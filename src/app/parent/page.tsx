"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PartyPackBuilder } from "@/components/parent/PartyPackBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Palette, Printer, Calendar, Settings, Shield, AlertTriangle, Check } from "lucide-react";
import { PrintLayout } from "@/types";

// Theme categories for whitelist
const THEME_CATEGORIES = [
  { id: "animals", label: "Animals", emoji: "🐱", default: true },
  { id: "fantasy", label: "Fantasy", emoji: "🦄", default: true },
  { id: "space", label: "Space", emoji: "🚀", default: true },
  { id: "food", label: "Food", emoji: "🍕", default: true },
  { id: "sports", label: "Sports", emoji: "⚽", default: true },
  { id: "nature", label: "Nature", emoji: "🌲", default: true },
  { id: "superheroes", label: "Superheroes", emoji: "🦸", default: false },
  { id: "monsters", label: "Monsters (mild)", emoji: "👻", default: false },
];

interface PartyPackResult {
  pdfUrl: string;
  pageCount: number;
}

export default function ParentPage() {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PartyPackResult | null>(null);
  const [partyPackError, setPartyPackError] = useState<string | null>(null);

  // Safety Settings
  const [strictMode, setStrictMode] = useState(true);
  const [allowedThemes, setAllowedThemes] = useState<string[]>(
    THEME_CATEGORIES.filter(t => t.default).map(t => t.id)
  );
  const [allowCommunitySharing, setAllowCommunitySharing] = useState(false);
  const [flaggedAttempts, setFlaggedAttempts] = useState<Array<{
    id: string;
    date: string;
    category: string;
  }>>([]);

  // Load flagged attempts
  useEffect(() => {
    if (session?.user) {
      fetchFlaggedAttempts();
    }
  }, [session]);

  const fetchFlaggedAttempts = async () => {
    try {
      const response = await fetch("/api/safety/flagged");
      if (response.ok) {
        const data = await response.json();
        setFlaggedAttempts(data.attempts || []);
      }
    } catch (error) {
      console.error("Failed to fetch flagged attempts:", error);
    }
  };

  const handleThemeToggle = (themeId: string) => {
    setAllowedThemes(prev =>
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleGeneratePartyPack = async (config: {
    theme: string;
    count: number;
    layout: PrintLayout;
    childName?: string;
  }) => {
    setIsGenerating(true);
    setProgress(0);
    setResult(null);
    setPartyPackError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 1000);

      const response = await fetch("/api/party-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        setPartyPackError(data.message || "Failed to generate party pack. Please try again.");
        return;
      }

      setResult({
        pdfUrl: data.pdfUrl,
        pageCount: data.pageCount,
      });
    } catch (error) {
      console.error("Failed to generate party pack:", error);
      setPartyPackError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Demo stats
  const stats = [
    { label: "Pages Created", value: 24, icon: Palette, color: "text-primary" },
    { label: "Pages Printed", value: 12, icon: Printer, color: "text-secondary" },
    { label: "This Week", value: 5, icon: Calendar, color: "text-purple" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm">Back</span>
          </Link>
          <h1 className="font-display text-lg font-bold">Parent Portal</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-5 h-5 text-foreground/70" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-4 text-center">
                  <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="font-body text-xs text-gray-500">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Party Pack Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PartyPackBuilder
            onGenerate={handleGeneratePartyPack}
            isGenerating={isGenerating}
            progress={progress}
            result={result}
            error={partyPackError}
          />
        </motion.div>

        {/* Print History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-secondary" />
                Print History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Demo print history items */}
                {[
                  { date: "Today", layout: "Single", pages: 3 },
                  { date: "Yesterday", layout: "Party Pack (10)", pages: 10 },
                  { date: "Dec 15", layout: "Double", pages: 4 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <div className="font-body text-sm">{item.layout}</div>
                      <div className="font-body text-xs text-gray-500">{item.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-sm text-gray-500">
                        {item.pages} pages
                      </span>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Safety Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Safety Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Strict Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div>
                    <div className="font-display text-sm font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      Strict Mode
                    </div>
                    <div className="font-body text-xs text-gray-500 mt-1">
                      Only allows pre-approved themes (recommended for ages 3-7)
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={strictMode}
                      onChange={(e) => setStrictMode(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Theme Whitelist */}
                <AnimatePresence>
                  {strictMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="font-display text-sm font-semibold mb-3">
                        Allowed Themes
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {THEME_CATEGORIES.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => handleThemeToggle(theme.id)}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                              allowedThemes.includes(theme.id)
                                ? "border-primary bg-primary/10"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <span className="text-xl">{theme.emoji}</span>
                            <span className="font-body text-sm">{theme.label}</span>
                            {allowedThemes.includes(theme.id) && (
                              <Check className="w-4 h-4 text-primary ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Community Sharing */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div>
                    <div className="font-display text-sm font-semibold">Allow Community Sharing</div>
                    <div className="font-body text-xs text-gray-500">
                      Let your child share pages to the community gallery
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={allowCommunitySharing}
                      onChange={(e) => setAllowCommunitySharing(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flagged Attempts Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Flagged Attempts
                {flaggedAttempts.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                    {flaggedAttempts.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedAttempts.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-2 text-green-300" />
                  <p className="font-body text-sm">No flagged attempts</p>
                  <p className="font-body text-xs text-gray-400 mt-1">
                    All content has been appropriate
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flaggedAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl"
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-body text-sm">
                          Blocked: {attempt.category}
                        </div>
                        <div className="font-body text-xs text-gray-500">
                          {attempt.date}
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="font-body text-xs text-gray-500 text-center mt-2">
                    Actual prompts are hidden for privacy
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </main>
    </div>
  );
}
