import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Role } from "@/lib/models/Users";

interface DecodedToken {
  netid: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

function isValidDecodedToken(decoded: any): decoded is DecodedToken {
  return (
    typeof decoded === "object" &&
    typeof decoded.netid === "string" &&
    typeof decoded.email === "string" &&
    typeof decoded.iat === "number" &&
    typeof decoded.exp === "number" &&
    decoded.role in Role
  );
}

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    // not logged in
    if (!token?.value) {
      return NextResponse.json({ isLoggedIn: false }, { status: 200 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json({ isLoggedIn: false }, { status: 500 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET);

    if (!isValidDecodedToken(decoded)) {
      console.error("Invalid token structure");
      return NextResponse.json({ isLoggedIn: false }, { status: 401 });
    }

    // if (decoded.exp < Math.floor(Date.now() / 1000)) {
    //   const response = NextResponse.json({ isLoggedIn: false }, { status: 401 });
    //   response.cookies.delete("token");
    //   return response;
    // }

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        netid: decoded.netid,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    // Log the error server-side but don't expose details to client
    console.error("Authentication error:", error);

    const response = NextResponse.json({ isLoggedIn: false }, { status: 401 });
    response.cookies.delete("token");
    return response;
  }
}
