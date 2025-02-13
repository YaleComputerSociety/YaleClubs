import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client({
  region: "us-east-1", // DigitalOcean Spaces uses "us-east-1"
  endpoint: "https://nyc3.digitaloceanspaces.com",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file-input") as Blob | null;

    if (!file) {
      return NextResponse.json({ message: "Missing file" }, { status: 400 });
    }

    const fileName = `${crypto.randomUUID()}`;

    // Convert Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadParams = {
      Bucket: process.env.DO_SPACES_BUCKET!,
      Key: `uploads/${fileName}`,
      Body: buffer,
      ContentType: file.type,
      ACL: ObjectCannedACL.public_read,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.DO_SPACES_BUCKET}.nyc3.digitaloceanspaces.com/uploads/${fileName}`;

    return NextResponse.json({ message: "success", fileUrl });
  } catch (reason) {
    console.error("Upload failed", reason);
    return NextResponse.json({ message: "failure" }, { status: 500 });
  }
}
