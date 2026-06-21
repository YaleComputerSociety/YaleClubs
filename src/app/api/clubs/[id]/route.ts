import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Club from "@/lib/models/Club";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    let isAuthenticated = false;

    if (token?.value && process.env.JWT_SECRET) {
      try {
        jwt.verify(token.value, process.env.JWT_SECRET);
        isAuthenticated = true;
      } catch {
        // invalid token — treat as unauthenticated
      }
    }

    const { id } = await params;
    const projection = isAuthenticated ? {} : { "leaders.email": 0 };
    const club = await Club.findById(id, projection);

    if (!club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    return NextResponse.json(club, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch club:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
