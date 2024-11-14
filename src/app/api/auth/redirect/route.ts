import { NextResponse } from "next/server";
import { parseString } from "xml2js";
import jwt from "jsonwebtoken";

export async function GET(request: Request): Promise<NextResponse> {
  const BASE_URL = process.env.BASE_URL as string;
  if (!BASE_URL) {
    throw new Error("Please define the BASE_URL environment variable");
  }
  const JWT_SECRET = process.env.JWT_SECRET as string;
  if (!JWT_SECRET) {
    throw new Error("Please define the JWT_SECRET environment variable");
  }
  const { searchParams } = new URL(request.url);
  const ticket = searchParams.get("ticket");

  if (ticket) {
    const ticketQuery = `https://secure.its.yale.edu/cas/serviceValidate?ticket=${ticket}&service=${process.env.BASE_URL}/api/auth/redirect`;
    const response = await fetch(ticketQuery);
    const xml = await response.text();

    const result: any = await new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    try {
      if (result["cas:serviceResponse"]["cas:authenticationFailure"]) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
      }
      const success = result["cas:serviceResponse"]["cas:authenticationSuccess"];

      if (!success) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
      }

      const netid = success[0]["cas:user"][0];
      const token = jwt.sign({ netid }, JWT_SECRET, {
        expiresIn: "7d",
      });
      const response = NextResponse.redirect(`${process.env.BASE_URL}/`);
      response.cookies.set("token", token);
      return response;
    } catch (e) {
      return NextResponse.json({ error: "Authentication failed: " + e }, { status: 401 });
    }
  } else {
    const BASE_URL = process.env.BASE_URL as string;
    if (!BASE_URL) {
      throw new Error("Please define the BASE_URL environment variable");
    }
    return NextResponse.redirect(`https://secure.its.yale.edu/cas/login?service=${BASE_URL}/api/auth/redirect`);
  }
}
