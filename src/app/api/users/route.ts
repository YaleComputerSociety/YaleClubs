import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../lib/models/Users";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const netid = url.searchParams.get("netid");

    await connectToDatabase();

    if (netid) {
      // Logic for fetching a single user
      const user = await User.findOne({ netid });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user }, { status: 200 });
    } else {
      // Logic for fetching all users
      const users = await User.find({});
      return NextResponse.json(users, { status: 200 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token?.value || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = jwt.verify(token.value, process.env.JWT_SECRET) as unknown as {
      role: string;
    };

    if (!verified.role || verified.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const netid = url.searchParams.get("netid");

    if (!netid) {
      return NextResponse.json({ error: "NetID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const updateData = await req.json();

    // Prevent updating netid
    delete updateData.netid;

    const updatedUser = await User.findOneAndUpdate({ netid }, updateData, { new: true, runValidators: true });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
