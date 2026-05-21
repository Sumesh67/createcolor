"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STROKE = "#1a1a1a";
const SW = 2.5;
const FILL_T = { duration: 1.1, ease: "easeInOut" as const };

// ─── SVG illustrations ────────────────────────────────────────────────────────

function UnicornSVG({ c }: { c: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width="90" height="90" fill="none">
      <motion.ellipse cx="50" cy="65" rx="28" ry="20" stroke={STROKE} strokeWidth={SW}
        animate={{ fill: c ? "#fce7f3" : "#fff" }} transition={FILL_T} />
      <motion.circle cx="50" cy="40" r="20" stroke={STROKE} strokeWidth={SW}
        animate={{ fill: c ? "#fce7f3" : "#fff" }} transition={FILL_T} />
      <motion.polygon points="50,8 44,30 56,30" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
        animate={{ fill: c ? "#fde68a" : "#fff" }} transition={FILL_T} />
      <motion.path d="M63,28 C74,32 76,46 68,54" stroke={STROKE} strokeWidth={3} strokeLinecap="round" fill="none"
        animate={{ stroke: c ? "#c084fc" : STROKE }} transition={FILL_T} />
      <motion.path d="M67,32 C77,38 77,50 70,57" stroke={STROKE} strokeWidth={2} strokeLinecap="round" fill="none"
        animate={{ stroke: c ? "#e879f9" : STROKE }} transition={{ ...FILL_T, delay: 0.1 }} />
      <motion.circle cx="44" cy="38" r="3" stroke={STROKE} strokeWidth={1.5}
        animate={{ fill: c ? "#1a1a1a" : "#fff" }} transition={FILL_T} />
      <motion.circle cx="44" cy="50" r="1.5" stroke={STROKE} strokeWidth={1}
        animate={{ fill: c ? "#f9a8d4" : "#fff" }} transition={FILL_T} />
    </svg>
  );
}

function DinoSVG({ c }: { c: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width="90" height="90" fill="none">
      <motion.ellipse cx="46" cy="63" rx="26" ry="22" stroke={STROKE} strokeWidth={SW}
        animate={{ fill: c ? "#86efac" : "#fff" }} transition={FILL_T} />
      <motion.ellipse cx="72" cy="38" rx="18" ry="14" stroke={STROKE} strokeWidth={SW}
        animate={{ fill: c ? "#4ade80" : "#fff" }} transition={FILL_T} />
      <motion.path d="M56,44 Q72,54 88,44" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" fill="none" />
      {[62, 68, 74, 80].map((x, i) => (
        <motion.polygon key={i} points={`${x},47 ${x + 3},47 ${x + 1.5},52`}
          stroke={STROKE} strokeWidth={1} animate={{ fill: "#fff" }} />
      ))}
      <motion.circle cx="76" cy="33" r="3.5" stroke={STROKE} strokeWidth={1.5}
        animate={{ fill: c ? "#1a1a1a" : "#fff" }} transition={FILL_T} />
      <path d="M36,60 Q28,57 24,65" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <path d="M22,72 Q10,70 8,80" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <motion.polygon key={i}
          points={`${44 + i * 8},42 ${40 + i * 8},30 ${48 + i * 8},42`}
          stroke={STROKE} strokeWidth={1.5} strokeLinejoin="round"
          animate={{ fill: c ? "#16a34a" : "#fff" }}
          transition={{ ...FILL_T, delay: i * 0.06 }} />
      ))}
    </svg>
  );
}

function RocketSVG({ c }: { c: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width="90" height="90" fill="none">
      <motion.rect x="35" y="30" width="30" height="42" rx="4" stroke={STROKE} strokeWidth={SW}
        animate={{ fill: c ? "#e0e7ff" : "#fff" }} transition={FILL_T} />
      <motion.path d="M35,32 Q50,10 65,32 Z" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
        animate={{ fill: c ? "#f87171" : "#fff" }} transition={FILL_T} />
      <motion.path d="M35,56 L22,72 L35,72 Z" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
        animate={{ fill: c ? "#f87171" : "#fff" }} transition={FILL_T} />
      <motion.path d="M65,56 L78,72 L65,72 Z" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
        animate={{ fill: c ? "#f87171" : "#fff" }} transition={FILL_T} />
      <motion.circle cx="50" cy="48" r="8" stroke={STROKE} strokeWidth={SW}
        animate={{ fill: c ? "#7dd3fc" : "#fff" }} transition={FILL_T} />
      <circle cx="47" cy="45" r="2.5" fill="#fff" />
      <motion.ellipse cx="50" cy="80" rx="10" ry="10" stroke={STROKE} strokeWidth={SW}
        animate={{ fill: c ? "#fb923c" : "#fff" }} transition={FILL_T} />
      <motion.ellipse cx="50" cy="83" rx="5" ry="6"
        animate={{ fill: c ? "#fde68a" : "#fff" }} transition={{ ...FILL_T, delay: 0.15 }} />
    </svg>
  );
}

// ─── Single animated card ─────────────────────────────────────────────────────

const SUBJECTS = [
  { label: "Unicorn", Svg: UnicornSVG },
  { label: "Dinosaur", Svg: DinoSVG },
  { label: "Rocket", Svg: RocketSVG },
];

const OUTLINE_HOLD = 2400; // ms to stay as outline
const COLOR_HOLD   = 2400; // ms to stay colored
const CYCLE        = OUTLINE_HOLD + COLOR_HOLD + 1200; // full loop duration

function AnimatedCard({
  label,
  Svg,
  delayMs,
  entryDelay,
}: {
  label: string;
  Svg: (props: { c: boolean }) => React.ReactElement;
  delayMs: number;
  entryDelay: number;
}) {
  const [colored, setColored] = useState(false);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let running = true;

    function cycle() {
      // show outline first
      setColored(false);
      t1 = setTimeout(() => {
        if (!running) return;
        setColored(true);              // transition to colored
        t2 = setTimeout(() => {
          if (running) cycle();        // loop
        }, COLOR_HOLD + 1200);
      }, OUTLINE_HOLD);
    }

    const init = setTimeout(cycle, delayMs);
    return () => {
      running = false;
      clearTimeout(init);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [delayMs]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: entryDelay, type: "spring", bounce: 0.3 }}
      className="relative w-32 h-44 sm:w-44 sm:h-60 bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col items-center justify-center gap-1"
    >
      {/* Phase badge */}
      <div className="absolute top-3 flex items-center gap-1">
        <motion.span
          animate={{ opacity: colored ? 0 : 1 }}
          transition={{ duration: 0.35 }}
          className="text-[10px] font-body text-gray-400 absolute"
        >
          outline ✏️
        </motion.span>
        <motion.span
          animate={{ opacity: colored ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          className="text-[10px] font-body text-gray-400 absolute"
        >
          colored 🎨
        </motion.span>
      </div>

      <Svg c={colored} />

      <span className="absolute bottom-3 text-[10px] font-body text-gray-400">
        {label}
      </span>
    </motion.div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function HeroAnimatedCards() {
  return (
    <div className="mt-16 flex justify-center gap-4 sm:gap-6 overflow-visible">
      {SUBJECTS.map((s, i) => (
        <AnimatedCard
          key={s.label}
          label={s.label}
          Svg={s.Svg}
          delayMs={i * (CYCLE / SUBJECTS.length)}
          entryDelay={0.6 + i * 0.2}
        />
      ))}
    </div>
  );
}
