import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../lib/models/Users";
import { checkIfAdmin, getAuthenticatedNetId } from "@/lib/serverUtils";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const netid = url.searchParams.get("netid");

    const requesterNetId = await getAuthenticatedNetId();
    const isAdmin = await checkIfAdmin();

    if (!requesterNetId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    if (netid) {
      // Only the user themselves or an admin may fetch a user record
      if (requesterNetId !== netid && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const user = await User.findOne({ netid });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user }, { status: 200 });
    } else {
      // Listing all users is admin-only
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

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
    if (!(await checkIfAdmin())) {
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
