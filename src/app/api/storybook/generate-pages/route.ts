import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rateLimit';
import { getRequestUserRole } from '@/lib/auth';
import sharp from 'sharp';

export const maxDuration = 120;

interface Character {
  label: string;
  description: string;
}

interface StoryPage {
  pageNumber: number;
  storyText: string;
  illustrationDescription: string;
  imageUrl?: string;
}

// Use FLUX.1-schnell for fast image generation
const IMAGE_CONFIG = {
  model: 'black-forest-labs/FLUX.1-schnell',
  width: 1024,
  height: 768,
  steps: 8,
};

/**
 * Post-process image for pure black & white coloring page
 */
async function postProcessForColoring(base64Data: string): Promise<string> {
  const buffer = Buffer.from(base64Data, 'base64');

  // Step 1: Convert to grayscale and boost contrast
  let processed = await sharp(buffer)
    .grayscale()
    .normalize()
    .linear(1.5, -30) // Increase contrast
    .toBuffer();

  // Step 2: Apply aggressive threshold for pure B&W
  processed = await sharp(processed)
    .threshold(150) // Lower threshold = more black lines
    .toBuffer();

  // Step 3: Clean up with median filter
  processed = await sharp(processed)
    .median(1)
    .toBuffer();

  // Step 4: Thicken lines slightly
  const dilationKernel = [1, 1, 1, 1, 1, 1, 1, 1, 1];
  processed = await sharp(processed)
    .convolve({
      width: 3,
      height: 3,
      kernel: dilationKernel,
      scale: 9,
      offset: 0,
    })
    .threshold(180) // Re-threshold after dilation
    .toBuffer();

  // Step 5: Final threshold to ensure absolutely pure B&W
  processed = await sharp(processed)
    .threshold(128)
    .toBuffer();

  // Step 6: Final output - ensure pure white background and 1-bit B&W
  const final = await sharp(processed)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .grayscale() // Ensure no color channels remain
    .threshold(128) // Final pure B&W conversion
    .png({ compressionLevel: 9 })
    .toBuffer();

  return final.toString('base64');
}

// High quality image generation with FLUX.1-schnell
async function generateImage(prompt: string, isOutline: boolean): Promise<string | null> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) return null;

  try {
    const negativePrompt = isOutline
      ? 'color, colored, colorful, red, blue, green, yellow, orange, purple, pink, shading, shadows, gradients, gray, grey, realistic, photorealistic, messy lines, text, words, letters, writing, watermark, nudity, gore, scary, 3d render, dark background, extra heads, duplicate heads, two heads, multiple heads, extra limbs, extra arms, extra legs, deformed, malformed, bad anatomy, fused bodies, merged characters'
      : 'text, words, letters, writing, watermark, nudity, gore, scary, dark, ugly, extra heads, duplicate heads, two heads, multiple heads, extra limbs, extra arms, extra legs, deformed, malformed, bad anatomy, fused bodies, merged characters';

    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: IMAGE_CONFIG.model,
        prompt,
        negative_prompt: negativePrompt,
        width: IMAGE_CONFIG.width,
        height: IMAGE_CONFIG.height,
        steps: IMAGE_CONFIG.steps,
        n: 1,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Generate Pages] API error: ${response.status} - ${errorText.substring(0, 100)}`);
      return null;
    }

    const data = await response.json();
    const imageData = data.data?.[0];

    if (imageData?.b64_json) {
      // Apply post-processing for outline style
      if (isOutline) {
        const processedBase64 = await postProcessForColoring(imageData.b64_json);
        return `data:image/png;base64,${processedBase64}`;
      }
      return `data:image/png;base64,${imageData.b64_json}`;
    }

    return imageData?.url || null;
  } catch (error) {
    console.error('[Generate Pages] Image generation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = await getRequestUserRole(request);
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = userRole === 'ADMIN'
      ? { allowed: true, remaining: 999, resetIn: 0 }
      : checkRateLimit(identifier, { maxRequests: 5, windowMs: 60 * 60 * 1000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: "You've created too many storybooks. Please try again later!",
          resetIn: Math.ceil(rateLimit.resetIn / 60000),
        },
        { status: 429 }
      );
    }

    // Validate Together API key
    if (!process.env.TOGETHER_API_KEY) {
      console.error('[Generate Pages] Together API key not configured');
      return NextResponse.json(
        { error: 'Service unavailable', message: 'Image generation service is not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { characters, pages, outputStyle = 'colored' } = body as {
      characters: Character[];
      pages: StoryPage[];
      outputStyle?: 'outline' | 'colored';
    };

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages provided' },
        { status: 400 }
      );
    }

    const isOutline = outputStyle === 'outline';
    console.log(`[Generate Pages] Generating ${pages.length} ${isOutline ? 'outline' : 'colored'} illustrations with FLUX.1-schnell (fast mode)`);

    // Build DETAILED character descriptions for consistency
    const characterDetails = characters
      .map((c) => `"${c.label}": ${c.description}`)
      .join('\n');

    // Create a consistent character reference block
    const characterBlock = `IMPORTANT - Use these EXACT character appearances in EVERY image:
${characterDetails}

Keep these characters looking IDENTICAL in every scene - same face, hair, clothing, features.`;

    // Generate illustrations for each page (in parallel for speed)
    const illustratedPages: StoryPage[] = await Promise.all(
      pages.map(async (page) => {
        try {
          console.log(`[Generate Pages] Page ${page.pageNumber}...`);

          // Enhanced prompt with strong character consistency instructions
          const illustrationPrompt = isOutline
            ? `BLACK AND WHITE children's coloring book page, pure monochrome line art:

Scene: ${page.illustrationDescription}

${characterBlock}

Style: BLACK AND WHITE ONLY, thick bold black outlines on pure white background, absolutely no color, no shading, no gray tones, no gradients, simple clean line art, large empty areas to color in, professional coloring book page style, monochrome, ink drawing, no text, no words, correct anatomy, one head per character.`
            : `Children's book illustration:

Scene: ${page.illustrationDescription}

${characterBlock}

Style: Colorful watercolor, cute friendly characters, soft pastel colors, G-rated, no text, no words, correct anatomy, one head per character.`;

          const imageUrl = await generateImage(illustrationPrompt, isOutline);

          if (!imageUrl) {
            console.error(`[Generate Pages] No image returned for page ${page.pageNumber}`);
            return { ...page, imageUrl: undefined };
          }

          console.log(`[Generate Pages] Page ${page.pageNumber} illustration generated`);

          return {
            ...page,
            imageUrl,
          };
        } catch (err) {
          console.error(`[Generate Pages] Error generating page ${page.pageNumber}:`, err);
          return { ...page, imageUrl: undefined };
        }
      })
    );

    // Check if at least some pages have illustrations
    const successCount = illustratedPages.filter((p) => p.imageUrl).length;
    console.log(`[Generate Pages] Successfully generated ${successCount}/${pages.length} illustrations`);

    if (successCount === 0) {
      return NextResponse.json(
        {
          error: 'Illustration generation failed',
          message: 'Could not generate any illustrations. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pages: illustratedPages,
    });
  } catch (error) {
    console.error('[Generate Pages] Error:', error);
    return NextResponse.json(
      {
        error: 'Illustration generation failed',
        message: 'Could not generate the illustrations. Please try again.',
      },
      { status: 500 }
    );
  }
}
