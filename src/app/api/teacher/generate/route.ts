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

// Grade band helpers
function gradeBand(gradeLevel: string): 'early' | 'mid' | 'upper' {
  if (gradeLevel === 'K' || gradeLevel === '1' || gradeLevel === '2') return 'early';
  if (gradeLevel === '3' || gradeLevel === '4' || gradeLevel === '5') return 'mid';
  return 'upper'; // 6-8
}

// How many countable objects the math worksheet shows per grade band
function mathCount(band: ReturnType<typeof gradeBand>): number {
  return band === 'early' ? 3 : band === 'mid' ? 5 : 8;
}

/**
 * Hardcoded prompts for each worksheet type, now grade-aware.
 *
 *  trace        — single figure or grid; complexity scales with grade
 *  connect-dots — outer silhouette only; detail level scales with grade
 *  math         — K-2: 3 objects, G3-5: 5 objects, G6-8: 8 objects in a row
 *  reading      — 4 corner objects; object complexity scales with grade
 */
function buildFallbackPrompt(topic: string, gradeLevel: string, type: WorksheetType): string {
  const band = gradeBand(gradeLevel);
  const isCollection = isCollectionTopic(topic);
  const count = mathCount(band);

  switch (type) {
    case 'trace':
      if (isCollection) {
        return `Six simple cartoon illustrations from the "${topic}" category arranged in two rows of three on a white page, each drawing inside its own lightly bordered square cell with generous internal padding. Each cell shows ONE clearly different item — pick the six most recognizable examples. Drawings use very thick bold outlines, ${band === 'early' ? 'zero interior detail lines, extremely simple rounded shapes' : band === 'mid' ? 'minimal interior lines, moderately detailed' : 'clear interior lines showing key features, detailed enough to be interesting'}. Cells are evenly sized and evenly spaced. ${WORKSHEET_STYLE}`;
      }
      return `One large friendly cartoon ${topic} centered on the page, surrounded by generous white space on all sides. ${band === 'early' ? 'Very thick bold outlines, no interior detail lines, oversized chunky rounded form — extremely simple and approachable' : band === 'mid' ? 'Thick bold outlines, a few interior lines showing main features, clear and identifiable' : 'Bold outlines with interior detail lines showing anatomy and features, complex enough to be engaging for older students'}. The figure fills about half the page height. No background, isolated on white. ${WORKSHEET_STYLE}`;

    case 'connect-dots':
      return `One ${topic} drawn ${band === 'early' ? 'using only its smooth outer boundary line — a single continuous minimal contour with absolutely no interior lines, no texture. The shape is recognizable purely from its large simple silhouette. Very thin clean stroke, figure centered, large empty white area all around. Sparse and minimalist like a paper cut-out shadow' : band === 'mid' ? 'as a clean minimal outline showing the outer boundary plus one or two key interior features only (such as a single eye or a wing edge). Very sparse, mostly silhouette, thin clean stroke, centered on white page with lots of empty space' : 'as a detailed outline showing the outer boundary and several recognizable interior features. More line segments and curves than earlier grades — complex enough to be a satisfying dot-to-dot for older students. Thin clean strokes, centered on white page'}. ${WORKSHEET_STYLE}`;

    case 'math':
      return `${count} identical small cartoon ${topic} drawings arranged in a single horizontal row across the center of the page, evenly spaced apart with generous white space between each one and above and below the row. Each ${topic} is drawn identically — same size, same ${band === 'early' ? 'very simple chunky' : band === 'mid' ? 'clear and recognizable' : 'detailed'} bold outline, same pose. ${count} separate isolated drawings in a row, nothing else on the page. ${WORKSHEET_STYLE}`;

    case 'reading':
      return `Four different objects closely associated with "${topic}" ${band === 'early' ? '— choose the simplest, most familiar everyday examples a kindergartner would know' : band === 'mid' ? '— choose clear subject-specific examples appropriate for elementary students' : '— choose more specific, content-rich examples appropriate for middle school students'} placed one in each corner of the page — top-left, top-right, bottom-left, bottom-right. Each object is a large simple cartoon drawing, clearly recognizable, drawn in thick bold outline. The four objects are completely different from each other. Large empty white space in the center of the page. No overlap between objects. ${WORKSHEET_STYLE}`;
  }
}

/**
 * Gemini writes a FLUX-optimised composition prompt for the given worksheet type and grade.
 */
async function buildGeminiPrompt(topic: string, gradeLevel: string, type: WorksheetType): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return buildFallbackPrompt(topic, gradeLevel, type);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const gradeContext = gradeLevel === 'K' ? 'Kindergarten (ages 5-6)' : `Grade ${gradeLevel} (ages ${5 + parseInt(gradeLevel, 10)}-${6 + parseInt(gradeLevel, 10)})`;
  const band = gradeBand(gradeLevel);
  const isCollection = isCollectionTopic(topic);
  const count = mathCount(band);

  const traceDetail = band === 'early'
    ? 'very thick bold outlines, no interior detail lines, oversized chunky rounded forms'
    : band === 'mid'
    ? 'thick bold outlines, a few interior lines showing main features'
    : 'bold outlines with interior detail lines and recognizable anatomy';

  const structural: Record<WorksheetType, string> = {
    'trace': isCollection
      ? `Six cartoon items from "${topic}" in a 3-column × 2-row grid of equal cells. ONE different item per cell, ${traceDetail}, thin cell border. Pick the six most recognizable examples for ${gradeContext}.`
      : `ONE large ${topic} cartoon centered on the page. ${traceDetail}. Isolated on white, lots of empty space around it. Appropriate complexity for ${gradeContext}.`,

    'connect-dots': band === 'early'
      ? `ONE ${topic} drawn ONLY as its smooth outer silhouette — single boundary line, ZERO interior lines, no details. Recognizable purely from outer shape. Thin stroke, centered, large empty space. Simple enough for ${gradeContext}.`
      : band === 'mid'
      ? `ONE ${topic} drawn as a minimal outline showing outer boundary plus 1-2 key interior features only. Sparse, mostly silhouette. Thin clean strokes, centered. Appropriate for ${gradeContext}.`
      : `ONE ${topic} drawn as a detailed outline with outer boundary and several interior features — complex enough for a satisfying dot-to-dot for ${gradeContext}. Thin clean strokes, centered on white page.`,

    'math':
      `EXACTLY ${count} identical small ${topic} cartoon drawings in ONE horizontal row across the page centre. Each drawing is the same size and ${band === 'early' ? 'very simple chunky' : band === 'mid' ? 'clear and recognizable' : 'detailed'} bold outline, same pose. ${count} separate isolated objects evenly spaced — nothing else on the page. (${gradeContext} counting level: ${count} objects)`,

    'reading':
      `FOUR different objects associated with "${topic}" for ${gradeContext} — ${band === 'early' ? 'choose the simplest familiar everyday examples' : band === 'mid' ? 'choose clear subject-specific examples' : 'choose specific content-rich examples for middle school'}. One object in each corner (top-left, top-right, bottom-left, bottom-right). Large empty white centre. Each object clearly different, large, simple, bold outline.`,
  };

  const systemPrompt = `You are a precise FLUX image-prompt engineer for children's educational worksheets.

HARD RULES:
1. Your prompt must produce a VISUALLY DISTINCT layout that matches the worksheet type. Do NOT default to "a single centered drawing" unless the type is TRACE.
2. Include the EXACT structural requirement below word-for-word in your output — do not paraphrase or soften it.
3. Do NOT mention text, labels, numbers, writing lines, or blank boxes — FLUX cannot draw these.
4. End the prompt with this style string verbatim: "${WORKSHEET_STYLE}"
5. Output ONLY the final prompt. No preamble, no quotes, no markdown. 60-90 words total.

WORKSHEET TYPE: ${type.toUpperCase()} — GRADE: ${gradeContext}
STRUCTURAL REQUIREMENT (copy this into your prompt):
${structural[type]}

Now write the complete FLUX image generation prompt:`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().trim().replace(/^["']|["']$/g, '');
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

    // Higher grades and multi-object types need more steps for layout fidelity
    const band = gradeBand(gradeLevel);
    const steps = (type === 'math' || type === 'reading')
      ? 12
      : (type === 'connect-dots' && band === 'upper') ? 10 : 8;

    // Generate worksheet image — uses direct FLUX path, bypasses the coloring-page wrapper
    const imageResult = await generateWorksheetImage(imagePrompt, steps);

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
