import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

function loadEnv(file: string) {
  try {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* skip */ }
}

loadEnv(resolve(__dirname, '../.env'));
loadEnv(resolve(__dirname, '../.env.local'));

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!TOGETHER_API_KEY) throw new Error('TOGETHER_API_KEY not found');
if (!GOOGLE_API_KEY) throw new Error('Gemini API key not found');

const SOURCE_IMAGE = process.argv[2];
if (!SOURCE_IMAGE) {
  console.error('Usage: npx tsx scripts/test-flux.ts <image-path>');
  process.exit(1);
}

const CONFIGS = [
  { steps: 4, threshold: 160 },
  { steps: 4, threshold: 170 },
  { steps: 4, threshold: 180 },
  { steps: 4, threshold: 190 },
  { steps: 4, threshold: 200 },
  { steps: 6, threshold: 170 },
  { steps: 6, threshold: 180 },
];

async function loadImageAsJpegBase64(filePath: string): Promise<string> {
  // Convert HEIC via sips if needed
  if (filePath.toLowerCase().endsWith('.heic') || filePath.toLowerCase().endsWith('.heif')) {
    const tmpPath = '/tmp/test_flux_source.jpg';
    execSync(`sips -s format jpeg "${filePath}" --out "${tmpPath}" 2>/dev/null`);
    const buf = await sharp(tmpPath).resize(1024, 1024, { fit: 'inside' }).jpeg({ quality: 85 }).toBuffer();
    return buf.toString('base64');
  }
  const buf = await sharp(filePath).resize(1024, 1024, { fit: 'inside' }).jpeg({ quality: 85 }).toBuffer();
  return buf.toString('base64');
}

async function analyzeWithGemini(imageBase64: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    },
    'Describe this photo in 25 words or less for a children\'s coloring book artist. Focus on: subjects, poses, clothing, expressions, and background. Keep it G-rated.',
  ]);

  return result.response.text().trim();
}

async function generateWithFlux(description: string, steps: number): Promise<Buffer> {
  const prompt = `Children's coloring book outline drawing of ${description}. ONLY thick bold black ink outlines on a pure white background. Cartoon line art style. No shading, no gray, no color fills, no gradients, no shadows, no textures. Simple clean lines only, large white areas to color in. Printable coloring page.`;

  const res = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt,
      width: 1024,
      height: 1024,
      steps,
      n: 1,
      response_format: 'b64_json',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FLUX error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { data: Array<{ b64_json?: string }> };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image returned');
  return Buffer.from(b64, 'base64');
}

async function postProcess(buffer: Buffer, threshold: number): Promise<Buffer> {
  let processed = await sharp(buffer).grayscale().toBuffer();
  processed = await sharp(processed).threshold(threshold).toBuffer();
  processed = await sharp(processed).median(1).toBuffer();
  return sharp(processed).flatten({ background: { r: 255, g: 255, b: 255 } }).png().toBuffer();
}

async function main() {
  const outDir = resolve(__dirname, '../test-results');
  mkdirSync(outDir, { recursive: true });

  console.log(`Source: ${SOURCE_IMAGE}`);
  console.log('Step 1: Loading and converting image...');
  const imageBase64 = await loadImageAsJpegBase64(SOURCE_IMAGE);
  console.log(`✓ Image loaded (${Math.round(imageBase64.length / 1024)}KB base64)\n`);

  console.log('Step 2: Analyzing with Gemini...');
  const description = await analyzeWithGemini(imageBase64);
  console.log(`✓ Description: "${description}"\n`);

  // Save raw FLUX outputs per step count (reuse across threshold variants)
  const rawBySteps: Record<number, Buffer> = {};
  const uniqueSteps = [...new Set(CONFIGS.map(c => c.steps))];

  console.log('Step 3: Generating FLUX images...');
  for (let i = 0; i < uniqueSteps.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 3000));
    const steps = uniqueSteps[i];
    process.stdout.write(`  [schnell steps=${steps}] generating... `);
    const start = Date.now();
    try {
      rawBySteps[steps] = await generateWithFlux(description, steps);
      console.log(`✓ ${((Date.now() - start) / 1000).toFixed(1)}s`);
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : String(err)}`);
      await new Promise(r => setTimeout(r, 4000));
    }
  }

  console.log('\nStep 4: Applying thresholds...');
  for (const cfg of CONFIGS) {
    const raw = rawBySteps[cfg.steps];
    if (!raw) { console.log(`  [steps${cfg.steps}_t${cfg.threshold}] skipped (FLUX failed)`); continue; }
    const label = `steps${cfg.steps}_threshold${cfg.threshold}`;
    const outPath = resolve(outDir, `${label}.png`);
    const processed = await postProcess(raw, cfg.threshold);
    writeFileSync(outPath, processed);
    console.log(`  ✓ ${label} → ${outPath}`);
  }

  console.log(`\nDone! Open test-results/ to compare.`);
  console.log(`Description used: "${description}"`);
}

main().catch(console.error);
