import connectToDatabase from "@/lib/mongodb";
import Event, { EventSource } from "@/lib/models/Event";
import Club from "@/lib/models/Club";
import {
  fetchYaleConnectRss,
  isPublicEvent,
  mapYaleConnectItem,
  parseYaleConnectRss,
  YALECONNECT_SYNC_USER,
} from "@/lib/yaleconnect";

export interface YaleConnectSyncResult {
  feedItems: number;
  publicItems: number;
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
  const publicItems = items.filter(isPublicEvent);

  // Guard against wiping our copy if YaleConnect returns an empty or broken feed.
  if (publicItems.length === 0) {
    throw new Error(`YaleConnect feed returned no public events (${items.length} items total); aborting sync.`);
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
    skippedInvalid,
    matchedToClub,
    inserted: writeResult?.upsertedCount ?? 0,
    refreshed: writeResult?.matchedCount ?? 0,
    removed: deletedCount ?? 0,
    durationMs: Date.now() - startedAt,
  };
}
