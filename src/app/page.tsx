"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  Sparkles, BookOpen, Package, PenLine, Apple,
  ChevronLeft, ChevronRight, Shuffle, Mic,
  Printer, Users, Check, Shield,
} from "lucide-react";


const APP_STORE_URL = "https://apps.apple.com/app/id6760249757";

// ─── Carousel data ─────────────────────────────────────────────────────────────

const WHO_OPTIONS   = ["👸 Princess","🦸 Superhero","🧙 Wizard","🐉 Dragon","🦊 Fox","🧑‍🚀 Astronaut","🧜 Mermaid","🦁 Lion King"];
const DOING_OPTIONS = ["💃 Dancing","🏃 Running","🎮 Playing Games","🍕 Eating Pizza","🎨 Painting","🌙 Sleeping","⚽ Kicking a Ball","🎸 Playing Guitar"];
const WHERE_OPTIONS = ["☁️ In The Clouds","🏰 In A Castle","🌊 Under The Sea","🚀 In Space","🌲 In The Forest","🏙️ In The City","🏝️ On An Island","🌋 Near A Volcano"];

const SECTIONS = [
  { id: "who" as const,   title: "Who?",       emoji: "🎭", options: WHO_OPTIONS,   border: "border-purple-400", bg: "bg-gradient-to-br from-purple-50 to-violet-100", badge: "bg-purple-100 text-purple-700", shadow: "shadow-purple-200" },
  { id: "doing" as const, title: "Doing What?", emoji: "🎬", options: DOING_OPTIONS, border: "border-teal-400",   bg: "bg-gradient-to-br from-teal-50 to-cyan-100",     badge: "bg-teal-100 text-teal-700",   shadow: "shadow-teal-200"   },
  { id: "where" as const, title: "Where?",      emoji: "🗺️", options: WHERE_OPTIONS, border: "border-indigo-400", bg: "bg-gradient-to-br from-indigo-50 to-blue-100",   badge: "bg-indigo-100 text-indigo-700",shadow: "shadow-indigo-200" },
];

// ─── CarouselCard ──────────────────────────────────────────────────────────────

function CarouselCard({
  section, index, direction, onPrev, onNext,
}: {
  section: typeof SECTIONS[0]; index: number; direction: number;
  onPrev: () => void; onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-3 w-full">
      <button onClick={onPrev} className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 hover:shadow-lg transition-all active:scale-90">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className={`flex-1 relative overflow-hidden rounded-2xl border-2 ${section.border} ${section.bg} shadow-lg ${section.shadow} py-4 px-3`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index} custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
            }}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="text-center"
          >
            <p className="font-display font-bold text-xl text-gray-800 leading-tight">{section.options[index]}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <button onClick={onNext} className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 hover:shadow-lg transition-all active:scale-90">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── MobileCreateView ─────────────────────────────────────────────────────────

function MobileCreateView() {
  const [indices, setIndices] = useState({ who: 0, doing: 0, where: 0 });
  const [directions, setDirections] = useState({ who: 1, doing: 1, where: 1 });

  const cycle = (id: "who" | "doing" | "where", dir: number, len: number) => {
    setDirections((d) => ({ ...d, [id]: dir }));
    setIndices((i) => ({ ...i, [id]: (i[id] + dir + len) % len }));
  };

  const shuffle = () => {
    setDirections({ who: 1, doing: 1, where: 1 });
    setIndices({
      who:   Math.floor(Math.random() * WHO_OPTIONS.length),
      doing: Math.floor(Math.random() * DOING_OPTIONS.length),
      where: Math.floor(Math.random() * WHERE_OPTIONS.length),
    });
  };

  const prompt = `${WHO_OPTIONS[indices.who]} ${DOING_OPTIONS[indices.doing]} ${WHERE_OPTIONS[indices.where]}`;

  return (
    <div className="md:hidden min-h-[calc(100vh-56px)] bg-[#fdfbf7] flex flex-col px-5 py-6 gap-5">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-gray-800 leading-snug">
          Spin to create your<br /><span className="text-primary">coloring page!</span>
        </h1>
        <p className="font-body text-sm text-gray-500 mt-1">Choose your character, action & place ✨</p>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {SECTIONS.map((section) => {
          const id = section.id;
          return (
            <div key={id}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className={`text-xs font-display font-bold px-2.5 py-1 rounded-full ${section.badge}`}>
                  {section.emoji} {section.title}
                </span>
              </div>
              <CarouselCard
                section={section} index={indices[id]} direction={directions[id]}
                onPrev={() => cycle(id, -1, section.options.length)}
                onNext={() => cycle(id,  1, section.options.length)}
              />
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-4 py-3">
        <p className="text-[11px] font-body text-gray-400 uppercase tracking-wide mb-1">Your prompt</p>
        <p className="font-display text-sm font-semibold text-gray-700 leading-snug">{prompt}</p>
      </div>
      <div className="flex gap-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={shuffle}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-400 text-white font-display font-bold text-base shadow-lg shadow-orange-200">
          <Shuffle className="w-5 h-5" /> Shuffle!
        </motion.button>
        <Link href="/create" className="flex-1">
          <motion.button whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-display font-bold text-base text-white shadow-lg shadow-pink-200"
            style={{ background: "linear-gradient(135deg, #FF6B6B 0%, #A855F7 100%)" }}>
            <Sparkles className="w-5 h-5" /> Create Magic!
          </motion.button>
        </Link>
      </div>
      <div className="flex items-center justify-center gap-2 text-gray-400">
        <div className="flex-1 h-px bg-gray-200" />
        <button className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm text-sm font-body text-gray-500 hover:border-primary hover:text-primary transition-colors">
          <Mic className="w-4 h-4" /> or speak your idea
        </button>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    </div>
  );
}

// ─── Gallery data ──────────────────────────────────────────────────────────────

const GALLERY_ITEMS = [
  { label: "Unicorn",  prompt: "A unicorn with a flowing mane in a magical forest", imgUrl: "/gallery/unicorn.png"  },
  { label: "Dinosaur", prompt: "A friendly T-Rex wearing a party hat",              imgUrl: "/gallery/dinosaur.png" },
  { label: "Rocket",   prompt: "A cute rocket blasting into space with stars",      imgUrl: "/gallery/rocket.png"   },
  { label: "Mermaid",  prompt: "A mermaid swimming under the sea",                  imgUrl: "/gallery/mermaid.png"  },
  { label: "Puppy",    prompt: "A fluffy puppy sitting and wagging its tail",       imgUrl: "/gallery/puppy.png"    },
  { label: "Robot",    prompt: "A friendly smiling robot waving hello",             imgUrl: "/gallery/robot.png"    },
];

// ─── DesktopHero ───────────────────────────────────────────────────────────────

function DesktopHero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-6 sm:pt-24 sm:pb-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-foreground mb-5 leading-tight">
            Turn imagination into{" "}
            <span className="text-primary">printable coloring pages</span>{" "}
            <motion.span
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
              className="inline-block"
            >✨</motion.span>
          </h1>
          <p className="font-body text-lg sm:text-xl text-foreground/65 mb-8 max-w-2xl mx-auto">
            Create custom coloring pages, storybooks, party packs, and classroom worksheets with AI — ready to print in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/create">
              <Button variant="primary" size="xl">
                <Sparkles className="w-5 h-5 mr-2" /> Start Creating Free
              </Button>
            </Link>
            <Link href="/storybook">
              <Button variant="secondary" size="xl">
                <BookOpen className="w-5 h-5 mr-2" /> Create a Storybook
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/parent">
              <Button variant="outline" size="lg" className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400">
                <Package className="w-4 h-4 mr-2" /> Party Pack — 20 pages
              </Button>
            </Link>
            <Link href="/teacher">
              <Button variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400">
                <PenLine className="w-4 h-4 mr-2" /> Teacher Worksheets
              </Button>
            </Link>
          </div>
          <Link href="#how-it-works" className="font-body text-sm text-foreground/50 hover:text-primary transition-colors">
            See how it works ↓
          </Link>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-foreground text-white px-5 py-2.5 rounded-xl hover:bg-foreground/90 transition-colors"
          >
            <Apple className="w-5 h-5" />
            <div className="text-left leading-tight">
              <div className="text-[10px] text-white/60">Download on the</div>
              <div className="text-sm font-semibold">App Store</div>
            </div>
          </a>
        </motion.div>

      </div>
    </section>
  );
}

// ─── TrustStrip ────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { Icon: Shield,  label: "Kid-safe prompts",          bg: "bg-green-50",  text: "text-green-600"  },
  { Icon: Printer, label: "Print-ready PDFs",           bg: "bg-blue-50",   text: "text-blue-600"   },
  { Icon: Users,   label: "Parent-controlled gallery",  bg: "bg-purple-50", text: "text-purple-600" },
  { Icon: PenLine, label: "Free teacher worksheets",    bg: "bg-orange-50", text: "text-orange-600" },
];

function TrustStrip() {
  return (
    <section className="py-6 px-4 bg-white border-y border-gray-100">
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-5 sm:gap-10">
        {TRUST_ITEMS.map(({ Icon, label, bg, text }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${text}`} />
            </div>
            <span className="font-body text-sm font-semibold text-foreground/70">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── HowItWorks ────────────────────────────────────────────────────────────────

const HOW_STEPS = [
  { step: "1", emoji: "🎰", color: "bg-primary/10",  title: "Pick or speak an idea",       desc: "Use our fun slot machine to mix characters and places — or just type or say what you want.",                        mini: "👸 + 🏰 + ✨ = your idea" },
  { step: "2", emoji: "✨", color: "bg-secondary/10", title: "AI creates clean line art",   desc: "Our AI generates a unique coloring page in seconds, perfectly styled for printing and coloring.",                   mini: "⚡ Generating your page…"  },
  { step: "3", emoji: "🖨️", color: "bg-purple/10",   title: "Print and color",             desc: "Download a print-ready PDF or send directly to your printer. Time to grab those crayons!",                          mini: "📄 Print-ready PDF"        },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
          <p className="font-body text-foreground/60 text-lg">From idea to print in under 60 seconds.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 flex flex-col items-center text-center hover:shadow-modern transition-shadow"
            >
              <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-4`}>
                <span className="text-3xl">{item.emoji}</span>
              </div>
              <div className="text-xs font-display font-bold text-foreground/30 mb-1 tracking-widest">STEP {item.step}</div>
              <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
              <p className="font-body text-foreground/65 text-sm mb-4 flex-1">{item.desc}</p>
              <div className="w-full bg-gray-50 rounded-xl px-3 py-2 text-center mt-auto">
                <span className="font-body text-xs text-foreground/50">{item.mini}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SampleGallery ─────────────────────────────────────────────────────────────

function SampleGallery() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">See what kids can create</h2>
          <p className="font-body text-foreground/60 text-lg">Real printable-style coloring pages generated from simple ideas.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden hover:shadow-modern hover:-translate-y-0.5 transition-all"
            >
              <div className="px-3 pt-3">
                <span className="inline-block text-[10px] font-body text-foreground/50 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 leading-none truncate max-w-full">
                  &quot;{item.prompt}&quot;
                </span>
              </div>
              <div className="w-full aspect-square p-2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imgUrl} alt={item.label} className="w-full h-full object-contain" />
              </div>
              <div className="px-3 pb-3 flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground/70">{item.label}</span>
                <span className="text-[10px] font-body text-green-600 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">Printable</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/create">
            <Button variant="primary" size="lg">
              <Sparkles className="w-4 h-4 mr-2" /> Create your own coloring page
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── StorybookSection ──────────────────────────────────────────────────────────

function StorybookSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Visual */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="relative flex justify-center order-2 md:order-1">
          <div className="relative w-64 h-80">
            {[2, 1, 0].map((offset) => (
              <div key={offset} className="absolute inset-0 bg-white rounded-2xl shadow-card border border-gray-100"
                style={{ transform: `rotate(${(offset - 1) * 3}deg) translateY(${offset * -5}px)` }} />
            ))}
            <div className="absolute inset-0 bg-white rounded-2xl shadow-modern border border-purple-100 flex flex-col overflow-hidden">
              <div className="bg-gradient-to-b from-purple-100 to-indigo-50 flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <span className="text-5xl">🚀</span>
                  <p className="font-display text-sm font-bold text-purple-700 mt-2 leading-tight">Maya&apos;s Space Adventure</p>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100">
                <p className="font-body text-[9px] text-foreground/50 leading-relaxed">
                  Maya zoomed past the twinkling stars, her rocket leaving a trail of sparkles. The moon waved hello as she soared by...
                </p>
                <div className="flex gap-1.5 mt-2">
                  {["🌙","⭐","🪐"].map((e) => (
                    <span key={e} className="text-base">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-3 -right-3 bg-purple-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
            5 pages
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="order-1 md:order-2">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            <BookOpen className="w-4 h-4" /> For Families
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Turn your child into the hero of a storybook
          </h2>
          <p className="font-body text-foreground/70 text-lg mb-6">
            Upload a photo, choose an adventure, and create a personalized printable coloring storybook.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              { e:"📸", t:"Upload photos of your kids, pets, or favourite characters" },
              { e:"✍️", t:"AI writes a unique 5-page rhyming story around your characters" },
              { e:"🖼️", t:"Every page gets a custom illustration in coloring-book style" },
              { e:"📄", t:"Download as a print-ready PDF to read and color together" },
            ].map(({ e, t }) => (
              <li key={t} className="flex items-start gap-3 font-body text-foreground/80">
                <span className="text-xl shrink-0">{e}</span><span>{t}</span>
              </li>
            ))}
          </ul>
          <Link href="/storybook">
            <Button variant="primary" size="xl" className="bg-purple-500 hover:bg-purple-600 border-none">
              <BookOpen className="w-5 h-5 mr-2" /> Create Storybook
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PartyPackSection ──────────────────────────────────────────────────────────

function PartyPackSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            <Package className="w-4 h-4" /> Perfect for Parties
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Birthday party coloring books in one click 🎉
          </h2>
          <p className="font-body text-foreground/70 text-lg mb-6">
            Generate a themed 20-page coloring book with a personalized cover — ready to print at home or at a copy shop.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Choose dinosaurs, unicorns, space, superheroes, and more",
              "Personalized cover page with the child's name",
              "Print-ready PDF — 20 unique coloring pages",
              "Great for birthday parties and classrooms",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 font-body text-foreground/80">
                <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" /><span>{t}</span>
              </li>
            ))}
          </ul>
          <Link href="/parent">
            <Button variant="primary" size="xl" className="bg-orange-500 hover:bg-orange-600 border-none">
              <Package className="w-5 h-5 mr-2" /> Make a Birthday Coloring Book
            </Button>
          </Link>
        </motion.div>

        {/* Visual */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="relative flex justify-center">
          <div className="relative w-56 h-72 sm:w-64 sm:h-80">
            {[3,2,1,0].map((offset) => (
              <div key={offset}
                className="absolute inset-0 bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col items-center justify-center gap-3"
                style={{ transform: `rotate(${(offset-1.5)*3}deg) translateY(${offset*-4}px)` }}>
                {offset === 0 ? (
                  <>
                    <span className="text-4xl">🎂</span>
                    <p className="font-display text-xs font-bold text-gray-700 text-center px-4 leading-snug">
                      Emma&apos;s Unicorn<br />Birthday Coloring Book
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-5xl">{["🦕","🚀","🦄"][offset-1]}</span>
                    <div className="text-xs text-gray-400 font-body">Page {offset+1}</div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500 text-white rounded-full flex flex-col items-center justify-center shadow-lg">
            <span className="text-xl font-bold leading-none">20</span>
            <span className="text-[9px] font-semibold">pages</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── TeacherSection ────────────────────────────────────────────────────────────

const WORKSHEET_CHIPS = ["Alphabet tracing","Math coloring","Sight words","Science topics","Holiday activities"];

function TeacherSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            <PenLine className="w-4 h-4" /> For Teachers 🍎
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Worksheets for teachers
          </h2>
          <p className="font-body text-foreground/70 text-lg mb-5">
            Create classroom-ready coloring worksheets for letters, math, reading, holidays, and science topics.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {WORKSHEET_CHIPS.map((chip) => (
              <span key={chip} className="font-body text-sm bg-white border border-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {chip}
              </span>
            ))}
          </div>
          <Link href="/teacher">
            <Button variant="primary" size="xl" className="bg-blue-500 hover:bg-blue-600 border-none">
              <PenLine className="w-5 h-5 mr-2" /> Create Teacher Worksheet
            </Button>
          </Link>
        </motion.div>

        {/* Visual */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="relative flex justify-center">
          <div className="w-56 sm:w-64 bg-white rounded-2xl shadow-card border border-gray-100 p-4 flex flex-col gap-3">
            <div className="text-center font-display font-bold text-sm text-gray-700 pb-2 border-b border-gray-100">
              Alphabet Coloring Worksheet
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 font-body">
              <span>Name: _______________</span><span>Grade: ___</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["🌍","🌙","⭐","🚀"].map((emoji, i) => (
                <div key={i} className="aspect-square bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                  <span className="text-2xl">{emoji}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 rounded-lg p-2 text-center">
              <p className="text-white text-[8px] font-bold leading-tight">✨ Generated by CreateColor.com</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── AppSection ────────────────────────────────────────────────────────────────

function AppSection() {
  return (
    <section className="py-12 px-4 bg-foreground">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-display text-white text-2xl font-bold">Create on the go 📱</p>
          <p className="font-body text-white/60 mt-1">Use Create &amp; Color on iPhone for quick coloring ideas anywhere.</p>
        </div>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
        >
          <Apple className="w-7 h-7" />
          <div className="text-left">
            <div className="text-xs text-black/60">Download on the</div>
            <div className="text-base font-semibold -mt-0.5">App Store</div>
          </div>
        </a>
      </div>
    </section>
  );
}

// ─── FinalCTA ──────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #FF6B6B 0%, #A855F7 100%)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4">
          Make your first coloring page free ✨
        </h2>
        <p className="font-body text-white/90 text-lg mb-8">
          Pick an idea, generate a page, and print it in under 60 seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/create">
            <Button variant="accent" size="xl">
              <Sparkles className="w-5 h-5 mr-2" /> Start Creating Free
            </Button>
          </Link>
          <Link href="/storybook">
            <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/20 hover:text-white">
              <BookOpen className="w-5 h-5 mr-2" /> Create Storybook
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { href: "/create",    label: "Create",     external: false },
      { href: "/storybook", label: "Storybook",  external: false },
      { href: "/gallery",   label: "Gallery",    external: false },
      { href: "/teacher",   label: "Worksheets", external: false },
    ],
  },
  {
    title: "For Parents",
    links: [
      { href: "/parent",    label: "Party Packs",        external: false },
      { href: "/upload",    label: "Photo to Coloring",  external: false },
      { href: "/community", label: "Safety",             external: false },
    ],
  },
  {
    title: "For Teachers",
    links: [
      { href: "/teacher",   label: "Free Worksheets",       external: false },
      { href: "/teacher",   label: "Classroom Printables",  external: false },
    ],
  },
  {
    title: "App",
    links: [
      { href: APP_STORE_URL, label: "Get iOS App", external: true },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-foreground text-white px-4 pt-12 pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer"
                        className="font-body text-sm text-white/65 hover:text-white transition-colors">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="font-body text-sm text-white/65 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-display text-xl">Create<span className="text-primary">and</span>Color</div>
          <p className="font-body text-sm text-white/40">© 2026 Create &amp; Color. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── HomePage ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">

      {/* MOBILE: full creation UI */}
      <MobileCreateView />

      {/* DESKTOP: landing page */}
      <div className="hidden md:block">
        <DesktopHero />
        <TrustStrip />
        <HowItWorks />
        <SampleGallery />
        <StorybookSection />
        <PartyPackSection />
        <TeacherSection />
        <AppSection />
        <FinalCTA />
        <Footer />
      </div>
    </main>
  );
}
