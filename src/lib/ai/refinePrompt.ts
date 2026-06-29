/**
 * LLM prompt refinement for coloring pages.
 *
 * Turns messy/ambiguous user input (e.g. "my dog at the beach being silly")
 * into a single, clean, single-subject scene description tuned for line-art
 * generation. This is what kills "unexpected images" — the model no longer has
 * to interpret vague input, and we guarantee exactly one clear subject.
 *
 * Uses Gemini Flash (cheap + fast). On ANY failure it falls back to the raw
 * input, so generation never breaks because of this step.
 */

const GEMINI_MODEL = 'gemini-2.5-flash';
const REFINE_TIMEOUT_MS = 8000;

const SYSTEM_INSTRUCTION = `You clean up a child's coloring-page idea into ONE short, concrete visual description for an AI image generator.

MOST IMPORTANT RULE: Keep the user's ACTUAL subject. Never swap it for something else. "iphone" stays a phone, "rocket" stays a rocket, "pizza" stays a pizza. You clarify and add a little scene — you do NOT reinterpret what they asked for.

Other rules:
- ONE main subject only. It can be an animal, a person/character, an object, a vehicle, food — whatever the user named. Never two subjects.
- Keep it simple and concrete. Add at most one friendly action or setting.
- Cute, friendly, G-rated for ages 3-10.
- Show the whole subject in view. For animals/people use normal correct anatomy (4 legs for animals, 2 arms/2 legs for people).
- 12-20 words max. No lists, no quotes, no style words like "line art" (that is added later).
- Never mention colors or darkness (e.g. avoid "red", "black", "dark") — a filled/colored area becomes a solid black blob that can't be colored in.
- Only invent an interpretation if the input is empty or pure nonsense; otherwise stay faithful to the exact thing they typed.

Respond with ONLY the rewritten description, nothing else.`;

/**
 * Refine a core subject phrase via Gemini. Returns a cleaned single-subject
 * description, or the original input on any error/timeout.
 */
export async function refineColoringSubject(rawSubject: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const input = rawSubject.trim();

  if (!apiKey || input.length === 0) {
    return input;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REFINE_TIMEOUT_MS);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ parts: [{ text: `Idea: ${input}` }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 100,
            // gemini-2.5-flash is a thinking model; disable thinking so the
            // budget goes to the (short) answer and latency stays low.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`[refinePrompt] Gemini error ${response.status}, using raw input`);
      return input;
    }

    const data = await response.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return input;
    }

    // Clean up: single line, strip quotes/trailing punctuation noise.
    const refined = text
      .replace(/[\r\n]+/g, ' ')
      .replace(/^["'\s]+|["'\s]+$/g, '')
      .trim();

    // Sanity guard: if the model returned something empty or absurdly long,
    // fall back to the original.
    if (refined.length < 3 || refined.length > 200) {
      return input;
    }

    console.log(`[refinePrompt] "${input}" -> "${refined}"`);
    return refined;
  } catch {
    console.log('[refinePrompt] Refinement failed/timed out, using raw input');
    return input;
  }
}
