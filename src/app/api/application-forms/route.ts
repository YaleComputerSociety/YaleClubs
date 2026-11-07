import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Club, { ClubLeader } from "@/lib/models/Club";
import ApplicationForm from "@/lib/models/ApplicationForm";
import { parseApplicationForm } from "@/lib/applicationForms";

async function getFormUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return { error: "Sign in to manage application forms.", status: 401 } as const;
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decoded === "string" || typeof decoded.netid !== "string" || typeof decoded.email !== "string") {
      return { error: "Invalid session.", status: 401 } as const;
    }
    return { user: { netid: decoded.netid, email: decoded.email, role: decoded.role } };
  } catch {
    return { error: "Your session has expired. Sign in again.", status: 401 } as const;
  }
}

export async function GET(request: Request) {
  try {
    const session = await getFormUser();
    if (!session.user) return NextResponse.json({ error: session.error }, { status: session.status });
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const before = searchParams.get("before");
    if (!clubId || !/^[a-f\d]{24}$/i.test(clubId) || (before !== null && !/^[a-f\d]{24}$/i.test(before))) {
      return NextResponse.json({ error: "Invalid club ID or page cursor." }, { status: 400 });
    }
    await connectToDatabase();
    const club = await Club.findById(clubId);
    if (!club) return NextResponse.json({ error: "Club not found." }, { status: 404 });
    if (
      session.user.role !== "admin" &&
      !club.leaders.some((leader: ClubLeader) => leader.email === session.user.email)
    ) {
      return NextResponse.json({ error: "Only this club's leaders can view its forms." }, { status: 403 });
    }
    const forms = await ApplicationForm.find({
      clubId,
      schemaVersion: 1,
      ...(before ? { _id: { $lt: before } } : {}),
    })
      .select("_id title opensAt closesAt questions createdAt")
      .sort({ _id: -1 })
      .limit(21)
      .lean();
    const page = forms.slice(0, 20);
    return NextResponse.json(
      { forms: page, nextCursor: forms.length > 20 ? String(page[page.length - 1]._id) : null },
      { status: 200, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Error fetching application forms:", error);
    return NextResponse.json({ error: "Unable to load applications. Please try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getFormUser();
    if (!session.user) return NextResponse.json({ error: session.error }, { status: session.status });
    const user = session.user;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }
    const parsed = parseApplicationForm(body);
    if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await connectToDatabase();
    const club = await Club.findById(parsed.data.clubId);
    if (!club) return NextResponse.json({ error: "Club not found." }, { status: 404 });
    if (user.role !== "admin" && !club.leaders.some((leader: ClubLeader) => leader.email === user.email)) {
      return NextResponse.json({ error: "Only this club's leaders can create its forms." }, { status: 403 });
    }
    const form = await ApplicationForm.create({ ...parsed.data, createdBy: user.netid });
    return NextResponse.json({ id: form._id.toString(), title: form.title }, { status: 201 });
  } catch (error) {
    console.error("Error creating application form:", error);
    return NextResponse.json({ error: "Unable to save the form. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getFormUser();
    if (!session.user) return NextResponse.json({ error: session.error }, { status: session.status });
    const params = new URL(request.url).searchParams;
    const clubId = params.get("clubId");
    const formId = params.get("formId");
    if (!clubId || !formId || !/^[a-f\d]{24}$/i.test(clubId) || !/^[a-f\d]{24}$/i.test(formId)) {
      return NextResponse.json({ error: "A valid club ID and form ID are required." }, { status: 400 });
    }
    await connectToDatabase();
    const club = await Club.findById(clubId);
    if (!club) return NextResponse.json({ error: "Club not found." }, { status: 404 });
    if (
      session.user.role !== "admin" &&
      !club.leaders.some((leader: ClubLeader) => leader.email === session.user.email)
    ) {
      return NextResponse.json({ error: "Only this club's leaders can delete its forms." }, { status: 403 });
    }
    const result = await ApplicationForm.deleteOne({ _id: formId, clubId, schemaVersion: 1 });
    if (!result.deletedCount) {
      return NextResponse.json({ error: "Application form not found for this club." }, { status: 404 });
    }
    return NextResponse.json({ deletedId: formId }, { status: 200 });
  } catch (error) {
    console.error("Error deleting application form:", error);
    return NextResponse.json({ error: "Unable to delete the application. Please try again." }, { status: 500 });
  }
}
