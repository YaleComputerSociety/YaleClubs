import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Club from "@/lib/models/Club";
import { ClubAnalyticsEvent } from "@/lib/models/ClubAnalyticsEvent";
import { checkIfAdmin } from "@/lib/serverUtils";

interface ClubLean {
  _id: mongoose.Types.ObjectId;
  name: string;
  followers?: number;
}

interface DecodedToken {
  netid: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

function isValidDecodedToken(decoded: unknown): decoded is DecodedToken {
  return (
    typeof decoded === "object" &&
    decoded !== null &&
    "email" in decoded &&
    typeof (decoded as DecodedToken).email === "string"
  );
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token?.value || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = jwt.verify(token.value, process.env.JWT_SECRET) as unknown;
    if (!isValidDecodedToken(verified)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const isAdmin = await checkIfAdmin();
    const query = isAdmin ? {} : { "leaders.email": verified.email };
    const clubs = (await Club.find(query, { _id: 1, name: 1, followers: 1 }).lean()) as unknown as ClubLean[];

    if (clubs.length === 0) {
      return NextResponse.json({ clubs: [] });
    }

    const clubIds = clubs.map((c) => c._id);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [aggResult] = await ClubAnalyticsEvent.aggregate([
      {
        $match: {
          clubId: { $in: clubIds },
          eventType: "modal_view",
        },
      },
      {
        $facet: {
          views7d: [
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            { $group: { _id: "$clubId", count: { $sum: 1 } } },
          ],
          views30d: [
            { $match: { timestamp: { $gte: thirtyDaysAgo } } },
            { $group: { _id: "$clubId", count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    const views7dMap = new Map<string, number>();
    const views30dMap = new Map<string, number>();
    for (const row of aggResult.views7d) {
      views7dMap.set(row._id.toString(), row.count);
    }
    for (const row of aggResult.views30d) {
      views30dMap.set(row._id.toString(), row.count);
    }

    const result = clubs.map((club) => ({
      clubId: club._id.toString(),
      name: club.name,
      followers: club.followers ?? 0,
      modalViews7d: views7dMap.get(club._id.toString()) ?? 0,
      modalViews30d: views30dMap.get(club._id.toString()) ?? 0,
    }));

    return NextResponse.json({ clubs: result });
  } catch (error) {
    console.error("Error in GET /api/analytics/dashboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
