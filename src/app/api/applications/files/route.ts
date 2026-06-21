import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Application, { ApplicationResponse } from "@/lib/models/Application";
import Club, { ClubLeader } from "@/lib/models/Club";
import { checkIfAdmin, getPresignedFileUrl } from "@/lib/serverUtils";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

export async function GET(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const verified = await getVerifiedUser();
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const applicationId = url.searchParams.get("applicationId");
    const questionId = url.searchParams.get("questionId");

    if (!applicationId || !questionId) {
      return NextResponse.json({ error: "applicationId and questionId are required." }, { status: 400 });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const isAdmin = await checkIfAdmin();
    const isOwner = application.applicantNetid === verified.netid;

    if (!isOwner && !isAdmin) {
      const club = await Club.findById(application.clubId);
      const isLeader = club?.leaders.some((leader: ClubLeader) => leader.email === verified.email);
      if (!isLeader) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const response = application.responses.find((item: ApplicationResponse) => item.questionId === questionId);
    if (!response?.fileUrl) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const presignedUrl = await getPresignedFileUrl(response.fileUrl);
    if (!presignedUrl) {
      return NextResponse.json({ error: "Failed to generate download link." }, { status: 500 });
    }

    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error("Failed to download application file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
