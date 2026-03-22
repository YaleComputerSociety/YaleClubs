import { NextResponse } from "next/server";
import { parseString } from "xml2js";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../../lib/mongodb";
import Users from "../../../../lib/models/Users";

/** Validates that a redirect target is a same-origin path (starts with "/"). */
function sanitizeRedirectPath(from: string | null): string {
  if (!from) return "/";
  // Only allow relative paths to prevent open-redirect attacks
  const trimmed = from.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  return "/";
}

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
  const redirectPath = sanitizeRedirectPath(searchParams.get("from"));

  // URL-encode the full service URL so CAS handles it correctly
  const serviceURL = encodeURIComponent(`${BASE_URL}/api/auth/redirect?from=${redirectPath}`);

  if (ticket) {
    const ticketQuery = `https://secure.its.yale.edu/cas/serviceValidate?ticket=${ticket}&service=${serviceURL}`;
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

      if (!yaliesResponse.ok) {
        const errorText = await yaliesResponse.text();
        console.error(`Yalies API error (${yaliesResponse.status}):`, errorText);
        return NextResponse.json(
          { error: "Failed to fetch user information from Yale directory. Please contact support." },
          { status: 500 },
        );
      }

      const yaliesJSON = await yaliesResponse.json();

      if (!Array.isArray(yaliesJSON) || yaliesJSON.length === 0) {
        console.error(`No user found in Yalies API for NetID: ${netid}`);
        return NextResponse.json({ error: "User not found in Yale directory" }, { status: 404 });
      }

      const email = yaliesJSON[0].email;

      await connectToDatabase();
      let existingUser = await Users.findOne({ netid });
      if (!existingUser) {
        existingUser = await Users.create({ netid });
      }

      const token = jwt.sign({ netid, email, role: existingUser?.role || "user" }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const redirectResponse = NextResponse.redirect(`${BASE_URL}${redirectPath}`);
      redirectResponse.cookies.set("token", token, {
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "strict",
      });

      return redirectResponse;
    } catch (e) {
      console.error("Authentication error:", e);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }
  } else {
    return NextResponse.redirect(`https://secure.its.yale.edu/cas/login?service=${serviceURL}`);
  }
}
