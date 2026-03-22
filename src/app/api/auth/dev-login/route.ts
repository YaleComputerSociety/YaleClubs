import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Users from "@/lib/models/Users";

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
  const netid = url.searchParams.get("netid") || (process.env.USER_NETID as string);
  const email = url.searchParams.get("email") || (process.env.USER_EMAIL as string);
  const role = url.searchParams.get("role") || (process.env.USER_ROLE as string);

  // Upsert the user in the database, mirroring what the real CAS login does
  await connectToDatabase();
  let existingUser = await Users.findOne({ netid });
  if (!existingUser) {
    existingUser = await Users.create({ netid });
  }

  const resolvedRole = existingUser?.role || role || "user";

  const token = jwt.sign({ netid, email, role: resolvedRole }, JWT_SECRET, {
    expiresIn: "7d",
  });

  let redirectTarget = `${BASE_URL}/`;
  if (redirectParam) {
    try {
      const parsed = new URL(redirectParam);
      const base = new URL(BASE_URL);
      // Only allow redirects to the same origin to prevent open-redirect attacks
      if (parsed.origin === base.origin) {
        redirectTarget = redirectParam;
      }
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
