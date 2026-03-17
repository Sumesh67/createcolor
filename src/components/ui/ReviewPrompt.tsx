"use client";

import { useEffect, useState } from "react";
import { Star, X, Apple } from "lucide-react";
import { Button } from "@/components/ui/Button";
import * as Dialog from "@radix-ui/react-dialog";

const APP_STORE_URL = "https://apps.apple.com/app/id6760249757";
const REVIEW_SHOWN_KEY = "reviewPromptShown";

interface ReviewPromptProps {
  printCount: number;
}

export function ReviewPrompt({ printCount }: ReviewPromptProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show prompt when user hits 5 prints and hasn't seen it before
    if (printCount >= 5) {
      const hasShown = localStorage.getItem(REVIEW_SHOWN_KEY);
      if (!hasShown) {
        setIsOpen(true);
        localStorage.setItem(REVIEW_SHOWN_KEY, "true");
      }
    }
  }, [printCount]);

  const handleReview = () => {
    window.open(APP_STORE_URL, "_blank");
    setIsOpen(false);
  };

  const handleMaybeLater = () => {
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-sm z-50 shadow-xl text-center">
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>

          <div className="mb-4">
            <span className="text-5xl">🌟</span>
          </div>

          <Dialog.Title className="font-display text-2xl font-bold mb-2">
            Enjoying the magic?
          </Dialog.Title>

          <Dialog.Description className="font-body text-gray-600 mb-6">
            You&apos;ve created {printCount} amazing coloring pages! If you&apos;re loving CreateAndColor, would you mind leaving us a review?
          </Dialog.Description>

          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-8 h-8 text-yellow-400 fill-yellow-400"
              />
            ))}
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleReview}
            >
              <Apple className="w-5 h-5 mr-2" />
              Rate on App Store
            </Button>
            <button
              onClick={handleMaybeLater}
              className="font-body text-sm text-gray-500 hover:text-gray-700"
            >
              Maybe later
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
