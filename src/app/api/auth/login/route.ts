import { NextResponse } from "next/server";
import { isDevLoginEnabled } from "@/lib/establishDevLogin";

export async function GET(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  if (isDevLoginEnabled(requestUrl)) {
    const target = new URL("/api/auth/redirect", requestUrl.origin);
    requestUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
    return NextResponse.redirect(target);
  }

  const BASE_URL = process.env.BASE_URL as string;
  if (!BASE_URL) {
    throw new Error("Please define the BASE_URL environment variable");
  }
  return NextResponse.redirect(`https://secure.its.yale.edu/cas/ap?service=${BASE_URL}/api/auth/redirect`);
}
