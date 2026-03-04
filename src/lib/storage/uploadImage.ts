import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateUniqueId } from "@/lib/utils";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "createandcolor-images";

export async function uploadToS3(
  buffer: Buffer,
  filename?: string,
  contentType: string = "image/png"
): Promise<string> {
  const key = filename || `coloring-pages/${generateUniqueId()}.png`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read",
  });

  await s3Client.send(command);

  // Return the public URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
}

export async function uploadColoringPage(buffer: Buffer): Promise<string> {
  const key = `coloring-pages/${generateUniqueId()}.png`;
  return uploadToS3(buffer, key, "image/png");
}

export async function uploadThumbnail(buffer: Buffer, pageId: string): Promise<string> {
  const key = `thumbnails/${pageId}.png`;
  return uploadToS3(buffer, key, "image/png");
}

export async function uploadPDF(buffer: Buffer, filename?: string): Promise<string> {
  const key = filename || `pdfs/${generateUniqueId()}.pdf`;
  return uploadToS3(buffer, key, "application/pdf");
}

// For development without S3, store images as base64 data URLs
export function bufferToDataUrl(buffer: Buffer, mimeType: string = "image/png"): string {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

// Helper to check if S3 is configured
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET_NAME
  );
}

// Upload image - uses S3 if configured, otherwise returns data URL
export async function uploadImage(
  buffer: Buffer,
  mimeType: string = "image/png"
): Promise<string> {
  if (isS3Configured()) {
    return uploadToS3(buffer, undefined, mimeType);
  }

  // For development, return data URL (note: this won't persist)
  console.warn("S3 not configured. Using data URL (not persistent).");
  return bufferToDataUrl(buffer, mimeType);
}
