import OpenAI from "openai";
import connectDB from "@/lib/db/connect";
import mongoose from "mongoose";

// Lazily initialize the OpenAI client. Constructing it at module scope throws
// "Missing credentials" during the Next build ("collect page data" evaluates
// this module) whenever OPENAI_API_KEY isn't present in the build environment.
// Building it on first use keeps the build safe and respects the runtime guard.
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// ==========================================
// LAYER 3: OUTPUT MODERATION (After Image Generated)
// ==========================================

interface ModerationResult {
  safe: boolean;
  reason?: string;
  shouldRetry: boolean;
}

interface FlaggedPromptDoc {
  userId?: string;
  sessionId?: string;
  prompt: string;
  reason: string;
  imageUrl?: string;
  createdAt: Date;
}

// Flagged Prompts Schema (for logging)
const FlaggedPromptSchema = new mongoose.Schema<FlaggedPromptDoc>({
  userId: { type: String },
  sessionId: { type: String },
  prompt: { type: String, required: true },
  reason: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Get or create model
const FlaggedPrompt = mongoose.models.FlaggedPrompt ||
  mongoose.model<FlaggedPromptDoc>('FlaggedPrompt', FlaggedPromptSchema);

// Rate limiter for failed moderations (in-memory for now)
const failedAttempts = new Map<string, { count: number; lockedUntil?: Date }>();

/**
 * Check if user/session is rate limited
 */
export function checkRateLimit(sessionId: string): { allowed: boolean; message?: string; remainingTime?: number } {
  const record = failedAttempts.get(sessionId);

  if (!record) {
    return { allowed: true };
  }

  if (record.lockedUntil && record.lockedUntil > new Date()) {
    const remainingMs = record.lockedUntil.getTime() - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return {
      allowed: false,
      message: `Time for a creativity break! Come back in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} 🌟`,
      remainingTime: remainingMs,
    };
  }

  // Lock expired, reset
  if (record.lockedUntil && record.lockedUntil <= new Date()) {
    failedAttempts.delete(sessionId);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Record a failed moderation attempt
 */
function recordFailedAttempt(sessionId: string): void {
  const record = failedAttempts.get(sessionId) || { count: 0 };
  record.count++;

  // Lock after 3 failed attempts
  if (record.count >= 3) {
    record.lockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    console.log(`[Safety] Session ${sessionId} locked for 5 minutes due to repeated failed moderations`);
  }

  failedAttempts.set(sessionId, record);
}

/**
 * Log flagged prompt to database
 */
async function logFlaggedPrompt(data: Omit<FlaggedPromptDoc, 'createdAt'>): Promise<void> {
  try {
    await connectDB();
    await FlaggedPrompt.create(data);
    console.log('[Safety] Flagged prompt logged to database');
  } catch (error) {
    console.error('[Safety] Failed to log flagged prompt:', error);
  }
}

/**
 * Moderate image using OpenAI Vision API
 * Checks if image is safe for children aged 3-10
 */
export async function moderateImage(
  imageUrl: string,
  prompt: string,
  sessionId?: string,
  userId?: string
): Promise<ModerationResult> {
  try {
    // Skip if no API key
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[Safety] OpenAI API key not set, skipping image moderation');
      return { safe: true, shouldRetry: false };
    }

    // Check rate limit first
    if (sessionId) {
      const rateCheck = checkRateLimit(sessionId);
      if (!rateCheck.allowed) {
        return {
          safe: false,
          reason: rateCheck.message,
          shouldRetry: false,
        };
      }
    }

    console.log('[Safety] Moderating generated image...');

    // Use GPT-4 Vision to analyze the image
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini", // Use mini for cost efficiency
      messages: [
        {
          role: "system",
          content: "You are a child safety content moderator. Your job is to determine if images are safe for children aged 3-10. Be strict but reasonable - children's coloring pages should be cute, fun, and completely appropriate.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Is this image safe for children aged 3-10? Check for:
- Nudity or inappropriate body exposure
- Violence, blood, or weapons
- Scary or disturbing content
- Adult themes or suggestive content
- Hate symbols or inappropriate text

Reply with ONLY one of these:
- "SAFE" if the image is appropriate for children
- "UNSAFE: [brief reason]" if the image is not appropriate`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "low", // Use low detail for faster/cheaper analysis
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    const result = response.choices[0]?.message?.content?.trim() || "";
    console.log('[Safety] Image moderation result:', result);

    if (result.toUpperCase().startsWith("SAFE")) {
      return { safe: true, shouldRetry: false };
    }

    // Image failed moderation
    const reason = result.replace(/^UNSAFE:\s*/i, "").trim() || "Content not appropriate";

    // Record failed attempt
    if (sessionId) {
      recordFailedAttempt(sessionId);
    }

    // Log to database
    await logFlaggedPrompt({
      userId,
      sessionId,
      prompt,
      reason,
      imageUrl,
    });

    return {
      safe: false,
      reason: "Oops! Let's try a different idea! 🎨",
      shouldRetry: true,
    };
  } catch (error) {
    console.error('[Safety] Image moderation error:', error);
    // On error, allow the image (fail open for UX, but log it)
    return { safe: true, shouldRetry: false };
  }
}

/**
 * Create a safer version of a prompt for retry
 */
export function makeSaferPrompt(originalPrompt: string): string {
  // Add extra safety keywords
  const saferPrefix = "cute, friendly, happy, cartoon style,";
  const saferSuffix = "for young children, wholesome, innocent";

  return `${saferPrefix} ${originalPrompt}, ${saferSuffix}`;
}

/**
 * Get flagged prompts for a user (for parent dashboard)
 */
export async function getFlaggedPrompts(userId: string, limit = 20): Promise<FlaggedPromptDoc[]> {
  try {
    await connectDB();
    const prompts = await FlaggedPrompt
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return prompts as FlaggedPromptDoc[];
  } catch (error) {
    console.error('[Safety] Failed to get flagged prompts:', error);
    return [];
  }
}

/**
 * Get flagged prompt count for a user
 */
export async function getFlaggedPromptCount(userId: string): Promise<number> {
  try {
    await connectDB();
    return await FlaggedPrompt.countDocuments({ userId });
  } catch (error) {
    console.error('[Safety] Failed to count flagged prompts:', error);
    return 0;
  }
}

/**
 * Clear rate limit for a session (admin function)
 */
export function clearRateLimit(sessionId: string): void {
  failedAttempts.delete(sessionId);
}
