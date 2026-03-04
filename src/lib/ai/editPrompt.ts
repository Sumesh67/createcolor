import { EditMode } from "@/types";
import { buildEditPrompt } from "./promptBuilder";

export interface EditSuggestion {
  label: string;
  emoji: string;
  editText: string;
  editMode: EditMode;
}

export const QUICK_EDIT_SUGGESTIONS: EditSuggestion[] = [
  { label: "Make it bigger", emoji: "📏", editText: "larger and more prominent", editMode: "tweak" },
  { label: "Add stars", emoji: "⭐", editText: "sparkly stars around it", editMode: "add" },
  { label: "Make it cuter", emoji: "🥰", editText: "cuter with big eyes and a smile", editMode: "tweak" },
  { label: "Add a hat", emoji: "🎩", editText: "a fun hat", editMode: "add" },
  { label: "Make it funny", emoji: "😄", editText: "funnier with a silly expression", editMode: "tweak" },
  { label: "Add wings", emoji: "🪽", editText: "magical wings", editMode: "add" },
  { label: "Make it magical", emoji: "✨", editText: "more magical with sparkles", editMode: "tweak" },
  { label: "Add a friend", emoji: "👫", editText: "a friendly companion", editMode: "add" },
  { label: "Add flowers", emoji: "🌸", editText: "pretty flowers", editMode: "add" },
  { label: "Add clouds", emoji: "☁️", editText: "fluffy clouds", editMode: "add" },
  { label: "Make it sleepy", emoji: "😴", editText: "sleepy and cozy", editMode: "tweak" },
  { label: "Add hearts", emoji: "💕", editText: "hearts floating around", editMode: "add" },
];

export function generateEditPromptFromSuggestion(
  originalPrompt: string,
  suggestion: EditSuggestion
): string {
  return buildEditPrompt(originalPrompt, suggestion.editMode, suggestion.editText);
}

export function parseEditCommand(command: string): { editMode: EditMode; editText: string } {
  const lowerCommand = command.toLowerCase();

  if (lowerCommand.startsWith("add ") || lowerCommand.startsWith("put ")) {
    return {
      editMode: "add",
      editText: command.replace(/^(add|put)\s+/i, ""),
    };
  }

  if (lowerCommand.startsWith("remove ") || lowerCommand.startsWith("delete ") || lowerCommand.startsWith("take away ")) {
    return {
      editMode: "remove",
      editText: command.replace(/^(remove|delete|take away)\s+/i, ""),
    };
  }

  if (lowerCommand.startsWith("change to ") || lowerCommand.startsWith("make it ")) {
    return {
      editMode: "replace",
      editText: command.replace(/^(change to|make it)\s+/i, ""),
    };
  }

  // Default to tweak
  return {
    editMode: "tweak",
    editText: command,
  };
}
