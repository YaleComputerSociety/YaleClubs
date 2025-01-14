import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../lib/models/Users";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const netid = url.searchParams.get("netid");

    if (!netid) {
      return NextResponse.json({ error: "Invalid NetID" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ netid });
    console.log(user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
