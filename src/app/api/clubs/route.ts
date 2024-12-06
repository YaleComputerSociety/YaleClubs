import connectToDatabase from "../../../lib/mongodb";
import Club from "../../../lib/models/Club";
import IClub from "../../../lib/models/Club";
import UpdateLog from "../../../lib/models/Updates";
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

    // Parse the incoming JSON body
    const body: IClubInput = await req.json();

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

const generateChangeLog = (
  original: { [key: string]: typeof IClub },
  updates: { [key: string]: typeof IClub },
): string => {
  const changes: string[] = [];

  for (const key in updates) {
    if (JSON.stringify(original[key]) !== JSON.stringify(updates[key])) {
      changes.push(`old ${key}: ${original[key]}, new ${key}: ${updates[key]}`);
    }
  }

  return changes.join(", ");
};

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    // connect to db
    await connectToDatabase();

    // get info and validate
    const body = await req.json();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    console.log(id);
    if (!id) {
      return NextResponse.json({ error: "Club ID is required." }, { status: 400 });
    }
    const { name, email, leaders } = body;
    if (!name && !email && !leaders) {
      return NextResponse.json(
        { error: "At least one of 'name', 'email', or 'leaders' must be provided for update." },
        { status: 400 },
      );
    }
    if (leaders && !Array.isArray(leaders)) {
      return NextResponse.json({ error: "'leaders' must be an array." }, { status: 400 });
    }
    const originalClub = await Club.findById(id);
    if (!Club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }
    // create update item
    const updateData: Partial<IClubInput> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (leaders) updateData.leaders = leaders;

    // Perform the update
    const updatedClub = await Club.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    // console.log(updatedClub);
    if (!updatedClub) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    const changeLog = generateChangeLog(originalClub, updatedClub);
    console.log(changeLog);
    await UpdateLog.create({
      documentId: id,
      changes: changeLog,
    });

    // Respond with the updated club
    return NextResponse.json(updatedClub, { status: 200 });
  } catch (error) {
    console.error("Error updating club:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    // Connect to the database
    await connectToDatabase();

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
