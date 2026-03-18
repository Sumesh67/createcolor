"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Sparkles, Mic, Printer, Package, Upload, Users, Apple, BookOpen } from "lucide-react";

const APP_STORE_URL = "https://apps.apple.com/app/id6760249757";

export default function HomePage() {
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
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
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
              <Button variant="outline" size="xl">
                See How It Works
              </Button>
            </Link>
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
          {["🦄", "🦖", "🚀"].map((emoji, i) => (
            <motion.div
              key={emoji}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.2, type: "spring" }}
              className="w-32 h-40 sm:w-48 sm:h-60 bg-white rounded-2xl shadow-card flex items-center justify-center"
            >
              <span className="text-5xl sm:text-7xl">{emoji}</span>
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
              },
              {
                icon: Mic,
                title: "Voice Prompts",
                description: "Just say what you want to draw - no typing needed!",
                color: "text-secondary",
              },
              {
                icon: Printer,
                title: "Instant Print",
                description: "Download PDFs or print directly to your printer",
                color: "text-purple",
              },
              {
                icon: Package,
                title: "Party Packs",
                description: "Generate 20 themed pages at once for birthday parties",
                color: "text-accent",
              },
              {
                icon: Upload,
                title: "Photo to Coloring",
                description: "Turn any photo into a coloring page outline",
                color: "text-primary",
              },
              {
                icon: Users,
                title: "Community Gallery",
                description: "Share and discover coloring pages from other kids",
                color: "text-secondary",
              },
              {
                icon: BookOpen,
                title: "Storybook Creator",
                description: "Turn family photos into personalized AI storybooks!",
                color: "text-purple",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Card hover className="h-full">
                  <CardContent className="pt-6">
                    <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                    <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="font-body text-foreground/70 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
