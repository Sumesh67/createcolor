"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TextPromptProps {
  onSubmit: (text: string) => void;
  isGenerating?: boolean;
}

const IDEA_CHIPS = [
  { emoji: "🦖", text: "Dinosaur chef cooking" },
  { emoji: "🧜‍♀️", text: "Mermaid princess underwater" },
  { emoji: "🚀", text: "Astronaut on the moon" },
  { emoji: "🦄", text: "Unicorn in a magical forest" },
  { emoji: "🐉", text: "Dragon guarding treasure" },
  { emoji: "🤖", text: "Robot playing soccer" },
];

export function TextPrompt({ onSubmit, isGenerating = false }: TextPromptProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  const handleChipClick = (chipText: string) => {
    setText(chipText);
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
          <Pencil className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          Type Your Idea
        </h3>
        <p className="font-body text-gray-600 text-sm">
          Describe anything you can imagine!
        </p>
      </div>

      {/* Text Input */}
      <div className="w-full">
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-card border-4 border-secondary/30 focus-within:border-secondary transition-colors">
            <div className="flex items-start p-4">
              <span className="text-2xl mr-3">💡</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="A dragon eating pizza in space..."
                className="flex-1 font-body text-lg resize-none outline-none min-h-[100px] text-foreground placeholder:text-gray-400"
                maxLength={150}
                disabled={isGenerating}
              />
              {text.length > 0 && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Character Count */}
          <div className="flex justify-end mt-2 px-2">
            <span className={`font-body text-sm ${text.length > 120 ? 'text-orange-500' : 'text-gray-400'}`}>
              {text.length}/150
            </span>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full"
      >
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          isLoading={isGenerating}
          disabled={!text.trim() || isGenerating}
          className="w-full"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Create Magic!
        </Button>
      </motion.div>

      {/* Idea Chips */}
      <div className="w-full">
        <p className="font-body text-sm text-gray-500 text-center mb-3">
          Need inspiration? Try one of these:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {IDEA_CHIPS.map((chip) => (
            <motion.button
              key={chip.text}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChipClick(chip.text)}
              className="bg-white border-2 border-gray-200 hover:border-secondary rounded-full px-4 py-2 font-body text-sm text-foreground transition-colors"
              disabled={isGenerating}
            >
              {chip.emoji} {chip.text}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
