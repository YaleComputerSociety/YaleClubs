import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../lib/models/Users";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const netid = url.searchParams.get("netid");

    await connectToDatabase();

    if (netid) {
      // Logic for fetching a single user
      const user = await User.findOne({ netid });
      console.log(user);

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
