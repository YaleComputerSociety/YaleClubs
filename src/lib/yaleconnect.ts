import { parseStringPromise } from "xml2js";
import { EventLocationType, Tag } from "@/lib/models/Event";

/**
 * Reads events from YaleConnect's public RSS feed (YaleConnect runs on CampusGroups).
 * The feed needs no API key and only contains events that haven't ended yet.
 *
 * This file only fetches, parses and maps — it does not touch the database,
 * so it can be unit-tested. The database side lives in `yaleconnectSync.ts`.
 */

export const YALECONNECT_BASE_URL = "https://yaleconnect.yale.edu";
export const YALECONNECT_RSS_URL = `${YALECONNECT_BASE_URL}/rss_events`;
export const YALECONNECT_SYNC_USER = "yaleconnect-sync";

/** Shown as the location when YaleConnect hides it; the UI turns it into a link to the event page. */
export const HIDDEN_LOCATION_TEXT = "View location on YaleConnect";

/**
 * YaleConnect only reveals some locations to signed-in or registered users. The public feed
 * then contains placeholder text like "Private Location (sign in to display)".
 */
export function isHiddenLocation(location?: string): boolean {
  const v = location?.trim() ?? "";
  return v === "" || /^private location\b/i.test(v);
}

/** The subset of a feed <item> that we use. Every value arrives as a string. */
export interface YaleConnectRssItem {
  eventId?: string;
  groupId?: string;
  group?: string;
  groupType?: string;
  cohostingGroupIds?: string;
  cohostingGroupNames?: string;
  title?: string;
  description?: string;
  fullDescription?: string;
  eventStartDateTime?: string;
  eventEndDateTime?: string;
  eventLocation?: string;
  eventPhotoFullUrl?: string;
  eventFlyerFullUrl?: string;
  eventPhotoAltText?: string;
  iCalLink?: string;
  eventLink?: string;
  eventExternalRegistrationLink?: string;
  eventType?: string;
  locationType?: string;
  foodProvided?: string;
  eventTopics?: string;
  eventTopicsSeparated?: { eventTopic?: string | string[] } | string;
  privacyLevel?: string;
  approvalStatus?: string;
  eventDelete?: string;
}

/** A YaleConnect event mapped to the fields of our Event model. */
export interface MappedYaleConnectEvent {
  externalId: string;
  name: string;
  description: string;
  clubs: string[];
  start: Date;
  end?: Date | undefined;
  location: string;
  registrationLink?: string | undefined;
  externalLink?: string | undefined;
  locationHidden: boolean;
  locationType?: EventLocationType | undefined;
  flyer?: string | undefined;
  imageAlt?: string | undefined;
  icalLink?: string | undefined;
  eventType?: string | undefined;
  hostCategory?: string | undefined;
  foodProvided: boolean;
  tags: Tag[];
  topics: string[];
}

/** Downloads the raw RSS feed. It is several MB, so allow a generous timeout. */
export async function fetchYaleConnectRss(url = YALECONNECT_RSS_URL, timeoutMs = 60_000): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: "application/rss+xml, text/xml" },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`YaleConnect feed request failed: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

/** Parses the feed XML into a list of raw items. */
export async function parseYaleConnectRss(xml: string): Promise<YaleConnectRssItem[]> {
  const parsed = await parseStringPromise(xml, { explicitArray: false, trim: true });
  const items = parsed?.rss?.channel?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

/** Only public, approved, non-deleted events are shown on YaleClubs. */
export function isPublicEvent(item: YaleConnectRssItem): boolean {
  return item.privacyLevel === "0" && item.approvalStatus === "1" && item.eventDelete !== "1";
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  ndash: "–",
  mdash: "—",
  hellip: "…",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** YaleConnect descriptions are HTML; our event cards render plain text. */
export function htmlToPlainText(html: string): string {
  const text = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "\n• ")
    .replace(/<\/\s*(p|div|h[1-6]|ul|ol|tr)\s*>/gi, "\n")
    // Only strip real tags ("<p>", "</a>", "<!-- -->"), not text like "< tinyurl.com/x >"
    .replace(/<!--[\s\S]*?-->|<\/?[a-z][^>]*>/gi, "");
  return decodeEntities(text)
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function normalizeUrl(value?: string): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/")) return `${YALECONNECT_BASE_URL}${v}`;
  // Leaders often type links without a scheme, e.g. "tinyurl.com/abc"
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(v)) return `https://${v}`;
  return undefined;
}

function extractTopics(item: YaleConnectRssItem): string[] {
  let raw: string[] = [];
  const sep = item.eventTopicsSeparated;
  if (sep && typeof sep === "object" && sep.eventTopic) {
    raw = Array.isArray(sep.eventTopic) ? sep.eventTopic : [sep.eventTopic];
  } else if (item.eventTopics) {
    raw = item.eventTopics.split(",");
  }
  const topics = raw.map((t) => (typeof t === "string" ? t.trim() : "")).filter(Boolean);
  return Array.from(new Set(topics));
}

// Matches YaleConnect event types / topics onto our existing Tag values.
const TAG_RULES: [RegExp, Tag][] = [
  [/community service|volunteer/i, Tag.CommunityService],
  [/performance|concert|recital/i, Tag.Performance],
  [/^social$/i, Tag.Social],
  [/lecture|talk|panel|speaker/i, Tag.Speaker],
  [/sport|recreation|athletic/i, Tag.Athletics],
  [/exhibition|showcase/i, Tag.Showcase],
  [/free food/i, Tag.FreeFood],
  [/career|professional development|networking/i, Tag.ProfessionalDevelopment],
];

export function mapTags(eventType: string | undefined, topics: string[], foodProvided = false): Tag[] {
  const labels = [eventType ?? "", ...topics].filter(Boolean);
  const tags = new Set<Tag>();
  for (const [pattern, tag] of TAG_RULES) {
    if (labels.some((label) => pattern.test(label))) tags.add(tag);
  }
  if (foodProvided) tags.add(Tag.FreeFood);
  return Array.from(tags);
}

const LOCATION_TYPES: Record<string, EventLocationType> = {
  "on-campus": EventLocationType.OnCampus,
  "off-campus": EventLocationType.OffCampus,
  virtual: EventLocationType.Virtual,
};

function cleanText(value?: string): string | undefined {
  const v = value ? decodeEntities(value).trim() : "";
  return v || undefined;
}

/**
 * Host plus co-hosts, as club names. Co-host ids and names arrive as parallel
 * comma-separated lists, e.g. ids "74323,32717" and names "Office A,Group B".
 */
function hostClubs(item: YaleConnectRssItem, clubNameByYaleConnectId: Map<number, string>): string[] {
  const resolve = (id: string | undefined, fallbackName: string | undefined) => {
    const n = Number(id);
    return (Number.isFinite(n) ? clubNameByYaleConnectId.get(n) : undefined) ?? cleanText(fallbackName);
  };
  const ids = (item.cohostingGroupIds ?? "").split(",").map((s) => s.trim());
  const names = (item.cohostingGroupNames ?? "").split(",");
  const cohosts = ids.map((id, i) => (id ? resolve(id, names[i]) : undefined));
  const clubs = [resolve(item.groupId, item.group), ...cohosts].filter((c): c is string => Boolean(c));
  return Array.from(new Set(clubs));
}

/**
 * Maps a raw feed item to our event shape.
 * `clubNameByYaleConnectId` maps a YaleConnect groupId to the name of the matching
 * Club (via Club.yaleConnectId). Unmatched groups fall back to YaleConnect's group name.
 * Returns null for items that are missing an id, title or start time.
 */
export function mapYaleConnectItem(
  item: YaleConnectRssItem,
  clubNameByYaleConnectId: Map<number, string> = new Map(),
): MappedYaleConnectEvent | null {
  const externalId = item.eventId?.trim();
  const name = item.title ? decodeEntities(item.title).trim() : "";
  const start = parseDate(item.eventStartDateTime);
  if (!externalId || !name || !start) return null;

  const clubs = hostClubs(item, clubNameByYaleConnectId);
  const foodProvided = item.foodProvided === "1";
  const eventType = cleanText(item.eventType);

  const topics = extractTopics(item);
  const description = htmlToPlainText(item.fullDescription || item.description || "");
  const externalLink = normalizeUrl(item.eventLink);
  const locationHidden = isHiddenLocation(item.eventLocation);

  return {
    externalId,
    name,
    // Our schema requires a non-empty description.
    description: description || "See YaleConnect for details.",
    clubs,
    start,
    end: parseDate(item.eventEndDateTime),
    // Our schema requires a location, so hidden ones get a placeholder that the UI renders as a link.
    location: locationHidden ? HIDDEN_LOCATION_TEXT : (item.eventLocation ?? "").trim(),
    locationHidden,
    locationType: LOCATION_TYPES[(item.locationType ?? "").trim().toLowerCase()],
    // Only a real sign-up link; the YaleConnect page itself is externalLink.
    registrationLink: normalizeUrl(item.eventExternalRegistrationLink),
    externalLink,
    flyer: normalizeUrl(item.eventFlyerFullUrl) ?? normalizeUrl(item.eventPhotoFullUrl),
    imageAlt: cleanText(item.eventPhotoAltText),
    icalLink: normalizeUrl(item.iCalLink),
    eventType,
    hostCategory: cleanText(item.groupType),
    foodProvided,
    tags: mapTags(eventType, topics, foodProvided),
    topics,
  };
}
