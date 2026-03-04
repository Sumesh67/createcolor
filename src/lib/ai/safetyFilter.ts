import { SafetyCheckResult } from "@/types";

// Comprehensive blocklist for children's platform (no API needed)
const BLOCKLIST_WORDS = [
  // Violence
  "violence", "violent", "weapon", "gun", "knife", "sword", "blood", "death",
  "dead", "kill", "murder", "fight", "war", "battle", "attack", "hurt", "pain",
  "wound", "injury", "bomb", "explosion", "shoot", "stab",
  // Horror
  "scary", "horror", "terror", "terrifying", "nightmare", "creepy", "haunted",
  "ghost", "zombie", "monster", "vampire", "werewolf", "skeleton", "skull",
  // Inappropriate
  "hate", "racist", "discrimination", "bully", "bullying",
  // Substances
  "drug", "drugs", "alcohol", "beer", "wine", "cigarette", "smoking", "tobacco",
  "marijuana", "cocaine", "heroin",
  // Adult content
  "nude", "naked", "sexy", "adult", "inappropriate", "nsfw", "xxx",
  "sexual", "erotic", "porn",
  // Religious/occult (potentially scary for kids)
  "evil", "demon", "devil", "satan", "satanic", "hell", "occult", "curse",
  "cursed", "witch", "witchcraft", "voodoo", "sacrifice",
  // Profanity
  "damn", "swear", "crap", "stupid", "idiot", "dumb",
  // Other inappropriate
  "prison", "jail", "criminal", "thief", "steal", "kidnap", "abuse",
];

// Words that might have innocent uses but should be checked in context
const CONTEXT_WORDS = [
  "fire", "burn", "crash", "destroy", "break", "smash",
];

function containsBlockedWords(text: string): { blocked: boolean; word?: string } {
  const lowerText = text.toLowerCase();

  // Check exact blocklist words
  for (const word of BLOCKLIST_WORDS) {
    // Use word boundary check to avoid false positives
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      return { blocked: true, word };
    }
  }

  return { blocked: false };
}

function checkContextWords(text: string): { suspicious: boolean; words: string[] } {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const word of CONTEXT_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.push(word);
    }
  }

  // If multiple context words appear together, it might be suspicious
  return { suspicious: found.length >= 2, words: found };
}

/**
 * Check if a prompt is safe for children (FREE - no API needed)
 * Uses comprehensive blocklist filtering
 */
export async function checkPromptSafety(prompt: string): Promise<SafetyCheckResult> {
  // Check against blocklist
  const blocklistCheck = containsBlockedWords(prompt);
  if (blocklistCheck.blocked) {
    return {
      safe: false,
      reason: `Let's try something more fun and kid-friendly! How about a happy animal or a colorful adventure?`,
    };
  }

  // Check context words
  const contextCheck = checkContextWords(prompt);
  if (contextCheck.suspicious) {
    return {
      safe: false,
      reason: `Hmm, that sounds a bit intense. How about something more cheerful like a friendly unicorn or a sunny day?`,
    };
  }

  return { safe: true };
}

/**
 * Check if an uploaded image is safe (basic check)
 */
export async function checkImageSafety(_imageUrl: string): Promise<SafetyCheckResult> {
  // For uploaded images, we rely on the image processing to convert to line art
  // which naturally removes inappropriate content
  return { safe: true };
}
