import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function decodeJWTToken(token: string): Promise<any> {
  const JWT_SECRET = process.env.JWT_SECRET as string;
  if (!JWT_SECRET) {
    throw new Error("Please define the JWT_SECRET environment variable");
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload;
  } catch (e) {
    console.error("Invalid JWT token: " + e);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  if (request.method === "GET") {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Authorization required" }, { status: 401 });
  }
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Invalid Authorization format" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const decoded = await decodeJWTToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (decoded.netid == "efm28") {
    decoded.email = "ethan.mathieu@yale.edu";
  }

  const response = NextResponse.next();
  response.headers.set("X-NetID", decoded.netid);
  response.headers.set("X-Email", decoded.email);
  return response;
}

export const config = {
  matcher: ["/api/clubs/:path*", "/api/events/:path*"],
};
