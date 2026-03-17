"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Image as ImageIcon, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MagicLensUploadProps {
  onImageConverted: (imageUrl: string, prompt: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

type DetailLevel = "simple" | "medium" | "detailed";

export function MagicLensUpload({
  onImageConverted,
  isProcessing,
  setIsProcessing,
}: MagicLensUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("medium");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large. Please upload an image under 10MB.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!preview || !fileInputRef.current?.files?.[0]) return;

    setIsProcessing(true);
    setError(null);

    try {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append("image", file);
      formData.append("style", detailLevel);

      const response = await fetch("/api/convert-photo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Conversion failed");
      }

      onImageConverted(data.imageUrl, "Photo converted with Magic Lens");
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  }, [preview, detailLevel, onImageConverted, setIsProcessing]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
        // Create a DataTransfer to set the file input
        const dt = new DataTransfer();
        dt.items.add(file);
        if (fileInputRef.current) {
          fileInputRef.current.files = dt.files;
        }
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          📷 Magic Lens
        </h2>
        <p className="font-body text-foreground/70">
          Turn any photo into a coloring page!
        </p>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 border border-red-200 rounded-xl text-center"
          >
            <p className="font-body text-red-600 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={handleInputChange}
        capture="environment"
      />

      {!preview ? (
        <motion.div
          className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Camera className="w-8 h-8 text-primary" />
              </motion.div>
              <motion.div
                className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <ImageIcon className="w-8 h-8 text-secondary" />
              </motion.div>
            </div>

            <div>
              <p className="font-display text-lg font-semibold text-foreground mb-1">
                Drop a photo here
              </p>
              <p className="font-body text-sm text-foreground/60">
                or tap to take a photo / choose from gallery
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Remove capture attribute to show gallery
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute("capture");
                    fileInputRef.current.click();
                  }
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>

            <p className="font-body text-xs text-foreground/40">
              JPG, PNG, WEBP • Max 10MB
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />

              {/* Processing Overlay */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent mb-4"
                  />
                  <p className="font-display text-lg font-semibold text-foreground">
                    Processing your photo...
                  </p>
                  <motion.p
                    className="font-body text-sm text-foreground/60 mt-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✨ Adding magic ✨
                  </motion.p>
                </motion.div>
              )}
            </motion.div>

            {/* Clear Button */}
            {!isProcessing && (
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Detail Level Selector */}
          <div>
            <label className="block font-display text-sm font-semibold mb-2">
              Line Detail
            </label>
            <div className="flex gap-2">
              {[
                { id: "simple", label: "Simple", desc: "Bold lines, easy to color" },
                { id: "medium", label: "Medium", desc: "Balanced detail" },
                { id: "detailed", label: "Detailed", desc: "More intricate lines" },
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setDetailLevel(level.id as DetailLevel)}
                  disabled={isProcessing}
                  className={`flex-1 p-3 rounded-xl border-2 text-center transition-colors ${
                    detailLevel === level.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="font-display text-sm font-semibold">{level.label}</div>
                  <div className="font-body text-xs text-foreground/60 mt-1">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Convert Button */}
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={handleConvert}
            disabled={isProcessing}
            isLoading={isProcessing}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isProcessing ? "Creating Magic..." : "Convert to Coloring Page"}
          </Button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-white rounded-xl p-4 shadow-card">
        <p className="font-display text-sm font-semibold mb-2">💡 Tips for best results:</p>
        <ul className="font-body text-xs text-foreground/70 space-y-1">
          <li>• Use photos with clear subjects (pets, toys, people)</li>
          <li>• Good lighting helps create cleaner outlines</li>
          <li>• Simple backgrounds work better than busy ones</li>
          <li>• Close-up photos produce better coloring pages</li>
        </ul>
      </div>
    </div>
  );
}
