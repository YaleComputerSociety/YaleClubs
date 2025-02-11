import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const BASE_URL = process.env.BASE_URL as string;
  if (!BASE_URL) {
    throw new Error("Please define the BASE_URL environment variable");
  }
  const response = NextResponse.redirect(`${process.env.BASE_URL}/`);

  response.cookies.delete({
    name: "token",
    secure: true,
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  });

  return response;
}
