import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateColoringPage } from '@/lib/ai/generateColoringPage';
import { buildPromptFromSlots, buildCustomPrompt } from '@/lib/ai/promptBuilder';
import { checkPromptSafety } from '@/lib/ai/safetyFilter';
import { processImageForColoring, createThumbnail, fetchImage } from '@/lib/image/processImage';
import { convertPhotoToColoringPage } from '@/lib/image/imageToOutline';
import { uploadImage, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rateLimit';
import connectDB from '@/lib/db/connect';
import ColoringPage from '@/lib/db/models/ColoringPage';
import mongoose from 'mongoose';
import { SlotSelections } from '@/types';

export const maxDuration = 60;

interface SessionUser {
  id?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(identifier, { maxRequests: 15, windowMs: 60 * 60 * 1000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: "You've created too many coloring pages. Please try again later!",
          resetIn: Math.ceil(rateLimit.resetIn / 60000),
        },
        { status: 429 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    let imageUrl: string;
    let prompt: string;
    let processedBuffer: Buffer;

    if (contentType.includes('multipart/form-data')) {
      // Handle image upload
      const formData = await request.formData();
      const file = formData.get('image') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      processedBuffer = await convertPhotoToColoringPage(buffer);
      prompt = 'Uploaded photo converted to coloring page';
      imageUrl = isS3Configured()
        ? await uploadImage(processedBuffer)
        : bufferToDataUrl(processedBuffer);
    } else {
      // Handle JSON request
      const body = await request.json();
      const { slotSelections, customPrompt } = body as {
        slotSelections?: SlotSelections;
        customPrompt?: string;
      };

      // Build prompt
      if (slotSelections) {
        prompt = buildPromptFromSlots(slotSelections);
      } else if (customPrompt) {
        prompt = buildCustomPrompt(customPrompt);
      } else {
        return NextResponse.json(
          { error: 'Either slotSelections or customPrompt is required' },
          { status: 400 }
        );
      }

      // Safety check
      const safetyResult = await checkPromptSafety(prompt);
      if (!safetyResult.safe) {
        return NextResponse.json(
          {
            error: 'Content not allowed',
            message: "That doesn't sound right, try something else!",
          },
          { status: 400 }
        );
      }

      // Generate coloring page image
      const result = await generateColoringPage(prompt);

      // Check if it's a data URL (SVG or base64) or external URL
      const isDataUrl = result.imageUrl.startsWith('data:');

      if (isDataUrl) {
        // Data URLs can be used directly
        imageUrl = result.imageUrl;
        const thumbnailUrl = result.imageUrl;

        // Get session and save to database if authenticated
        const session = await getServerSession(authOptions);
        const userId = (session?.user as SessionUser)?.id;
        let pageId = `temp_${Date.now()}`;

        if (userId) {
          await connectDB();

          const page = await ColoringPage.create({
            userId: new mongoose.Types.ObjectId(userId),
            prompt,
            imageUrl,
            thumbnailUrl,
          });

          pageId = page._id.toString();
        }

        return NextResponse.json({
          imageUrl,
          thumbnailUrl,
          pageId,
          prompt,
          remaining: rateLimit.remaining,
        });
      }

      // For other image APIs (like DALL-E), fetch and process
      const generatedBuffer = await fetchImage(result.imageUrl);
      processedBuffer = await processImageForColoring(generatedBuffer);

      // Upload processed image
      imageUrl = isS3Configured()
        ? await uploadImage(processedBuffer)
        : bufferToDataUrl(processedBuffer);
    }

    // Create thumbnail (for non-Pollinations images)
    const thumbnailBuffer = await createThumbnail(processedBuffer);
    const thumbnailUrl = isS3Configured()
      ? await uploadImage(thumbnailBuffer)
      : bufferToDataUrl(thumbnailBuffer);

    // Get session and save to database if authenticated
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;
    let pageId = `temp_${Date.now()}`;

    if (userId) {
      await connectDB();

      const page = await ColoringPage.create({
        userId: new mongoose.Types.ObjectId(userId),
        prompt,
        imageUrl,
        thumbnailUrl,
      });

      pageId = page._id.toString();
    }

    return NextResponse.json({
      imageUrl,
      thumbnailUrl,
      pageId,
      prompt,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('Error generating coloring page:', error);
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: 'Oops! Something went wrong. Please try again.',
      },
      { status: 500 }
    );
  }
}
