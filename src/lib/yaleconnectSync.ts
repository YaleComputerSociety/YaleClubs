import connectToDatabase from "@/lib/mongodb";
import Event, { EventSource } from "@/lib/models/Event";
import Club from "@/lib/models/Club";
import {
  fetchYaleConnectRss,
  isPublicEvent,
  mapYaleConnectItem,
  mergeSignedInLocations,
  parseYaleConnectRss,
  YALECONNECT_RSS_URL,
  YALECONNECT_SYNC_USER,
} from "@/lib/yaleconnect";

export interface YaleConnectSyncResult {
  feedItems: number;
  publicItems: number;
  authenticatedLocations: number;
  skippedInvalid: number;
  matchedToClub: number;
  inserted: number;
  /** Existing events re-written by this run (every run refreshes lastSyncedAt). */
  refreshed: number;
  removed: number;
  durationMs: number;
}

/**
 * Pulls YaleConnect's public event feed and upserts it into the Event collection.
 *
 * - Events are keyed on (source = "yaleconnect", externalId = YaleConnect eventId),
 *   so running the sync repeatedly is safe.
 * - Upcoming YaleConnect events that disappeared from the feed (cancelled, deleted
 *   or made private) are removed. Past events are kept so they still show under
 *   "past events", since the feed only contains events that haven't ended yet.
 * - Events created on YaleClubs itself are never touched.
 */
export async function syncYaleConnectEvents(): Promise<YaleConnectSyncResult> {
  const startedAt = Date.now();
  const now = new Date();

  const xml = await fetchYaleConnectRss();
  const items = await parseYaleConnectRss(xml);
  let publicItems = items.filter(isPublicEvent);

  // Guard against wiping our copy if YaleConnect returns an empty or broken feed.
  if (publicItems.length === 0) {
    throw new Error(`YaleConnect feed returned no public events (${items.length} items total); aborting sync.`);
  }

  // A YaleConnect session may expose locations marked "sign in to display".
  // Keep the anonymous feed as the event allowlist and preserve registration-only
  // and member-only restrictions even when this session can see more.
  let authenticatedLocations = 0;
  const cookie = process.env.YALECONNECT_COOKIE?.trim();
  if (cookie) {
    try {
      const signedInXml = await fetchYaleConnectRss(YALECONNECT_RSS_URL, 60_000, cookie);
      const signedInItems = await parseYaleConnectRss(signedInXml);
      const merged = mergeSignedInLocations(publicItems, signedInItems);
      publicItems = merged.items;
      authenticatedLocations = merged.revealedLocations;
    } catch {
      // An expired session should not prevent the public event sync.
      console.warn("YaleConnect authenticated feed unavailable; using public locations.");
    }
  }

  await connectToDatabase();

  // Map YaleConnect groupIds onto our clubs via Club.yaleConnectId.
  const groupIds = Array.from(new Set(publicItems.map((i) => Number(i.groupId)).filter(Number.isFinite)));
  const clubs = await Club.find({ yaleConnectId: { $in: groupIds } }, { name: 1, yaleConnectId: 1 }).lean<
    { name: string; yaleConnectId: number }[]
  >();
  const clubNameByYaleConnectId = new Map(clubs.map((c) => [c.yaleConnectId, c.name]));

  let skippedInvalid = 0;
  let matchedToClub = 0;
  const seenIds: string[] = [];
  const operations = [];

  for (const item of publicItems) {
    const mapped = mapYaleConnectItem(item, clubNameByYaleConnectId);
    if (!mapped) {
      skippedInvalid++;
      continue;
    }
    if (clubNameByYaleConnectId.has(Number(item.groupId))) matchedToClub++;
    seenIds.push(mapped.externalId);

    const { externalId, ...fields } = mapped;
    const $set: Record<string, unknown> = { lastSyncedAt: now };
    const $unset: Record<string, ""> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) $unset[key] = "";
      else $set[key] = value;
    }

    operations.push({
      updateOne: {
        filter: { source: EventSource.YaleConnect, externalId },
        update: {
          $set,
          ...(Object.keys($unset).length ? { $unset } : {}),
          $setOnInsert: { createdBy: YALECONNECT_SYNC_USER },
        },
        upsert: true,
      },
    });
  }

  const writeResult = operations.length ? await Event.bulkWrite(operations, { ordered: false }) : null;

  const { deletedCount } = await Event.deleteMany({
    source: EventSource.YaleConnect,
    externalId: { $nin: seenIds },
    start: { $gte: now },
  });

  return {
    feedItems: items.length,
    publicItems: publicItems.length,
    authenticatedLocations,
    skippedInvalid,
    matchedToClub,
    inserted: writeResult?.upsertedCount ?? 0,
    refreshed: writeResult?.matchedCount ?? 0,
    removed: deletedCount ?? 0,
    durationMs: Date.now() - startedAt,
  };
}
