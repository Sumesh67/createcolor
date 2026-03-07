import { SlotSelections } from "@/types";

export const SLOT_OPTIONS = {
  who: [
    { emoji: "🦄", label: "Unicorn" },
    { emoji: "🦖", label: "Dinosaur" },
    { emoji: "🐱", label: "Cat" },
    { emoji: "🤖", label: "Robot" },
    { emoji: "👸", label: "Princess" },
    { emoji: "🧑‍🚀", label: "Astronaut" },
    { emoji: "🧜‍♀️", label: "Mermaid" },
    { emoji: "🐉", label: "Dragon" },
    { emoji: "🦁", label: "Lion" },
    { emoji: "🐶", label: "Dog" },
    { emoji: "🦋", label: "Butterfly" },
    { emoji: "🐻", label: "Bear" },
  ],
  doing: [
    { emoji: "🛹", label: "Riding a skateboard" },
    { emoji: "🍕", label: "Eating pizza" },
    { emoji: "🎸", label: "Playing guitar" },
    { emoji: "🚀", label: "Flying" },
    { emoji: "💃", label: "Dancing" },
    { emoji: "🎨", label: "Painting" },
    { emoji: "📚", label: "Reading a book" },
    { emoji: "🏄", label: "Surfing" },
    { emoji: "🎂", label: "Having a birthday party" },
    { emoji: "🧁", label: "Baking cupcakes" },
    { emoji: "⚽", label: "Playing soccer" },
    { emoji: "🎤", label: "Singing" },
  ],
  where: [
    { emoji: "🌌", label: "In space" },
    { emoji: "🌊", label: "Underwater" },
    { emoji: "🌲", label: "In a forest" },
    { emoji: "🌈", label: "On a rainbow" },
    { emoji: "🎉", label: "At a party" },
    { emoji: "🏰", label: "In a castle" },
    { emoji: "🏝️", label: "On an island" },
    { emoji: "☁️", label: "In the clouds" },
    { emoji: "🎪", label: "At the circus" },
    { emoji: "🌺", label: "In a garden" },
    { emoji: "🏔️", label: "On a mountain" },
    { emoji: "🌙", label: "On the moon" },
  ],
};

// ==========================================
// LAYER 2: AI-LEVEL SAFETY (Prompt Engineering)
// ==========================================

// Safety prefix - ALWAYS prepended to every prompt
const SAFETY_PREFIX = "Safe for children, family-friendly, G-rated, appropriate for ages 3-10, cute and friendly,";

// Safety suffix - ALWAYS appended to every prompt
const SAFETY_SUFFIX = "NO nudity, NO violence, NO scary content, NO adult themes, NO weapons, NO blood, NO inappropriate content";

// Coloring page style suffix
const COLORING_PAGE_SUFFIX = "children's coloring page, clean black outlines only, pure white background, bold thick lines, no shading, no gradients, no color fills, simple cartoon shapes, large open areas for coloring, printable coloring book page";

/**
 * Build a safe prompt with all safety layers applied
 */
function buildSafePrompt(basePrompt: string): string {
  return `${SAFETY_PREFIX} ${basePrompt}, ${COLORING_PAGE_SUFFIX}, ${SAFETY_SUFFIX}`;
}

/**
 * Get DALL-E 3 configuration with safety settings
 */
export function getDallE3Config() {
  return {
    model: "dall-e-3" as const,
    style: "natural" as const,
    quality: "standard" as const,
    size: "1024x1024" as const,
    systemMessage: "You are a children's coloring book illustrator. Only generate age-appropriate, G-rated, family-friendly content. Never include nudity, violence, scary elements, or adult themes.",
  };
}

/**
 * Get Pollinations.ai URL with safety parameters
 */
export function getPollinationsUrl(prompt: string): string {
  const safePrompt = buildSafePrompt(prompt);
  const encodedPrompt = encodeURIComponent(safePrompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&safe=true&model=turbo`;
}

export function buildPromptFromSlots(selections: SlotSelections): string {
  const { who, doing, where } = selections;
  const basePrompt = `A ${who.toLowerCase()} ${doing.toLowerCase()} ${where.toLowerCase()}`;
  return buildSafePrompt(basePrompt);
}

export function buildCustomPrompt(customText: string): string {
  return buildSafePrompt(customText);
}

export function buildEditPrompt(
  originalPrompt: string,
  editMode: "tweak" | "add" | "remove" | "replace",
  editText: string
): string {
  let editedPrompt: string;

  switch (editMode) {
    case "tweak":
      editedPrompt = `${originalPrompt}, modified to ${editText}`;
      break;
    case "add":
      editedPrompt = `${originalPrompt}, with added ${editText}`;
      break;
    case "remove":
      editedPrompt = `${originalPrompt}, but without ${editText}`;
      break;
    case "replace":
      editedPrompt = editText;
      break;
    default:
      editedPrompt = originalPrompt;
  }

  return buildSafePrompt(editedPrompt);
}

/**
 * Get the raw user prompt (for display purposes, without safety wrappers)
 */
export function getDisplayPrompt(selections: SlotSelections): string {
  const { who, doing, where } = selections;
  return `A ${who.toLowerCase()} ${doing.toLowerCase()} ${where.toLowerCase()}`;
}

export function getRandomSelection(): SlotSelections {
  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return {
    who: randomItem(SLOT_OPTIONS.who).label,
    doing: randomItem(SLOT_OPTIONS.doing).label,
    where: randomItem(SLOT_OPTIONS.where).label,
  };
}
