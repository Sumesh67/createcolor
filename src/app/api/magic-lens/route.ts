import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzePhoto } from '@/lib/ai/gemini-client';
import { checkAndDeductEnergy, EnergyError } from '@/lib/auth/check-energy';
import { uploadImage, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';
import sharp from 'sharp';

export const maxDuration = 120;

interface SessionUser {
  id?: string;
}

interface TogetherImageResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

/**
 * Generate coloring page using FLUX.1-dev
 * Cost estimate: ~$0.005 per image (28 steps)
 */
async function generateColoringPage(description: string): Promise<Buffer> {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY not configured');
  }

  console.log('[MagicLens] Generating coloring page with FLUX.1-dev...');
  console.log('[MagicLens] Description:', description);

  const prompt = `A professional children's coloring book page of ${description}. Thick bold black outlines, pure white background, no shading, no gray, no color, simple clean line art, large areas to color, minimalist, G-rated, printable.`;

  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt,
      negative_prompt: 'color, shading, gradients, realistic, photorealistic, messy lines, text, watermark, nudity, gore, scary, dark background',
      width: 1024,
      height: 1024,
      steps: 4,
      n: 1,
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[MagicLens] FLUX.1-dev error:', errorText);
    throw new Error(`Image generation failed: ${response.status}`);
  }

  const data = (await response.json()) as TogetherImageResponse;
  const imageData = data.data?.[0];

  if (!imageData?.b64_json) {
    throw new Error('No image data returned');
  }

  console.log('[MagicLens] FLUX.1-dev image generated');
  console.log('[MagicLens] Estimated image cost: ~$0.005');

  return Buffer.from(imageData.b64_json, 'base64');
}

/**
 * Post-process image to force pure black/white coloring page
 */
async function postProcessImage(buffer: Buffer): Promise<Buffer> {
  console.log('[MagicLens] Post-processing image...');

  // Step 1: Convert to grayscale and apply threshold for pure B&W
  let processed = await sharp(buffer)
    .grayscale()
    .normalize()
    .threshold(180) // Force pure black/white
    .toBuffer();

  // Step 2: Median filter to smooth jagged lines
  processed = await sharp(processed)
    .median(1)
    .toBuffer();

  // Step 3: Slight dilation to thicken lines (using convolution)
  const dilationKernel = [1, 1, 1, 1, 1, 1, 1, 1, 1];
  processed = await sharp(processed)
    .convolve({
      width: 3,
      height: 3,
      kernel: dilationKernel,
      scale: 9,
      offset: 0,
    })
    .threshold(200) // Re-threshold after dilation
    .toBuffer();

  // Step 4: Add watermark
  const { width } = await sharp(processed).metadata();
  const watermarkSvg = `
    <svg width="${width}" height="30">
      <text x="50%" y="20" font-family="Arial, sans-serif" font-size="14" fill="#999999" text-anchor="middle">
        Created with CreateAndColor.app
      </text>
    </svg>
  `;

  const final = await sharp(processed)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .extend({
      bottom: 30,
      background: { r: 255, g: 255, b: 255 },
    })
    .composite([
      {
        input: Buffer.from(watermarkSvg),
        gravity: 'south',
      },
    ])
    .png({ quality: 100 })
    .toBuffer();

  console.log('[MagicLens] Post-processing complete');

  return final;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional for mobile)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    // If user is authenticated, check and deduct energy
    if (userId) {
      try {
        const energyStatus = await checkAndDeductEnergy(userId);
        console.log(`[MagicLens] Energy deducted, ${energyStatus.remaining} remaining`);
      } catch (error) {
        const energyError = error as EnergyError;
        if (energyError.code === 'NO_ENERGY') {
          return NextResponse.json(
            {
              error: 'NO_ENERGY',
              message: energyError.message,
            },
            { status: 429 }
          );
        }
        throw error;
      }
    } else {
      console.log('[MagicLens] Anonymous request (no energy tracking)');
    }

    // Parse request body
    const body = await request.json();
    const { imageBase64 } = body as { imageBase64: string };

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    console.log('[MagicLens] Starting Magic Lens conversion...');
    console.log('[MagicLens] Total estimated cost: ~$0.008 (Gemini: $0.002 + FLUX: $0.005 + processing)');

    // Step 1: Analyze photo with Gemini
    const description = await analyzePhoto(imageBase64);

    // Step 2: Generate coloring page with FLUX.1-dev
    const rawImage = await generateColoringPage(description);

    // Step 3: Post-process for pure B&W
    const processedImage = await postProcessImage(rawImage);

    // Step 4: Upload to storage
    const imageUrl = isS3Configured()
      ? await uploadImage(processedImage)
      : bufferToDataUrl(processedImage);

    console.log('[MagicLens] Conversion complete!');

    return NextResponse.json({
      success: true,
      imageUrl,
      description,
    });
  } catch (error) {
    console.error('[MagicLens] Error:', error);
    return NextResponse.json(
      {
        error: 'Conversion failed',
        message: 'Could not convert your photo. Please try again.',
      },
      { status: 500 }
    );
  }
}
