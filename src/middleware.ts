import { NextRequest, NextResponse } from "next/server";
// import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

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

const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 3600,
};

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  let decodedToken = null;

  if (token) {
    decodedToken = await decodeJWTToken(token.value);
    if (!decodedToken) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      response.cookies.delete("token");
      console.log("bad token");
      return response;
    }
  }

  // For /api/clubs GET requests, set auth data in HttpOnly cookies
  if (request.nextUrl.pathname === "/api/clubs" && request.method === "GET") {
    const response = NextResponse.next();

    if (decodedToken) {
      // Store auth data in HttpOnly cookies
      response.cookies.set("auth_netid", decodedToken.netid, SECURE_COOKIE_OPTIONS);
      response.cookies.set("auth_email", decodedToken.email, SECURE_COOKIE_OPTIONS);
      response.cookies.set("auth_status", "true", SECURE_COOKIE_OPTIONS);
    } else {
      // Clear auth cookies if not authenticated
      response.cookies.delete("auth_netid");
      response.cookies.delete("auth_email");
      response.cookies.delete("auth_status");
    }

    return response;
  }

  // For all other routes, require valid token
  if (!decodedToken) {
    console.log("bad token 2");
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Clear all auth cookies
    response.cookies.delete("auth_netid");
    response.cookies.delete("auth_email");
    response.cookies.delete("auth_status");
    return response;
  }

  const response = NextResponse.next();

  // Set auth data in HttpOnly cookies
  response.cookies.set("auth_netid", decodedToken.netid, SECURE_COOKIE_OPTIONS);
  response.cookies.set("auth_email", decodedToken.email, SECURE_COOKIE_OPTIONS);

  return response;
}

export const config = {
  matcher: ["/api/clubs/:path*", "/api/events/:path*"],
};
