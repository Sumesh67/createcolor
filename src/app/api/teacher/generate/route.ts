import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, extractTokenFromRequest, verifyJWT } from '@/lib/auth';
import { checkAndConsumeChalkboardCredit } from '@/lib/auth/check-energy';
import { generateWorksheetImage } from '@/services/image-service';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

type WorksheetType = 'trace' | 'connect-dots' | 'math' | 'reading';

// Shared style suffix appended to every worksheet prompt.
// Defines the rendering contract for FLUX — must come at the end.
const WORKSHEET_STYLE =
  'professional children\'s educational worksheet, thick bold black outlines, pure white background, clean crisp linework, high contrast black and white, vector illustration style, no color fills, no shading, no gray, no embedded text or numbers in the artwork, G-rated, safe for kids';

/**
 * Returns true when the topic clearly describes a named set of items
 * (e.g. "Solar System planets", "farm animals", "vowels").
 * Used to switch the trace layout from a single centered figure to a grid.
 */
function isCollectionTopic(topic: string): boolean {
  const lower = topic.toLowerCase();
  const collectionKeywords = [
    'planets', 'animals', 'shapes', 'letters', 'numbers', 'fruits', 'vegetables',
    'insects', 'birds', 'fish', 'dinosaurs', 'seasons', 'emotions', 'colors',
    'tools', 'instruments', 'vehicles', 'foods', 'clothes', 'body parts',
    'continents', 'countries', 'flags', 'organs', 'bones',
  ];
  return collectionKeywords.some((kw) => lower.includes(kw));
}

/**
 * Hardcoded fallback prompts — used when Gemini is unavailable.
 * Each describes a specific VISUAL COMPOSITION, not just the subject,
 * so FLUX renders a usable worksheet layout rather than a generic scene.
 */
function buildFallbackPrompt(topic: string, gradeLevel: string, type: WorksheetType): string {
  const isEarlyGrade = gradeLevel === 'K' || gradeLevel === '1' || gradeLevel === '2';
  const isCollection = isCollectionTopic(topic);

  switch (type) {
    case 'trace':
      if (isCollection) {
        return `An educational trace worksheet arranged as a 3-column by 2-row grid (six equal cells) on a white page. Each cell contains ONE simple cartoon illustration of a different item from the "${topic}" category, drawn with very thick bold outlines, no interior detail lines, surrounded by generous white space inside its cell. Each cell has a thin border and a blank rectangular bar at the bottom for writing the name. Items are clearly distinct from each other, ${isEarlyGrade ? 'extremely simple and rounded' : 'recognizable and detailed enough to identify'}. ${WORKSHEET_STYLE}`;
      }
      return `A single large friendly cartoon ${topic} centered on the page with exaggerated simple features, surrounded by generous white space. Very thick bold outlines with no interior detail lines — designed for young children to trace around the main shape. Isolated figure on white, no background, simple rounded forms, ${isEarlyGrade ? 'oversized and approachable' : 'clear and detailed'}. ${WORKSHEET_STYLE}`;

    case 'connect-dots':
      return `A simple recognizable ${topic} scene drawn as a clean outline illustration, the main subject rendered with a minimal contour line showing its key silhouette and a few important interior lines. The outline is broken into short separate line segments as if the dots have already been connected, suggesting a dot-to-dot puzzle in its completed form. Single subject centered on white page with clear outer shape, no background. ${WORKSHEET_STYLE}`;

    case 'math':
      return `An educational illustration showing exactly five distinct ${topic}-themed objects arranged in a clean single row across the middle of the page — each object drawn identically, clearly separated by white space, each inside its own thin rectangular box outline. Objects are simple bold cartoon shapes. Below each box there is a blank square for writing. Top area of page is empty white for a title. ${WORKSHEET_STYLE}`;

    case 'reading':
      return `A clean educational vocabulary illustration showing four separate ${topic}-related objects arranged in a 2x2 grid layout on the page. Each object is large, simple, cartoon-style, centered inside its own equal-sized square cell with a thin border. Each cell has a blank rectangular label bar at the bottom edge. Objects are clearly identifiable: choose the most iconic items associated with ${topic}. No overlapping, generous white space inside each cell. ${WORKSHEET_STYLE}`;
  }
}

/**
 * Gemini constructs a FLUX composition prompt — telling FLUX exactly what
 * spatial layout, subject count, and visual structure to render.
 * We steer Gemini away from "describe the subject" and toward "describe the page layout".
 */
async function buildGeminiPrompt(topic: string, gradeLevel: string, type: WorksheetType): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return buildFallbackPrompt(topic, gradeLevel, type);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const gradeContext = gradeLevel === 'K' ? 'Kindergarten (ages 5-6)' : `Grade ${gradeLevel} (ages ${5 + parseInt(gradeLevel, 10)}-${6 + parseInt(gradeLevel, 10)})`;
  const isEarlyGrade = gradeLevel === 'K' || gradeLevel === '1' || gradeLevel === '2';

  const isCollection = isCollectionTopic(topic);

  const traceInstruction = isCollection
    ? `TRACE worksheet — the topic "${topic}" is a COLLECTION of multiple items. The image must show a 3-column by 2-row grid (6 equal cells) on a white page. Each cell contains ONE different cartoon item from the "${topic}" category — pick the 6 most recognizable examples. Items have very thick bold outlines, no interior detail, ${isEarlyGrade ? 'extremely simple rounded shapes' : 'clear identifiable forms'}. Each cell has a thin border and a blank bar at the bottom. NO background, no clutter.`
    : `TRACE worksheet — the image must show ONE large centered cartoon ${topic} with very thick, simple bold outlines and generous white space around it. Clear, chunky, rounded forms ${isEarlyGrade ? 'extremely oversized and simple' : 'moderately detailed but still bold'} so a ${gradeContext} student can trace the outline with a crayon. NO interior detail lines. NO background scenery. Single isolated figure.`;

  const typeInstructions: Record<WorksheetType, string> = {
    'trace': traceInstruction,

    'connect-dots': `CONNECT-THE-DOTS worksheet — the image must show the COMPLETED picture that a connect-the-dots puzzle would reveal: a clean, recognizable ${topic}-themed cartoon character or object drawn with a minimal single-stroke contour outline. The contour should be a clear silhouette with just enough interior lines to convey the subject. The line should look slightly segmented/dotted as if it represents connected dots. Centered on white page, no background.`,

    'math': `COUNTING/MATH worksheet — the image must show exactly FIVE identical cartoon ${topic}-themed objects arranged in one neat horizontal row across the center of the page. Each object is enclosed in its own thin rectangular box. Objects are bold, simple, identically sized. Below each box is a small blank writing square. Top area is empty white space. The layout must be symmetrical and grid-like.`,

    'reading': `VOCABULARY/READING worksheet — the image must show FOUR different ${topic}-related objects arranged in a 2-column, 2-row grid. Each object occupies its own equal-sized cell with a visible thin border. Each cell contains ONE large simple cartoon object centered inside it, with a blank horizontal label bar at the bottom of the cell. Generous padding inside each cell. Objects should be the most iconic/recognizable items associated with ${topic} for ${gradeContext} students.`,
  };

  const systemPrompt = `You are an expert AI image prompt engineer who writes FLUX image generation prompts for educational children's worksheets.

CRITICAL RULES:
- You write COMPOSITION prompts, not subject descriptions. Describe EXACTLY what appears on the page: how many objects, where they are positioned, what surrounds them, what blank spaces exist.
- FLUX cannot draw text, numbers, or labels — never mention them in the image content. The teacher adds those separately.
- Every prompt must end with this exact style string (copy it verbatim): "${WORKSHEET_STYLE}"
- Output ONLY the image prompt. No explanation, no quotes, no markdown.
- Length: 80-120 words total including the style string.

WORKSHEET REQUIREMENTS:
${typeInstructions[type]}

Write the FLUX image generation prompt now:`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().trim().replace(/^["']|["']$/g, '');
    // Ensure the style string is always present — append if Gemini dropped it
    if (!text.toLowerCase().includes('pure white background')) {
      return `${text}, ${WORKSHEET_STYLE}`;
    }
    return text;
  } catch (err) {
    console.warn('[Teacher] Gemini prompt generation failed, using fallback:', err);
    return buildFallbackPrompt(topic, gradeLevel, type);
  }
}

interface SessionUser {
  id?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate — teacher endpoint requires login
    let userId: string | undefined;

    const token = extractTokenFromRequest(request);
    if (token) {
      const decoded = verifyJWT(token);
      if (decoded) userId = decoded.id;
    }

    if (!userId) {
      const session = await getServerSession(authOptions);
      userId = (session?.user as SessionUser)?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'Please sign in to use Teacher worksheets.' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify teacher role
    await connectDB();
    const user = await User.findById(userId).select('role name').lean() as { role: string; name?: string } | null;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const isAdmin = user.role === 'ADMIN';

    if (user.role !== 'TEACHER' && !isAdmin) {
      return NextResponse.json(
        {
          error: 'Teacher account required',
          message: 'This feature is only available for teacher accounts. Sign up with your school email to get free Chalkboard Credits!',
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = await request.json();
    const { topic, gradeLevel, type } = body as {
      topic: string;
      gradeLevel: string;
      type: WorksheetType;
    };

    if (!topic || !gradeLevel || !type) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Please provide topic, gradeLevel, and type.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const validTypes: WorksheetType[] = ['trace', 'connect-dots', 'math', 'reading'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid worksheet type' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Admins bypass credit limits entirely
    const creditStatus = isAdmin
      ? { remaining: 999, resetAt: undefined }
      : await checkAndConsumeChalkboardCredit(userId);

    // Build composition prompt via Gemini (falls back to hardcoded template)
    const imagePrompt = await buildGeminiPrompt(topic, gradeLevel, type);
    console.log(`[Teacher] Prompt for FLUX (${imagePrompt.length} chars): ${imagePrompt.substring(0, 120)}...`);

    // Generate worksheet image — uses direct FLUX path, bypasses the coloring-page wrapper
    const imageResult = await generateWorksheetImage(imagePrompt);

    if (!imageResult.success || !imageResult.imageUrl) {
      // Refund the credit on failure (admins have no credit to refund)
      if (!isAdmin) {
        const { default: UserModel } = await import('@/lib/db/models/User');
        await UserModel.findByIdAndUpdate(userId, { $inc: { chalkboardCredits: 1 } });
      }

      return NextResponse.json(
        { error: 'Image generation failed', message: 'Could not generate worksheet image. Please try again.' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageResult.imageUrl,
      teacherName: (user as { name?: string }).name || 'Teacher',
      creditsRemaining: creditStatus.remaining,
      creditsResetAt: creditStatus.resetAt,
    }, { headers: corsHeaders });

  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as Record<string, unknown>)['code'] === 'NO_ENERGY') {
      const message = typeof (error as Record<string, unknown>)['message'] === 'string'
        ? (error as Record<string, unknown>)['message'] as string
        : 'No credits remaining this week.';
      return NextResponse.json(
        { error: 'No credits remaining', message },
        { status: 429, headers: corsHeaders }
      );
    }

    console.error('[Teacher Generate] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
