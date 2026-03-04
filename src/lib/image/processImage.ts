import sharp from "sharp";

interface ProcessOptions {
  threshold?: number;
  lineThickness?: number;
  contrast?: number;
}

const DEFAULT_OPTIONS: ProcessOptions = {
  threshold: 128,
  lineThickness: 2,
  contrast: 1.5,
};

export async function processImageForColoring(
  input: Buffer | string,
  options: ProcessOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const image = sharp(typeof input === "string" ? await fetchImage(input) : input);

  // Process the image to ensure clean black lines on white background
  const processed = await image
    // Convert to grayscale
    .grayscale()
    // Increase contrast
    .linear(opts.contrast!, -(opts.contrast! - 1) * 128)
    // Apply threshold to get pure black and white
    .threshold(opts.threshold!)
    // Negate to ensure black lines on white background if needed
    // .negate()
    // Ensure white background
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    // Output as high-quality PNG
    .png({ quality: 100 })
    .toBuffer();

  return processed;
}

export async function thickenLines(
  input: Buffer,
  thickness: number = 2
): Promise<Buffer> {
  // Create a dilated version to thicken lines
  // Using morphological operations via convolution
  const _kernelSize = thickness * 2 + 1;

  // For sharp, we simulate dilation with a combination of operations
  const processed = await sharp(input)
    .median(thickness) // Helps thicken the lines
    .png()
    .toBuffer();

  return processed;
}

export async function resizeForPrint(
  input: Buffer,
  dpi: number = 300,
  paperWidth: number = 8.5, // inches (Letter size)
  paperHeight: number = 11
): Promise<Buffer> {
  const targetWidth = Math.floor(paperWidth * dpi);
  const targetHeight = Math.floor(paperHeight * dpi);

  const processed = await sharp(input)
    .resize(targetWidth, targetHeight, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      withoutEnlargement: false,
    })
    .png({ quality: 100 })
    .toBuffer();

  return processed;
}

export async function createThumbnail(
  input: Buffer,
  size: number = 300
): Promise<Buffer> {
  const thumbnail = await sharp(input)
    .resize(size, size, {
      fit: "cover",
      position: "center",
    })
    .png({ quality: 80 })
    .toBuffer();

  return thumbnail;
}

export async function getImageDimensions(
  input: Buffer | string
): Promise<{ width: number; height: number }> {
  const buffer = typeof input === "string" ? await fetchImage(input) : input;
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

async function fetchImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export { fetchImage };
