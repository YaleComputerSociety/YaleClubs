# Design: YaleConnect event import and Events page filters

Status: implemented on `milind-events-overhaul` (not yet deployed).

## Goal

Show public YaleConnect events on the YaleClubs Events page next to events clubs post on
YaleClubs, kept up to date automatically, and let students sort and filter them.

Non-goals: members-only YaleConnect events, RSVP counts, writing anything back to YaleConnect.

## Architecture

```
YaleConnect RSS feed ──(hourly)──> POST /api/events/sync ──> MongoDB Event collection ──> /api/events ──> Events page
  rss_events (public)    cron job, Bearer SYNC_SECRET         upsert by (source, externalId)                 cards, popup, filters
```

| Layer | File |
| --- | --- |
| Fetch, parse, map (no DB access, unit-tested) | `src/lib/yaleconnect.ts` |
| Upsert / delete in MongoDB | `src/lib/yaleconnectSync.ts` |
| HTTP trigger | `src/app/api/events/sync/route.ts` |
| Schedule | crontab on the production server; `k8s/yaleconnect-sync-cron.yaml` for the k8s setup |
| Model | `src/lib/models/Event.ts` |
| Sorting, filtering, URL state (pure, unit-tested) | `src/lib/eventFilters.ts` |
| UI | `src/components/events/**`, `src/components/SelectFilter.tsx`, `src/app/Events/**` |

## Data source

`https://yaleconnect.yale.edu/rss_events` (CampusGroups RSS) is public and needs no key. It
lists events that have not ended (about 1,600; about 850 public), about 6.6 MB, refreshed hourly.

Alternatives considered:

- **CampusGroups API with a key.** Needs Yale administrators to issue a key. Only adds
  members-only events, hidden locations and RSVP data, none of which a public page should show.
  Swapping it in later only replaces `fetchYaleConnectRss` / `parseYaleConnectRss`.
- **iCal feed** (`/ical/yale/ical_yale.ics`). Same events plus past ones, fewer fields, and it hides
  the same locations.
- **Event pages / internal GraphQL API.** Event pages are a JS shell over a private API. Not used:
  undocumented, likely to break, and not something to scrape.

Filtering: only items with `privacyLevel = 0`, `approvalStatus = 1` and `eventDelete != 1` are
imported. About 600 public events have their location replaced with
`Private Location (sign in to display)`; these get `locationHidden: true`.

## Data model

Imported events share the `Event` collection with club-created events, so every existing query,
card and filter works on both. All new fields are optional, so existing documents and the
create/edit API are unaffected.

New fields: `source` (`yaleclubs` default | `yaleconnect`), `externalId`, `end`, `externalLink`,
`locationHidden`, `locationType` (`On-Campus` | `Off-Campus` | `Virtual`), `eventType`,
`hostCategory`, `foodProvided`, `topics`, `imageAlt`, `icalLink`, `lastSyncedAt`.

Index: unique on `{ source, externalId }` with a partial filter on `externalId` being a string,
so it only applies to imported events.

Mapping decisions:

- `clubs`: host plus co-hosts. A YaleConnect group ID that matches `Club.yaleConnectId` uses our
  club name; otherwise YaleConnect's group name.
- `description`: HTML converted to plain text (cards render text). Only real tags are stripped, so
  text such as `< tinyurl.com/x >` survives.
- `registrationLink`: only an actual external sign-up link. The YaleConnect page is `externalLink`.
- `tags`: regex rules over event type and topics, plus `Free Food` when `foodProvided`.
- `eventType`: known YaleConnect misspellings are fixed (`Commmunity` -> `Community`).
- Required schema fields get placeholders when empty (`See YaleConnect for details.`,
  `View location on YaleConnect`).

## Sync algorithm

1. Fetch the feed (60 s timeout) and parse with `xml2js`.
2. Keep public items. If none remain, throw: never wipe our copy because of a bad feed.
3. Load clubs whose `yaleConnectId` appears in the feed; map group ID -> club name.
4. One unordered `bulkWrite` of `updateOne` upserts keyed on `(source, externalId)`. Fields are
   `$set` (or `$unset` when now missing); `createdBy` is `$setOnInsert`.
5. Delete `source: yaleconnect` events with `start >= now` whose `externalId` is not in the feed
   (cancelled, deleted or made private). Past events are kept because the feed only lists
   upcoming ones, and the Past Events list needs them.

The sync is idempotent; running it twice in a row inserts and deletes nothing.

## Trigger and security

- `POST /api/events/sync` requires `Authorization: Bearer <SYNC_SECRET>`. Comparison hashes both
  values and uses `timingSafeEqual`. Missing secret on the server = 500, never open.
- `src/proxy.ts` exempts exactly this path from cookie auth; the route does its own check.
- Concurrency: an in-process flag returns 409 while a sync runs. With several app processes or
  pods, the schedule itself must not overlap runs (k8s `concurrencyPolicy: Forbid`; hourly cron
  runs finish in about 20 s).
- Production (DigitalOcean server, deployed by `.github/workflows/main.yml` with pm2): schedule it
  with a crontab entry on that server, for example
  `17 * * * * curl -fsS -X POST -H "Authorization: Bearer $SYNC_SECRET" https://yaleclubs.io/api/events/sync`,
  and add `SYNC_SECRET` to `.env.prod` there.
- Kubernetes setup (`k8s/`): `k8s/yaleconnect-sync-cron.yaml`, `17 * * * *` America/New_York,
  `backoffLimit: 2`, `activeDeadlineSeconds: 600`, calls `http://main-app/api/events/sync` with
  `curl --fail-with-body`.

## Events page

### Display

- `EventLocation` renders the location, or a "View location on YaleConnect" link when
  `locationHidden`. It stops click propagation so a card's popup doesn't open.
- `EventSourceDetails` renders type, where, food, host category, topics and a source note; it
  renders nothing for club events. It uses type-only model imports so mongoose stays out of the
  client bundle and jsdom tests.
- Time ranges come from `formatEventTimeRange`; Google Calendar links use `end` when valid.

### Filters and sorting

All logic is in `src/lib/eventFilters.ts`; `SearchControlEvents` only holds state.

- Pipeline: search (existing Trie) -> `filterEvents` (date window, source, where, type) ->
  clubs / tags (existing) -> split upcoming / past -> `sortEvents` for each.
- Within a control, several picks match any; across controls, all must match.
- Date windows use the viewer's local time: today; this week through Sunday; this weekend
  Saturday to Sunday (on a Sunday, just today); next 31 days.
- Events with no `source` count as YaleClubs (older documents).
- For past events, "soonest" sorts newest first, matching the previous behaviour.

### URL state

`pageStateToQuery` / `queryToPageState` map the controls to `q`, `sort`, `date`, `source`
and repeated `where`, `type`, `club`, `tag` keys. Repeated keys are used because club and type
names contain commas. Defaults are omitted, so an unfiltered page has a clean address.

- Read once after mount (not during render) so the server render matches the first client render.
- Written with `history.replaceState`: no history entry per keystroke, and Back still leaves the
  page. This avoids `useSearchParams`, which would need a Suspense boundary on this client page.
- Invalid values fall back to defaults.

## Testing

`tests/yaleconnect.test.ts` (parsing, mapping, hidden locations, co-hosts, tags, spelling),
`tests/eventFilters.test.ts` (date windows, filters, sorting, URL round-trip),
`tests/EventLocation.test.tsx`, `tests/EventSourceDetails.test.tsx`. The sync and route were
also run end to end against the live feed and a local MongoDB (insert, re-run, delete, auth).

## Open questions and future work

- Permission from Yale Student Engagement to republish the public feed.
- Fill `Club.yaleConnectId` for more clubs so imported events show our club names.
- Replace YaleConnect's default photo with our default image.
- A "YaleConnect" badge on cards.
- Detect duplicates when a club posts the same event on both sites (club + start time + title).
- Check the filter bar at phone width.
- `GET /api/events` returns every event; paginate or filter server-side if the list grows.
