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

      const yaliesURL = "https://api.yalies.io/v2/people";
      const yaliesResponse = await fetch(yaliesURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + YALIES_API_KEY,
        },
        body: JSON.stringify({ filters: { netid } }),
      });
      
      // Check if the Yalies API request was successful
      if (!yaliesResponse.ok) {
        const errorText = await yaliesResponse.text();
        console.error(`Yalies API error (${yaliesResponse.status}):`, errorText);
        return NextResponse.json({ 
          error: "Failed to fetch user information from Yale directory. Please contact support." 
        }, { status: 500 });
      }
      
      const yaliesJSON = await yaliesResponse.json();
      
      // Check if yaliesJSON is an array and has at least one element
      if (!Array.isArray(yaliesJSON) || yaliesJSON.length === 0) {
        console.error(`No user found in Yalies API for NetID: ${netid}`);
        return NextResponse.json({ error: "User not found in Yale directory" }, { status: 404 });
      }
      
      const email = yaliesJSON[0].email;

      await connectToDatabase();
      let existingUser = await Users.findOne({ netid });
      console.log("Here 2");
      if (!existingUser) {
        console.log(`Creating new user for NetID: ${netid}`);
        existingUser = await Users.create({
          netid,
        });
      } else {
        console.log("Here 3");
        console.log(`User already exists for NetID: ${netid}`);
      }
      const token = jwt.sign({ netid, email, role: existingUser?.role || "user" }, JWT_SECRET, {
        expiresIn: "7d",
      });
      console.log("Here 4");
      const redirectPath = from && from.includes("/Events") ? "/Events" : "/";

      const response = NextResponse.redirect(`${process.env.BASE_URL}${redirectPath}`);
      response.cookies.set("token", token, {
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "strict",
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
