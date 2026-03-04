import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateColoringPage } from '@/lib/ai/generateColoringPage';
import { buildEditPrompt } from '@/lib/ai/promptBuilder';
import { checkPromptSafety } from '@/lib/ai/safetyFilter';
import { processImageForColoring, fetchImage } from '@/lib/image/processImage';
import { uploadImage, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rateLimit';
import connectDB from '@/lib/db/connect';
import ColoringPage from '@/lib/db/models/ColoringPage';
import mongoose from 'mongoose';
import { EditMode } from '@/types';
import { generateUniqueId } from '@/lib/utils';

export const maxDuration = 60;

interface SessionUser {
  id?: string;
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
          message: "You've made too many edits. Please wait a bit!",
          resetIn: Math.ceil(rateLimit.resetIn / 60000),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { pageId, originalPrompt, editMode, editText } = body as {
      pageId: string;
      originalPrompt: string;
      editMode: EditMode;
      editText: string;
    };

    if (!originalPrompt || !editMode || !editText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build the edited prompt
    const editedPrompt = buildEditPrompt(originalPrompt, editMode, editText);

    // Safety check
    const safetyResult = await checkPromptSafety(editedPrompt);
    if (!safetyResult.safe) {
      return NextResponse.json(
        {
          error: 'Content not allowed',
          message: "That doesn't sound right, try something else!",
        },
        { status: 400 }
      );
    }

    // Generate new image
    const result = await generateColoringPage(editedPrompt);

    // Process the image
    const generatedBuffer = await fetchImage(result.imageUrl);
    const processedBuffer = await processImageForColoring(generatedBuffer);

    // Upload
    const imageUrl = isS3Configured()
      ? await uploadImage(processedBuffer)
      : bufferToDataUrl(processedBuffer);

    const editId = generateUniqueId();

    // Update edit history if user is authenticated and pageId is valid
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (userId && pageId && !pageId.startsWith('temp_')) {
      await connectDB();

      await ColoringPage.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(pageId),
          userId: new mongoose.Types.ObjectId(userId),
        },
        {
          $push: {
            editHistory: {
              editText,
              editMode,
              imageUrl,
              timestamp: new Date(),
            },
          },
        }
      );
    }

    return NextResponse.json({
      newImageUrl: imageUrl,
      editId,
      newPrompt: editedPrompt,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('Error editing coloring page:', error);
    return NextResponse.json(
      {
        error: 'Edit failed',
        message: "Couldn't apply your edit. Please try again!",
      },
      { status: 500 }
    );
  }
}
