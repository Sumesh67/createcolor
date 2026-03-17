import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { convertPhotoToColoringPage } from '@/lib/image/imageToOutline';
import { uploadImage, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';
import { createThumbnail } from '@/lib/image/processImage';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rateLimit';
import connectDB from '@/lib/db/connect';
import ColoringPage from '@/lib/db/models/ColoringPage';
import mongoose from 'mongoose';
import sharp from 'sharp';

export const maxDuration = 60;

interface SessionUser {
  id?: string;
}

// Optional: Simple background removal using Sharp
async function removeBackground(inputBuffer: Buffer): Promise<Buffer> {
  try {
    // Convert to grayscale and find edges
    const grayscale = await sharp(inputBuffer)
      .grayscale()
      .toBuffer();

    // Create a mask based on edge detection
    // This is a simplified version - for production, consider using a dedicated API
    await sharp(grayscale)
      .blur(2)
      .linear(2, -128) // Increase contrast
      .threshold(200) // High threshold to find background
      .negate() // Invert so subject is white
      .blur(3) // Smooth the mask
      .toBuffer();

    // Apply the mask (simplified - just returns original for now)
    // For better results, use @imgly/background-removal or similar
    return inputBuffer;
  } catch {
    console.log('[Background Removal] Failed, using original image');
    return inputBuffer;
  }
}

// Enhanced photo to coloring conversion with multiple detail levels
async function convertWithStyle(
  buffer: Buffer,
  style: 'simple' | 'medium' | 'detailed' = 'medium'
): Promise<Buffer> {
  const styleConfig = {
    simple: { threshold: 180, blur: 2.5, contrast: 2.5 },
    medium: { threshold: 140, blur: 1.5, contrast: 3 },
    detailed: { threshold: 100, blur: 0.8, contrast: 3.5 },
  };

  const config = styleConfig[style];

  // Resize to manageable size
  const resized = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  // Convert to grayscale
  const grayscale = await sharp(resized)
    .grayscale()
    .toBuffer();

  // Apply blur to reduce noise
  const blurred = await sharp(grayscale)
    .blur(config.blur)
    .toBuffer();

  // Increase contrast
  const highContrast = await sharp(blurred)
    .linear(config.contrast, -200)
    .normalize()
    .toBuffer();

  // Apply threshold for black and white
  const thresholded = await sharp(highContrast)
    .threshold(config.threshold)
    .toBuffer();

  // Invert to get black lines on white
  const inverted = await sharp(thresholded)
    .negate()
    .toBuffer();

  // Clean up
  const cleaned = await sharp(inverted)
    .median(3)
    .toBuffer();

  // Add watermark text at the bottom
  const { width, height } = await sharp(cleaned).metadata();
  const watermarkSvg = `
    <svg width="${width}" height="30">
      <text x="50%" y="20" font-family="Arial, sans-serif" font-size="14" fill="#999999" text-anchor="middle">
        Created with CreateAndColor.app
      </text>
    </svg>
  `;

  // Final output with white background and watermark
  const final = await sharp(cleaned)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .extend({
      bottom: 30,
      background: { r: 255, g: 255, b: 255 }
    })
    .composite([{
      input: Buffer.from(watermarkSvg),
      gravity: 'south'
    }])
    .png({ quality: 100 })
    .toBuffer();

  return final;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(identifier, { maxRequests: 20, windowMs: 60 * 60 * 1000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: "You've converted too many photos. Please try again later!",
          resetIn: Math.ceil(rateLimit.resetIn / 60000),
        },
        { status: 429 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Please upload an image' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const style = (formData.get('style') as string) || 'medium';
    const removeBackgroundFlag = formData.get('removeBackground') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Please upload a JPG, PNG, or WEBP image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Please upload an image under 10MB.' },
        { status: 400 }
      );
    }

    console.log(`[ConvertPhoto] Processing ${file.name} (${file.size} bytes), style: ${style}`);

    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer);

    // Optional background removal
    if (removeBackgroundFlag) {
      console.log('[ConvertPhoto] Applying background removal');
      buffer = await removeBackground(buffer);
    }

    // Convert to coloring page
    const processedBuffer = await convertWithStyle(
      buffer,
      style as 'simple' | 'medium' | 'detailed'
    );

    // Upload or encode
    const imageUrl = isS3Configured()
      ? await uploadImage(processedBuffer)
      : bufferToDataUrl(processedBuffer);

    // Create thumbnail
    const thumbnailBuffer = await createThumbnail(processedBuffer);
    const thumbnailUrl = isS3Configured()
      ? await uploadImage(thumbnailBuffer)
      : bufferToDataUrl(thumbnailBuffer);

    // Save to database if authenticated
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;
    let pageId = `temp_${Date.now()}`;

    if (userId) {
      await connectDB();

      const page = await ColoringPage.create({
        userId: new mongoose.Types.ObjectId(userId),
        prompt: 'Photo converted with Magic Lens',
        imageUrl,
        thumbnailUrl,
      });

      pageId = page._id.toString();
    }

    console.log(`[ConvertPhoto] Success! Generated ${processedBuffer.length} bytes`);

    return NextResponse.json({
      success: true,
      imageUrl,
      thumbnailUrl,
      pageId,
      prompt: 'Photo converted with Magic Lens',
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('Error converting photo:', error);
    return NextResponse.json(
      {
        error: 'Conversion failed',
        message: 'Oops! Could not convert your photo. Please try another image.',
      },
      { status: 500 }
    );
  }
}
