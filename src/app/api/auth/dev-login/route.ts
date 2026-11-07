import { NextResponse } from "next/server";
import { establishDevLogin } from "@/lib/establishDevLogin";

export async function GET(request: Request): Promise<NextResponse> {
  return establishDevLogin(request);
}
