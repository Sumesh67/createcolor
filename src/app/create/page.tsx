"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SlotMachine } from "@/components/kid-mode/SlotMachine";
import { VoicePrompt } from "@/components/kid-mode/VoicePrompt";
import { TextPrompt } from "@/components/kid-mode/TextPrompt";
import { ColoringCanvas } from "@/components/kid-mode/ColoringCanvas";
import { EditPanel } from "@/components/kid-mode/EditPanel";
import { PrintDialog } from "@/components/ui/PrintDialog";
import { SaveDialog } from "@/components/ui/SaveDialog";
import { ReviewPrompt } from "@/components/ui/ReviewPrompt";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";
import { Button } from "@/components/ui/Button";
import { SlotSelections, EditMode, EditHistoryItem } from "@/types";
import { ArrowLeft, Dices, Mic, Pencil, Images } from "lucide-react";

type InputMode = "slots" | "voice" | "type";

export default function CreatePage() {
  const [inputMode, setInputMode] = useState<InputMode>("slots");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printCount, setPrintCount] = useState(0);

  // Load image with timeout and fallback
  const loadImageWithFallback = useCallback(async (
    primaryUrl: string,
    fallbackUrl: string,
    timeoutMs: number = 30000
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.log('[Image] Timeout, using fallback');
          resolve(fallbackUrl);
        }
      }, timeoutMs);

      img.onload = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.log('[Image] Loaded successfully from Pollinations');
          resolve(primaryUrl);
        }
      };

      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.log('[Image] Load error, using fallback');
          resolve(fallbackUrl);
        }
      };

      img.src = primaryUrl;
    });
  }, []);

  const handleGenerate = useCallback(async (selections: SlotSelections) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotSelections: selections }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate");
      }

      // Handle Pollinations URL - load client-side with fallback
      if (data.isPollinationsUrl && data.svgFallbackUrl) {
        const finalUrl = await loadImageWithFallback(data.imageUrl, data.svgFallbackUrl);
        setImageUrl(finalUrl);
      } else {
        setImageUrl(data.imageUrl);
      }

      setCurrentPrompt(data.prompt);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again!";
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [loadImageWithFallback]);

  const handleVoiceGenerate = useCallback(async (transcript: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPrompt: transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate");
      }

      // Handle Pollinations URL - load client-side with fallback
      if (data.isPollinationsUrl && data.svgFallbackUrl) {
        const finalUrl = await loadImageWithFallback(data.imageUrl, data.svgFallbackUrl);
        setImageUrl(finalUrl);
      } else {
        setImageUrl(data.imageUrl);
      }

      setCurrentPrompt(data.prompt);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again!";
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [loadImageWithFallback]);

  const handleEdit = useCallback(async (editMode: EditMode, editText: string) => {
    if (!currentPrompt) return;

    setIsEditing(true);
    setError(null);

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: currentPrompt,
          editMode,
          editText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply edit");
      }

      // Save to history
      setEditHistory((prev) => [
        ...prev,
        {
          id: data.editId,
          editMode,
          editText,
          imageUrl: imageUrl!,
          timestamp: new Date(),
        },
      ]);

      setImageUrl(data.newImageUrl);
      setCurrentPrompt(data.newPrompt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Couldn't apply that edit. Try again!";
      setError(errorMessage);
    } finally {
      setIsEditing(false);
    }
  }, [currentPrompt, imageUrl]);

  const handleUndo = useCallback((editId: string) => {
    const editIndex = editHistory.findIndex((e) => e.id === editId);
    if (editIndex > 0) {
      const previousEdit = editHistory[editIndex - 1];
      setImageUrl(previousEdit.imageUrl);
      setEditHistory((prev) => prev.slice(0, editIndex));
    } else if (editIndex === 0 && editHistory.length > 0) {
      // Revert to original
      setImageUrl(editHistory[0].imageUrl);
      setEditHistory([]);
    }
  }, [editHistory]);

  const handlePrint = useCallback(async () => {
    // For now, just trigger browser print
    window.print();
  }, []);

  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `coloring-page-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl]);

  const handleShare = useCallback(async () => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Coloring Page",
          text: "Check out this coloring page I made!",
          url: imageUrl,
        });
      } catch (_err) {
        // User cancelled or error
      }
    } else {
      // Copy to clipboard
      await navigator.clipboard.writeText(imageUrl);
      alert("Link copied to clipboard!");
    }
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-background">
      <ConfettiEffect isActive={showConfetti} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm">Back</span>
          </Link>
          <h1 className="font-display text-lg font-bold">
            Create<span className="text-primary">and</span>Color
          </h1>
          <Link href="/gallery" className="flex items-center gap-1 text-foreground/70 hover:text-foreground">
            <Images className="w-5 h-5" />
            <span className="font-body text-sm">Gallery</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl p-1 shadow-card inline-flex">
            <button
              onClick={() => setInputMode("slots")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display text-sm transition-colors ${
                inputMode === "slots"
                  ? "bg-primary text-white"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Dices className="w-4 h-4" />
              Spin It
            </button>
            <button
              onClick={() => setInputMode("voice")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display text-sm transition-colors ${
                inputMode === "voice"
                  ? "bg-secondary text-white"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Mic className="w-4 h-4" />
              Say It
            </button>
            <button
              onClick={() => setInputMode("type")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display text-sm transition-colors ${
                inputMode === "type"
                  ? "bg-purple text-white"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Pencil className="w-4 h-4" />
              Type It
            </button>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-center"
            >
              <p className="font-body text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <AnimatePresence mode="wait">
              {inputMode === "slots" && (
                <motion.div
                  key="slots"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <SlotMachine onGenerate={handleGenerate} isGenerating={isGenerating} />
                </motion.div>
              )}
              {inputMode === "voice" && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <VoicePrompt onTranscript={handleVoiceGenerate} isGenerating={isGenerating} />
                </motion.div>
              )}
              {inputMode === "type" && (
                <motion.div
                  key="type"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <TextPrompt onSubmit={handleVoiceGenerate} isGenerating={isGenerating} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Canvas Section */}
          <div>
            <ColoringCanvas
              imageUrl={imageUrl}
              isLoading={isGenerating}
              onEdit={() => setShowEditPanel(true)}
              onPrint={() => setShowPrintDialog(true)}
              onDownload={() => setShowSaveDialog(true)}
              onShare={handleShare}
            />
          </div>
        </div>

        {/* Quick Actions (when image is generated) */}
        {imageUrl && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="font-body text-foreground/60 text-sm mb-4">
              Like it? Make another one!
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setImageUrl(null);
                setCurrentPrompt("");
                setEditHistory([]);
              }}
            >
              Create New Page
            </Button>
          </motion.div>
        )}
      </main>

      {/* Edit Panel */}
      <EditPanel
        isOpen={showEditPanel}
        onClose={() => setShowEditPanel(false)}
        onApplyEdit={handleEdit}
        editHistory={editHistory}
        onUndo={handleUndo}
        isProcessing={isEditing}
      />

      {/* Print Dialog */}
      {imageUrl && (
        <PrintDialog
          isOpen={showPrintDialog}
          onClose={() => setShowPrintDialog(false)}
          imageUrl={imageUrl}
          onPrint={async () => {
            // Call print API to generate PDF and track print count
            try {
              const response = await fetch("/api/print", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl }),
              });
              const data = await response.json();
              if (data.printCount) {
                setPrintCount(data.printCount);
              }
            } catch (err) {
              console.error("Print tracking error:", err);
            }
            setShowPrintDialog(false);
            handlePrint();
          }}
        />
      )}

      {/* Review Prompt */}
      <ReviewPrompt printCount={printCount} />

      {/* Save Dialog */}
      {imageUrl && (
        <SaveDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          imageUrl={imageUrl}
          prompt={currentPrompt}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
