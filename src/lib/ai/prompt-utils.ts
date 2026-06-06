/**
 * Prompt Engineering Utilities for DreamShaper Coloring Pages
 * Transforms simple user ideas into professional AI prompts for line art
 */

// Prefix for professional coloring book style
const COLORING_BOOK_PREFIX =
  'Professional children coloring book page, simple clean line art,';

// Suffix to enforce black and white outline style with full composition and intact creature anatomy
const COLORING_BOOK_SUFFIX =
  'thick bold black outlines, pure white background, no coloring, no shading, no gray, high contrast, vector style, G-rated, safe for kids, no text, no words, ' +
  'only one single animal, one character only, no other animals or characters in the scene, ' +
  'single complete creature with all body parts fully connected, head attached to neck and body, all limbs joined to torso, no floating or detached body parts, ' +
  'correct anatomy, one head per character, full body visible from head to toe, complete figure, ' +
  'centered composition, entire subject fits within frame, wide shot, zoomed out enough to show whole body, ample white space around subject';

// Strict negative prompt to force black and white outlines, prevent cropping, and prevent broken/merged anatomy
export const DREAMSHAPER_NEGATIVE_PROMPT =
  'color, shading, gradients, shadows, 3d, photorealistic, gray, blurry, messy lines, text, words, letters, writing, watermark, nudity, violence, scary, dark, complex backgrounds, realistic, photograph, painting, colored, fills, halftone, ' +
  'two animals, multiple animals, second animal, another animal, pair of animals, group of animals, merged animals, fused animals, overlapping animals, animals touching, ' +
  'extra heads, duplicate heads, two heads, multiple heads, extra limbs, extra arms, extra legs, deformed, malformed, disfigured, bad anatomy, fused bodies, merged characters, conjoined, ' +
  'floating head, detached head, severed head, disconnected body parts, floating limbs, isolated body parts, broken anatomy, split body, ' +
  'cropped, cut off, partial figure, incomplete figure, out of frame, clipped, body parts missing, figure extends beyond border, close-up, extreme close-up, portrait crop, zoomed in too much';

/**
 * Wraps user input into a professional DreamShaper prompt for coloring pages
 * @param userInput - The simple idea from the user (e.g., "a unicorn playing soccer")
 * @returns Formatted prompt optimized for DreamShaper line art generation
 */
export function prepareDreamShaperPrompt(userInput: string): string {
  // Clean and normalize the input
  const cleanedInput = userInput
    .trim()
    .toLowerCase()
    .replace(/[^\w\s,'-]/g, '') // Remove special characters except common ones
    .replace(/\s+/g, ' '); // Normalize whitespace

  // Build the full prompt
  return `${COLORING_BOOK_PREFIX} ${cleanedInput}, ${COLORING_BOOK_SUFFIX}`;
}

/**
 * Extract core subject from a safety-wrapped prompt
 * Used when prompt has already been wrapped by promptBuilder.ts
 */
export function extractCoreSubject(prompt: string): string {
  // Try to extract from "cute and friendly, SUBJECT, children's coloring page"
  const match = prompt.match(/cute and friendly,\s*(.+?),\s*children's coloring page/i);
  if (match) {
    return match[1].trim();
  }

  // Try to extract from "A SUBJECT" pattern
  const subjectMatch = prompt.match(/^a\s+(.+?)(?:,|$)/i);
  if (subjectMatch) {
    return subjectMatch[1].trim();
  }

  // Fallback: return as-is but truncate if too long
  return prompt.substring(0, 150).trim();
}

/**
 * Validates that a prompt is safe for children
 * Basic check - more thorough checks happen elsewhere
 */
export function isPromptSafe(prompt: string): boolean {
  const unsafePatterns = [
    /\b(nude|naked|nsfw|xxx|porn|sex|violence|blood|gore|kill|death|murder|weapon|gun|knife)\b/i,
  ];

  return !unsafePatterns.some(pattern => pattern.test(prompt));
}
