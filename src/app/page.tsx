"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Sparkles, Mic, Printer, Package, Upload, Users, Apple, BookOpen, PenLine } from "lucide-react";

const APP_STORE_URL = "https://apps.apple.com/app/id6760249757";
const FALLBACK_EMOJIS = ["🦄", "🦖", "🚀"];

export default function HomePage() {
  const [sampleImages, setSampleImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/gallery?public=true&limit=3")
      .then((r) => r.json())
      .then((d) => {
        if (d.pages?.length) {
          setSampleImages(d.pages.map((p: { thumbnailUrl?: string; imageUrl: string }) => p.thumbnailUrl || p.imageUrl));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:pt-32 sm:pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/20 rounded-full blur-xl" />
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent/30 rounded-full blur-xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl sm:text-6xl font-bold text-foreground mb-6">
              Turn imagination into{" "}
              <span className="text-primary">coloring pages!</span>{" "}
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block"
              >
                ✨
              </motion.span>
            </h1>
            <p className="font-body text-lg sm:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
              Create magical custom coloring pages for kids with AI. Just spin, speak, or type your idea - and watch it come to life!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            {/* Row 1 — primary actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button variant="primary" size="xl">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Creating
                </Button>
              </Link>
              <Link href="/storybook">
                <Button variant="secondary" size="xl">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Create Storybook
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="xl" className="py-[14px]">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Row 2 — secondary actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/parent">
                <Button variant="outline" size="lg" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <Package className="w-4 h-4 mr-2" />
                  Party Pack — 20 pages
                </Button>
              </Link>
              <Link href="/teacher">
                <Button variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  <PenLine className="w-4 h-4 mr-2" />
                  Teacher Worksheets — free
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* App Store Download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Apple className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xs opacity-80">Download on the</div>
                <div className="text-lg font-semibold -mt-1">App Store</div>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Animated Sample Pages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center gap-4 overflow-hidden"
        >
          {FALLBACK_EMOJIS.map((emoji, i) => (
            <motion.div
              key={i}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.2, type: "spring" }}
              className="w-32 h-40 sm:w-48 sm:h-60 bg-white rounded-2xl shadow-card overflow-hidden flex items-center justify-center"
            >
              {sampleImages[i] ? (
                <div className="relative w-full h-full">
                  <Image
                    src={sampleImages[i]}
                    alt="Coloring page example"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-5xl sm:text-7xl">{emoji}</span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                emoji: "🎰",
                title: "Spin or Speak",
                description: "Use our fun slot machine to mix characters, actions, and places - or just tell us what you want!",
              },
              {
                step: "2",
                emoji: "✨",
                title: "AI Magic",
                description: "Our AI creates a unique coloring page just for you in seconds!",
              },
              {
                step: "3",
                emoji: "🖨️",
                title: "Print & Color",
                description: "Download or print your page instantly. Time to get those crayons out!",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-4xl">{item.emoji}</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                <p className="font-body text-foreground/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">
            Features Kids & Parents Love
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Kid-Friendly Creator",
                description: "Simple slot machine interface perfect for little fingers",
                color: "text-primary",
                href: "/create",
              },
              {
                icon: Mic,
                title: "Voice Prompts",
                description: "Just say what you want to draw - no typing needed!",
                color: "text-secondary",
                href: "/create",
              },
              {
                icon: Printer,
                title: "Instant Print",
                description: "Download PDFs or print directly to your printer",
                color: "text-purple",
                href: "/create",
              },
              {
                icon: Package,
                title: "Party Packs",
                description: "Generate 20 themed coloring pages as a PDF — perfect for birthday parties",
                color: "text-accent",
                href: "/parent",
              },
              {
                icon: Upload,
                title: "Photo to Coloring",
                description: "Turn any photo into a coloring page outline",
                color: "text-primary",
                href: "/upload",
              },
              {
                icon: Users,
                title: "Community Gallery",
                description: "Share and discover coloring pages from other kids",
                color: "text-secondary",
                href: "/community",
              },
              {
                icon: BookOpen,
                title: "Storybook Creator",
                description: "Turn family photos into personalized AI storybooks!",
                color: "text-purple",
                href: "/storybook",
              },
              {
                icon: PenLine,
                title: "Teacher Worksheets",
                description: "Generate printable coloring worksheets for your class — free for teachers!",
                color: "text-blue-500",
                href: "/teacher",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link href={feature.href}>
                  <Card hover className="h-full cursor-pointer">
                    <CardContent className="pt-6">
                      <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                      <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                      <p className="font-body text-foreground/70 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Party Pack Feature Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                <Package className="w-4 h-4" />
                Perfect for Parties
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Party Pack — <span className="text-orange-500">20 coloring pages</span> in one click 🎉
              </h2>
              <p className="font-body text-foreground/70 text-lg mb-6">
                Planning a birthday? Generate a full themed coloring book instantly. Pick a theme, add the child&apos;s name, and download a print-ready PDF — no design skills needed.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { emoji: "🎨", text: "Choose any theme — dinosaurs, unicorns, space, superheroes & more" },
                  { emoji: "📄", text: "Up to 20 unique coloring pages, all different scenes" },
                  { emoji: "👶", text: "Personalised cover page with the child's name" },
                  { emoji: "🖨️", text: "Download as a single print-ready PDF" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 font-body text-foreground/80">
                    <span className="text-xl shrink-0">{item.emoji}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/parent">
                <Button variant="primary" size="xl" className="bg-orange-500 hover:bg-orange-600 border-none">
                  <Package className="w-5 h-5 mr-2" />
                  Create a Party Pack
                </Button>
              </Link>
            </motion.div>

            {/* Right: visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              {/* Stacked pages effect */}
              <div className="relative w-56 h-72 sm:w-64 sm:h-80">
                {[3, 2, 1, 0].map((offset) => (
                  <div
                    key={offset}
                    className="absolute inset-0 bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col items-center justify-center gap-3"
                    style={{ transform: `rotate(${(offset - 1.5) * 3}deg) translateY(${offset * -4}px)` }}
                  >
                    <span className="text-5xl">
                      {["🦕", "🚀", "🦄", "🎪"][offset]}
                    </span>
                    <div className="text-xs text-gray-400 font-body">Coloring page {offset + 1}</div>
                  </div>
                ))}
              </div>
              {/* Badge */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500 text-white rounded-full flex flex-col items-center justify-center shadow-lg">
                <span className="text-xl font-bold leading-none">20</span>
                <span className="text-[9px] font-semibold leading-none">pages</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Storybook Feature Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: visual */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center order-2 md:order-1"
            >
              <div className="relative w-56 h-72 sm:w-64 sm:h-80">
                {[
                  { emoji: "📸", label: "Upload photos" },
                  { emoji: "✨", label: "AI writes story" },
                  { emoji: "🎨", label: "AI illustrates" },
                  { emoji: "📖", label: "Your storybook!" },
                ].map((item, offset) => (
                  <div
                    key={offset}
                    className="absolute inset-0 bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col items-center justify-center gap-3"
                    style={{ transform: `rotate(${(offset - 1.5) * 3}deg) translateY(${offset * -4}px)` }}
                  >
                    <span className="text-5xl">{item.emoji}</span>
                    <div className="text-xs text-gray-400 font-body">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-500 text-white rounded-full flex flex-col items-center justify-center shadow-lg">
                <span className="text-xl font-bold leading-none">5</span>
                <span className="text-[9px] font-semibold leading-none">pages</span>
              </div>
            </motion.div>

            {/* Right: copy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                <BookOpen className="w-4 h-4" />
                For Families
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Storybook Creator — <span className="text-purple-500">your family, starring in a story</span> 📖
              </h2>
              <p className="font-body text-foreground/70 text-lg mb-6">
                Upload photos of your kids, pets, or favourite characters. Our AI writes a 5-page rhyming story and illustrates every page — then packages it as a printable PDF.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { emoji: "📸", text: "Upload photos of real characters — kids, pets, family members" },
                  { emoji: "✍️", text: "AI writes a unique 5-page rhyming story around your characters" },
                  { emoji: "🖼️", text: "Every page gets a custom AI illustration in coloring-book style" },
                  { emoji: "📄", text: "Download as a print-ready storybook PDF to read together" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 font-body text-foreground/80">
                    <span className="text-xl shrink-0">{item.emoji}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/storybook">
                <Button variant="primary" size="xl" className="bg-purple-500 hover:bg-purple-600 border-none">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Create Your Storybook
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Teacher Worksheets Feature Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                <PenLine className="w-4 h-4" />
                Free for Teachers
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Teacher Worksheets — <span className="text-blue-500">5 free worksheets</span> every week ✏️
              </h2>
              <p className="font-body text-foreground/70 text-lg mb-6">
                Sign up with your school email and get a free teacher account. Type a topic, pick a grade and worksheet type — AI generates a print-ready coloring worksheet in seconds.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { emoji: "🏫", text: "Free for .edu and school email addresses — no credit card needed" },
                  { emoji: "🎨", text: "4 worksheet types: Trace, Connect-the-Dots, Math, and Reading/Vocab" },
                  { emoji: "📐", text: "Grades K–8 supported — AI adjusts complexity automatically" },
                  { emoji: "✨", text: "Every worksheet prints with your name on it — parents see CreateColor.com on every page" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 font-body text-foreground/80">
                    <span className="text-xl shrink-0">{item.emoji}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/teacher">
                <Button variant="primary" size="xl" className="bg-blue-500 hover:bg-blue-600 border-none">
                  <PenLine className="w-5 h-5 mr-2" />
                  Generate a Worksheet
                </Button>
              </Link>
            </motion.div>

            {/* Right: visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <div className="w-56 sm:w-64 bg-white rounded-2xl shadow-card border border-gray-100 p-4 flex flex-col gap-3">
                {/* Worksheet header mock */}
                <div className="flex justify-between text-[10px] text-gray-500 font-body border-b border-gray-200 pb-2">
                  <span>Name: _______________</span>
                  <span>Date: _______</span>
                </div>
                {/* Worksheet body mock */}
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {["🪐", "🌍", "🔴", "🪐"].map((emoji, i) => (
                    <div key={i} className="aspect-square bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                      <span className="text-3xl">{emoji}</span>
                    </div>
                  ))}
                </div>
                {/* Viral footer mock */}
                <div className="bg-gray-900 rounded-lg p-2 text-center">
                  <p className="text-white text-[8px] font-bold leading-tight">
                    ✨ Generated for Smith&apos;s class by CreateColor.com
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                FREE ✓
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-purple">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Create Magic? ✨
          </h2>
          <p className="font-body text-white/90 text-lg mb-8">
            Start making personalized coloring pages for free!
          </p>
          <Link href="/create">
            <Button variant="accent" size="xl">
              Start Creating Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-foreground text-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-display text-xl">
            Create<span className="text-primary">and</span>Color
          </div>
          <div className="flex gap-6 font-body text-sm text-white/70">
            <Link href="/create" className="hover:text-white">Create</Link>
            <Link href="/storybook" className="hover:text-white">Storybook</Link>
            <Link href="/gallery" className="hover:text-white">Gallery</Link>
            <Link href="/community" className="hover:text-white">Community</Link>
            <Link href="/parent" className="hover:text-white">Parents</Link>
            <Link href="/teacher" className="hover:text-white">Worksheets</Link>
          </div>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            <Apple className="w-5 h-5" />
            <span className="text-sm">Get iOS App</span>
          </a>
        </div>
        <div className="max-w-5xl mx-auto mt-4 text-center">
          <p className="font-body text-sm text-white/50">
            © 2026 CreateAndColor. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
