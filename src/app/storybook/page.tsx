"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  X,
  Rocket,
  Waves,
  Castle,
  Trees,
  Sparkles,
  BookOpen,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CharacterUpload {
  id: string;
  file: File | null;
  preview: string | null;
  label: string;
}

interface StoryPage {
  pageNumber: number;
  storyText: string;
  illustrationDescription: string;
  imageUrl?: string;
}

interface GeneratedStorybook {
  title: string;
  characters: Array<{ label: string; description: string }>;
  pages: StoryPage[];
  pdfUrl?: string;
}

type Theme = "space" | "ocean" | "fairytale" | "dinosaur" | "forest";
type OutputStyle = "outline" | "colored";

const THEMES: Array<{ id: Theme; emoji: string; label: string; color: string }> = [
  { id: "space", emoji: "🚀", label: "Space Adventure", color: "bg-purple-500" },
  { id: "ocean", emoji: "🌊", label: "Ocean Quest", color: "bg-cyan-500" },
  { id: "fairytale", emoji: "🏰", label: "Fairy Tale Kingdom", color: "bg-pink-500" },
  { id: "dinosaur", emoji: "🦕", label: "Dinosaur Land", color: "bg-green-500" },
  { id: "forest", emoji: "🌈", label: "Magical Forest", color: "bg-emerald-500" },
];

const LOADING_STEPS = [
  { step: 1, text: "Meeting your characters...", emoji: "👋" },
  { step: 2, text: "Writing your adventure...", emoji: "✍️" },
  { step: 3, text: "Drawing the pages...", emoji: "🎨" },
  { step: 4, text: "Binding your book...", emoji: "📚" },
];

const createEmptySlot = (): CharacterUpload => ({
  id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  file: null,
  preview: null,
  label: "",
});

export default function StorybookPage() {
  const [characters, setCharacters] = useState<CharacterUpload[]>([
    createEmptySlot(),
    createEmptySlot(),
    createEmptySlot(),
  ]);
  const [selectedTheme, setSelectedTheme] = useState<Theme>("space");
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("colored");
  const [childName, setChildName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedStorybook, setGeneratedStorybook] = useState<GeneratedStorybook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const uploadedCount = characters.filter((c) => c.file !== null).length;
  const canGenerate = uploadedCount >= 1 && characters.every((c) => !c.file || c.label.trim());

  const handleFileSelect = useCallback((slotId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === slotId
            ? { ...c, file, preview: e.target?.result as string }
            : c
        )
      );
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemove = useCallback((slotId: string) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === slotId ? { ...c, file: null, preview: null, label: "" } : c
      )
    );
  }, []);

  const handleLabelChange = useCallback((slotId: string, label: string) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === slotId ? { ...c, label } : c))
    );
  }, []);

  const addSlot = useCallback(() => {
    if (characters.length < 5) {
      setCharacters((prev) => [...prev, createEmptySlot()]);
    }
  }, [characters.length]);

  const removeSlot = useCallback((slotId: string) => {
    if (characters.length > 3) {
      setCharacters((prev) => prev.filter((c) => c.id !== slotId));
    }
  }, [characters.length]);

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setCurrentStep(1);

    try {
      const uploadedCharacters = characters.filter((c) => c.file && c.label.trim());

      // Step 1: Analyze characters
      setCurrentStep(1);
      const analyzeResponse = await fetch("/api/storybook/analyze-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characters: uploadedCharacters.map((c) => ({
            imageBase64: c.preview?.split(",")[1],
            label: c.label.trim(),
          })),
        }),
      });

      if (!analyzeResponse.ok) {
        const data = await analyzeResponse.json();
        throw new Error(data.message || "Failed to analyze characters");
      }

      const { characters: analyzedCharacters } = await analyzeResponse.json();

      // Step 2: Generate story
      setCurrentStep(2);
      const storyResponse = await fetch("/api/storybook/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characters: analyzedCharacters,
          theme: selectedTheme,
          childName: childName.trim() || undefined,
        }),
      });

      if (!storyResponse.ok) {
        const data = await storyResponse.json();
        throw new Error(data.message || "Failed to generate story");
      }

      const { story } = await storyResponse.json();

      // Step 3: Generate illustrations with reference images
      setCurrentStep(3);
      const illustrateResponse = await fetch("/api/storybook/generate-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characters: analyzedCharacters,
          pages: story.pages,
          referenceImages: uploadedCharacters.map((c) => c.preview), // Pass base64 images
          outputStyle, // "outline" for coloring pages, "colored" for full color
        }),
      });

      if (!illustrateResponse.ok) {
        const data = await illustrateResponse.json();
        throw new Error(data.message || "Failed to generate illustrations");
      }

      const { pages: illustratedPages } = await illustrateResponse.json();

      // Step 4: Generate PDF
      setCurrentStep(4);
      const pdfResponse = await fetch("/api/storybook/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: story.title || `${childName || "Our"}'s Big Adventure!`,
          characters: analyzedCharacters,
          pages: illustratedPages,
          theme: selectedTheme,
        }),
      });

      if (!pdfResponse.ok) {
        const data = await pdfResponse.json();
        throw new Error(data.message || "Failed to generate PDF");
      }

      const { pdfUrl } = await pdfResponse.json();

      setGeneratedStorybook({
        title: story.title || `${childName || "Our"}'s Big Adventure!`,
        characters: analyzedCharacters,
        pages: illustratedPages,
        pdfUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
      setCurrentStep(0);
    }
  };

  const resetStorybook = () => {
    setGeneratedStorybook(null);
    setCharacters([createEmptySlot(), createEmptySlot(), createEmptySlot()]);
    setChildName("");
    setSelectedTheme("space");
    setOutputStyle("colored");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm">Back</span>
          </Link>
          <h1 className="font-display text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Storybook Creator
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Show Result or Form */}
        {generatedStorybook ? (
          <StorybookResult
            storybook={generatedStorybook}
            onReset={resetStorybook}
          />
        ) : isGenerating ? (
          <GeneratingAnimation currentStep={currentStep} />
        ) : (
          <>
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                Create Your Own Storybook! 📖
              </h2>
              <p className="font-body text-foreground/70">
                Upload photos of your family, pets, or toys and watch them become the stars of an adventure!
              </p>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center"
                >
                  <p className="font-body text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Child's Name (Optional) */}
            <div className="mb-6">
              <label className="block font-display text-sm font-semibold mb-2">
                Child&apos;s Name (optional)
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter name for a personalized story..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-body"
              />
            </div>

            {/* Character Upload Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="font-display text-sm font-semibold">
                  Your Characters ({uploadedCount}/5)
                </label>
                {characters.length < 5 && (
                  <button
                    onClick={addSlot}
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    + Add Character
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {characters.map((char, index) => (
                  <CharacterSlot
                    key={char.id}
                    character={char}
                    index={index}
                    canRemove={characters.length > 3}
                    onFileSelect={(file) => handleFileSelect(char.id, file)}
                    onRemove={() => handleRemove(char.id)}
                    onRemoveSlot={() => removeSlot(char.id)}
                    onLabelChange={(label) => handleLabelChange(char.id, label)}
                    inputRef={(el) => (fileInputRefs.current[char.id] = el)}
                  />
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="mb-8">
              <label className="block font-display text-sm font-semibold mb-4">
                Choose Your Adventure Theme
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedTheme === theme.id
                        ? `border-purple-500 bg-purple-50 shadow-lg scale-105`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{theme.emoji}</div>
                    <div className="font-display text-xs font-semibold">{theme.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Output Style Selector */}
            <div className="mb-8">
              <label className="block font-display text-sm font-semibold mb-4">
                Output Style
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "outline", emoji: "✏️", label: "Outline Only", desc: "B&W for coloring later" },
                  { id: "colored", emoji: "🎨", label: "With Color", desc: "Full color illustrations" },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setOutputStyle(style.id as OutputStyle)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      outputStyle === style.id
                        ? "border-purple-500 bg-purple-50 shadow-lg scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{style.emoji}</div>
                    <div className="font-display text-sm font-semibold">{style.label}</div>
                    <div className="font-body text-xs text-foreground/60 mt-1">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="primary"
                size="xl"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Create Our Story! 📖
              </Button>

              {!canGenerate && uploadedCount > 0 && (
                <p className="text-center text-sm text-orange-600 mt-2 font-body">
                  Please name all your characters before creating the story
                </p>
              )}

              {uploadedCount === 0 && (
                <p className="text-center text-sm text-gray-500 mt-2 font-body">
                  Upload at least 1 character to get started
                </p>
              )}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}

// Character Upload Slot Component
function CharacterSlot({
  character,
  index,
  canRemove,
  onFileSelect,
  onRemove,
  onRemoveSlot,
  onLabelChange,
  inputRef,
}: {
  character: CharacterUpload;
  index: number;
  canRemove: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  onRemoveSlot: () => void;
  onLabelChange: (label: string) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <input
        id={`file-${character.id}`}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />

      {/* Upload Area */}
      {character.preview ? (
        <div
          className="aspect-square rounded-xl border-2 border-green-400 bg-green-50 overflow-hidden transition-all relative"
        >
          <Image
            src={character.preview}
            alt={character.label || "Character"}
            fill
            className="object-cover"
          />
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={`file-${character.id}`}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 cursor-pointer bg-white hover:bg-purple-50 overflow-hidden transition-all flex flex-col items-center justify-center text-gray-400"
        >
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-xs font-body">Upload</span>
        </label>
      )}

      {/* Label Input */}
      <input
        type="text"
        value={character.label}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder="Who is this?"
        disabled={!character.preview}
        className={`w-full mt-2 px-3 py-2 rounded-lg border text-sm font-body text-center ${
          character.preview
            ? "border-gray-200 focus:border-purple-400"
            : "border-gray-100 bg-gray-50 cursor-not-allowed"
        } focus:outline-none`}
      />

      {/* Remove Slot Button */}
      {canRemove && !character.preview && (
        <button
          onClick={onRemoveSlot}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300 text-xs"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}

// Generating Animation Component
function GeneratingAnimation({ currentStep }: { currentStep: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 rounded-full border-4 border-purple-200 border-t-purple-500 mb-8"
      />

      <div className="space-y-4 w-full max-w-sm">
        {LOADING_STEPS.map((step) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: currentStep >= step.step ? 1 : 0.3,
              scale: currentStep === step.step ? 1.05 : 1,
            }}
            className={`flex items-center gap-3 p-4 rounded-xl ${
              currentStep === step.step
                ? "bg-purple-100 border-2 border-purple-300"
                : currentStep > step.step
                ? "bg-green-100 border-2 border-green-300"
                : "bg-gray-100"
            }`}
          >
            <span className="text-2xl">{step.emoji}</span>
            <span className="font-display font-semibold">{step.text}</span>
            {currentStep > step.step && (
              <span className="ml-auto text-green-500">✓</span>
            )}
            {currentStep === step.step && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ml-auto"
              >
                ⏳
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Storybook Result Component
function StorybookResult({
  storybook,
  onReset,
}: {
  storybook: GeneratedStorybook;
  onReset: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Your Storybook is Ready!
        </h2>
        <p className="font-body text-foreground/70">{storybook.title}</p>
      </div>

      {/* Page Preview */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Page Navigation */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="font-display font-semibold">
            Page {currentPage + 1} of {storybook.pages.length}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(storybook.pages.length - 1, currentPage + 1))}
            disabled={currentPage === storybook.pages.length - 1}
            className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
          >
            Next →
          </button>
        </div>

        {/* Current Page */}
        <div className="p-6">
          {storybook.pages[currentPage]?.imageUrl && (
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-100">
              <Image
                src={storybook.pages[currentPage].imageUrl!}
                alt={`Page ${currentPage + 1}`}
                fill
                className="object-contain"
              />
            </div>
          )}
          <p className="font-body text-lg text-center text-foreground leading-relaxed">
            {storybook.pages[currentPage]?.storyText}
          </p>
        </div>

        {/* Page Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {storybook.pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === currentPage ? "bg-purple-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {storybook.pdfUrl && (
          <a
            href={storybook.pdfUrl}
            download={`${storybook.title.replace(/[^a-z0-9]/gi, "-")}.pdf`}
            className="flex-1"
          >
            <Button variant="primary" size="lg" className="w-full">
              <Download className="w-5 h-5 mr-2" />
              Download Storybook PDF
            </Button>
          </a>
        )}
        <Button variant="outline" size="lg" className="flex-1" onClick={onReset}>
          <RefreshCw className="w-5 h-5 mr-2" />
          Create Another Story
        </Button>
      </div>

      {/* Characters Used */}
      <div className="bg-white rounded-xl p-4">
        <p className="font-display text-sm font-semibold mb-3">Starring:</p>
        <div className="flex flex-wrap gap-2">
          {storybook.characters.map((char, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-body"
            >
              {char.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
