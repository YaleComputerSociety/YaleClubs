import connectToDatabase from "@/lib/mongodb";
import Event from "../../../lib/models/Event";
import { NextResponse } from "next/server";
import { Tag, IEventInput } from "../../../lib/models/Event";
import Club, { IClub, ClubLeader } from "@/lib/models/Club";

export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // only fetch events that are happening today or in the future
    const events = await Event.find({ start: { $gte: today } }).sort({ start: 1 });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error reading savedData.json:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();

    let body: IEventInput;

    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validate required fields
    if (!body.name || !body.description || !body.clubs || !body.start || !body.location) {
      return NextResponse.json(
        { error: "Name, description, club, start and location are required fields." },
        { status: 400 },
      );
    }

    // Validate `tags` if provided
    if (body.tags && !Array.isArray(body.tags)) {
      return NextResponse.json({ error: "Tags must be an array of Category values." }, { status: 400 });
    }

    // Validate `tags` against Tag enum
    if (body.tags && !body.tags.every((tag) => Object.values(Tag).includes(tag))) {
      return NextResponse.json({ error: "Invalid tag provided." }, { status: 400 });
    }

    const event = new Event(body);

    const savedEvent = await event.save();

    // Respond with the created event
    return NextResponse.json(savedEvent, { status: 200 });
  } catch (error) {
    console.log("error");
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();

    let body: IEventInput;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("obtained body");

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    console.log(id);

    if (!id) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Disallow updates to restricted fields
    const restrictedFields = ["_id", "createdAt", "updatedAt", "createdBy"];
    const validUpdateData = Object.fromEntries(Object.entries(body).filter(([key]) => !restrictedFields.includes(key)));

    if (Object.keys(validUpdateData).length === 0) {
      console.log("no fields", validUpdateData);
      return NextResponse.json(
        { error: "No valid fields provided for update. Restricted fields cannot be updated." },
        { status: 400 },
      );
    }

    // Fetch the original Event data
    const originalEvent = await Event.findById(id);
    if (!originalEvent) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    console.log(originalEvent);

    const clubsHostingEvent = originalEvent.clubs;
    const clubs: IClub[] = await Promise.all(
      clubsHostingEvent.map(
        async (club: IClub) =>
          await Club.find({
            name: club,
          }),
      ),
    );

    if (clubs == undefined) {
      return NextResponse.json({ error: "Event is not associated with a valid club." }, { status: 404 });
    }

    const admin_emails = [
      "lucas.huang@yale.edu",
      "addison.goolsbee@yale.edu",
      "francis.fan@yale.edu",
      "grady.yu@yale.edu",
      "lauren.lee.ll2243@yale.edu",
      "ethan.mathieu@yale.edu",
    ];

    const updateEmail = req.headers.get("X-Email");
    console.log(updateEmail);
    // if (
    //   !updateEmail ||
    //   (updateEmail &&
    //     !clubs.flatMap((club: IClub) => club.leaders).some((leader: ClubLeader) => leader.email === updateEmail) &&
    //     updateEmail !== "admin_a1b2c3e" &&
    //     !admin_emails.includes(updateEmail))
    // ) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Perform the update
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: validUpdateData },
      { new: true, runValidators: true },
    );
    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found after update." }, { status: 404 });
    }

    // // Generate change log
    // const changeLog = generateChangeLog(
    //   {
    //     name: originalClub.name,
    //     email: originalClub.email,
    //     leaders: originalClub.leaders,
    //   },
    //   {
    //     name: updatedClub.name,
    //     email: updatedClub.email,
    //     leaders: updatedClub.leaders,
    //   },
    // );

    // if (changeLog) {
    //   console.log(changeLog);

    //   // Save the change log
    //   await UpdateLog.create({
    //     documentId: id,
    //     updatedBy: updateEmail,
    //     changes: changeLog,
    //   });
    // }

    // Respond with the updated club
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const netid = req.headers.get("X-NetID");
    if (netid !== "admin_a1b2c3e") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the event ID from the query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Attempt to delete the event
    const result = await Event.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // Respond with a success message
    return NextResponse.json({ message: "Event deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
