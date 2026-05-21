"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const COLOR_OVERLAYS: Record<string, string> = {
  unicorn: "linear-gradient(135deg, #f9a8d4 0%, #c4b5fd 50%, #93c5fd 100%)",
  trex:    "linear-gradient(135deg, #86efac 0%, #4ade80 50%, #a3e635 100%)",
  rocket:  "linear-gradient(135deg, #fca5a5 0%, #fb923c 50%, #bfdbfe 100%)",
};

const SAMPLES = [
  { key: "unicorn", label: "Unicorn", imageUrl: "/hero/unicorn.svg" },
  { key: "trex",    label: "T-Rex",   imageUrl: "/hero/trex.svg"    },
  { key: "rocket",  label: "Rocket",  imageUrl: "/hero/rocket.svg"  },
];

const OUTLINE_HOLD = 2600;
const COLOR_HOLD   = 2600;
const CYCLE        = OUTLINE_HOLD + COLOR_HOLD + 1000;

function AnimatedCard({
  sample,
  delayMs,
  entryDelay,
}: {
  sample: typeof SAMPLES[0];
  delayMs: number;
  entryDelay: number;
}) {
  const [colored, setColored] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function cycle() {
      setColored(false);
      const t1 = setTimeout(() => {
        if (cancelled) return;
        setColored(true);
        const t2 = setTimeout(() => {
          if (!cancelled) cycle();
        }, COLOR_HOLD + 1000);
        return () => clearTimeout(t2);
      }, OUTLINE_HOLD);
      return () => clearTimeout(t1);
    }

    const init = setTimeout(cycle, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(init);
    };
  }, [delayMs]);

  const overlay = COLOR_OVERLAYS[sample.key] ?? COLOR_OVERLAYS.rocket;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: entryDelay, type: "spring", bounce: 0.3 }}
      className="relative w-36 h-48 sm:w-44 sm:h-60 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Phase badge */}
      <div className="absolute top-2.5 z-10 flex justify-center w-full pointer-events-none">
        <motion.span
          animate={{ opacity: colored ? 0 : 1 }}
          transition={{ duration: 0.35 }}
          className="absolute text-[10px] font-body text-gray-400 whitespace-nowrap"
        >
          outline ✏️
        </motion.span>
        <motion.span
          animate={{ opacity: colored ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          className="absolute text-[10px] font-body text-gray-400 whitespace-nowrap"
        >
          colored 🎨
        </motion.span>
      </div>

      {/* Image area */}
      <div className="relative w-full flex-1 mt-6 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sample.imageUrl}
          alt={sample.label}
          className="absolute inset-0 w-full h-full object-contain p-2"
        />
        {/* Watercolor overlay — fades in when colored */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: colored ? 0.55 : 0 }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
          style={{
            background: overlay,
            mixBlendMode: "multiply",
          }}
        />
      </div>

      {/* Label */}
      <span className="absolute bottom-2.5 text-[10px] font-body text-gray-500 font-medium z-10">
        {sample.label}
      </span>
    </motion.div>
  );
}

export function HeroAnimatedCards() {
  return (
    <div className="mt-16 flex justify-center gap-4 sm:gap-6">
      {SAMPLES.map((s, i) => (
        <AnimatedCard
          key={s.key}
          sample={s}
          delayMs={i * (CYCLE / SAMPLES.length)}
          entryDelay={0.6 + i * 0.18}
        />
      ))}
    </div>
  );
}
