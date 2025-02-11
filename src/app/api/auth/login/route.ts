import { NextResponse } from "next/server";
// import express from "express";
// import passport from "passport";
// import { Strategy as CasStrategy } from "passport";

export async function GET(): Promise<NextResponse> {
  const BASE_URL = process.env.BASE_URL as string;
  if (!BASE_URL) {
    throw new Error("Please define the BASE_URL environment variable");
  }
  return NextResponse.redirect(`https://secure.its.yale.edu/cas/login?service=${BASE_URL}/api/auth/redirect`);
}
