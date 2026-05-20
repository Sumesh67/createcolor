"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PrintLayout } from "@/types";
import { cn } from "@/lib/utils";
import * as Slider from "@radix-ui/react-slider";

interface PartyPackBuilderProps {
  onGenerate: (config: PartyPackConfig) => Promise<void>;
  isGenerating?: boolean;
  progress?: number;
  result?: { pdfUrl: string; pageCount: number } | null;
}

interface PartyPackConfig {
  theme: string;
  count: number;
  layout: PrintLayout;
  childName?: string;
}

const THEME_SUGGESTIONS = [
  { emoji: "🦁", label: "Jungle Animals" },
  { emoji: "🚀", label: "Space Adventure" },
  { emoji: "🧜‍♀️", label: "Underwater World" },
  { emoji: "🏰", label: "Fairy Tale" },
  { emoji: "🦖", label: "Dinosaurs" },
  { emoji: "🦸", label: "Superheroes" },
  { emoji: "🦋", label: "Butterflies & Flowers" },
  { emoji: "🎪", label: "Circus Fun" },
];

const LAYOUT_OPTIONS: { id: PrintLayout; label: string; description: string }[] = [
  { id: "single", label: "1 per page", description: "Full-size coloring pages" },
  { id: "double", label: "2 per page", description: "Side by side" },
  { id: "quad", label: "4 per page", description: "2x2 grid layout" },
];

export function PartyPackBuilder({
  onGenerate,
  isGenerating = false,
  progress = 0,
  result = null,
}: PartyPackBuilderProps) {
  const [theme, setTheme] = useState("");
  const [count, setCount] = useState(10);
  const [layout, setLayout] = useState<PrintLayout>("single");
  const [childName, setChildName] = useState("");

  const handleGenerate = async () => {
    if (!theme.trim()) return;
    await onGenerate({ theme, count, layout, childName: childName.trim() || undefined });
  };

  const handleDownload = () => {
    if (!result?.pdfUrl) return;
    const a = document.createElement("a");
    a.href = result.pdfUrl;
    a.download = `party-pack.pdf`;
    a.click();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          Party Pack Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Input */}
        <div>
          <label className="block font-display text-sm font-semibold mb-2">
            Theme
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., Dinosaur birthday party"
            className={cn(
              "w-full px-4 py-3 rounded-xl border border-gray-200",
              "font-body text-foreground placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            )}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {THEME_SUGGESTIONS.map((suggestion) => (
              <motion.button
                key={suggestion.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(suggestion.label)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-colors",
                  theme === suggestion.label
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-gray-200 hover:border-primary"
                )}
              >
                {suggestion.emoji} {suggestion.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Page Count */}
        <div>
          <label className="block font-display text-sm font-semibold mb-2">
            Number of Pages: {count}
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[count]}
            onValueChange={([value]) => setCount(value)}
            min={1}
            max={20}
            step={1}
          >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-6 h-6 bg-primary rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
          </Slider.Root>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        {/* Layout Selection */}
        <div>
          <label className="block font-display text-sm font-semibold mb-2">
            Layout
          </label>
          <div className="grid grid-cols-3 gap-3">
            {LAYOUT_OPTIONS.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLayout(option.id)}
                className={cn(
                  "p-3 rounded-xl border-2 text-center transition-colors",
                  layout === option.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="font-display text-sm font-semibold">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {option.description}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Child Name (Optional) */}
        <div>
          <label className="block font-display text-sm font-semibold mb-2">
            Child&apos;s Name (Optional)
          </label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="For the cover page"
            className={cn(
              "w-full px-4 py-3 rounded-xl border border-gray-200",
              "font-body text-foreground placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            )}
          />
        </div>

        {/* Progress */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
              <motion.div
                className="bg-primary h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Generating page {Math.ceil((progress / 100) * count)} of {count}...
            </p>
          </motion.div>
        )}

        {/* Result */}
        {result && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-semibold text-green-800">
                  Party Pack Ready!
                </p>
                <p className="text-sm text-green-600">
                  {result.pageCount} coloring pages generated
                </p>
              </div>
              <Button variant="primary" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </motion.div>
        )}

        {/* Generate Button */}
        {!result && (
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={handleGenerate}
            disabled={!theme.trim() || isGenerating}
            isLoading={isGenerating}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Party Pack
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
