import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, extractTokenFromRequest, verifyJWT } from '@/lib/auth';
import { analyzePhoto } from '@/lib/ai/gemini-client';
import { checkAndConsumeSpark, getSparkStatus, EnergyError } from '@/lib/auth/check-energy';
import { uploadImage, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';
import { compositeQRCode } from '@/lib/image/processImage';
import { generateQRPngBytes } from '@/lib/pdf/qrCodeHelper';
import sharp from 'sharp';

export const maxDuration = 120;

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

interface TogetherImageResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

interface TogetherChatResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

async function analyzeWithLlama(imageBase64: string): Promise<string> {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY not configured');
  }

  const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageDataUrl } },
            {
              type: 'text',
              text: 'Describe this photo in detail for a children\'s coloring book artist: subject, pose, clothing, expression, background. Keep it G-rated and under 100 words.',
            },
          ],
        },
      ],
      max_tokens: 200,
      temperature: 0.1,
    }),
  });

  if (!response.ok) throw new Error(`Llama vision error: ${response.status}`);

  const data = (await response.json()) as TogetherChatResponse;
  const description = data.choices?.[0]?.message?.content?.trim();
  if (!description) throw new Error('No description from Llama');

  return description;
}

async function generateWithFlux(description: string): Promise<Buffer> {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY not configured');
  }

  const prompt = `Children's coloring book outline drawing of ${description}. ONLY thick bold black ink outlines on a pure white background. Cartoon line art style. No shading, no gray, no color fills, no gradients, no shadows, no textures. Simple clean lines only, large white areas to color in. Printable coloring page.`;

  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt,
      width: 1024,
      height: 1024,
      steps: 4,
      n: 1,
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) throw new Error(`FLUX error: ${response.status}`);

  const data = (await response.json()) as TogetherImageResponse;
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image from FLUX');

  return Buffer.from(b64, 'base64');
}

async function convertWithSharp(imageBase64: string): Promise<Buffer> {
  console.log('[MagicLens] Using local Sharp edge detection fallback');
  const buffer = Buffer.from(imageBase64, 'base64');

  // Step 1: Resize + grayscale
  const gray = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .grayscale()
    .toBuffer();

  // Step 2: Slight blur to suppress texture noise before edge detection
  const blurred = await sharp(gray).blur(1.5).toBuffer();

  // Step 3: Laplacian edge detection — finds borders between regions, not fills
  // offset:128 centres the result so edges appear bright on mid-gray background
  const edges = await sharp(blurred)
    .convolve({
      width: 3,
      height: 3,
      kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0],
      scale: 1,
      offset: 128,
    })
    .toBuffer();

  // Step 4: Normalize so edges span the full brightness range
  const normalized = await sharp(edges).normalize().toBuffer();

  // Step 5: Threshold — bright pixels are edges; keep them, discard background
  const thresholded = await sharp(normalized).threshold(85).toBuffer();

  // Step 6: Invert → edges become black lines on white background
  const inverted = await sharp(thresholded).negate().toBuffer();

  // Step 7: Thicken lines slightly so they're printable
  const thickened = await sharp(inverted)
    .convolve({
      width: 3,
      height: 3,
      kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      scale: 9,
      offset: 0,
    })
    .threshold(200)
    .toBuffer();

  // Step 8: Remove noise with median filter
  const cleaned = await sharp(thickened).median(2).toBuffer();

  return sharp(cleaned)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ quality: 100 })
    .toBuffer();
}

async function postProcessImage(buffer: Buffer): Promise<Buffer> {
  // FLUX should have already generated near-line-art (white bg, dark lines).
  // We only need to clean it up — NOT re-threshold as if it were a photo.

  // Step 1: Grayscale
  let processed = await sharp(buffer).grayscale().toBuffer();

  // Step 2: Threshold at 180 — keeps ink lines + any medium-gray areas as black.
  // 230 was too aggressive and erased near-white FLUX lines.
  processed = await sharp(processed).threshold(160).toBuffer();

  // Step 3: Light noise removal
  processed = await sharp(processed).median(1).toBuffer();

  const { width } = await sharp(processed).metadata();
  const watermarkSvg = `
    <svg width="${width}" height="30">
      <text x="50%" y="20" font-family="Arial, sans-serif" font-size="14" fill="#999999" text-anchor="middle">
        Created with CreateAndColor.app
      </text>
    </svg>
  `;

  return sharp(processed)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .extend({ bottom: 30, background: { r: 255, g: 255, b: 255 } })
    .composite([{ input: Buffer.from(watermarkSvg), gravity: 'south' }])
    .png({ quality: 100 })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  let userId: string | undefined;

  try {
    // Auth: JWT (mobile) or NextAuth session (web)
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
        { error: 'Authentication required', message: 'Please sign in to use Magic Lens' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check sparks before doing anything (without deducting yet)
    const energyCheck = await getSparkStatus(userId);
    if (!energyCheck.success) {
      return NextResponse.json(
        { error: 'NO_ENERGY', message: 'Your Magic Wand needs to rest ✨ Come back tomorrow!' },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { imageBase64 } = body as { imageBase64: string };

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[MagicLens] Starting Magic Lens conversion...');

    let processedImage: Buffer;
    let description: string | undefined;

    // Try AI pipeline (Gemini or Llama → FLUX), fall back to local Sharp
    try {
      // Step 1: Analyze photo — try Gemini first, then Llama
      try {
        description = await analyzePhoto(imageBase64);
        console.log('[MagicLens] Photo analyzed with Gemini');
      } catch (geminiError) {
        console.warn('[MagicLens] Gemini failed, trying Llama:', geminiError);
        description = await analyzeWithLlama(imageBase64);
        console.log('[MagicLens] Photo analyzed with Llama');
      }

      // Step 2: Generate coloring page with FLUX
      const rawImage = await generateWithFlux(description);
      console.log('[MagicLens] Image generated with FLUX');

      // Step 3: Post-process
      processedImage = await postProcessImage(rawImage);
      processedImage = await compositeQRCode(processedImage, await generateQRPngBytes('coloring'));
    } catch (aiError) {
      console.error('[MagicLens] AI pipeline failed:', aiError);
      throw aiError; // Surface the real error instead of silently producing a bad result
    }

    // Step 4: Upload
    const imageUrl = isS3Configured()
      ? await uploadImage(processedImage)
      : bufferToDataUrl(processedImage);

    // Consume spark only after successful generation
    let energyRemaining = energyCheck.remaining;
    try {
      const sparkStatus = await checkAndConsumeSpark(userId);
      energyRemaining = sparkStatus.remaining;
    } catch (sparkErr) {
      console.error('[MagicLens] Failed to consume spark after success:', sparkErr);
    }

    console.log('[MagicLens] Conversion complete!');

    return NextResponse.json({
      success: true,
      imageUrl,
      description,
      energyRemaining,
    }, { headers: corsHeaders });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[MagicLens] Error:', msg);
    return NextResponse.json(
      {
        error: 'Conversion failed',
        message: `Could not convert your photo: ${msg}`,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
