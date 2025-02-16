import connectToDatabase from "../../../lib/mongodb";
import Club, { ClubLeader } from "../../../lib/models/Club";
import UpdateLog from "../../../lib/models/Updates";
import { NextResponse } from "next/server";
import { Category, IClubInput } from "../../../lib/models/Club";
import { deleteImage, getFormData, uploadImage } from "@/lib/serverUtils";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { checkIfAdmin } from "@/lib/serverUtils";

interface DecodedToken {
  netid: string;
  email: string;
  iat: number;
  exp: number;
}

function isValidDecodedToken(decoded: any): decoded is DecodedToken {
  return (
    typeof decoded === "object" &&
    typeof decoded.netid === "string" &&
    typeof decoded.email === "string" &&
    typeof decoded.role === "string" &&
    typeof decoded.iat === "number" &&
    typeof decoded.exp === "number"
  );
}

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    let isAuthenticated = false;

    if (token?.value) {
      try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET as string);
        isAuthenticated = isValidDecodedToken(decoded);
      } catch (error) {
        console.error("Token verification failed:", error);
      }
    }

    await connectToDatabase();

    if (isAuthenticated) {
      const clubs = await Club.find({});
      return NextResponse.json(clubs, { status: 200 });
    } else {
      // Non-authenticated users get filtered data -- email is protected
      const clubs = await Club.find(
        {},
        {
          "leaders.email": 0,
        },
      );
      return NextResponse.json(clubs, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    if (!(await checkIfAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

const IClubInputKeys = {
  name: "",
  subheader: "",
  description: "",
  categories: undefined,
  leaders: [],
  affiliations: undefined,
  school: undefined,
  logo: "",
  backgroundImage: "",
  numMembers: undefined,
  website: "",
  email: "",
  instagram: "",
  applyForm: "",
  mailingListForm: "",
  meeting: "",
  calendarLink: "",
  yaleConnectId: undefined,
  intensity: undefined,
  howToJoin: "",
  scraped: undefined,
  inactive: undefined,
  applicationStatus: "",
  recruitmentStatus: undefined,
  recruitmentStartDate: undefined,
  recruitmentEndDate: undefined,
  aliases: [],
};

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();

    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Club ID is required." }, { status: 400 });
    }

    const data = await getFormData(req);

    // Disallow updates to restricted fields
    const restrictedFields = ["yaleConnectId", "scraped", "inactive", "_id", "createdAt", "updatedAt", "followers"];
    const allowedFields = Object.keys(IClubInputKeys);
    const validUpdateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key) && !restrictedFields.includes(key)),
    );

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

    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token?.value || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = jwt.verify(token.value, process.env.JWT_SECRET);
    if (!isValidDecodedToken(verified)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const isAdmin = await checkIfAdmin();

    if (
      !isAdmin &&
      (!verified.email ||
        (verified.email && !originalClub.leaders.some((leader: ClubLeader) => leader.email === verified.email)))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (data["logoFile"] !== undefined) {
      if (originalClub.logo && originalClub.logo.startsWith("https://yaleclubs")) {
        await deleteImage(originalClub.logo);
      }
      const fileUrl = await uploadImage(data["logoFile"], "logos", false);
      validUpdateData["logo"] = fileUrl;
    }

    if (data["backgroundImageFile"] !== undefined) {
      if (originalClub.backgroundImage && originalClub.backgroundImage.startsWith("https://yaleclubs")) {
        await deleteImage(originalClub.backgroundImage);
      }
      const fileUrl = await uploadImage(data["backgroundImageFile"], "backgrounds", false);
      validUpdateData["backgroundImage"] = fileUrl;
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
      // Save the change log
      await UpdateLog.create({
        documentId: id,
        updatedBy: verified.email,
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
