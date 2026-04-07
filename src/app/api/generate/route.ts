import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, extractTokenFromRequest, verifyJWT } from '@/lib/auth';
import { generateColoringPage } from '@/lib/ai/generateColoringPage';
import { buildPromptFromSlots, buildCustomPrompt, getDisplayPrompt } from '@/lib/ai/promptBuilder';
import { checkPromptSafety } from '@/lib/ai/safetyFilter';
import { filterPrompt } from '@/lib/safety/input-filter';
import { processImageForColoring, createThumbnail, fetchImage } from '@/lib/image/processImage';
import { convertPhotoToColoringPage } from '@/lib/image/imageToOutline';
import { uploadImage, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';
import { checkDailyLimit, getRateLimitIdentifier } from '@/lib/rateLimit';
import connectDB from '@/lib/db/connect';
import ColoringPage from '@/lib/db/models/ColoringPage';
import mongoose from 'mongoose';
import { SlotSelections } from '@/types';

export const maxDuration = 60;

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface SessionUser {
  id?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication - support both NextAuth session (web) and JWT token (mobile)
    let userId: string | undefined;

    // Try JWT token first (for mobile app)
    const token = extractTokenFromRequest(request);
    if (token) {
      const decoded = verifyJWT(token);
      if (decoded) {
        userId = decoded.id;
      }
    }

    // If no JWT, try NextAuth session (for web app)
    if (!userId) {
      const session = await getServerSession(authOptions);
      userId = (session?.user as SessionUser)?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'Please sign in to generate coloring pages' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Daily limit: 20 images per day, resets at midnight
    const identifier = getRateLimitIdentifier(request);
    const dailyLimit = checkDailyLimit(identifier, 20);

    if (!dailyLimit.allowed) {
      const hoursUntilReset = Math.ceil(dailyLimit.resetIn / (60 * 60 * 1000));
      return NextResponse.json(
        {
          error: 'Daily limit reached',
          message: `You've used all 20 free coloring pages for today! Come back tomorrow for more magic! ✨`,
          resetIn: dailyLimit.resetIn,
          hoursUntilReset,
          used: dailyLimit.used,
          limit: 20,
        },
        { status: 429, headers: corsHeaders }
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
        return NextResponse.json({ error: 'No image provided' }, { status: 400, headers: corsHeaders });
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

      // Determine the raw user prompt (for filtering) and display prompt
      let userPrompt: string;
      let displayPrompt: string;

      if (slotSelections) {
        userPrompt = `${slotSelections.who} ${slotSelections.doing} ${slotSelections.where}`;
        displayPrompt = getDisplayPrompt(slotSelections);
        prompt = buildPromptFromSlots(slotSelections);
      } else if (customPrompt) {
        userPrompt = customPrompt;
        displayPrompt = customPrompt;
        prompt = buildCustomPrompt(customPrompt);
      } else {
        return NextResponse.json(
          { error: 'Either slotSelections or customPrompt is required' },
          { status: 400, headers: corsHeaders }
        );
      }

      // ==========================================
      // LAYER 1: INPUT FILTERING (Blocklist + OpenAI Moderation)
      // ==========================================
      const inputFilterResult = await filterPrompt(userPrompt);
      if (!inputFilterResult.safe) {
        return NextResponse.json(
          {
            error: 'Content not allowed',
            message: inputFilterResult.reason || "Let's try something more fun! 🌈",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      // Also run legacy safety check
      const legacySafetyResult = await checkPromptSafety(userPrompt);
      if (!legacySafetyResult.safe) {
        return NextResponse.json(
          {
            error: 'Content not allowed',
            message: legacySafetyResult.reason || "Let's try something different!",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      // ==========================================
      // LAYER 2: AI-LEVEL SAFETY (Built into prompt via buildPromptFromSlots/buildCustomPrompt)
      // The prompt now includes safety prefix/suffix automatically
      // ==========================================

      // Generate coloring page image
      const result = await generateColoringPage(prompt);
      const generatedImageUrl = result.imageUrl;

      // Check if it's a data URL (SVG or base64) or external URL
      const isDataUrl = generatedImageUrl.startsWith('data:');

      if (isDataUrl) {
        // Data URLs can be used directly
        imageUrl = generatedImageUrl;
        const thumbnailUrl = generatedImageUrl;

        await connectDB();

        const page = await ColoringPage.create({
          userId: new mongoose.Types.ObjectId(userId),
          prompt,
          imageUrl,
          thumbnailUrl,
        });

        const pageId = page._id.toString();

        return NextResponse.json({
          imageUrl,
          thumbnailUrl,
          pageId,
          prompt: displayPrompt,
          remaining: dailyLimit.remaining,
        }, { headers: corsHeaders });
      }

      // For other image APIs (like DALL-E), fetch and process
      const generatedBuffer = await fetchImage(generatedImageUrl);
      processedBuffer = await processImageForColoring(generatedBuffer);

      // Upload processed image
      imageUrl = isS3Configured()
        ? await uploadImage(processedBuffer)
        : bufferToDataUrl(processedBuffer);

      // Create thumbnail
      const thumbnailBuffer = await createThumbnail(processedBuffer);
      const thumbnailUrl = isS3Configured()
        ? await uploadImage(thumbnailBuffer)
        : bufferToDataUrl(thumbnailBuffer);

      await connectDB();

      const page = await ColoringPage.create({
        userId: new mongoose.Types.ObjectId(userId),
        prompt: displayPrompt,
        imageUrl,
        thumbnailUrl,
      });

      const pageId = page._id.toString();

      return NextResponse.json({
        imageUrl,
        thumbnailUrl,
        pageId,
        prompt: displayPrompt,
        remaining: dailyLimit.remaining,
      }, { headers: corsHeaders });
    }

    // Create thumbnail (for non-Pollinations images - image upload case)
    const thumbnailBuffer = await createThumbnail(processedBuffer);
    const thumbnailUrl = isS3Configured()
      ? await uploadImage(thumbnailBuffer)
      : bufferToDataUrl(thumbnailBuffer);

    // Save to database (user is already authenticated)
    await connectDB();

    const page = await ColoringPage.create({
      userId: new mongoose.Types.ObjectId(userId),
      prompt,
      imageUrl,
      thumbnailUrl,
    });

    const pageId = page._id.toString();

    return NextResponse.json({
      imageUrl,
      thumbnailUrl,
      pageId,
      prompt,
      remaining: dailyLimit.remaining,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error generating coloring page:', error);
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: 'Oops! Something went wrong. Please try again.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
