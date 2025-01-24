import { NextResponse } from "next/server";
import { parseString } from "xml2js";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../../lib/mongodb";
import Users from "../../../../lib/models/Users";

export async function GET(request: Request): Promise<NextResponse> {
  const BASE_URL = process.env.BASE_URL as string;
  if (!BASE_URL) {
    throw new Error("Please define the BASE_URL environment variable");
  }
  const JWT_SECRET = process.env.JWT_SECRET as string;
  if (!JWT_SECRET) {
    throw new Error("Please define the JWT_SECRET environment variable");
  }

  const YALIES_API_KEY = process.env.YALIES_API_KEY as string;
  if (!YALIES_API_KEY) {
    throw new Error("Please define the YALIES_API_KEY environment variable");
  }

  const { searchParams } = new URL(request.url);
  const ticket = searchParams.get("ticket");
  const from = searchParams.get("from") || "/"; // Default to home if no 'from' parameter

  if (ticket) {
    const ticketQuery = `https://secure.its.yale.edu/cas/serviceValidate?ticket=${ticket}&service=${process.env.BASE_URL}/api/auth/redirect?from=${from}`;
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

      const yaliesURL = "https://yalies.io/api/people";
      const yaliesResponse = await fetch(yaliesURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + YALIES_API_KEY,
        },
        body: JSON.stringify({ filters: { netid } }),
      });
      const yaliesJSON = await yaliesResponse.json();
      const email = yaliesJSON[0].email;

      await connectToDatabase();
      const existingUser = await Users.findOne({ netid });
      if (!existingUser) {
        console.log(`Creating new user for NetID: ${netid}`);
        await Users.create({
          netid,
        });
      } else {
        console.log(`User already exists for NetID: ${netid}`);
      }
      const token = jwt.sign({ netid, email }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const redirectPath = from && from.includes("/Events") ? "/Events" : "/";

      const response = NextResponse.redirect(`${process.env.BASE_URL}${redirectPath}`);
      response.cookies.set("token", token, {
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    } catch (e) {
      return NextResponse.json({ error: "Authentication failed: " + e }, { status: 401 });
    }
  } else {
    return NextResponse.redirect(
      `https://secure.its.yale.edu/cas/login?service=${BASE_URL}/api/auth/redirect?from=${from}`,
    );
  }
}
