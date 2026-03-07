import { SafetyCheckResult } from "@/types";
import OpenAI from "openai";

// Initialize OpenAI client (for moderation API - FREE to use)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Comprehensive blocklist for children's platform
const BLOCKLIST = {
  // Violence & Weapons
  violence: [
    "violence", "violent", "weapon", "gun", "knife", "sword", "blood", "death",
    "dead", "kill", "murder", "fight", "war", "battle", "attack", "hurt", "pain",
    "wound", "injury", "bomb", "explosion", "shoot", "stab", "punch", "kick",
    "strangle", "choke", "drown", "torture", "execute", "assassin", "sniper",
  ],
  // Horror & Scary
  horror: [
    "scary", "horror", "terror", "terrifying", "nightmare", "creepy", "haunted",
    "ghost", "zombie", "monster", "vampire", "werewolf", "skeleton", "skull",
    "corpse", "undead", "possessed", "demonic", "sinister", "macabre", "gory",
    "gruesome", "mutant", "freak", "deformed",
  ],
  // Body parts (inappropriate context)
  body: [
    "nude", "naked", "breast", "butt", "buttocks", "genitals", "private parts",
    "underwear", "lingerie", "bikini", "topless", "bottomless", "exposed",
  ],
  // Adult content
  adult: [
    "sexy", "adult", "inappropriate", "nsfw", "xxx", "sexual", "erotic", "porn",
    "pornography", "fetish", "bondage", "bdsm", "provocative", "seductive",
    "sensual", "intimate", "intercourse", "orgasm",
  ],
  // Substances
  substances: [
    "drug", "drugs", "alcohol", "beer", "wine", "vodka", "whiskey", "cigarette",
    "smoking", "tobacco", "marijuana", "weed", "cocaine", "heroin", "meth",
    "overdose", "intoxicated", "drunk", "high", "stoned",
  ],
  // Hate & Discrimination
  hate: [
    "hate", "racist", "racism", "discrimination", "nazi", "kkk", "supremacist",
    "slur", "bigot", "sexist", "homophobic", "transphobic", "xenophobic",
  ],
  // Religious/Occult (potentially scary)
  occult: [
    "evil", "demon", "devil", "satan", "satanic", "hell", "occult", "curse",
    "cursed", "witchcraft", "voodoo", "sacrifice", "pentagram", "ritual",
    "summoning", "exorcism", "possession", "antichrist",
  ],
  // Crime & Illegal
  crime: [
    "prison", "jail", "criminal", "thief", "steal", "kidnap", "abuse", "assault",
    "rape", "molest", "trafficking", "slavery", "ransom", "hostage", "terrorist",
  ],
  // Self-harm
  selfHarm: [
    "suicide", "self-harm", "cutting", "depression", "suicidal", "kill myself",
    "end my life", "want to die", "hanging", "overdose",
  ],
  // Profanity (basic)
  profanity: [
    "fuck", "shit", "bitch", "ass", "damn", "bastard", "crap", "piss",
  ],
};

// Flatten blocklist for checking
const ALL_BLOCKED_WORDS = Object.values(BLOCKLIST).flat();

// Kid-friendly rejection messages
const REJECTION_MESSAGES = [
  "Hmm, let's think of something more fun! 🌈",
  "How about we try a happier idea? 🦄",
  "Let's create something magical instead! ✨",
  "Oops! Let's pick something more colorful! 🎨",
  "Let's dream up something wonderful! 🌟",
];

function getRandomRejectionMessage(): string {
  return REJECTION_MESSAGES[Math.floor(Math.random() * REJECTION_MESSAGES.length)];
}

/**
 * Check prompt against blocklist (instant, no API)
 */
function checkBlocklist(text: string): { safe: boolean; word?: string; category?: string } {
  const lowerText = text.toLowerCase();

  for (const [category, words] of Object.entries(BLOCKLIST)) {
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        return { safe: false, word, category };
      }
    }
  }

  return { safe: true };
}

/**
 * Check prompt using OpenAI Moderation API (FREE)
 * Detects: hate, harassment, violence, sexual content, self-harm
 */
async function checkOpenAIModeration(text: string): Promise<{ safe: boolean; categories?: string[] }> {
  try {
    // Skip if no API key
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[Safety] OpenAI API key not set, skipping moderation API');
      return { safe: true };
    }

    const response = await openai.moderations.create({
      input: text,
    });

    const result = response.results[0];

    if (result.flagged) {
      // Get flagged categories
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      console.log('[Safety] OpenAI flagged content:', flaggedCategories);
      return { safe: false, categories: flaggedCategories };
    }

    return { safe: true };
  } catch (error) {
    console.error('[Safety] OpenAI moderation error:', error);
    // On error, fall back to blocklist only (already checked)
    return { safe: true };
  }
}

/**
 * Main filter function - checks both blocklist AND OpenAI moderation
 * Returns safe only if BOTH pass
 */
export async function filterPrompt(text: string): Promise<SafetyCheckResult> {
  // Layer 1A: Blocklist check (instant)
  const blocklistResult = checkBlocklist(text);
  if (!blocklistResult.safe) {
    console.log(`[Safety] Blocklist blocked: "${blocklistResult.word}" in category "${blocklistResult.category}"`);
    return {
      safe: false,
      reason: getRandomRejectionMessage(),
    };
  }

  // Layer 1B: OpenAI Moderation API check (comprehensive)
  const moderationResult = await checkOpenAIModeration(text);
  if (!moderationResult.safe) {
    console.log(`[Safety] OpenAI moderation blocked: ${moderationResult.categories?.join(', ')}`);
    return {
      safe: false,
      reason: getRandomRejectionMessage(),
    };
  }

  return { safe: true };
}

/**
 * Quick blocklist-only check (for real-time typing feedback)
 */
export function quickFilter(text: string): SafetyCheckResult {
  const result = checkBlocklist(text);
  if (!result.safe) {
    return {
      safe: false,
      reason: getRandomRejectionMessage(),
    };
  }
  return { safe: true };
}

/**
 * Get all blocked words (for debugging/admin)
 */
export function getBlocklistStats() {
  return {
    total: ALL_BLOCKED_WORDS.length,
    categories: Object.entries(BLOCKLIST).map(([cat, words]) => ({
      category: cat,
      count: words.length,
    })),
  };
}
