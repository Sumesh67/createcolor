import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with v1 API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model name - use gemini-2.5-flash for best performance
const GEMINI_MODEL = 'gemini-2.5-flash';

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 2000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error as Error;
      const errorMessage = lastError?.message || '';
      const isRateLimit = errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes('quota');

      if (!isRateLimit || attempt === maxRetries) {
        throw error;
      }

      const delay = initialDelayMs * Math.pow(2, attempt);
      console.log(`[Gemini] Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

interface StoryPage {
  pageNumber: number;
  storyText: string;
  illustrationDescription: string;
}

interface StoryResponse {
  pages: StoryPage[];
}

// Fallback story template if Gemini fails
const FALLBACK_STORY: StoryResponse = {
  pages: [
    {
      pageNumber: 1,
      storyText: "Once upon a time, so bright and fair,\nOur heroes gathered without a care.",
      illustrationDescription: "Characters standing together in a sunny meadow, waving happily."
    },
    {
      pageNumber: 2,
      storyText: "They found a path that led the way,\nTo an adventure on this special day.",
      illustrationDescription: "Characters walking down a winding path through flowers."
    },
    {
      pageNumber: 3,
      storyText: "Together they climbed up so high,\nReaching for the bright blue sky.",
      illustrationDescription: "Characters climbing a gentle hill with clouds above."
    },
    {
      pageNumber: 4,
      storyText: "They laughed and played the whole day through,\nMaking memories, me and you.",
      illustrationDescription: "Characters playing and dancing together joyfully."
    },
    {
      pageNumber: 5,
      storyText: "As stars came out to say goodnight,\nThey hugged and held each other tight.",
      illustrationDescription: "Characters hugging under a starry sky with a crescent moon."
    }
  ]
};

/**
 * Analyze a photo using Gemini 1.5 Flash
 * Returns a concise description for coloring page generation
 * Cost estimate: ~$0.002 per call
 */
export async function analyzePhoto(imageBase64: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('[Gemini] Analyzing photo...');

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const prompt = `You are a professional children's coloring book art director.
Describe this photo in 25 words for an illustrator.
Focus on: subject, pose, clothing, expression, and key background elements.
Keep it G-rated and simple.`;

  const result = await withRetry(async () => {
    return model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
    ]);
  });

  const response = await result.response;
  const description = response.text().trim();

  console.log('[Gemini] Photo analysis:', description);
  console.log('[Gemini] Estimated cost: ~$0.002');

  return description;
}

/**
 * Write a children's story using Gemini 1.5 Flash
 * Returns a 5-page rhyming story with illustration descriptions
 * Cost estimate: ~$0.003 per call
 */
export async function writeStory(
  characters: string[],
  theme: string,
  customContext?: string
): Promise<StoryResponse> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Gemini] No API key, using fallback story');
    return FALLBACK_STORY;
  }

  console.log('[Gemini] Writing story for characters:', characters, 'theme:', theme);

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const contextBlock = customContext?.trim()
    ? `Special Parent Request: ${customContext.trim()}. You MUST weave this specific detail, lesson, or character into the story naturally.\n`
    : '';

  const prompt = `Write a 5-page rhyming children's story for ages 3-10.
Characters: ${characters.join(', ')}. Theme: ${theme}.
${contextBlock}Rules:
- Each page has exactly 2 rhyming sentences (AABB style).
- Each page has a visual scene description for a coloring page illustrator (max 25 words).
- Happy tone, simple vocabulary (Kindergarten sight words), G-rated.
Return ONLY valid JSON (no markdown, no code blocks):
{ "pages": [{ "pageNumber": 1, "storyText": "...", "illustrationDescription": "..." }] }`;

  try {
    const result = await withRetry(async () => model.generateContent(prompt));
    const response = await result.response;
    let text = response.text().trim();

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const storyData = JSON.parse(text) as StoryResponse;

    // Validate the response structure
    if (!storyData.pages || !Array.isArray(storyData.pages) || storyData.pages.length === 0) {
      throw new Error('Invalid story structure');
    }

    console.log('[Gemini] Story generated with', storyData.pages.length, 'pages');
    console.log('[Gemini] Estimated cost: ~$0.003');

    return storyData;
  } catch (error) {
    console.error('[Gemini] Story generation failed, using fallback:', error);
    return FALLBACK_STORY;
  }
}

/**
 * Analyze multiple character photos
 * Returns an array of descriptions
 */
export async function analyzeCharacters(
  characters: { label: string; imageBase64: string }[]
): Promise<{ label: string; description: string }[]> {
  console.log('[Gemini] Analyzing', characters.length, 'characters...');

  const results = await Promise.all(
    characters.map(async (char) => {
      try {
        const description = await analyzePhoto(char.imageBase64);
        return {
          label: char.label,
          description: `${char.label}: ${description}`,
        };
      } catch (error) {
        console.error(`[Gemini] Failed to analyze ${char.label}:`, error);
        return {
          label: char.label,
          description: `${char.label}: a friendly character with a warm smile`,
        };
      }
    })
  );

  return results;
}
