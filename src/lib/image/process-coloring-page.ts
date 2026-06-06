/**
 * Image Post-Processing for Coloring Pages using Sharp
 * Ensures perfect black lines on white background for printing
 */

import sharp from 'sharp';

// Standard printable page dimensions (8.5x11 at 150 DPI)
const PRINT_WIDTH = 1275; // 8.5 inches * 150 DPI
const PRINT_HEIGHT = 1650; // 11 inches * 150 DPI

// Threshold for black/white conversion (0-255)
// Lower = more black (preserves thin lines like necks/joints), Higher = more white
const BW_THRESHOLD = 160;

// Contrast adjustment (1.0 = no change, >1 = more contrast)
// Kept gentle so thin connecting lines between body parts aren't wiped out
const CONTRAST_MULTIPLIER = 1.1;

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

/**
 * Process an image into a clean coloring page
 * - Converts to grayscale
 * - Increases contrast
 * - Applies threshold to force pure black/white
 * - Resizes to printable dimensions
 */
export async function processColoringPageImage(
  input: Buffer | string
): Promise<ProcessedImage> {
  console.log('[ImageProcess] Starting image processing...');

  // Load the image
  let image = sharp(input);

  // Get original metadata
  const metadata = await image.metadata();
  console.log(`[ImageProcess] Original: ${metadata.width}x${metadata.height}`);

  // Step 1: Convert to grayscale
  image = image.grayscale();

  // Step 2: Increase contrast by 20%
  // Using linear transformation: output = input * contrast + brightness
  image = image.linear(CONTRAST_MULTIPLIER, -(128 * (CONTRAST_MULTIPLIER - 1)));

  // Step 3: Apply threshold to force pure black (#000) or white (#FFF)
  image = image.threshold(BW_THRESHOLD);

  // Step 4: Resize to printable 8.5x11 aspect ratio while maintaining quality
  // Fit within the print dimensions while preserving aspect ratio
  image = image.resize(PRINT_WIDTH, PRINT_HEIGHT, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255 }, // White background
    withoutEnlargement: false,
  });

  // Step 5: Ensure white background by flattening any transparency
  image = image.flatten({ background: { r: 255, g: 255, b: 255 } });

  // Output as high-quality PNG for printing
  const buffer = await image.png({ quality: 100, compressionLevel: 6 }).toBuffer();

  console.log(`[ImageProcess] Processed: ${PRINT_WIDTH}x${PRINT_HEIGHT}, ${buffer.length} bytes`);

  return {
    buffer,
    width: PRINT_WIDTH,
    height: PRINT_HEIGHT,
    format: 'png',
  };
}

/**
 * Quick processing for web display (smaller, faster)
 * Creates a clean black/white image without resizing to print dimensions
 */
export async function processForWebDisplay(input: Buffer | string): Promise<Buffer> {
  const image = sharp(input)
    .grayscale()
    .linear(CONTRAST_MULTIPLIER, -(128 * (CONTRAST_MULTIPLIER - 1)))
    .threshold(BW_THRESHOLD)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ quality: 90 });

  return image.toBuffer();
}

/**
 * Create a thumbnail for gallery display
 */
export async function createThumbnail(
  input: Buffer | string,
  size: number = 300
): Promise<Buffer> {
  return sharp(input)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}

/**
 * Process base64 image data
 */
export async function processBase64Image(base64Data: string): Promise<ProcessedImage> {
  // Remove data URL prefix if present
  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Clean, 'base64');

  return processColoringPageImage(buffer);
}

/**
 * Fetch and process an image from URL
 */
export async function processImageFromUrl(url: string): Promise<ProcessedImage> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return processColoringPageImage(buffer);
}
