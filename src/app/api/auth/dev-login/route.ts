import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: Request): Promise<NextResponse> {
  // Only enable in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const JWT_SECRET = process.env.JWT_SECRET as string | undefined;
  if (!JWT_SECRET) {
    throw new Error("Please define the JWT_SECRET environment variable");
  }

  const BASE_URL = process.env.BASE_URL as string | undefined;
  if (!BASE_URL) {
    throw new Error("Please define the BASE_URL environment variable");
  }

  const url = new URL(request.url);
  const redirectParam = url.searchParams.get("redirect");

  // Allow overriding via query params for testing, otherwise use sensible defaults
  const netid = url.searchParams.get("netid") || "fyf2";
  const email = url.searchParams.get("email") || `$francis.fan@yale.edu`;
  const role = url.searchParams.get("role") || "admin";

  const token = jwt.sign({ netid, email, role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  let redirectTarget = `${BASE_URL}/`;
  if (redirectParam) {
    try {
      // Validate full URL; if invalid, fall back to BASE_URL
      new URL(redirectParam);
      redirectTarget = redirectParam;
    } catch {
      redirectTarget = `${BASE_URL}/`;
    }
  }

  const response = NextResponse.redirect(redirectTarget);
  response.cookies.set("token", token, {
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
  });

  return response;
}

//http://localhost:3000/api/auth/dev-login?redirect=http://localhost:3000
