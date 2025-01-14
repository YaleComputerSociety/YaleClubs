import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../lib/models/Users";
import Club from "../../../lib/models/Club";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { netid, clubId, following } = body;
    if (!netid || !clubId || !following) {
      console.error("Missing netid or clubId or followed in request body");
      return NextResponse.json({ error: "netid and clubId and followed boolean are required" }, { status: 400 });
    }

    try {
      await connectToDatabase();
      console.log("Connected to database successfully.");
    } catch (error) {
      console.error("Error connecting to the database:", error);
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let user;
    try {
      user = await User.findOne({ netid });
      if (!user) throw new Error(`User with netid ${netid} not found`);
      console.log("User found:", user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let club;
    try {
      club = await Club.findById({ _id: clubId });
      if (!club) throw new Error(`Club with clubId ${clubId} not found`);
      console.log("Club found:", club);
    } catch (error) {
      console.error("Error fetching club:", error);
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    try {
      const isFollowing = user.followedClubs.includes(clubId);
      // if following and match database, unfollow
      if (following && isFollowing) {
        await User.findOneAndUpdate({ netid }, { $pull: { followedClubs: clubId } }, { new: true });
        await Club.findOneAndUpdate(
          mongoose.Types.ObjectId.createFromHexString(clubId),
          { $setOnInsert: { followers: 0 } },
          { upsert: true, new: true },
        );
        const updatedClub = await Club.findOneAndUpdate(
          mongoose.Types.ObjectId.createFromHexString(clubId),
          { $inc: { followers: -1 } },
          { new: true },
        );
        console.log(`Unfollowed club ${clubId}. Updated followers count: ${updatedClub?.followers}`);
      } else if (following && !isFollowing) {
        return NextResponse.json({ error: "boolean does not match database" }, { status: 500 });
      } else if (!following && !isFollowing) {
        // if not following and matches db
        const updatedUser = await User.findOneAndUpdate(
          { netid },
          { $addToSet: { followedClubs: clubId } },
          { new: true },
        );
        if (!updatedUser) {
          throw new Error(`Failed to update user with netid ${netid}`);
        }

        await Club.findByIdAndUpdate(
          mongoose.Types.ObjectId.createFromHexString(clubId),
          { $setOnInsert: { followers: 0 } },
          { upsert: true, new: true },
        );
        const updatedClub = await Club.findByIdAndUpdate(
          mongoose.Types.ObjectId.createFromHexString(clubId),
          { $inc: { followers: 1 } },
          { new: true },
        );

        if (!updatedClub) {
          throw new Error(`Failed to update club with id ${clubId}`);
        }

        console.log(`Followed club ${clubId}. Updated followers count: ${updatedClub?.followers}`);
      } else {
        return NextResponse.json({ error: "boolean does not match database" }, { status: 500 });
      }
    } catch (error) {
      console.error("Error updating follow/unfollow status:", error);
      throw new Error("Failed to update follow/unfollow status");
    }
    return NextResponse.json({
      isFollowing: user.followedClubs.includes(clubId),
      followers: club.followers,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/follow:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const netid = url.searchParams.get("netid");
    const clubId = url.searchParams.get("clubId");

    if (!netid || !clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
      return NextResponse.json({ error: "Invalid NetID or Club ID" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ netid });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isFollowing = user.followedClubs.includes(clubId);

    return NextResponse.json({ isFollowing }, { status: 200 });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
