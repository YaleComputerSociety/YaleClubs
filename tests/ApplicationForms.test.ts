import { DELETE, GET, POST } from "@/app/api/application-forms/route";
import { parseApplicationForm } from "@/lib/applicationForms";
import ApplicationForm from "@/lib/models/ApplicationForm";
import Club from "@/lib/models/Club";
import connectToDatabase from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, options: { status: number }) => ({ status: options.status, json: async () => body }),
  },
}));
jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("jsonwebtoken", () => ({ __esModule: true, default: { verify: jest.fn() } }));
jest.mock("@/lib/mongodb", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/lib/models/Club", () => ({ __esModule: true, default: { findById: jest.fn() } }));
jest.mock("@/lib/models/ApplicationForm", () => ({
  __esModule: true,
  default: { create: jest.fn(), find: jest.fn(), deleteOne: jest.fn() },
}));

function validForm() {
  return {
    clubId: "507f1f77bcf86cd799439011",
    title: " Fall Application ",
    opensAt: "2026-11-10T14:00:00.000Z",
    closesAt: "2026-11-20T22:00:00.000Z",
    questions: [
      { id: "q1", type: "short-answer", prompt: " Why join? ", wordLimit: 250 },
      {
        id: "q2",
        type: "multiple-choice",
        prompt: "Which team?",
        options: [
          { id: "o1", text: "Events" },
          { id: "o2", text: "Outreach" },
        ],
      },
    ],
  };
}

function request(body: unknown = validForm()) {
  return { json: async () => body } as Request;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "test-secret";
  (cookies as jest.Mock).mockResolvedValue({ get: () => ({ value: "test-token" }) });
  (jwt.verify as jest.Mock).mockReturnValue({ netid: "leader1", email: "leader@example.com", role: "user" });
  (Club.findById as jest.Mock).mockResolvedValue({ leaders: [{ email: "leader@example.com" }] });
  (ApplicationForm.create as jest.Mock).mockResolvedValue({ _id: "saved-form", title: "Fall Application" });
});

it("saves ordered typed questions, UTC dates, club ownership and the verified creator", async () => {
  const response = await POST(request({ ...validForm(), createdBy: "forged-user" }));
  expect(response.status).toBe(201);
  expect(ApplicationForm.create).toHaveBeenCalledWith({
    ...validForm(),
    title: "Fall Application",
    opensAt: new Date(validForm().opensAt),
    closesAt: new Date(validForm().closesAt),
    createdBy: "leader1",
    questions: [{ id: "q1", type: "short-answer", prompt: "Why join?", wordLimit: 250 }, validForm().questions[1]],
  });
});

it("requires a signed-in user", async () => {
  (cookies as jest.Mock).mockResolvedValue({ get: () => undefined });
  expect((await POST(request())).status).toBe(401);
  expect(connectToDatabase).not.toHaveBeenCalled();
  expect(ApplicationForm.create).not.toHaveBeenCalled();
});

it("rejects expired or forged tokens", async () => {
  (jwt.verify as jest.Mock).mockImplementation(() => {
    throw new Error("Invalid token");
  });
  expect((await POST(request())).status).toBe(401);
  expect(ApplicationForm.create).not.toHaveBeenCalled();
});

it("does not let another club's leader save a form", async () => {
  (Club.findById as jest.Mock).mockResolvedValue({ leaders: [{ email: "someone-else@example.com" }] });
  expect((await POST(request())).status).toBe(403);
  expect(ApplicationForm.create).not.toHaveBeenCalled();
});

it("allows admins to create forms", async () => {
  (jwt.verify as jest.Mock).mockReturnValue({ netid: "admin1", email: "admin@example.com", role: "admin" });
  expect((await POST(request())).status).toBe(201);
});

it("rejects missing clubs", async () => {
  (Club.findById as jest.Mock).mockResolvedValue(null);
  expect((await POST(request())).status).toBe(404);
  expect(ApplicationForm.create).not.toHaveBeenCalled();
});

it.each([
  { clubId: "invalid" },
  { title: " " },
  { closesAt: "2026-11-01T00:00:00Z" },
  { opensAt: "invalid" },
  { questions: [] },
  { questions: [{ id: "q", type: "unsupported", prompt: "Why?" }] },
  { questions: [{ id: "q", type: "short-answer", prompt: "Why?", wordLimit: 1.5 }] },
  { questions: [{ id: "q", type: "multiple-choice", prompt: "Why?", options: [] }] },
  {
    questions: [
      {
        id: "q",
        type: "multiple-choice",
        prompt: "Why?",
        options: [
          { id: "o", text: "A" },
          { id: "o", text: "B" },
        ],
      },
    ],
  },
])("validates malformed form data on the server: %j", async (invalid) => {
  expect((await POST(request({ ...validForm(), ...invalid }))).status).toBe(400);
  expect(ApplicationForm.create).not.toHaveBeenCalled();
});

it("rejects duplicate question IDs", () => {
  const form = validForm();
  expect(parseApplicationForm({ ...form, questions: [form.questions[0], form.questions[0]] }).error).toBeDefined();
});

it("discards fields belonging to a different question type", () => {
  const form = validForm();
  const result = parseApplicationForm({
    ...form,
    questions: [
      { ...form.questions[0], options: [{ id: "stale", text: "Old choice" }] },
      { ...form.questions[1], wordLimit: 250 },
    ],
  });
  expect(result.data?.questions[0]).not.toHaveProperty("options");
  expect(result.data?.questions[1]).not.toHaveProperty("wordLimit");
});

describe("listing a club's application forms", () => {
  function listRequest(query = "clubId=507f1f77bcf86cd799439011") {
    return { url: `http://localhost:3000/api/application-forms?${query}` } as Request;
  }

  function mockFind(forms: unknown[] = []) {
    const query = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(forms),
    };
    (ApplicationForm.find as jest.Mock).mockReturnValue(query);
    return query;
  }

  it("returns only the selected club's current forms and excludes private metadata", async () => {
    const query = mockFind([{ _id: "form1", title: "Fall Application" }]);
    const response = await GET(listRequest());
    expect(response.status).toBe(200);
    expect(ApplicationForm.find).toHaveBeenCalledWith({ clubId: "507f1f77bcf86cd799439011", schemaVersion: 1 });
    expect(query.select).toHaveBeenCalledWith("_id title opensAt closesAt questions createdAt");
    expect(query.sort).toHaveBeenCalledWith({ _id: -1 });
    expect(await response.json()).toEqual({ forms: [{ _id: "form1", title: "Fall Application" }], nextCursor: null });
  });

  it("requires authentication before querying forms", async () => {
    (cookies as jest.Mock).mockResolvedValue({ get: () => undefined });
    expect((await GET(listRequest())).status).toBe(401);
    expect(ApplicationForm.find).not.toHaveBeenCalled();
  });

  it("denies leaders of other clubs", async () => {
    (Club.findById as jest.Mock).mockResolvedValue({ leaders: [{ email: "someone-else@example.com" }] });
    expect((await GET(listRequest())).status).toBe(403);
    expect(ApplicationForm.find).not.toHaveBeenCalled();
  });

  it("allows an administrator to list forms", async () => {
    mockFind();
    (jwt.verify as jest.Mock).mockReturnValue({ netid: "admin", email: "admin@example.com", role: "admin" });
    expect((await GET(listRequest())).status).toBe(200);
  });

  it.each(["", "clubId=invalid", "clubId=507f1f77bcf86cd799439011&before=invalid"])(
    "rejects invalid list parameters: %s",
    async (query) => {
      expect((await GET(listRequest(query))).status).toBe(400);
      expect(ApplicationForm.find).not.toHaveBeenCalled();
    },
  );

  it("returns a cursor for additional forms and applies it to the next page", async () => {
    const forms = Array.from({ length: 21 }, (_, index) => ({ _id: index.toString(16).padStart(24, "0") }));
    mockFind(forms);
    const response = await GET(listRequest());
    const page = await response.json();
    expect(page.forms).toHaveLength(20);
    expect(page.nextCursor).toBe(forms[19]._id);
    mockFind();
    await GET(listRequest(`clubId=507f1f77bcf86cd799439011&before=${page.nextCursor}`));
    expect((ApplicationForm.find as jest.Mock).mock.calls[1][0]._id.$lt.toString()).toBe(page.nextCursor);
  });
});

describe("deleting application forms", () => {
  const clubId = "507f1f77bcf86cd799439011";
  const formId = "507f1f77bcf86cd799439012";
  const deleteRequest = (query = `clubId=${clubId}&formId=${formId}`) =>
    ({ url: `http://localhost:3000/api/application-forms?${query}` }) as Request;

  beforeEach(() => {
    (ApplicationForm.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
  });

  it("deletes only the requested current form belonging to the authorized club", async () => {
    const response = await DELETE(deleteRequest());
    expect(response.status).toBe(200);
    expect(ApplicationForm.deleteOne).toHaveBeenCalledWith({ _id: formId, clubId, schemaVersion: 1 });
    expect(await response.json()).toEqual({ deletedId: formId });
  });

  it("rejects unauthenticated deletion", async () => {
    (cookies as jest.Mock).mockResolvedValue({ get: () => undefined });
    expect((await DELETE(deleteRequest())).status).toBe(401);
    expect(ApplicationForm.deleteOne).not.toHaveBeenCalled();
  });

  it("rejects leaders of another club", async () => {
    (Club.findById as jest.Mock).mockResolvedValue({ leaders: [{ email: "other@example.com" }] });
    expect((await DELETE(deleteRequest())).status).toBe(403);
    expect(ApplicationForm.deleteOne).not.toHaveBeenCalled();
  });

  it("allows an administrator to delete a form", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ netid: "admin", email: "admin@example.com", role: "admin" });
    expect((await DELETE(deleteRequest())).status).toBe(200);
  });

  it.each(["", `clubId=${clubId}`, `clubId=invalid&formId=${formId}`, `clubId=${clubId}&formId=invalid`])(
    "rejects malformed deletion parameters: %s",
    async (query) => {
      expect((await DELETE(deleteRequest(query))).status).toBe(400);
      expect(ApplicationForm.deleteOne).not.toHaveBeenCalled();
    },
  );

  it("returns not found when the form is absent or belongs to another club", async () => {
    (ApplicationForm.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });
    expect((await DELETE(deleteRequest())).status).toBe(404);
  });
});
