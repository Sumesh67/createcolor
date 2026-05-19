"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SLOT_OPTIONS } from "@/lib/ai/promptBuilder";
import { SlotSelections } from "@/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Shuffle, Sparkles } from "lucide-react";

interface SlotMachineProps {
  onGenerate: (selections: SlotSelections) => void;
  isGenerating?: boolean;
}

type SlotCategory = "who" | "doing" | "where";

export function SlotMachine({ onGenerate, isGenerating = false }: SlotMachineProps) {
  const [selections, setSelections] = useState<Record<SlotCategory, number>>({
    who: 0,
    doing: 0,
    where: 0,
  });
  const [spinning, setSpinning] = useState<Record<SlotCategory, boolean>>({
    who: false,
    doing: false,
    where: false,
  });

  const spinSlot = useCallback((category: SlotCategory) => {
    setSpinning((prev) => ({ ...prev, [category]: true }));

    // Random number of spins
    const spins = Math.floor(Math.random() * 10) + 5;
    const items = SLOT_OPTIONS[category];
    let currentIndex = selections[category];

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % items.length;
      setSelections((prev) => ({ ...prev, [category]: currentIndex }));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const finalIndex = Math.floor(Math.random() * items.length);
      setSelections((prev) => ({ ...prev, [category]: finalIndex }));
      setSpinning((prev) => ({ ...prev, [category]: false }));
    }, spins * 100);
  }, [selections]);

  const spinAll = useCallback(() => {
    spinSlot("who");
    setTimeout(() => spinSlot("doing"), 200);
    setTimeout(() => spinSlot("where"), 400);
  }, [spinSlot]);

  const handleGenerate = () => {
    const selectedValues: SlotSelections = {
      who: SLOT_OPTIONS.who[selections.who].label,
      doing: SLOT_OPTIONS.doing[selections.doing].label,
      where: SLOT_OPTIONS.where[selections.where].label,
    };
    onGenerate(selectedValues);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Slot Carousels */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <SlotCarousel
          title="Who?"
          emoji="🦄"
          items={SLOT_OPTIONS.who}
          selectedIndex={selections.who}
          isSpinning={spinning.who}
          onSpin={() => spinSlot("who")}
          onSelect={(index) => setSelections((prev) => ({ ...prev, who: index }))}
        />
        <SlotCarousel
          title="Doing?"
          emoji="🛹"
          items={SLOT_OPTIONS.doing}
          selectedIndex={selections.doing}
          isSpinning={spinning.doing}
          onSpin={() => spinSlot("doing")}
          onSelect={(index) => setSelections((prev) => ({ ...prev, doing: index }))}
        />
        <SlotCarousel
          title="Where?"
          emoji="🌈"
          items={SLOT_OPTIONS.where}
          selectedIndex={selections.where}
          isSpinning={spinning.where}
          onSpin={() => spinSlot("where")}
          onSelect={(index) => setSelections((prev) => ({ ...prev, where: index }))}
        />
      </div>

      {/* Selection Preview */}
      <motion.div
        className="text-center px-4 py-3 bg-white/80 rounded-2xl shadow-card w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-display text-lg text-foreground">
          A <span className="text-primary font-bold">{SLOT_OPTIONS.who[selections.who].label}</span>{" "}
          <span className="text-secondary font-bold">{SLOT_OPTIONS.doing[selections.doing].label.toLowerCase()}</span>{" "}
          <span className="text-purple font-bold">{SLOT_OPTIONS.where[selections.where].label.toLowerCase()}</span>
        </p>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          variant="secondary"
          size="lg"
          onClick={spinAll}
          disabled={Object.values(spinning).some(Boolean) || isGenerating}
          className="flex-1"
        >
          <Shuffle className="w-5 h-5 mr-2" />
          Spin All!
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={Object.values(spinning).some(Boolean) || isGenerating}
          className="flex-1"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Make It!
        </Button>
      </div>
    </div>
  );
}

interface SlotCarouselProps {
  title: string;
  emoji: string;
  items: { emoji: string; label: string }[];
  selectedIndex: number;
  isSpinning: boolean;
  onSpin: () => void;
  onSelect: (index: number) => void;
}

function SlotCarousel({
  title,
  emoji,
  items,
  selectedIndex,
  isSpinning,
  onSpin,
  onSelect,
}: SlotCarouselProps) {
  const getVisibleItems = () => {
    const result = [];
    for (let i = -1; i <= 1; i++) {
      const index = (selectedIndex + i + items.length) % items.length;
      result.push({ ...items[index], originalIndex: index, position: i });
    }
    return result;
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="font-display text-sm font-bold mb-2 text-foreground flex items-center gap-1">
        {emoji} {title}
      </h3>

      <motion.div
        className={cn(
          "relative bg-white rounded-2xl shadow-card overflow-hidden cursor-pointer",
          "w-full aspect-[3/4] min-h-[160px]",
          isSpinning && "pointer-events-none"
        )}
        onClick={onSpin}
        whileTap={{ scale: 0.98 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (isSpinning) return;
          if (info.offset.y < -30) {
            onSelect((selectedIndex + 1) % items.length);
          } else if (info.offset.y > 30) {
            onSelect((selectedIndex - 1 + items.length) % items.length);
          }
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((item) => (
              <motion.div
                key={`${item.originalIndex}-${item.position}`}
                className={cn(
                  "flex flex-col items-center justify-center p-2 w-full",
                  item.position === 0
                    ? "scale-100 opacity-100"
                    : "scale-75 opacity-40"
                )}
                initial={{ y: isSpinning ? -50 : 0, opacity: 0 }}
                animate={{ y: 0, opacity: item.position === 0 ? 1 : 0.4 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <span className={cn(
                  "text-3xl sm:text-4xl",
                  item.position === 0 && "text-4xl sm:text-5xl"
                )}>
                  {item.emoji}
                </span>
                {item.position === 0 && (
                  <span className="font-display text-xs sm:text-sm text-center mt-1 text-foreground">
                    {item.label}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Hint */}
        <div className="absolute bottom-1 left-0 right-0 text-center">
          <span className="text-[10px] text-gray-400 font-body">Tap or swipe</span>
        </div>
      </motion.div>
    </div>
  );
}
