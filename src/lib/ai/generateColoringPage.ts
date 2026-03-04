import { sleep } from "@/lib/utils";

interface GenerationResult {
  imageUrl: string;
  revisedPrompt?: string;
}

const COLORING_PAGE_SUFFIX = ", children's coloring page, clean black outlines only, pure white background, bold thick lines, no shading, no gradients, no color fills, simple cartoon style, large areas for coloring";

/**
 * Generate image using Hugging Face Inference Providers API
 * Requires a token with "Inference Providers" permission
 */
async function generateWithHuggingFace(prompt: string): Promise<string | null> {
  const apiToken = process.env.HUGGINGFACE_API_TOKEN;

  if (!apiToken) {
    console.log('[HuggingFace] No API token configured');
    return null;
  }

  const fullPrompt = prompt + COLORING_PAGE_SUFFIX;

  // Models available via Inference Providers
  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
  ];

  for (const model of models) {
    try {
      console.log(`[HuggingFace] Trying model: ${model}`);

      // Use the new router.huggingface.co endpoint for Inference Providers
      const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
              negative_prompt: 'color, colored, shading, gradient, realistic, photo, 3d, filled',
              num_inference_steps: 4,
            },
          }),
        }
      );

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const contentType = response.headers.get('content-type') || 'image/png';
        console.log(`[HuggingFace] Success with model: ${model}`);
        return `data:${contentType};base64,${base64}`;
      }

      const errorText = await response.text();
      console.log(`[HuggingFace] API error: ${response.status} ${errorText.substring(0, 200)}`);

      // If model is loading (503), wait and retry once
      if (response.status === 503) {
        try {
          const errorData = JSON.parse(errorText);
          const waitTime = Math.min(errorData.estimated_time || 20, 30);
          console.log(`[HuggingFace] Model loading, waiting ${waitTime}s...`);
          await sleep(waitTime * 1000);

          const retryResponse = await fetch(
            `https://router.huggingface.co/hf-inference/models/${model}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inputs: fullPrompt,
                parameters: {
                  negative_prompt: 'color, colored, shading, gradient, realistic, photo, 3d, filled',
                  num_inference_steps: 4,
                },
              }),
            }
          );

          if (retryResponse.ok) {
            const imageBuffer = await retryResponse.arrayBuffer();
            const base64 = Buffer.from(imageBuffer).toString('base64');
            const contentType = retryResponse.headers.get('content-type') || 'image/png';
            console.log(`[HuggingFace] Success with model: ${model} (after retry)`);
            return `data:${contentType};base64,${base64}`;
          }
        } catch {
          // Continue to next model
        }
      }
    } catch (error) {
      console.error(`[HuggingFace] Error with model ${model}:`, error);
    }
  }

  console.log('[HuggingFace] All models failed');
  return null;
}

// Simple SVG coloring page templates (fallback)
function generateSVG(type: string): string {
  const svgs: Record<string, string> = {
    unicorn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><path fill="none" stroke="black" stroke-width="3" d="M200 80 L220 40 L210 80 M150 120 C100 120 70 180 80 240 C90 300 140 340 200 340 C260 340 310 300 320 240 C330 180 300 120 250 120 C230 120 215 130 200 150 C185 130 170 120 150 120 Z M120 200 A10 10 0 1 1 140 200 A10 10 0 1 1 120 200 M170 250 Q200 280 230 250 M300 260 Q340 280 350 320 M80 260 Q60 300 40 320 M100 320 L80 380 M140 340 L130 380 M260 340 L270 380 M300 320 L320 380"/></svg>`,
    dinosaur: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><path fill="none" stroke="black" stroke-width="3" d="M100 200 C80 180 80 140 120 120 C160 100 200 120 220 150 L280 130 C300 125 320 140 320 160 L320 200 C340 200 360 220 360 250 C360 280 340 300 310 300 L290 300 L290 350 L260 350 L260 300 L200 300 L200 350 L170 350 L170 300 L120 300 C80 300 60 260 80 230 C60 220 60 200 80 190 L100 200 Z M290 160 A8 8 0 1 1 306 160 A8 8 0 1 1 290 160 M100 140 L80 120 M120 130 L110 100 M140 125 L140 95"/></svg>`,
    cat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="220" rx="100" ry="80"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="140" rx="70" ry="60"/><path fill="none" stroke="black" stroke-width="3" d="M130 100 L145 60 L160 100 M240 100 L255 60 L270 100"/><circle fill="none" stroke="black" stroke-width="3" cx="170" cy="130" r="12"/><circle fill="none" stroke="black" stroke-width="3" cx="230" cy="130" r="12"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="160" rx="8" ry="5"/><path fill="none" stroke="black" stroke-width="2" d="M100 140 L60 130 M100 150 L60 150 M100 160 L60 170 M300 140 L340 130 M300 150 L340 150 M300 160 L340 170"/><path fill="none" stroke="black" stroke-width="3" d="M300 250 Q350 280 340 340"/></svg>`,
    robot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><rect fill="none" stroke="black" stroke-width="3" x="120" y="80" width="160" height="120" rx="20"/><rect fill="none" stroke="black" stroke-width="3" x="100" y="200" width="200" height="140" rx="10"/><circle fill="none" stroke="black" stroke-width="3" cx="160" cy="130" r="20"/><circle fill="none" stroke="black" stroke-width="3" cx="240" cy="130" r="20"/><rect fill="none" stroke="black" stroke-width="3" x="170" y="160" width="60" height="20" rx="5"/><line stroke="black" stroke-width="3" x1="200" y1="60" x2="200" y2="80"/><circle fill="none" stroke="black" stroke-width="3" cx="200" cy="50" r="10"/><rect fill="none" stroke="black" stroke-width="3" x="60" y="220" width="40" height="80" rx="10"/><rect fill="none" stroke="black" stroke-width="3" x="300" y="220" width="40" height="80" rx="10"/><rect fill="none" stroke="black" stroke-width="3" x="140" y="340" width="40" height="40" rx="5"/><rect fill="none" stroke="black" stroke-width="3" x="220" y="340" width="40" height="40" rx="5"/><rect fill="none" stroke="black" stroke-width="2" x="130" y="230" width="60" height="40" rx="5"/><rect fill="none" stroke="black" stroke-width="2" x="210" y="230" width="60" height="40" rx="5"/></svg>`,
    princess: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="100" rx="50" ry="55"/><path fill="none" stroke="black" stroke-width="3" d="M150 80 Q130 40 160 30 L180 50 L200 20 L220 50 L240 30 Q270 40 250 80"/><path fill="none" stroke="black" stroke-width="3" d="M150 130 Q100 180 100 250 L140 380 L260 380 L300 250 Q300 180 250 130"/><path fill="none" stroke="black" stroke-width="2" d="M160 200 Q200 220 240 200"/><path fill="none" stroke="black" stroke-width="2" d="M150 280 L140 380 M250 280 L260 380"/><circle fill="none" stroke="black" stroke-width="2" cx="180" cy="90" r="6"/><circle fill="none" stroke="black" stroke-width="2" cx="220" cy="90" r="6"/><path fill="none" stroke="black" stroke-width="2" d="M190 110 Q200 120 210 110"/><path fill="none" stroke="black" stroke-width="3" d="M100 200 L60 180 M300 200 L340 180"/></svg>`,
    dragon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><path fill="none" stroke="black" stroke-width="3" d="M100 200 C60 180 60 140 100 120 C140 100 180 120 200 160 L260 140 C290 130 320 150 320 180 L300 200 L340 180 C370 170 390 200 380 230 C370 260 340 270 310 260 L280 250 C300 300 280 350 230 360 C180 370 140 340 150 290 L100 300 C60 310 30 280 40 240 C50 200 80 190 100 200 Z M290 180 A8 8 0 1 1 306 180 A8 8 0 1 1 290 180"/><path fill="none" stroke="black" stroke-width="2" d="M200 200 L180 240 L200 220 L220 250 L210 210 L240 240 L220 200"/></svg>`,
    mermaid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="80" rx="40" ry="45"/><path fill="none" stroke="black" stroke-width="3" d="M160 110 Q140 140 150 200 L130 200 Q100 200 100 240 Q100 280 140 300 L150 380 Q200 400 250 380 L260 300 Q300 280 300 240 Q300 200 270 200 L250 200 Q260 140 240 110"/><path fill="none" stroke="black" stroke-width="3" d="M150 380 Q120 400 100 380 M250 380 Q280 400 300 380"/><path fill="none" stroke="black" stroke-width="2" d="M140 60 Q100 40 80 60 M260 60 Q300 40 320 60"/><circle fill="none" stroke="black" stroke-width="2" cx="180" cy="75" r="5"/><circle fill="none" stroke="black" stroke-width="2" cx="220" cy="75" r="5"/><path fill="none" stroke="black" stroke-width="2" d="M190 95 Q200 100 210 95"/><path fill="none" stroke="black" stroke-width="2" d="M160 260 Q200 300 240 260"/></svg>`,
    lion: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><circle fill="none" stroke="black" stroke-width="3" cx="200" cy="180" r="100"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="200" rx="60" ry="50"/><path fill="none" stroke="black" stroke-width="2" d="M200 80 L200 60 M240 90 L260 70 M280 120 L310 100 M300 160 L330 150 M300 200 L330 210 M280 240 L300 270 M240 270 L250 300 M200 280 L200 310 M160 270 L150 300 M120 240 L100 270 M100 200 L70 210 M100 160 L70 150 M120 120 L90 100 M160 90 L140 70"/><circle fill="none" stroke="black" stroke-width="2" cx="170" cy="180" r="10"/><circle fill="none" stroke="black" stroke-width="2" cx="230" cy="180" r="10"/><ellipse fill="none" stroke="black" stroke-width="2" cx="200" cy="210" rx="15" ry="10"/><path fill="none" stroke="black" stroke-width="2" d="M170 240 Q200 260 230 240"/></svg>`,
    butterfly: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="200" rx="15" ry="80"/><path fill="none" stroke="black" stroke-width="3" d="M185 140 Q80 80 60 160 Q40 240 120 280 Q160 300 185 260"/><path fill="none" stroke="black" stroke-width="3" d="M215 140 Q320 80 340 160 Q360 240 280 280 Q240 300 215 260"/><circle fill="none" stroke="black" stroke-width="2" cx="120" cy="160" r="25"/><circle fill="none" stroke="black" stroke-width="2" cx="280" cy="160" r="25"/><circle fill="none" stroke="black" stroke-width="2" cx="100" cy="230" r="15"/><circle fill="none" stroke="black" stroke-width="2" cx="300" cy="230" r="15"/><path fill="none" stroke="black" stroke-width="2" d="M190 120 Q170 80 150 60 M210 120 Q230 80 250 60"/><circle fill="none" stroke="black" stroke-width="2" cx="150" cy="55" r="5"/><circle fill="none" stroke="black" stroke-width="2" cx="250" cy="55" r="5"/></svg>`,
    bear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="180" rx="80" ry="70"/><circle fill="none" stroke="black" stroke-width="3" cx="130" cy="120" r="30"/><circle fill="none" stroke="black" stroke-width="3" cx="270" cy="120" r="30"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="300" rx="100" ry="70"/><circle fill="none" stroke="black" stroke-width="2" cx="165" cy="165" r="12"/><circle fill="none" stroke="black" stroke-width="2" cx="235" cy="165" r="12"/><ellipse fill="none" stroke="black" stroke-width="2" cx="200" cy="200" rx="20" ry="15"/><path fill="none" stroke="black" stroke-width="2" d="M180 220 Q200 240 220 220"/><ellipse fill="none" stroke="black" stroke-width="3" cx="110" cy="340" rx="25" ry="30"/><ellipse fill="none" stroke="black" stroke-width="3" cx="290" cy="340" rx="25" ry="30"/></svg>`,
    dog: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="160" rx="70" ry="60"/><path fill="none" stroke="black" stroke-width="3" d="M130 130 Q90 80 100 120 Q100 150 130 160"/><path fill="none" stroke="black" stroke-width="3" d="M270 130 Q310 80 300 120 Q300 150 270 160"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="280" rx="90" ry="80"/><circle fill="none" stroke="black" stroke-width="2" cx="170" cy="145" r="10"/><circle fill="none" stroke="black" stroke-width="2" cx="230" cy="145" r="10"/><ellipse fill="none" stroke="black" stroke-width="2" cx="200" cy="180" rx="15" ry="12"/><path fill="none" stroke="black" stroke-width="2" d="M170 200 Q200 220 230 200"/><ellipse fill="none" stroke="black" stroke-width="3" cx="120" cy="350" rx="20" ry="30"/><ellipse fill="none" stroke="black" stroke-width="3" cx="280" cy="350" rx="20" ry="30"/><path fill="none" stroke="black" stroke-width="3" d="M290 280 Q350 300 340 350"/></svg>`,
    astronaut: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><circle fill="none" stroke="black" stroke-width="3" cx="200" cy="100" r="60"/><circle fill="none" stroke="black" stroke-width="2" cx="200" cy="100" r="45"/><rect fill="none" stroke="black" stroke-width="3" x="130" y="160" width="140" height="160" rx="20"/><rect fill="none" stroke="black" stroke-width="3" x="70" y="180" width="60" height="100" rx="15"/><rect fill="none" stroke="black" stroke-width="3" x="270" y="180" width="60" height="100" rx="15"/><rect fill="none" stroke="black" stroke-width="3" x="150" y="320" width="40" height="60" rx="10"/><rect fill="none" stroke="black" stroke-width="3" x="210" y="320" width="40" height="60" rx="10"/><rect fill="none" stroke="black" stroke-width="2" x="160" y="200" width="80" height="60" rx="5"/><circle fill="none" stroke="black" stroke-width="2" cx="180" cy="90" r="8"/><circle fill="none" stroke="black" stroke-width="2" cx="220" cy="90" r="8"/><path fill="none" stroke="black" stroke-width="2" d="M185 115 Q200 125 215 115"/></svg>`,
  };

  return svgs[type] || svgs.cat;
}

/**
 * Generate a coloring page
 * Tries Hugging Face API first, falls back to SVG templates
 */
export async function generateColoringPage(prompt: string): Promise<GenerationResult> {
  // Try Hugging Face first
  const hfImage = await generateWithHuggingFace(prompt);

  if (hfImage) {
    console.log('[generateColoringPage] Generated with Hugging Face');
    return {
      imageUrl: hfImage,
      revisedPrompt: prompt,
    };
  }

  // Fallback to SVG templates
  console.log('[generateColoringPage] Falling back to SVG templates');
  const svgUrl = getSvgFallback(prompt);

  return {
    imageUrl: svgUrl,
    revisedPrompt: prompt,
  };
}

/**
 * Get SVG fallback for a given prompt
 */
export function getSvgFallback(prompt: string): string {
  const promptLower = prompt.toLowerCase();

  // Match prompt to available SVG templates
  let svgType = 'cat'; // default

  if (promptLower.includes('unicorn')) svgType = 'unicorn';
  else if (promptLower.includes('dinosaur') || promptLower.includes('dino')) svgType = 'dinosaur';
  else if (promptLower.includes('robot')) svgType = 'robot';
  else if (promptLower.includes('princess')) svgType = 'princess';
  else if (promptLower.includes('dragon')) svgType = 'dragon';
  else if (promptLower.includes('mermaid')) svgType = 'mermaid';
  else if (promptLower.includes('lion')) svgType = 'lion';
  else if (promptLower.includes('butterfly')) svgType = 'butterfly';
  else if (promptLower.includes('bear')) svgType = 'bear';
  else if (promptLower.includes('dog')) svgType = 'dog';
  else if (promptLower.includes('astronaut')) svgType = 'astronaut';
  else if (promptLower.includes('cat')) svgType = 'cat';

  const svg = generateSVG(svgType);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export async function generateMultipleColoringPages(
  prompts: string[],
  batchSize: number = 3
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];

  // Process in batches to avoid rate limiting
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchPromises = batch.map((prompt) => generateColoringPage(prompt));

    const batchResults = await Promise.allSettled(batchPromises);

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        console.error("Failed to generate page:", result.reason);
      }
    }

    // Small delay between batches
    if (i + batchSize < prompts.length) {
      await sleep(500);
    }
  }

  return results;
}

/**
 * Generate variation prompts for party packs
 * Uses template-based generation (no API needed)
 */
export async function generateVariationPrompts(
  theme: string,
  count: number
): Promise<string[]> {
  // Template-based prompt variations (free, no API needed)
  const actions = [
    "playing happily",
    "having an adventure",
    "exploring",
    "dancing",
    "celebrating",
    "flying through the sky",
    "swimming in the ocean",
    "running through a meadow",
    "sitting on a rainbow",
    "making friends",
    "having a picnic",
    "building something fun",
    "discovering treasure",
    "reading a magical book",
    "riding a bicycle",
    "playing music",
    "painting a picture",
    "cooking delicious food",
    "stargazing at night",
    "jumping on clouds",
  ];

  const settings = [
    "in an enchanted forest",
    "at a magical castle",
    "on a sunny beach",
    "in outer space",
    "underwater in the ocean",
    "in a colorful garden",
    "on top of a mountain",
    "in a cozy treehouse",
    "at a birthday party",
    "in a candy land",
    "on a pirate ship",
    "in a fairy village",
    "at a carnival",
    "in a snow wonderland",
    "on a farm",
    "in a jungle",
    "at a playground",
    "in a bakery",
    "on the moon",
    "in a library",
  ];

  const prompts: string[] = [];
  const coloringPageSuffix = ", children's coloring page, clean black outlines only, pure white background, bold thick lines, no shading, no gradients, no color fills, simple friendly cartoon shapes, large open areas for coloring";

  for (let i = 0; i < count; i++) {
    const action = actions[i % actions.length];
    const setting = settings[i % settings.length];
    const prompt = `${theme} ${action} ${setting}${coloringPageSuffix}`;
    prompts.push(prompt);
  }

  // Shuffle for variety
  for (let i = prompts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [prompts[i], prompts[j]] = [prompts[j], prompts[i]];
  }

  return prompts.slice(0, count);
}
