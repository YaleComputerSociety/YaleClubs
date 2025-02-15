import { S3Client, PutObjectCommand, ObjectCannedACL, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

/**
 * Deletes a file from DigitalOcean Spaces.
 * @param fileUrl - The full URL of the file to delete
 * @returns `true` if deletion was successful, `false` otherwise
 */
export async function deleteImage(fileUrl: string): Promise<boolean> {
  try {
    const bucketName = process.env.DO_SPACES_BUCKET || "yaleclubs";

    // Extract file path from full URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading "/"

    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));
    return true;
  } catch {
    return false;
  }
}
