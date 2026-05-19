import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeCharacters, writeStory } from '@/lib/ai/gemini-client';
import { checkAndConsumeSpark, EnergyError } from '@/lib/auth/check-energy';
import { uploadImage, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';
import sharp from 'sharp';

export const maxDuration = 300; // 5 minutes for full storybook generation

interface SessionUser {
  id?: string;
}

interface CharacterInput {
  label: string;
  imageBase64: string;
}

interface TogetherImageResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

interface StoryPage {
  pageNumber: number;
  storyText: string;
  illustrationDescription: string;
  imageUrl?: string;
}

/**
 * Generate a single page illustration using FLUX.1-dev
 * Cost estimate: ~$0.005 per image
 */
async function generatePageIllustration(
  pageDescription: string,
  characterDescriptions: string,
  isOutline: boolean = true
): Promise<Buffer> {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY not configured');
  }

  const stylePrompt = isOutline
    ? 'BLACK AND WHITE ONLY, thick bold black outlines on pure white background, absolutely no color, no shading, no gray tones, no gradients, simple clean line art, large empty areas to color in, professional coloring book page style, monochrome, ink drawing'
    : 'Colorful watercolor illustration, soft pastel colors, friendly cute style';

  const prompt = `A professional children's ${isOutline ? 'black and white coloring book page' : 'book illustration'}. ${pageDescription}. Characters: ${characterDescriptions}. ${stylePrompt}, G-rated, no text, no watermarks.`;

  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt,
      negative_prompt: isOutline
        ? 'color, colored, colorful, red, blue, green, yellow, orange, purple, pink, shading, shadows, gradients, gray, grey, realistic, photorealistic, messy lines, text, watermark, nudity, gore, scary, 3d render'
        : 'text, watermark, nudity, gore, scary, dark',
      width: 1024,
      height: 768,
      steps: 4,
      n: 1,
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Storybook] FLUX.1-dev error:', errorText);
    throw new Error(`Image generation failed: ${response.status}`);
  }

  const data = (await response.json()) as TogetherImageResponse;
  const imageData = data.data?.[0];

  if (!imageData?.b64_json) {
    throw new Error('No image data returned');
  }

  return Buffer.from(imageData.b64_json, 'base64');
}

/**
 * Post-process image for coloring book style - force pure black & white
 */
async function postProcessForColoring(buffer: Buffer): Promise<Buffer> {
  // FLUX.1-dev generates near-line-art: white background (~240-255) + dark lines (~0-80).
  // Use a high threshold so ONLY actual ink lines survive — no filled blobs.

  // Step 1: Grayscale + normalize
  let processed = await sharp(buffer)
    .grayscale()
    .normalize()
    .toBuffer();

  // Step 2: High threshold — keeps only genuinely dark ink lines
  processed = await sharp(processed).threshold(160).toBuffer();

  // Step 3: Light noise removal
  processed = await sharp(processed).median(1).toBuffer();

  // Step 4: Thicken lines so they're visible when printed
  processed = await sharp(processed)
    .convolve({
      width: 3,
      height: 3,
      kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      scale: 9,
      offset: 0,
    })
    .threshold(160)
    .toBuffer();

  return sharp(processed)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'Please sign in to create a storybook' },
        { status: 401 }
      );
    }

    // Check and consume a spark (shared pool: 2/day for magic lens + storybook)
    try {
      const sparkStatus = await checkAndConsumeSpark(userId);
      console.log(`[Storybook] Spark consumed, ${sparkStatus.remaining} remaining today`);
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

    // Parse request body
    const body = await request.json();
    const { characters, theme, outputStyle = 'outline', customContext } = body as {
      characters: CharacterInput[];
      theme: string;
      outputStyle?: 'outline' | 'colored';
      customContext?: string;
    };

    if (!characters || characters.length === 0) {
      return NextResponse.json(
        { error: 'No characters provided' },
        { status: 400 }
      );
    }

    if (!theme) {
      return NextResponse.json(
        { error: 'No theme provided' },
        { status: 400 }
      );
    }

    console.log('[Storybook] Starting storybook creation...');
    console.log('[Storybook] Characters:', characters.length, 'Theme:', theme);
    console.log('[Storybook] Total estimated cost: ~$0.05 (Gemini: ~$0.01 + 5 FLUX images: ~$0.025)');

    // Step 1: Analyze all character photos with Gemini
    console.log('[Storybook] Step 1: Analyzing characters...');
    const analyzedCharacters = await analyzeCharacters(characters);
    const characterDescriptions = analyzedCharacters.map((c) => c.description).join('. ');

    // Step 2: Write the story with Gemini
    console.log('[Storybook] Step 2: Writing story...');
    const characterLabels = analyzedCharacters.map((c) => c.label);
    const story = await writeStory(characterLabels, theme, customContext);

    // Step 3: Generate all 5 page illustrations in parallel
    console.log('[Storybook] Step 3: Generating illustrations...');
    const isOutline = outputStyle === 'outline';

    const illustratedPages: StoryPage[] = [];
    for (let i = 0; i < story.pages.length; i++) {
      const page = story.pages[i];
      if (i > 0) await new Promise(r => setTimeout(r, 1500)); // avoid FLUX rate limit
      try {
        console.log(`[Storybook] Generating page ${page.pageNumber}...`);

        const rawImage = await generatePageIllustration(
          page.illustrationDescription,
          characterDescriptions,
          isOutline
        );

        const processedImage = isOutline
          ? await postProcessForColoring(rawImage)
          : rawImage;

        const imageUrl = isS3Configured()
          ? await uploadImage(processedImage)
          : bufferToDataUrl(processedImage);

        console.log(`[Storybook] Page ${page.pageNumber} complete`);
        illustratedPages.push({ ...page, imageUrl });
      } catch (error) {
        console.error(`[Storybook] Failed to generate page ${page.pageNumber}:`, error);
        illustratedPages.push({ ...page, imageUrl: undefined });
      }
    }

    // Check how many pages succeeded
    const successCount = illustratedPages.filter((p) => p.imageUrl).length;
    console.log(`[Storybook] Generated ${successCount}/${story.pages.length} pages`);

    if (successCount === 0) {
      return NextResponse.json(
        {
          error: 'Generation failed',
          message: 'Could not generate any illustrations. Please try again.',
        },
        { status: 500 }
      );
    }

    console.log('[Storybook] Storybook creation complete!');

    return NextResponse.json({
      success: true,
      title: `A ${theme} Adventure`,
      characters: analyzedCharacters,
      pages: illustratedPages,
    });
  } catch (error) {
    console.error('[Storybook] Error:', error);
    return NextResponse.json(
      {
        error: 'Creation failed',
        message: 'Could not create your storybook. Please try again.',
      },
      { status: 500 }
    );
  }
}
