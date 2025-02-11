import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../lib/models/Users";
import Club from "../../../lib/models/Club";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const getNetId = async (): Promise<string> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const verified = jwt.verify(token.value, process.env.JWT_SECRET) as unknown as {
      netid: string;
      email: string;
    };

    return verified.netid;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Authentication failed: ${error.message}`);
    } else {
      throw new Error("Authentication failed: Unknown error");
    }
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const netid = getNetId();

    const { clubId, isFollowing: shouldFollow } = body;
    if (!clubId || shouldFollow === undefined) {
      console.error("Missing netid or clubId or followed in request body");
      throw new Error("netid and clubId and followed boolean are required");
    }

    await connectToDatabase();

    const session = await mongoose.startSession();

    let result;
    await session.withTransaction(async () => {
      const user = await User.findOne({ netid });
      if (!user) throw new Error(`User with netid ${netid} not found`);

      const club = await Club.findById({ _id: clubId });
      if (!club) throw new Error(`Club with clubId ${clubId} not found`);

      const isAlreadyFollowing = user.followedClubs.includes(clubId);

      if (shouldFollow == isAlreadyFollowing) {
        throw new Error("boolean does not match database");
      } else if (!shouldFollow && isAlreadyFollowing) {
        // Unfollow
        const updatedUser = await User.findOneAndUpdate(
          // We only match if the user IS currently following the club
          { netid, followedClubs: clubId },
          { $pull: { followedClubs: clubId } },
          { new: true, session },
        );

        if (!updatedUser) throw new Error(`Failed to update user with netid ${netid}`);
        // Ensure club has a followers field (e.g., set to 0 if missing)
        await Club.findOneAndUpdate(
          { _id: clubId },
          { $setOnInsert: { followers: 0 } },
          { upsert: true, new: true, session },
        );

        // Decrement followers, but only if > 0
        await Club.findOneAndUpdate(
          { _id: clubId, followers: { $gt: 0 } },
          { $inc: { followers: -1 } },
          { new: true, session },
        );
      } else if (shouldFollow && !isAlreadyFollowing) {
        // Follow club
        const updatedUser = await User.findOneAndUpdate(
          // The condition ensures we only match if the user is NOT already following.
          { netid, followedClubs: { $ne: clubId } },
          { $addToSet: { followedClubs: clubId } },
          { new: true, session },
        );
        if (!updatedUser) {
          throw new Error(`Failed to update user with netid ${netid}`);
        }

        // Ensure club has a followers field (e.g., set to 0 if missing)
        await Club.findByIdAndUpdate(
          mongoose.Types.ObjectId.createFromHexString(clubId),
          { $setOnInsert: { followers: 0 } },
          { upsert: true, new: true, session },
        );
        const updatedClub = await Club.findByIdAndUpdate(
          mongoose.Types.ObjectId.createFromHexString(clubId),
          { $inc: { followers: 1 } },
          { new: true, session },
        );

        if (!updatedClub) throw new Error(`Club with clubId ${clubId} not found`);
      }

      const userAfter = await User.findOne({ netid }).session(session);
      const clubAfter = await Club.findById(clubId).session(session);

      result = {
        isFollowing: userAfter?.followedClubs.includes(clubId),
        followers: clubAfter?.followers ?? 0,
      };
    });

    session.endSession();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/follow:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}
