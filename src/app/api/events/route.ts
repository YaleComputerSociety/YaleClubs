import connectToDatabase from "@/lib/mongodb";
import Event, { Frequency } from "../../../lib/models/Event";
import { NextResponse } from "next/server";
import { Tag, IEventInput } from "../../../lib/models/Event";
import Club, { ClubLeader, IClub } from "@/lib/models/Club";
import UpdateLog from "../../../lib/models/Updates";

const generateChangeLog = (
  original: {
    name?: string;
    description?: string;
    location?: string;
    clubs?: string[];
    start?: Date;
    end?: Date;
  },
  updates: {
    name?: string;
    description?: string;
    location?: string;
    clubs?: string[];
    start?: Date;
    end?: Date;
  },
): string => {
  const changes: string[] = [];

  if (original.name !== updates.name) {
    changes.push(`Name changed from "${original.name}" to "${updates.name}"`);
  }

  if (original.description !== updates.description) {
    changes.push(`Description updated`);
  }

  if (original.location !== updates.location) {
    changes.push(`Location changed from "${original.location}" to "${updates.location}"`);
  }

  if (JSON.stringify(original.clubs) !== JSON.stringify(updates.clubs)) {
    changes.push(`Clubs changed from [${original.clubs?.join(", ")}] to [${updates.clubs?.join(", ")}]`);
  }

  if (original.start?.toString() !== updates.start?.toString()) {
    changes.push(`Start time updated from ${original.start} to ${updates.start}`);
  }

  if (original.end?.toString() !== updates.end?.toString()) {
    changes.push(`End time updated from ${original.end} to ${updates.end}`);
  }

  return changes.join(", ");
};

export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const events = await Event.find().sort({ start: 1 });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error reading savedData.json:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Get user email from the header set by middleware
    const userEmail = req.headers.get("X-Email");

    if (!userEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let body: IEventInput;

    try {
      body = await req.json();
      console.log(body);
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

    // Validate `tags` against Tag enum
    if (body.tags && !body.tags.every((tag) => Object.values(Tag).includes(tag))) {
      return NextResponse.json({ error: "Invalid tag provided." }, { status: 400 });
    }
    /*
    if (body.frequency && !Object.values(Frequency).includes(body.frequency)) {
      return NextResponse.json({ error: "Invalid frequency provided." }, { status: 400 });
    }*/

    if (!body.recurringEnd && !(body.frequency == null || body.frequency.length == 0)) {
      console.log("1");
      return NextResponse.json({ error: "Recurring end date is required filed." }, { status: 400 });
    }

    if (new Date(body.recurringEnd) <= new Date(body.start) && body.frequency != null && body.frequency.length != 0) {
      console.log("3");
      return NextResponse.json({ error: "Invalid start and end date pair." }, { status: 400 });
    }

    if (body.frequency != null) {
      if (body.frequency[0] == Frequency.Weekly) {
        //compares the duration of recursion to the number of miliseconds in a week
        if (body.recurringEnd.valueOf() - body.start.valueOf() < 6.048e8) {
          console.log("3");
          console.log(body.recurringEnd.valueOf() - body.start.valueOf());
          return NextResponse.json(
            { error: "Durration of recurring event too short for event to reoccur with selected frequency." },
            { status: 400 },
          );
        }
      }

      if (body.frequency[0] == Frequency.BiWeekly) {
        if (body.recurringEnd.valueOf() - body.start.valueOf() < 6.048e8 * 2) {
          console.log("4");
          return NextResponse.json(
            { error: "Durration of recurring event too short for event to reoccur with selected frequency." },
            { status: 400 },
          );
        }
      }
      if (body.frequency[0] == Frequency.Monthly) {
        console.log("month");
        //const endofRecursion = new Date(body.recurringEnd);
        //const plusMonth = new Date(body.start.setMonth(body.start.getMonth() + 1));
        if (body.recurringEnd.valueOf() - body.start.valueOf() < 2.592e9) {
          //if(plusMonth < endofRecursion)
          console.log("Durration of recurring event too short for event to reoccur with selected frequency");
          return NextResponse.json(
            { error: "Durration of recurring event too short for event to reoccur with selected frequency." },
            { status: 400 },
          );
          //return NextResponse.json({ error: "Durration of recurring event too short for event to reoccur with selected frequency." }, { status: 400 });
        }
      }
    }

    /*
    // Validate `frequency` against Frequency enum
    if (!(Object.values(Frequency).includes(body.frequency))) {
      return NextResponse.json({ error: "Invalid frequency provided." }, { status: 400 });
    } */

    let isLeaderOfAnyClub = false;
    for (const clubName of body.clubs) {
      const club = await Club.findOne({ name: clubName });
      if (!club) {
        return NextResponse.json({ error: `Club ${clubName} not found` }, { status: 404 });
      }

      const isLeader = club.leaders.some((leader: ClubLeader) => leader.email === userEmail);
      if (isLeader) {
        isLeaderOfAnyClub = true;
        break;
      }
    }

    if (!isLeaderOfAnyClub) {
      return NextResponse.json(
        { error: "You must be a leader of at least one of the clubs to create an event" },
        { status: 403 },
      );
    }

    body.createdBy = userEmail;

    const event = new Event({ ...body, createdBy: userEmail });
    const savedEvent = await event.save();

    // Log the creation in UpdateLog
    await UpdateLog.create({
      documentId: savedEvent._id,
      updatedBy: userEmail,
      changes: "Event created",
    });

    return NextResponse.json(savedEvent, { status: 200 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const userEmail = req.headers.get("X-Email");

    if (!userEmail) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let body: IEventInput;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    let isLeaderOfAnyClub = false;
    for (const clubName of body.clubs) {
      const club = await Club.findOne({ name: clubName });
      if (!club) {
        return NextResponse.json({ error: `Club ${clubName} not found` }, { status: 404 });
      }

      const isLeader = club.leaders.some((leader: ClubLeader) => leader.email === userEmail);
      if (isLeader) {
        isLeaderOfAnyClub = true;
        break;
      }
    }

    if (!isLeaderOfAnyClub) {
      return NextResponse.json(
        { error: "You must be a leader of at least one of the clubs to edit the event" },
        { status: 403 },
      );
    }

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

    // Perform the update
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: validUpdateData },
      { new: true, runValidators: true },
    );

    const changeLog = generateChangeLog(
      {
        name: originalEvent.name,
        description: originalEvent.description,
        location: originalEvent.location,
        clubs: originalEvent.clubs,
        start: originalEvent.start,
        end: originalEvent.end,
      },
      {
        name: updatedEvent.name,
        description: updatedEvent.description,
        location: updatedEvent.location,
        clubs: updatedEvent.clubs,
        start: updatedEvent.start,
        end: updatedEvent.end,
      },
    );

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found after update." }, { status: 404 });
    }

    const updateEmail = req.headers.get("X-Email");

    if (changeLog) {
      console.log(changeLog);

      // Save the change log
      await UpdateLog.create({
        documentId: id,
        updatedBy: updateEmail,
        changes: changeLog,
      });
    }

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
    // const userEmail = req.headers.get("X-Email");
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
