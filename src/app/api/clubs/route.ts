import connectToDatabase from "../../../lib/mongodb";
import Club, { ClubLeader } from "../../../lib/models/Club";
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

const generateChangeLog = (
  original: { name?: string; email?: string; leaders?: ClubLeader[] },
  updates: { name?: string; email?: string; leaders?: ClubLeader[] },
): string => {
  const changes: string[] = [];

  // Log changes to the club name
  if (original.name !== updates.name) {
    changes.push(`Name changed from "${original.name}" to "${updates.name}"`);
  }

  // Log changes to the club email
  if (original.email !== updates.email) {
    changes.push(`Email changed from "${original.email}" to "${updates.email}"`);
  }

  // Log changes to the club leaders
  if (JSON.stringify(original.leaders) !== JSON.stringify(updates.leaders)) {
    const originalEmails = original.leaders?.map((leader) => leader.email) || [];
    const updatedEmails = updates.leaders?.map((leader) => leader.email) || [];
    changes.push(`Leaders changed from [${originalEmails.join(", ")}] to [${updatedEmails.join(", ")}]`);
  }

  return changes.join(", ");
};

export async function PUT(req: Request): Promise<NextResponse> {
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

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Club ID is required." }, { status: 400 });
    }

    // Disallow updates to restricted fields
    const restrictedFields = ["yaleConnectId", "scraped", "inactive", "_id", "createdAt", "updatedAt"];
    const validUpdateData = Object.fromEntries(Object.entries(body).filter(([key]) => !restrictedFields.includes(key)));

    if (Object.keys(validUpdateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update. Restricted fields cannot be updated." },
        { status: 400 },
      );
    }

    // Fetch the original club data
    const originalClub = await Club.findById(id);
    if (!originalClub) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    const updateEmail = req.headers.get("X-Email");
    if (
      !originalClub.leaders.some((leader: ClubLeader) => leader.email === updateEmail) &&
      updateEmail !== "admin_a1b2c3e"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Perform the update
    const updatedClub = await Club.findByIdAndUpdate(id, { $set: validUpdateData }, { new: true, runValidators: true });
    if (!updatedClub) {
      return NextResponse.json({ error: "Club not found after update." }, { status: 404 });
    }

    // Generate change log
    const changeLog = generateChangeLog(
      {
        name: originalClub.name,
        email: originalClub.email,
        leaders: originalClub.leaders,
      },
      {
        name: updatedClub.name,
        email: updatedClub.email,
        leaders: updatedClub.leaders,
      },
    );

    if (changeLog) {
      console.log(changeLog);

      // Save the change log
      await UpdateLog.create({
        documentId: id,
        changes: changeLog,
      });
    }

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
