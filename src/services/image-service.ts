/**
 * Image Generation Service using Together AI with DreamShaper v8
 * Optimized for high-quality coloring page generation
 */

import {
  prepareDreamShaperPrompt,
  extractCoreSubject,
  DREAMSHAPER_NEGATIVE_PROMPT,
} from '@/lib/ai/prompt-utils';

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  base64?: string;
  error?: string;
}

// FLUX.1-schnell configuration for optimal coloring pages
const IMAGE_CONFIG = {
  model: 'black-forest-labs/FLUX.1-schnell',
  width: 1024,
  height: 1024,
  steps: 4, // FLUX.1-schnell is optimized for 4 steps
};

/**
 * Generates a coloring page using Together AI with DreamShaper v8
 * @param userPrompt - The user's idea (can be raw or pre-wrapped)
 * @returns Image generation response with base64 data or error
 */
export async function generateColoringPage(
  userPrompt: string
): Promise<ImageGenerationResponse> {
  const apiKey = process.env.TOGETHER_API_KEY;

  if (!apiKey) {
    console.log('[ImageService] TOGETHER_API_KEY not configured');
    return {
      success: false,
      error: 'Image generation service not configured',
    };
  }

  try {
    // Extract core subject if prompt is already wrapped
    const coreSubject = extractCoreSubject(userPrompt);

    // Prepare the optimized prompt for DreamShaper
    const optimizedPrompt = prepareDreamShaperPrompt(coreSubject);

    console.log(`[ImageService] Generating with FLUX.1-schnell`);
    console.log(`[ImageService] Core subject: ${coreSubject.substring(0, 50)}...`);

    // Call Together AI API directly
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: IMAGE_CONFIG.model,
        prompt: optimizedPrompt,
        negative_prompt: DREAMSHAPER_NEGATIVE_PROMPT,
        width: IMAGE_CONFIG.width,
        height: IMAGE_CONFIG.height,
        steps: IMAGE_CONFIG.steps,
        n: 1,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[ImageService] API error: ${response.status} - ${errorText.substring(0, 150)}`);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const imageData = data.data?.[0];

    if (imageData?.b64_json) {
      console.log('[ImageService] Successfully generated image');
      return {
        success: true,
        base64: imageData.b64_json,
        imageUrl: `data:image/png;base64,${imageData.b64_json}`,
      };
    }

    // Handle URL response format (fallback)
    if (imageData?.url) {
      console.log('[ImageService] Received URL response');
      return {
        success: true,
        imageUrl: imageData.url,
      };
    }

    console.log('[ImageService] No image data in response');
    return {
      success: false,
      error: 'No image generated',
    };
  } catch (error) {
    // Handle specific API errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Rate limiting
      if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
        console.log('[ImageService] Rate limited');
        return {
          success: false,
          error: 'Too many requests. Please try again in a moment.',
        };
      }

      // Safety/content filters
      if (
        errorMessage.includes('safety') ||
        errorMessage.includes('content') ||
        errorMessage.includes('policy')
      ) {
        console.log('[ImageService] Content flagged by safety filter');
        return {
          success: false,
          error: 'This content cannot be generated. Please try a different idea.',
        };
      }

      // API key issues
      if (errorMessage.includes('unauthorized') || errorMessage.includes('api key')) {
        console.log('[ImageService] API key issue');
        return {
          success: false,
          error: 'Image generation service configuration error',
        };
      }

      console.error('[ImageService] Error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    console.error('[ImageService] Unknown error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Check if the image service is available
 */
export function isImageServiceAvailable(): boolean {
  return !!process.env.TOGETHER_API_KEY;
}
