"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiEffectProps {
  isActive: boolean;
  duration?: number;
}

interface Confetti {
  id: number;
  x: number;
  color: string;
  size: number;
  rotation: number;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A855F7", "#FF9F43", "#5F27CD"];

export function ConfettiEffect({ isActive, duration = 3000 }: ConfettiEffectProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate confetti pieces
      const pieces: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
      }));
      setConfetti(pieces);

      // Clear after duration
      const timer = setTimeout(() => {
        setConfetti([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  return (
    <AnimatePresence>
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: -20,
                rotate: piece.rotation,
                opacity: 1,
              }}
              animate={{
                y: "110vh",
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3 + Math.random() * 2,
                ease: "easeIn",
              }}
              style={{
                position: "absolute",
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "0%",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export function CelebrationEmojis({ isActive }: { isActive: boolean }) {
  const [emojis, setEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);

  useEffect(() => {
    if (isActive) {
      const emojiOptions = ["🎉", "⭐", "✨", "🌟", "💫", "🎨", "🖍️", "🦄"];
      const items = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: emojiOptions[Math.floor(Math.random() * emojiOptions.length)],
        x: Math.random() * 100,
      }));
      setEmojis(items);

      const timer = setTimeout(() => setEmojis([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {emojis.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {emojis.map((item) => (
            <motion.span
              key={item.id}
              initial={{
                x: `${item.x}vw`,
                y: "100vh",
                scale: 0,
                rotate: 0,
              }}
              animate={{
                y: "-10vh",
                scale: [0, 1.5, 1],
                rotate: [0, 180, 360],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 2 + Math.random(),
                ease: "easeOut",
              }}
              className="absolute text-3xl"
            >
              {item.emoji}
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
