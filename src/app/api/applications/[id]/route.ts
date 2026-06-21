import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Application, { ApplicationStatus } from "@/lib/models/Application";
import Club, { ClubLeader } from "@/lib/models/Club";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { checkIfAdmin } from "@/lib/serverUtils";
import { assertLeaderOrAdmin, updateApplicationStatus } from "@/lib/applicationService";

interface JWTPayload {
  netid: string;
  email: string;
  role?: string;
}

const getVerifiedUser = async (): Promise<JWTPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value || !process.env.JWT_SECRET) return null;
  try {
    return jwt.verify(token.value, process.env.JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const verified = await getVerifiedUser();
    if (!verified) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const application = await Application.findById(id);
    if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    const isAdmin = await checkIfAdmin();
    const isOwner = application.applicantNetid === verified.netid;

    if (!isOwner && !isAdmin) {
      const club = await Club.findById(application.clubId);
      const isLeader = club?.leaders.some((l: ClubLeader) => l.email === verified.email);
      if (!isLeader) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const verified = await getVerifiedUser();
    if (!verified) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status, reviewerNote } = (await req.json()) as {
      status?: ApplicationStatus;
      reviewerNote?: string;
    };

    if (!status || !Object.values(ApplicationStatus).includes(status)) {
      return NextResponse.json({ error: "Valid status is required." }, { status: 400 });
    }

    const application = await Application.findById(id);
    if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    const club = await Club.findById(application.clubId);
    if (!club) return NextResponse.json({ error: "Club not found." }, { status: 404 });

    const isAdmin = await checkIfAdmin();
    const canReview = await assertLeaderOrAdmin(club, verified.email, isAdmin);
    if (!canReview) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await updateApplicationStatus(application, verified.email, status, reviewerNote);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Failed to update application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
