import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/serverUtils";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file-input") as Blob | null;

    if (!file) {
      return NextResponse.json({ message: "Missing file" }, { status: 400 });
    }

    const fileUrl = await uploadImage(file, "uploads", false);

    return NextResponse.json({ message: "success", fileUrl });
  } catch (reason) {
    console.error("Upload failed", reason);
    return NextResponse.json({ message: "failure" }, { status: 500 });
  }
}
