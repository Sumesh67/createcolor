import sharp from "sharp";
import { fetchImage } from "./processImage";

interface OutlineOptions {
  threshold?: number;
  edgeSensitivity?: number;
  invert?: boolean;
  simplify?: boolean;
}

const DEFAULT_OPTIONS: OutlineOptions = {
  threshold: 100,
  edgeSensitivity: 2,
  invert: true,
  simplify: true,
};

export async function convertToOutline(
  input: Buffer | string,
  options: OutlineOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const buffer = typeof input === "string" ? await fetchImage(input) : input;

  // Step 1: Convert to grayscale and normalize
  const grayscale = await sharp(buffer)
    .grayscale()
    .normalize()
    .toBuffer();

  // Step 2: Apply edge detection using a Sobel-like filter
  // Sharp doesn't have built-in edge detection, so we use a combination of operations

  // Create a high-contrast version
  const highContrast = await sharp(grayscale)
    .linear(2, -128)
    .toBuffer();

  // Apply threshold to get edges
  const edges = await sharp(highContrast)
    .threshold(opts.threshold!)
    .toBuffer();

  // Step 3: Invert if needed (black lines on white background)
  let result = edges;
  if (opts.invert) {
    result = await sharp(edges)
      .negate()
      .toBuffer();
  }

  // Step 4: Clean up and ensure white background
  const finalImage = await sharp(result)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ quality: 100 })
    .toBuffer();

  return finalImage;
}

export async function convertPhotoToColoringPage(
  input: Buffer | string,
  options: {
    threshold?: number;
    detail?: "low" | "medium" | "high";
  } = {}
): Promise<Buffer> {
  const buffer = typeof input === "string" ? await fetchImage(input) : input;

  // Determine threshold based on detail level
  const detailThresholds = {
    low: 150,
    medium: 100,
    high: 60,
  };
  const threshold = options.threshold ?? detailThresholds[options.detail ?? "medium"];

  // Step 1: Resize to manageable size while maintaining aspect ratio
  const resized = await sharp(buffer)
    .resize(1024, 1024, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toBuffer();

  // Step 2: Convert to grayscale
  const grayscale = await sharp(resized)
    .grayscale()
    .toBuffer();

  // Step 3: Apply blur to reduce noise
  const blurred = await sharp(grayscale)
    .blur(1.5)
    .toBuffer();

  // Step 4: Increase contrast significantly
  const highContrast = await sharp(blurred)
    .linear(3, -200)
    .normalize()
    .toBuffer();

  // Step 5: Apply threshold for black and white
  const thresholded = await sharp(highContrast)
    .threshold(threshold)
    .toBuffer();

  // Step 6: Invert to get black lines on white
  const inverted = await sharp(thresholded)
    .negate()
    .toBuffer();

  // Step 7: Clean up with morphological operations (using median)
  const cleaned = await sharp(inverted)
    .median(3)
    .toBuffer();

  // Step 8: Final output with white background
  const final = await sharp(cleaned)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ quality: 100 })
    .toBuffer();

  return final;
}

export async function adjustOutlineThreshold(
  input: Buffer,
  threshold: number
): Promise<Buffer> {
  // Allow user to adjust the threshold for better results
  const grayscale = await sharp(input)
    .grayscale()
    .toBuffer();

  const thresholded = await sharp(grayscale)
    .threshold(threshold)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();

  return thresholded;
}
