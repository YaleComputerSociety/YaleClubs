import { NextResponse } from "next/server";
import { getYaleMojiAvatar } from "@/lib/yalemoji";
import { getAuthenticatedNetId } from "@/lib/serverUtils";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const netid = await getAuthenticatedNetId();
  if (!netid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const yalemoji = await getYaleMojiAvatar(netid);
  if (yalemoji === undefined) {
    return NextResponse.json(
      { error: "Yalemoji lookup unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json({ netid, yalemoji }, { headers: { "Cache-Control": "no-store" } });
}
