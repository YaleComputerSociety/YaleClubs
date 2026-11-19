import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Users from "@/lib/models/Users";
import { isLocalDevHostname, resolveDevLoginIdentity, resolveDevLoginRedirect } from "@/lib/devLogin";

/**
 * The Host header is client-controlled, so the hostname check alone does not prove the
 * caller is local. `npm run dev` also binds to 127.0.0.1 and sets ALLOW_DEV_LOGIN; `devprod`
 * and production never set it.
 */
export function isDevLoginEnabled(requestUrl: URL): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_DEV_LOGIN === "true" &&
    isLocalDevHostname(requestUrl.hostname)
  );
}

/** Creates the local dev session and sends the browser back into the app. Development only. */
export async function establishDevLogin(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  if (!isDevLoginEnabled(requestUrl)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("Please define the JWT_SECRET environment variable");
  }

  const { netid, email, role } = resolveDevLoginIdentity({
    netid: requestUrl.searchParams.get("netid"),
    email: requestUrl.searchParams.get("email"),
    envNetid: process.env.USER_NETID,
    envEmail: process.env.USER_EMAIL,
    envRole: process.env.USER_ROLE,
  });

  await connectToDatabase();
  let existingUser = await Users.findOne({ netid });
  if (!existingUser) {
    existingUser = await Users.create({ netid });
  }

  const token = jwt.sign({ netid, email, role: existingUser?.role || role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  const redirectTarget = resolveDevLoginRedirect({
    redirectParam: requestUrl.searchParams.get("redirect") ?? requestUrl.searchParams.get("from"),
    requestOrigin: requestUrl.origin,
    baseUrl: process.env.BASE_URL,
  });

  const response = NextResponse.redirect(redirectTarget);
  response.cookies.set("token", token, {
    secure: requestUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
