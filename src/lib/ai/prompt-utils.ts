/**
 * Prompt Engineering Utilities for DreamShaper Coloring Pages
 * Transforms simple user ideas into professional AI prompts for line art
 */

// Keep the prompt TIGHT. FLUX has strong prompt adherence, so a short, concrete
// prompt with the subject up front beats a long wall of constraints (which
// dilutes attention and causes off-subject "unexpected" images). The most
// important single-subject + anatomy guidance is stated once, positively.
const COLORING_BOOK_PREFIX =
  'Black and white coloring book line art of';

const COLORING_BOOK_SUFFIX =
  'one single subject, full body, simple cute cartoon, bold clean black outlines, ' +
  'no shading, no color, no gray, plain white background, centered, lots of open space to color';

// Focused negative prompt. FLUX.1-schnell ignores negatives entirely, but
// FLUX.1-dev (with guidance) respects them — so we keep the highest-value
// terms only. Short and targeted works better than an exhaustive list.
export const DREAMSHAPER_NEGATIVE_PROMPT =
  'color, shading, gradient, gray, photo, realistic, 3d, text, watermark, ' +
  'two animals, multiple characters, extra limbs, extra heads, extra legs, extra arms, ' +
  'deformed, bad anatomy, fused bodies, merged, cropped, cut off, close-up';

/**
 * Wraps a (preferably already-refined) subject into a tight FLUX line-art prompt.
 * @param userInput - The clean subject from the user / LLM refinement
 */
export function prepareDreamShaperPrompt(userInput: string): string {
  const cleanedInput = userInput
    .trim()
    .toLowerCase()
    .replace(/[^\w\s,'-]/g, '') // Remove special characters except common ones
    .replace(/\s+/g, ' '); // Normalize whitespace

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
