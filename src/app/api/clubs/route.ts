import connectToDatabase from "../../../lib/mongodb";
import Club from "../../../lib/models/Club";
import { NextResponse } from "next/server";
import { ClubCategory, ClubAffiliation, IClubInput } from "../../../lib/models/Club";

export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const clubs = await Club.find({});
    return NextResponse.json(clubs, { status: 200 });
  } catch (error) {
    console.error("Error reading savedData.json:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST request
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse the incoming JSON body
    const body: IClubInput = await req.json();

    // Validate required fields
    if (!body.name || !body.leaders || !Array.isArray(body.leaders)) {
      return NextResponse.json({ error: "Name and leaders are required fields." }, { status: 400 });
    }

    // Validate `categories` if provided
    if (body.categories && !Array.isArray(body.categories)) {
      return NextResponse.json({ error: "Categories must be an array of ClubCategory values." }, { status: 400 });
    }

    // Validate `categories` against ClubCategory enum
    if (body.categories && !body.categories.every((category) => Object.values(ClubCategory).includes(category))) {
      return NextResponse.json({ error: "Invalid category provided." }, { status: 400 });
    }

    // Validate `affiliations` if provided
    if (body.affiliations && !Array.isArray(body.affiliations)) {
      return NextResponse.json({ error: "Affiliations must be an array of ClubAffiliation values." }, { status: 400 });
    }

    // Validate `affiliations` against ClubAffiliation enum
    if (
      body.affiliations &&
      !body.affiliations.every((affiliation) => Object.values(ClubAffiliation).includes(affiliation))
    ) {
      return NextResponse.json({ error: "Invalid affiliation provided." }, { status: 400 });
    }

    // Create a new club
    const club = new Club(body);

    // Save the club to the database
    const savedClub = await club.save();

    // Respond with the created club
    return NextResponse.json(savedClub, { status: 201 });
  } catch (error) {
    console.error("Error creating club:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
