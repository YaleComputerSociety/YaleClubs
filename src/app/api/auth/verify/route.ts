import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token?.value) {
      return NextResponse.json({ isLoggedIn: false }, { status: 200 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json({ isLoggedIn: false }, { status: 500 });
    }

    const user = await getSessionUser();
    if (!user) {
      const response = NextResponse.json({ isLoggedIn: false }, { status: 401 });
      response.cookies.delete("token");
      return response;
    }

    return NextResponse.json({
      isLoggedIn: true,
      user,
    });
  } catch (error) {
    console.error("Authentication error:", error);

    const response = NextResponse.json({ isLoggedIn: false }, { status: 401 });
    response.cookies.delete("token");
    return response;
  }
}
