import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';
import { createThumbnail } from '@/lib/image/processImage';
import { checkDailyLimit, getRateLimitIdentifier } from '@/lib/rateLimit';
import connectDB from '@/lib/db/connect';
import ColoringPage from '@/lib/db/models/ColoringPage';
import mongoose from 'mongoose';
import sharp from 'sharp';

export const maxDuration = 60;

// Together AI API types
interface TogetherImageResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

interface TogetherChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface SessionUser {
  id?: string;
}

// =============================================================================
// MAGIC RE-DRAW MODE - Vision-to-Vector: Describe → Generate clean coloring page
// =============================================================================
async function convertMagicReDraw(
  buffer: Buffer,
  style: 'simple' | 'medium' | 'detailed' = 'medium'
): Promise<Buffer> {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY not configured');
  }

  console.log(`[MagicReDraw] Starting Vision-to-Vector with style: ${style}`);

  // ===================
  // STEP 1: PRE-PROCESS IMAGE FOR VISION
  // ===================
  const resized = await sharp(buffer)
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const base64Image = resized.toString('base64');
  const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

  console.log(`[MagicReDraw] Step 1: Analyzing photo with Llama 4 Vision...`);

  // ===================
  // STEP 2: VISION ANALYSIS - Describe the photo in detail
  // ===================
  const visionResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
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
            {
              type: 'image_url',
              image_url: { url: imageDataUrl },
            },
            {
              type: 'text',
              text: `You are a professional artist assistant. Describe this photo in 150+ words with PHOTOGRAPHIC PRECISION so another artist can draw an IDENTICAL copy.

REQUIRED DETAILS:
1. SUBJECT TYPE: Human/animal/object, age range, gender if applicable
2. FACE: Expression, eye direction, mouth (smiling/neutral), eyebrows, any facial hair, glasses
3. BODY POSE: Exact position - standing/sitting/lying, which way facing, head angle (tilted left/right, looking up/down), shoulder position, EACH arm position (bent/straight, where hands are), EACH leg position
4. CLOTHING: Every garment from top to bottom - shirt type (t-shirt/button-up/sweater), neckline (v-neck/crew/collar), sleeve length, pants/skirt type, shoes, ALL patterns and colors
5. HAIR: Length (short/medium/long), style (straight/curly/wavy), parting (left/middle/right), tied up or down, color
6. ACCESSORIES: Jewelry, watch, hat, bag, belt, glasses - describe each
7. HANDS: What are they doing? Holding anything? Position?
8. SPATIAL: Where in frame (center/left/right), how much of body visible (full/waist-up/face only)

Be EXTREMELY specific. Do NOT use vague words like "casual" or "nice" - describe exactly what you see.`,
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    }),
  });

  if (!visionResponse.ok) {
    const errorText = await visionResponse.text();
    console.error('[MagicReDraw] Vision API error:', errorText);
    throw new Error(`Vision API error: ${visionResponse.status}`);
  }

  const visionData = (await visionResponse.json()) as TogetherChatResponse;
  const description = visionData.choices?.[0]?.message?.content?.trim();

  if (!description) {
    throw new Error('No description from Vision model');
  }

  console.log(`[MagicReDraw] Vision description: "${description}"`);

  // ===================
  // STEP 3: GENERATE COLORING PAGE (Text-to-Image)
  // ===================
  const styleModifiers = {
    simple: 'Very simple outlines only, almost no interior lines, just main shape edges. Perfect for toddlers.',
    medium: 'Clean simple outlines with minimal interior detail. Main shapes and features only. Great for kids.',
    detailed: 'More detailed outlines showing some clothing folds and features, but still mostly white space inside.',
  };

  const generationPrompt = `Children's coloring book page, simple clean line drawing:

${description}

ARTISTIC STYLE: ${styleModifiers[style]}

CRITICAL COLORING BOOK RULES:
1. ONLY thin black outlines on WHITE background
2. ZERO filled areas - everything is just lines
3. NO solid black anywhere - not in hair, eyes, clothing, shadows
4. NO shading, hatching, crosshatching, or gray tones
5. Hair = simple curved outline strands, NOT filled black
6. Eyes = circle outlines only, white inside (no black pupils)
7. Eyebrows = thin line arcs only
8. Clothing = outline edges only, patterns as simple lines
9. 90% of the image should be WHITE SPACE for coloring
10. Lines should be clean, smooth, and kid-friendly
11. Think: activity book for 5-year-olds to color with crayons
12. Maximum simplicity - if in doubt, use fewer lines`;

  console.log(`[MagicReDraw] Step 2: Generating coloring page with FLUX Schnell...`);

  const imageResponse = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: generationPrompt,
      width: 1024,
      height: 1024,
      steps: 8,
      n: 1,
      response_format: 'url',
    }),
  });

  if (!imageResponse.ok) {
    const errorText = await imageResponse.text();
    console.error('[MagicReDraw] Image API error:', errorText);
    throw new Error(`Image generation error: ${imageResponse.status}`);
  }

  const imageData = (await imageResponse.json()) as TogetherImageResponse;
  const outputUrl = imageData.data?.[0]?.url;

  if (!outputUrl) {
    throw new Error('No output from FLUX Schnell');
  }

  console.log(`[MagicReDraw] Step 3: Post-processing output...`);

  // Fetch the generated image
  const fetchResponse = await fetch(outputUrl);
  const arrayBuffer = await fetchResponse.arrayBuffer();
  const rawBuffer = Buffer.from(arrayBuffer);

  // ===================
  // STEP 4: POST-PROCESSING - Force pure B&W with minimal black
  // ===================
  // Higher threshold = more white, less black (better for coloring)
  // Increased values for maximum white space
  const thresholdValue = style === 'detailed' ? 180 : style === 'medium' ? 170 : 160;

  // Chain all processing together
  const processedBuffer = await sharp(rawBuffer)
    .grayscale()
    .normalize() // Stretch contrast first
    .threshold(thresholdValue) // Higher value = more white space
    .median(1) // Smooth out AI artifacts
    .toBuffer();

  // Add watermark
  const watermarkSvg = `
    <svg width="1024" height="30">
      <text x="50%" y="20" font-family="Arial, sans-serif" font-size="14" fill="#999999" text-anchor="middle">
        Created with CreateAndColor.app
      </text>
    </svg>
  `;

  const final = await sharp(processedBuffer)
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

  console.log(`[MagicReDraw] Complete!`);

  return final;
}

// =============================================================================
// FAST SKETCH MODE - Local edge detection, no AI needed (fallback)
// =============================================================================
async function convertFastSketch(
  buffer: Buffer,
  style: 'simple' | 'medium' | 'detailed' = 'medium'
): Promise<Buffer> {
  console.log(`[FastSketch] Processing with style: ${style}`);

  // Style configs optimized for coloring pages
  const styleConfig = {
    simple: { blur: 2.5, lowThreshold: 50, highThreshold: 150, lineThickness: 2 },
    medium: { blur: 1.5, lowThreshold: 30, highThreshold: 100, lineThickness: 1 },
    detailed: { blur: 0.8, lowThreshold: 20, highThreshold: 80, lineThickness: 1 },
  };

  const config = styleConfig[style];

  // Step 1: Resize to manageable size
  const resized = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  // Step 2: Convert to grayscale and enhance contrast
  const grayscale = await sharp(resized)
    .grayscale()
    .normalize() // Auto-level for better edge detection
    .toBuffer();

  // Step 3: Gaussian blur to reduce noise
  const blurred = await sharp(grayscale)
    .blur(config.blur)
    .toBuffer();

  // Step 4: Canny-style edge detection using Sobel operators
  // Sobel X (horizontal edges)
  const sobelX = await sharp(blurred)
    .convolve({
      width: 3,
      height: 3,
      kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
      scale: 1,
      offset: 128,
    })
    .toBuffer();

  // Sobel Y (vertical edges)
  const sobelY = await sharp(blurred)
    .convolve({
      width: 3,
      height: 3,
      kernel: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
      scale: 1,
      offset: 128,
    })
    .toBuffer();

  // Step 5: Combine X and Y gradients (approximate magnitude)
  const edges = await sharp(sobelX)
    .composite([{ input: sobelY, blend: 'darken' }])
    .toBuffer();

  // Step 6: Enhance edges and apply threshold
  const enhanced = await sharp(edges)
    .linear(2.5, -180) // Boost contrast significantly
    .normalize()
    .toBuffer();

  // Step 7: Convert to pure black/white with threshold
  const bw = await sharp(enhanced)
    .threshold(config.highThreshold)
    .negate() // Invert: black lines on white
    .toBuffer();

  // Step 8: Remove background noise with median filter
  const denoised = await sharp(bw)
    .median(3)
    .toBuffer();

  // Step 9: Thicken lines using dilation (convolution with box kernel)
  let thickened = denoised;
  if (config.lineThickness > 1) {
    // Dilation kernel - expands white areas (which are our lines after invert)
    // We need to invert, dilate, then invert back
    const inverted = await sharp(denoised).negate().toBuffer();

    const dilated = await sharp(inverted)
      .convolve({
        width: 3,
        height: 3,
        kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1], // Box filter for dilation effect
        scale: 9,
        offset: 0,
      })
      .threshold(200) // Re-threshold to keep binary
      .toBuffer();

    thickened = await sharp(dilated).negate().toBuffer();
  }

  // Step 10: Final cleanup - remove isolated pixels
  const cleaned = await sharp(thickened)
    .median(1)
    .toBuffer();

  // Step 11: Add watermark
  const { width } = await sharp(cleaned).metadata();
  const watermarkSvg = `
    <svg width="${width}" height="30">
      <text x="50%" y="20" font-family="Arial, sans-serif" font-size="14" fill="#999999" text-anchor="middle">
        Created with CreateAndColor.app
      </text>
    </svg>
  `;

  const final = await sharp(cleaned)
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

  return final;
}


// =============================================================================
// COLORED OUTPUT MODE - Posterize effect keeping colors
// =============================================================================
async function convertColored(buffer: Buffer): Promise<Buffer> {
  const resized = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const { width } = await sharp(resized).metadata();

  const posterized = await sharp(resized)
    .modulate({ saturation: 1.3 })
    .blur(0.5)
    .sharpen({ sigma: 1.5 })
    .toBuffer();

  const watermarkSvg = `
    <svg width="${width}" height="30">
      <text x="50%" y="20" font-family="Arial, sans-serif" font-size="14" fill="#999999" text-anchor="middle">
        Created with CreateAndColor.app
      </text>
    </svg>
  `;

  const final = await sharp(posterized)
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

  return final;
}

export async function POST(request: NextRequest) {
  try {
    // Daily limit: 20 images per day (shared with generate), resets at midnight
    const identifier = getRateLimitIdentifier(request);
    const dailyLimit = checkDailyLimit(identifier, 20);

    if (!dailyLimit.allowed) {
      const hoursUntilReset = Math.ceil(dailyLimit.resetIn / (60 * 60 * 1000));
      return NextResponse.json(
        {
          error: 'Daily limit reached',
          message: `You've used all 20 free coloring pages for today! Come back tomorrow for more magic! ✨`,
          resetIn: dailyLimit.resetIn,
          hoursUntilReset,
          used: dailyLimit.used,
          limit: 20,
        },
        { status: 429 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Please upload an image' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const style = (formData.get('style') as string) || 'medium';
    const outputStyle = (formData.get('outputStyle') as string) || 'outline';
    const mode = (formData.get('mode') as string) || 'magic'; // 'magic' (AI) or 'fast' (local)

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Please upload a JPG, PNG, or WEBP image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Please upload an image under 10MB.' },
        { status: 400 }
      );
    }

    console.log(`[ConvertPhoto] Processing ${file.name}, style: ${style}, mode: ${mode}, output: ${outputStyle}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer: Buffer = Buffer.from(arrayBuffer);

    // Convert to coloring page based on mode
    let processedBuffer: Buffer;

    if (outputStyle === 'colored') {
      // Colored output mode
      processedBuffer = await convertColored(buffer);
    } else if (mode === 'magic') {
      // Magic Re-Draw mode (AI inking with Together AI)
      try {
        processedBuffer = await convertMagicReDraw(
          buffer,
          style as 'simple' | 'medium' | 'detailed'
        );
      } catch (aiError) {
        console.error('[ConvertPhoto] Magic Re-Draw failed, falling back to fast:', aiError);
        processedBuffer = await convertFastSketch(
          buffer,
          style as 'simple' | 'medium' | 'detailed'
        );
      }
    } else {
      // Fast Sketch mode (local edge detection)
      processedBuffer = await convertFastSketch(
        buffer,
        style as 'simple' | 'medium' | 'detailed'
      );
    }

    // Upload or encode
    const imageUrl = isS3Configured()
      ? await uploadImage(processedBuffer)
      : bufferToDataUrl(processedBuffer);

    // Create thumbnail
    const thumbnailBuffer = await createThumbnail(processedBuffer);
    const thumbnailUrl = isS3Configured()
      ? await uploadImage(thumbnailBuffer)
      : bufferToDataUrl(thumbnailBuffer);

    // Save to database if authenticated
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;
    let pageId = `temp_${Date.now()}`;

    if (userId) {
      await connectDB();

      const page = await ColoringPage.create({
        userId: new mongoose.Types.ObjectId(userId),
        prompt: 'Photo converted with Magic Lens',
        imageUrl,
        thumbnailUrl,
      });

      pageId = page._id.toString();
    }

    console.log(`[ConvertPhoto] Success! Generated ${processedBuffer.length} bytes`);

    return NextResponse.json({
      success: true,
      imageUrl,
      thumbnailUrl,
      pageId,
      prompt: 'Photo converted with Magic Lens',
      remaining: dailyLimit.remaining,
      used: dailyLimit.used,
      limit: 20,
    });
  } catch (error) {
    console.error('Error converting photo:', error);
    return NextResponse.json(
      {
        error: 'Conversion failed',
        message: 'Oops! Could not convert your photo. Please try another image.',
      },
      { status: 500 }
    );
  }
}
