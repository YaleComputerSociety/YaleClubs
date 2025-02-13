import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "https://nyc3.digitaloceanspaces.com",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

/**
 * Uploads a file to DigitalOcean Spaces and returns the public URL.
 * @param file - The file (Blob) to upload
 * @param folderPath - The folder within the DO Space to upload the file to, don't include leading/trailing slashes
 * @param isPrivate - Whether the file should be private or public
 * @returns The public URL of the uploaded file or null if upload fails
 */
export async function uploadImage(file: Blob, folderPath: string, isPrivate: boolean = true): Promise<string | null> {
  try {
    const fileName = crypto.randomUUID();
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadParams = {
      Bucket: process.env.DO_SPACES_BUCKET || "yaleclubs",
      Key: `${folderPath}/${fileName}`,
      Body: buffer,
      ContentType: file.type,
      ACL: isPrivate ? ObjectCannedACL.private : ObjectCannedACL.public_read,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    return `https://${process.env.DO_SPACES_BUCKET}.nyc3.digitaloceanspaces.com/${folderPath}/${fileName}`;
  } catch (err) {
    console.error("Upload to DigitalOcean Spaces failed:", err);
    return null;
  }
}
