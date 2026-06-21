import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Club, { ApplicationQuestionType, ClubLeader, ClubApplicationForm } from "@/lib/models/Club";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { checkIfAdmin } from "@/lib/serverUtils";

interface JWTPayload {
  email: string;
}

const isValidForm = (applicationForm: ClubApplicationForm): boolean => {
  if (!applicationForm.title || !Array.isArray(applicationForm.questions)) {
    return false;
  }

  return applicationForm.questions.every(
    (question) =>
      question.id &&
      question.label &&
      Object.values(ApplicationQuestionType).includes(question.type) &&
      typeof question.required === "boolean",
  );
};

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { clubId, applicationForm } = (await req.json()) as {
      clubId?: string;
      applicationForm?: ClubApplicationForm;
    };

    if (!clubId || !applicationForm) {
      return NextResponse.json({ error: "clubId and applicationForm are required." }, { status: 400 });
    }

    if (!isValidForm(applicationForm)) {
      return NextResponse.json({ error: "Invalid application form payload." }, { status: 400 });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token?.value || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = jwt.verify(token.value, process.env.JWT_SECRET) as JWTPayload;
    const isAdmin = await checkIfAdmin();
    const isLeader = club.leaders.some((leader: ClubLeader) => leader.email === verified.email);
    if (!isAdmin && !isLeader) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    club.applicationForm = applicationForm;
    await club.save();

    return NextResponse.json(
      { message: "Application form updated.", applicationForm: club.applicationForm },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update application form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
