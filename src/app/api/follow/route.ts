import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../lib/models/Users";
import Club from "../../../lib/models/Club";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { netid, clubId } = body;
    if (!netid || !clubId) {
      console.error("Missing netid or clubId in request body");
      return NextResponse.json({ error: "netid and clubId are required" }, { status: 400 });
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

      try {
        if (isFollowing) {
          // Unfollow the club
          console.log("we are here");
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
        } else {
          // Follow the club
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
        }
      } catch (error) {
        console.error("Error updating follow/unfollow status:", error);
        throw new Error("Failed to update follow/unfollow status");
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      return NextResponse.json({ error: "Error updating follow status" }, { status: 500 });
    }

    // try {
    //   await user.save();
    //   await club.save();
    //   console.log("User and club updates saved successfully.");
    // } catch (error) {
    //   console.error("Error saving user or club updates:", error);
    //   return NextResponse.json({ error: "Failed to save updates" }, { status: 500 });
    // }

    return NextResponse.json({
      isFollowing: user.followedClubs.includes(clubId),
      followers: club.followers,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/follow:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
