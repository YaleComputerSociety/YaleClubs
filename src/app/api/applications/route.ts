import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Application, { ApplicationStatus } from "@/lib/models/Application";
import Club, { ApplicationQuestionType, ClubLeader } from "@/lib/models/Club";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { checkIfAdmin } from "@/lib/serverUtils";
import { uploadImage } from "@/lib/serverUtils";
import {
  buildNewApplicationNotifications,
  sendApplicationNotifications,
} from "@/lib/applicationNotifications";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_ACTIVE_APPLICATIONS = 20;

interface JWTPayload {
  netid: string;
  email: string;
  role?: string;
}

interface RawAnswer {
  questionId: string;
  textAnswer?: string;
}

const getVerifiedUser = async (): Promise<JWTPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token?.value || !process.env.JWT_SECRET) {
    return null;
  }

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
    const clubId = url.searchParams.get("clubId");
    const isAdmin = await checkIfAdmin();

    if (clubId) {
      const club = await Club.findById(clubId);
      if (!club) {
        return NextResponse.json({ error: "Club not found." }, { status: 404 });
      }

      const isLeader = club.leaders.some((leader: ClubLeader) => leader.email === verified.email);
      if (!isLeader && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const applications = await Application.find({ clubId }).sort({ createdAt: -1 });
      return NextResponse.json(applications, { status: 200 });
    }

    const applications = await Application.find({ applicantNetid: verified.netid }).sort({ createdAt: -1 });
    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const verified = await getVerifiedUser();
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const formData = await req.formData();
    const payloadRaw = formData.get("payload");
    if (typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Missing payload." }, { status: 400 });
    }

    let payload: {
      clubId: string;
      applicantName?: string;
      answers: RawAnswer[];
    };

    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    if (!payload.clubId || !Array.isArray(payload.answers)) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const club = await Club.findById(payload.clubId);
    if (!club) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    if (!club.applicationForm?.enabled || !club.applicationForm?.questions?.length) {
      return NextResponse.json({ error: "Applications are not enabled for this club." }, { status: 400 });
    }

    const existingSubmission = await Application.findOne({
      clubId: club._id,
      applicantNetid: verified.netid,
      status: { $in: [ApplicationStatus.SUBMITTED, ApplicationStatus.IN_REVIEW] },
    });

    if (existingSubmission) {
      return NextResponse.json({ error: "You already have an active application for this club." }, { status: 409 });
    }

    const activeApplicationCount = await Application.countDocuments({
      applicantNetid: verified.netid,
      status: { $in: [ApplicationStatus.SUBMITTED, ApplicationStatus.IN_REVIEW] },
    });

    if (activeApplicationCount >= MAX_ACTIVE_APPLICATIONS) {
      return NextResponse.json(
        {
          error: `You have reached the maximum of ${MAX_ACTIVE_APPLICATIONS} active applications. Wait for some to be reviewed before submitting more.`,
        },
        { status: 429 },
      );
    }

    const answerMap = new Map(payload.answers.map((answer) => [answer.questionId, answer]));
    const responses = [];

    for (const question of club.applicationForm.questions) {
      const answer = answerMap.get(question.id);
      const baseResponse = {
        questionId: question.id,
        label: question.label,
        type: question.type,
      };

      if (question.type === ApplicationQuestionType.FILE_DROP) {
        const file = formData.get(`file_${question.id}`);
        if (!(file instanceof File)) {
          if (question.required) {
            return NextResponse.json({ error: `Missing required file for "${question.label}".` }, { status: 400 });
          }
          responses.push(baseResponse);
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          return NextResponse.json({ error: `File "${file.name}" exceeds the 10 MB size limit.` }, { status: 413 });
        }

        const uploadedUrl = await uploadImage(file, "applications", true);
        if (!uploadedUrl) {
          return NextResponse.json(
            { error: `Failed to upload file for "${question.label}". Please try again.` },
            { status: 500 },
          );
        }

        responses.push({
          ...baseResponse,
          fileUrl: uploadedUrl,
          fileName: file.name,
        });
      } else {
        const text = answer?.textAnswer?.trim() ?? "";
        if (question.required && !text) {
          return NextResponse.json({ error: `Missing required response for "${question.label}".` }, { status: 400 });
        }
        responses.push({
          ...baseResponse,
          textAnswer: text || undefined,
        });
      }
    }

    const application = await Application.create({
      clubId: club._id,
      clubName: club.name,
      applicantNetid: verified.netid,
      applicantEmail: verified.email,
      applicantName: payload.applicantName,
      status: ApplicationStatus.SUBMITTED,
      responses,
    });

    const leaderEmails = club.leaders.map((leader: ClubLeader) => leader.email).filter(Boolean);
    await sendApplicationNotifications(
      buildNewApplicationNotifications(
        club.name,
        String(club._id),
        verified.email,
        payload.applicantName,
        leaderEmails,
      ),
    );

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Failed to submit application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
