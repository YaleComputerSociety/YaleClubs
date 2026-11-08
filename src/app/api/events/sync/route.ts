import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { syncYaleConnectEvents } from "@/lib/yaleconnectSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/events/sync
 * Imports events from YaleConnect's public feed. Meant to be called by a scheduled job.
 *
 * Auth: `Authorization: Bearer <SYNC_SECRET>`. This is our own secret, not a YaleConnect key —
 * it just stops anyone else from triggering the (slow, ~6 MB) sync.
 */

function isAuthorized(req: Request): boolean {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;

  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!provided) return false;

  // Hash both sides so the comparison is constant-time regardless of length.
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

let syncInProgress = false;

export async function POST(req: Request): Promise<NextResponse> {
  if (!process.env.SYNC_SECRET) {
    console.error("SYNC_SECRET is not set; refusing to run YaleConnect sync.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (syncInProgress) {
    return NextResponse.json({ error: "A sync is already running" }, { status: 409 });
  }

  syncInProgress = true;
  try {
    const result = await syncYaleConnectEvents();
    console.log("YaleConnect sync complete:", result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("YaleConnect sync failed:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 502 });
  } finally {
    syncInProgress = false;
  }
}
