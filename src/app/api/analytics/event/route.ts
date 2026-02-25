import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import { ClubAnalyticsEvent } from "@/lib/models/ClubAnalyticsEvent";
import mongoose from "mongoose";

const ALLOWED_EVENT_TYPES = ["modal_view"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clubId, eventType } = body;

    if (!clubId || typeof clubId !== "string" || !eventType || typeof eventType !== "string") {
      return NextResponse.json(
        { error: "clubId and eventType are required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `eventType must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return NextResponse.json({ error: "Invalid clubId" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_netid")?.value ?? null;

    await connectToDatabase();

    await ClubAnalyticsEvent.create({
      clubId: new mongoose.Types.ObjectId(clubId),
      eventType,
      userId: userId || undefined,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/analytics/event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
