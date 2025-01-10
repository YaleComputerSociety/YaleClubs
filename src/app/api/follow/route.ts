// src/app/api/follow/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../lib/models/Users";
import Club from "../../../lib/models/Club";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const { userId, clubId } = await req.json();

    if (!userId || !clubId) {
      return NextResponse.json({ error: "User ID and Club ID are required." }, { status: 400 });
    }

    const user = await User.findById(userId);
    const club = await Club.findById(clubId);

    if (!user || !club) {
      return NextResponse.json({ error: "User or Club not found." }, { status: 404 });
    }

    const isFollowing = user.followedClubs.includes(clubId);

    if (isFollowing) {
      user.followedClubs = user.followedClubs.filter((id) => id.toString() !== clubId);
      club.followers = Math.max(0, club.followers - 1);
    } else {
      user.followedClubs.push(clubId);
      club.followers += 1;
    }

    await user.save();
    await club.save();

    return NextResponse.json({ message: "Follow status updated." }, { status: 200 });
  } catch (error) {
    console.error("Error updating follow status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function GET(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const clubId = url.searchParams.get("clubId");

    if (!userId || !clubId) {
      return NextResponse.json({ error: "User ID and Club ID are required." }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const isFollowing = user.followedClubs.includes(clubId);

    return NextResponse.json({ isFollowing }, { status: 200 });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
