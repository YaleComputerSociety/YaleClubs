import { NextResponse } from "next/server";
import User from "../../../lib/models/Users";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const netid = url.searchParams.get("netid");

    if (!netid) {
      return NextResponse.json({ error: "NetID is required" }, { status: 400 });
    }

    const user = await User.findOne({ netid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ followedClubs: user.followedClubs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching followed clubs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
