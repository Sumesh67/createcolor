/**
 * Coloring Page Generation Module
 * Uses Together AI with DreamShaper v8 + Sharp post-processing
 */

import { generateColoringPage as generateWithDreamShaper } from '@/services/image-service';
import { processForWebDisplay } from '@/lib/image/process-coloring-page';

interface GenerationResult {
  imageUrl: string;
  revisedPrompt?: string;
  processed?: boolean;
  isFallback?: boolean;
}

// SVG fallback templates
const SVG_TEMPLATES: Record<string, string> = {
  unicorn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><path fill="none" stroke="black" stroke-width="3" d="M200 80 L220 40 L210 80 M150 120 C100 120 70 180 80 240 C90 300 140 340 200 340 C260 340 310 300 320 240 C330 180 300 120 250 120 C230 120 215 130 200 150 C185 130 170 120 150 120 Z M120 200 A10 10 0 1 1 140 200 A10 10 0 1 1 120 200 M170 250 Q200 280 230 250 M300 260 Q340 280 350 320 M80 260 Q60 300 40 320 M100 320 L80 380 M140 340 L130 380 M260 340 L270 380 M300 320 L320 380"/></svg>`,
  dinosaur: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><path fill="none" stroke="black" stroke-width="3" d="M100 200 C80 180 80 140 120 120 C160 100 200 120 220 150 L280 130 C300 125 320 140 320 160 L320 200 C340 200 360 220 360 250 C360 280 340 300 310 300 L290 300 L290 350 L260 350 L260 300 L200 300 L200 350 L170 350 L170 300 L120 300 C80 300 60 260 80 230 C60 220 60 200 80 190 L100 200 Z M290 160 A8 8 0 1 1 306 160 A8 8 0 1 1 290 160 M100 140 L80 120 M120 130 L110 100 M140 125 L140 95"/></svg>`,
  cat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="220" rx="100" ry="80"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="140" rx="70" ry="60"/><path fill="none" stroke="black" stroke-width="3" d="M130 100 L145 60 L160 100 M240 100 L255 60 L270 100"/><circle fill="none" stroke="black" stroke-width="3" cx="170" cy="130" r="12"/><circle fill="none" stroke="black" stroke-width="3" cx="230" cy="130" r="12"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="160" rx="8" ry="5"/><path fill="none" stroke="black" stroke-width="2" d="M100 140 L60 130 M100 150 L60 150 M100 160 L60 170 M300 140 L340 130 M300 150 L340 150 M300 160 L340 170"/><path fill="none" stroke="black" stroke-width="3" d="M300 250 Q350 280 340 340"/></svg>`,
  robot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><rect fill="none" stroke="black" stroke-width="3" x="120" y="80" width="160" height="120" rx="20"/><rect fill="none" stroke="black" stroke-width="3" x="100" y="200" width="200" height="140" rx="10"/><circle fill="none" stroke="black" stroke-width="3" cx="160" cy="130" r="20"/><circle fill="none" stroke="black" stroke-width="3" cx="240" cy="130" r="20"/><rect fill="none" stroke="black" stroke-width="3" x="170" y="160" width="60" height="20" rx="5"/><line stroke="black" stroke-width="3" x1="200" y1="60" x2="200" y2="80"/><circle fill="none" stroke="black" stroke-width="3" cx="200" cy="50" r="10"/></svg>`,
  princess: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="100" rx="50" ry="55"/><path fill="none" stroke="black" stroke-width="3" d="M150 80 Q130 40 160 30 L180 50 L200 20 L220 50 L240 30 Q270 40 250 80"/><path fill="none" stroke="black" stroke-width="3" d="M150 130 Q100 180 100 250 L140 380 L260 380 L300 250 Q300 180 250 130"/></svg>`,
  dragon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><path fill="none" stroke="black" stroke-width="3" d="M100 200 C60 180 60 140 100 120 C140 100 180 120 200 160 L260 140 C290 130 320 150 320 180 L300 200 L340 180 C370 170 390 200 380 230 C370 260 340 270 310 260 L280 250 C300 300 280 350 230 360 C180 370 140 340 150 290 L100 300 C60 310 30 280 40 240 C50 200 80 190 100 200 Z"/></svg>`,
  dog: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="white" width="400" height="400"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="160" rx="70" ry="60"/><path fill="none" stroke="black" stroke-width="3" d="M130 130 Q90 80 100 120 Q100 150 130 160"/><path fill="none" stroke="black" stroke-width="3" d="M270 130 Q310 80 300 120 Q300 150 270 160"/><ellipse fill="none" stroke="black" stroke-width="3" cx="200" cy="280" rx="90" ry="80"/></svg>`,
};

/**
 * Main coloring page generation function
 * Tries Together AI (DreamShaper v8) first, with Sharp post-processing
 * Falls back to Pollinations, then SVG templates
 */
export async function generateColoringPage(prompt: string): Promise<GenerationResult> {
  // Try Together AI with DreamShaper v8
  const aiResult = await generateWithDreamShaper(prompt);

  if (aiResult.success && aiResult.base64) {
    console.log('[generateColoringPage] Generated with FLUX.1-dev');

    try {
      // Apply Sharp post-processing for perfect black/white
      const processedBuffer = await processForWebDisplay(
        Buffer.from(aiResult.base64, 'base64')
      );

      const processedBase64 = processedBuffer.toString('base64');
      console.log('[generateColoringPage] Post-processing complete');

      return {
        imageUrl: `data:image/png;base64,${processedBase64}`,
        revisedPrompt: prompt,
        processed: true,
      };
    } catch (processError) {
      console.error('[generateColoringPage] Post-processing failed, using raw image');
      // Return raw image if processing fails
      return {
        imageUrl: aiResult.imageUrl!,
        revisedPrompt: prompt,
        processed: false,
      };
    }
  }

  if (aiResult.success && aiResult.imageUrl) {
    console.log('[generateColoringPage] Generated with DreamShaper (URL response)');
    return {
      imageUrl: aiResult.imageUrl,
      revisedPrompt: prompt,
      processed: false,
    };
  }

  // Try Pollinations as backup
  const pollinationsImage = await generateWithPollinations(prompt);
  if (pollinationsImage) {
    console.log('[generateColoringPage] Generated with Pollinations');
    return {
      imageUrl: pollinationsImage,
      revisedPrompt: prompt,
      processed: false,
      isFallback: true,
    };
  }

  // Fallback to SVG templates
  console.log('[generateColoringPage] Falling back to SVG templates');
  return {
    imageUrl: getSvgFallback(prompt),
    revisedPrompt: prompt,
    processed: false,
    isFallback: true,
  };
}

/**
 * Pollinations.ai fallback (free, no API key)
 */
async function generateWithPollinations(prompt: string): Promise<string | null> {
  // Extract core subject
  const corePrompt = extractCorePrompt(prompt);
  const simplePrompt = `${corePrompt}, coloring book, black outlines, white background`;

  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplePrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

  console.log(`[Pollinations] Trying: ${simplePrompt.substring(0, 50)}...`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: { 'Accept': 'image/*' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const imageBuffer = await response.arrayBuffer();
      if (imageBuffer.byteLength > 1000) {
        const base64 = Buffer.from(imageBuffer).toString('base64');
        console.log(`[Pollinations] Success! ${imageBuffer.byteLength} bytes`);
        return `data:image/jpeg;base64,${base64}`;
      }
    }
  } catch (error) {
    console.log('[Pollinations] Failed');
  }

  return null;
}

/**
 * Extract core subject from wrapped prompt
 */
function extractCorePrompt(prompt: string): string {
  const match = prompt.match(/cute and friendly,\s*(.+?),\s*children's coloring page/i);
  if (match) return match[1].trim();
  return prompt.substring(0, 150);
}

/**
 * Get SVG fallback based on prompt keywords
 */
export function getSvgFallback(prompt: string): string {
  const promptLower = prompt.toLowerCase();

  let svgType = 'cat'; // default

  if (promptLower.includes('unicorn')) svgType = 'unicorn';
  else if (promptLower.includes('dinosaur') || promptLower.includes('dino')) svgType = 'dinosaur';
  else if (promptLower.includes('robot')) svgType = 'robot';
  else if (promptLower.includes('princess')) svgType = 'princess';
  else if (promptLower.includes('dragon')) svgType = 'dragon';
  else if (promptLower.includes('dog')) svgType = 'dog';
  else if (promptLower.includes('cat')) svgType = 'cat';

  const svg = SVG_TEMPLATES[svgType] || SVG_TEMPLATES.cat;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Generate multiple coloring pages (for party packs)
 */
export async function generateMultipleColoringPages(
  prompts: string[],
  batchSize: number = 2
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];

  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchPromises = batch.map((prompt) => generateColoringPage(prompt));
    const batchResults = await Promise.allSettled(batchPromises);

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }

    // Delay between batches to avoid rate limits
    if (i + batchSize < prompts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// Theme → specific individual characters to draw one per page
const THEME_CHARACTERS: Record<string, string[]> = {
  'jungle animals':    ['lion', 'elephant', 'monkey', 'giraffe', 'zebra', 'parrot', 'hippo', 'tiger', 'lemur', 'toucan', 'crocodile', 'gorilla'],
  'dinosaurs':         ['T-Rex dinosaur', 'Triceratops', 'Brachiosaurus', 'Stegosaurus', 'Pterodactyl', 'Ankylosaurus', 'baby Raptor', 'Diplodocus', 'Spinosaurus', 'Parasaurolophus'],
  'unicorns':          ['pink unicorn', 'rainbow unicorn', 'baby unicorn', 'golden unicorn', 'sparkly unicorn', 'winged unicorn', 'unicorn with flowers', 'unicorn on a cloud'],
  'under the sea':     ['friendly shark', 'clownfish', 'sea turtle', 'octopus', 'dolphin', 'starfish', 'crab', 'seahorse', 'jellyfish', 'blue whale', 'mermaid'],
  'farm animals':      ['pig', 'cow', 'horse', 'sheep', 'chicken', 'duck', 'donkey', 'goat', 'rabbit', 'rooster', 'puppy', 'kitten'],
  'outer space':       ['cute astronaut', 'friendly alien', 'rocket ship', 'space robot', 'moon rover', 'baby alien', 'comet', 'space puppy in a helmet'],
  'princess':          ['princess', 'fairy godmother', 'friendly dragon', 'unicorn', 'castle knight', 'fairy', 'mermaid princess', 'elf princess'],
  'superheroes':       ['superhero flying', 'hero with cape', 'girl superhero', 'robot hero', 'animal superhero'],
  'dragons':           ['baby dragon', 'friendly dragon', 'dragon with wings', 'dragon breathing bubbles', 'sleeping dragon', 'dragon family'],
  'mermaids':          ['mermaid', 'mermaid with fish', 'mermaid on a rock', 'baby mermaid', 'mermaid and turtle', 'mermaid with seashells'],
  'robots':            ['friendly robot', 'dancing robot', 'tiny robot', 'robot puppy', 'robot with balloons', 'flying robot'],
  'cats':              ['kitten', 'fluffy cat', 'cat with bow', 'sleeping cat', 'cat playing', 'mama cat and kittens'],
  'dogs':              ['puppy', 'fluffy dog', 'dog with bone', 'dog chasing ball', 'dog in a hat', 'dog family'],
};

// Safe actions — NO text-triggering phrases, NO "making friends" (causes two animals to merge)
const SAFE_ACTIONS = [
  'playing happily',
  'having an adventure',
  'exploring',
  'dancing joyfully',
  'flying through the sky',
  'swimming',
  'running through a meadow',
  'sitting on a rainbow',
  'having a picnic',
  'discovering treasure',
  'riding a bicycle',
  'playing music',
  'stargazing',
  'jumping on clouds',
  'wearing a party hat',
  'playing with balloons',
  'blowing bubbles',
  'eating cake',
  'bouncing happily',
  'smiling and waving',
];

const PARTY_SETTINGS = [
  'in a colorful garden',
  'at a magical castle',
  'on a sunny beach',
  'in a cozy treehouse',
  'on a rainbow',
  'in a candy land',
  'in a fairy village',
  'at a carnival',
  'in a snow wonderland',
  'at a playground',
  'in a jungle',
  'on the moon',
  'in an enchanted forest',
  'by a waterfall',
  'in a flower field',
];

function getCharactersForTheme(theme: string): string[] {
  const key = theme.toLowerCase().trim();
  // Exact match
  if (THEME_CHARACTERS[key]) return THEME_CHARACTERS[key];
  // Partial match
  for (const [k, v] of Object.entries(THEME_CHARACTERS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Fallback: use theme name as the character
  return Array(12).fill(null).map(() => theme);
}

/**
 * Generate variation prompts for party packs — one specific character per page
 */
export async function generateVariationPrompts(
  theme: string,
  count: number
): Promise<string[]> {
  const characters = getCharactersForTheme(theme);

  const prompts: string[] = [];
  for (let i = 0; i < count; i++) {
    const character = characters[i % characters.length];
    const action = SAFE_ACTIONS[i % SAFE_ACTIONS.length];
    const setting = PARTY_SETTINGS[i % PARTY_SETTINGS.length];
    prompts.push(`cute ${character} ${action} ${setting}`);
  }

  // Shuffle for variety
  for (let i = prompts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [prompts[i], prompts[j]] = [prompts[j], prompts[i]];
  }

  return prompts.slice(0, count);
}
