import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rateLimit';

export const maxDuration = 60;

interface CharacterInput {
  imageBase64: string;
  label: string;
}

interface AnalyzedCharacter {
  label: string;
  description: string;
}

// Generate a simple description based on the character name
// This is a zero-cost fallback since vision models are unavailable
function generateDescription(label: string): string {
  const lowerLabel = label.toLowerCase();

  // Common character types
  if (lowerLabel.includes('mom') || lowerLabel.includes('mother') || lowerLabel.includes('mama')) {
    return 'A loving mother with a warm smile and caring eyes';
  }
  if (lowerLabel.includes('dad') || lowerLabel.includes('father') || lowerLabel.includes('papa')) {
    return 'A friendly father with a big smile and kind expression';
  }
  if (lowerLabel.includes('grandma') || lowerLabel.includes('grandmother') || lowerLabel.includes('nana')) {
    return 'A sweet grandmother with gentle eyes and silver hair';
  }
  if (lowerLabel.includes('grandpa') || lowerLabel.includes('grandfather')) {
    return 'A wise grandfather with a warm smile and kind face';
  }
  if (lowerLabel.includes('sister') || lowerLabel.includes('sis')) {
    return 'A cheerful sister with bright eyes and a playful smile';
  }
  if (lowerLabel.includes('brother') || lowerLabel.includes('bro')) {
    return 'An adventurous brother with a mischievous grin';
  }
  if (lowerLabel.includes('baby')) {
    return 'An adorable baby with rosy cheeks and curious eyes';
  }
  if (lowerLabel.includes('dog') || lowerLabel.includes('puppy') || lowerLabel.includes('pup')) {
    return 'A loyal and playful dog with a wagging tail';
  }
  if (lowerLabel.includes('cat') || lowerLabel.includes('kitty') || lowerLabel.includes('kitten')) {
    return 'A curious cat with soft fur and whiskers';
  }
  if (lowerLabel.includes('bunny') || lowerLabel.includes('rabbit')) {
    return 'A fluffy bunny with long ears and a twitching nose';
  }
  if (lowerLabel.includes('bear') || lowerLabel.includes('teddy')) {
    return 'A cuddly teddy bear with soft fur and button eyes';
  }
  if (lowerLabel.includes('princess') || lowerLabel.includes('queen')) {
    return 'A beautiful royal with a sparkling crown and elegant dress';
  }
  if (lowerLabel.includes('prince') || lowerLabel.includes('king')) {
    return 'A brave royal with a golden crown and noble bearing';
  }
  if (lowerLabel.includes('friend')) {
    return 'A wonderful friend with a bright smile and friendly eyes';
  }
  if (lowerLabel.includes('family')) {
    return 'A loving family group standing together happily';
  }

  // Default description
  return `A wonderful character named ${label} with a friendly smile`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(identifier, { maxRequests: 10, windowMs: 60 * 60 * 1000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: "You've created too many storybooks. Please try again later!",
          resetIn: Math.ceil(rateLimit.resetIn / 60000),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { characters } = body as { characters: CharacterInput[] };

    if (!characters || !Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json(
        { error: 'No characters provided' },
        { status: 400 }
      );
    }

    if (characters.length > 5) {
      return NextResponse.json(
        { error: 'Too many characters', message: 'Maximum 5 characters allowed' },
        { status: 400 }
      );
    }

    console.log(`[Analyze Characters] Processing ${characters.length} characters`);

    // Generate descriptions based on labels (no API cost)
    const analyzedCharacters: AnalyzedCharacter[] = characters.map((char) => {
      const description = generateDescription(char.label);
      console.log(`[Analyze Characters] ${char.label}: ${description}`);
      return {
        label: char.label,
        description,
      };
    });

    console.log(`[Analyze Characters] Successfully processed ${analyzedCharacters.length} characters`);

    return NextResponse.json({
      success: true,
      characters: analyzedCharacters,
    });
  } catch (error) {
    console.error('[Analyze Characters] Error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: 'Could not analyze the characters. Please try again.',
      },
      { status: 500 }
    );
  }
}
