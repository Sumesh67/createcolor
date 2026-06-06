import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, extractTokenFromRequest, verifyJWT, getRequestUserRole } from '@/lib/auth';
import { generateColoringPage } from '@/lib/ai/generateColoringPage';
import { buildPromptFromSlots, buildCustomPrompt, getDisplayPrompt } from '@/lib/ai/promptBuilder';
import { checkPromptSafety } from '@/lib/ai/safetyFilter';
import { filterPrompt } from '@/lib/safety/input-filter';
import { processImageForColoring, createThumbnail, fetchImage, compositeQRCode } from '@/lib/image/processImage';
import { generateQRPngBytes } from '@/lib/pdf/qrCodeHelper';
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
    // Authentication is OPTIONAL for Create tab
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

    // Admins bypass all rate limits
    const userRole = await getRequestUserRole(request);
    const isAdmin = userRole === 'ADMIN';

    const dailyLimit = userId ? 20 : 10;
    const identifier = userId || getRateLimitIdentifier(request);
    const limitCheck = isAdmin ? { allowed: true, remaining: 999, resetIn: 0, used: 0 } : checkDailyLimit(identifier, dailyLimit);

    if (!limitCheck.allowed) {
      const hoursUntilReset = Math.ceil(limitCheck.resetIn / (60 * 60 * 1000));
      return NextResponse.json(
        {
          error: 'Daily limit reached',
          message: userId
            ? `You've used all 20 free coloring pages for today! Come back tomorrow for more magic! ✨`
            : `You've used all 10 free coloring pages for today! Sign in to get 20/day or come back tomorrow! ✨`,
          resetIn: limitCheck.resetIn,
          hoursUntilReset,
          used: limitCheck.used,
          limit: dailyLimit,
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
      processedBuffer = await compositeQRCode(processedBuffer, await generateQRPngBytes('coloring'));
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
      const isFallback = result.isFallback ?? false;

      // Check if it's a data URL (SVG or base64) or external URL
      const isDataUrl = generatedImageUrl.startsWith('data:');

      if (isDataUrl) {
        // Data URLs can be used directly
        imageUrl = generatedImageUrl;
        const thumbnailUrl = generatedImageUrl;

        // Only save to database if user is authenticated
        let pageId: string | undefined;
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
          prompt: displayPrompt,
          remaining: limitCheck.remaining,
          isFallback,
        }, { headers: corsHeaders });
      }

      // For other image APIs (like DALL-E), fetch and process
      const generatedBuffer = await fetchImage(generatedImageUrl);
      processedBuffer = await processImageForColoring(generatedBuffer);
      processedBuffer = await compositeQRCode(processedBuffer, await generateQRPngBytes('coloring'));

      // Upload processed image
      imageUrl = isS3Configured()
        ? await uploadImage(processedBuffer)
        : bufferToDataUrl(processedBuffer);

      // Create thumbnail
      const thumbnailBuffer = await createThumbnail(processedBuffer);
      const thumbnailUrl = isS3Configured()
        ? await uploadImage(thumbnailBuffer)
        : bufferToDataUrl(thumbnailBuffer);

      // Only save to database if user is authenticated
      let pageId: string | undefined;
      if (userId) {
        await connectDB();
        const page = await ColoringPage.create({
          userId: new mongoose.Types.ObjectId(userId),
          prompt: displayPrompt,
          imageUrl,
          thumbnailUrl,
        });
        pageId = page._id.toString();
      }

      return NextResponse.json({
        imageUrl,
        thumbnailUrl,
        pageId,
        prompt: displayPrompt,
        remaining: limitCheck.remaining,
        isFallback,
      }, { headers: corsHeaders });
    }

    // Create thumbnail (for non-Pollinations images - image upload case)
    const thumbnailBuffer = await createThumbnail(processedBuffer);
    const thumbnailUrl = isS3Configured()
      ? await uploadImage(thumbnailBuffer)
      : bufferToDataUrl(thumbnailBuffer);

    // Only save to database if user is authenticated
    let pageId: string | undefined;
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
      remaining: limitCheck.remaining,
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
