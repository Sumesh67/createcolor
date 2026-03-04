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

const COLORING_PAGE_SUFFIX = "children's coloring page, clean black outlines only, pure white background, bold thick lines, no shading, no gradients, no color fills, simple cartoon shapes, large open areas for coloring, printable coloring book page";

export function buildPromptFromSlots(selections: SlotSelections): string {
  const { who, doing, where } = selections;
  const basePrompt = `A ${who.toLowerCase()} ${doing.toLowerCase()} ${where.toLowerCase()}`;
  return `${basePrompt}, ${COLORING_PAGE_SUFFIX}`;
}

export function buildCustomPrompt(customText: string): string {
  return `${customText}, ${COLORING_PAGE_SUFFIX}`;
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

  return `${editedPrompt}, ${COLORING_PAGE_SUFFIX}`;
}

export function getRandomSelection(): SlotSelections {
  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return {
    who: randomItem(SLOT_OPTIONS.who).label,
    doing: randomItem(SLOT_OPTIONS.doing).label,
    where: randomItem(SLOT_OPTIONS.where).label,
  };
}
