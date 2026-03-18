import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rateLimit';

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

// Use FLUX.2-flex for multi-reference image generation
const IMAGE_CONFIG = {
  model: 'black-forest-labs/FLUX.2-flex',
  width: 768,
  height: 576,
  steps: 20, // FLUX.2-flex allows customizable steps
};

async function generateImageWithReferences(
  prompt: string,
  referenceImages: string[]
): Promise<string | null> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) return null;

  try {
    // Filter valid reference images (must be data URLs or URLs)
    const validRefs = referenceImages
      .filter((img) => img && (img.startsWith('data:') || img.startsWith('http')))
      .slice(0, 5); // Max 5 reference images for performance

    console.log(`[Generate Pages] Using ${validRefs.length} reference images`);

    const requestBody: Record<string, unknown> = {
      model: IMAGE_CONFIG.model,
      prompt,
      width: IMAGE_CONFIG.width,
      height: IMAGE_CONFIG.height,
      steps: IMAGE_CONFIG.steps,
      n: 1,
      response_format: 'b64_json',
    };

    // Add reference images if available
    if (validRefs.length > 0) {
      requestBody.reference_images = validRefs;
    }

    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Generate Pages] API error: ${response.status} - ${errorText.substring(0, 200)}`);

      // Fallback to FLUX.1-schnell without references if FLUX.2-flex fails
      if (validRefs.length > 0) {
        console.log('[Generate Pages] Falling back to FLUX.1-schnell without references');
        return generateImageFallback(prompt);
      }
      return null;
    }

    const data = await response.json();
    const imageData = data.data?.[0];

    if (imageData?.b64_json) {
      return `data:image/png;base64,${imageData.b64_json}`;
    }

    if (imageData?.url) {
      return imageData.url;
    }

    return null;
  } catch (error) {
    console.error('[Generate Pages] Image generation error:', error);
    return null;
  }
}

// Fallback to FLUX.1-schnell without references
async function generateImageFallback(prompt: string): Promise<string | null> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt,
        width: 768,
        height: 576,
        steps: 4,
        n: 1,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data?.[0]?.b64_json
      ? `data:image/png;base64,${data.data[0].b64_json}`
      : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(identifier, { maxRequests: 5, windowMs: 60 * 60 * 1000 });

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
    const { characters, pages, referenceImages, outputStyle = 'colored' } = body as {
      characters: Character[];
      pages: StoryPage[];
      referenceImages?: string[];
      outputStyle?: 'outline' | 'colored';
    };

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages provided' },
        { status: 400 }
      );
    }

    const refs = referenceImages || [];
    const isOutline = outputStyle === 'outline';
    console.log(`[Generate Pages] Generating ${pages.length} ${isOutline ? 'outline' : 'colored'} illustrations with FLUX.2-flex (${refs.length} reference images)`);

    // Build character reference string with image indices
    const characterRef = characters
      .map((c, i) => `${c.label} (image ${i + 1}: ${c.description})`)
      .join(', ');

    // Generate illustrations for each page (in parallel for speed)
    const illustratedPages: StoryPage[] = await Promise.all(
      pages.map(async (page) => {
        try {
          console.log(`[Generate Pages] Generating illustration for page ${page.pageNumber}`);

          // Create prompt that references the uploaded images
          const stylePrompt = isOutline
            ? `Children's book coloring page, black and white line art, clean outlines, simple shapes for coloring, no shading, white background, suitable for kids to color in`
            : `Children's book illustration, colorful watercolor style, friendly cute characters, G-rated, warm inviting scene`;

          const styleFooter = isOutline
            ? `Style: Black and white line drawing, thick clean outlines, simple shapes, no colors, no shading, white background, coloring book page style, no text in image`
            : `Style: Soft pastel colors, simple shapes, cheerful children's book atmosphere, no text in image`;

          const illustrationPrompt = `${stylePrompt}:

${page.illustrationDescription}

${refs.length > 0 ? `Use the characters from the reference images: ${characterRef}. Make them look like the people/characters in image 1${refs.length > 1 ? ', image 2' : ''}${refs.length > 2 ? ', image 3' : ''} etc.` : `Characters: ${characterRef}`}

${styleFooter}`;

          const imageUrl = await generateImageWithReferences(illustrationPrompt, refs);

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
