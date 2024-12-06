import connectToDatabase from "../../../lib/mongodb";
import Club from "../../../lib/models/Club";
import { NextResponse } from "next/server";
import { Category, IClubInput } from "../../../lib/models/Club";

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

    let body: IClubInput;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validate required fields
    if (!body.name || !body.leaders || !Array.isArray(body.leaders)) {
      return NextResponse.json({ error: "Name and leaders are required fields." }, { status: 400 });
    }

    // Validate `categories` if provided
    if (body.categories && !Array.isArray(body.categories)) {
      return NextResponse.json({ error: "Categories must be an array of Category values." }, { status: 400 });
    }

    // Validate `categories` against Category enum
    if (body.categories && !body.categories.every((category) => Object.values(Category).includes(category))) {
      return NextResponse.json({ error: "Invalid category provided." }, { status: 400 });
    }

    // Validate `affiliations` if provided
    if (body.affiliations && !Array.isArray(body.affiliations)) {
      return NextResponse.json({ error: "Affiliations must be an array of ClubAffiliation values." }, { status: 400 });
    }

    // // Validate `affiliations` against ClubAffiliation enum
    // if (
    //   body.affiliations &&
    //   !body.affiliations.every((affiliation) => Object.values(ClubAffiliation).includes(affiliation))
    // ) {
    //   return NextResponse.json({ error: "Invalid affiliation provided." }, { status: 400 });
    // }

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

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    // Connect to the database
    await connectToDatabase();

    const netid = req.headers.get("X-NetID");
    if (netid !== "admin_a1b2c3e") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the club ID from the query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Club ID is required." }, { status: 400 });
    }

    // Attempt to delete the club
    const result = await Club.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    // Respond with a success message
    return NextResponse.json({ message: "Club deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting club:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
