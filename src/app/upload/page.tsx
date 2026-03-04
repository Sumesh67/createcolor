"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Upload, Camera, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Slider from "@radix-ui/react-slider";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [threshold, setThreshold] = useState(128);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Show original
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process image
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process image");
      }

      setProcessedImage(data.imageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUseImage = useCallback(() => {
    if (processedImage) {
      // In a real app, we'd save this to state/context and redirect
      router.push("/create");
    }
  }, [processedImage, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm">Back</span>
          </Link>
          <h1 className="font-display text-lg font-bold">Photo to Coloring</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!originalImage ? (
          /* Upload Zone */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "border-2 border-dashed border-gray-300 rounded-3xl p-12",
              "flex flex-col items-center justify-center min-h-[400px]",
              "cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
            />

            <Upload className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">
              Drop a photo here
            </h2>
            <p className="font-body text-gray-500 text-center mb-6">
              or click to choose an image
            </p>

            <div className="flex gap-3">
              <Button variant="primary">
                <Upload className="w-4 h-4 mr-2" />
                Choose Photo
              </Button>
              <Button
                variant="outline"
                onClick={(e) => {
                  e?.stopPropagation();
                  // On mobile, this would trigger camera
                  fileInputRef.current?.click();
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Preview Section */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Side by Side Preview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="bg-white rounded-2xl shadow-card p-4">
                <h3 className="font-display text-sm font-semibold mb-3 text-center">
                  Original Photo
                </h3>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={originalImage}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Processed */}
              <div className="bg-white rounded-2xl shadow-card p-4">
                <h3 className="font-display text-sm font-semibold mb-3 text-center">
                  Coloring Page
                </h3>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="text-4xl"
                      >
                        🎨
                      </motion.div>
                    </div>
                  ) : processedImage ? (
                    <Image
                      src={processedImage}
                      alt="Coloring Page"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-4">
                <span className="font-display text-sm text-foreground whitespace-nowrap">
                  Detail Level
                </span>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={[threshold]}
                  onValueChange={([value]) => setThreshold(value)}
                  min={50}
                  max={200}
                  step={10}
                >
                  <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                    <Slider.Range className="absolute bg-primary rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-primary rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
                </Slider.Root>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>Less</span>
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                <p className="font-body text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setOriginalImage(null);
                  setProcessedImage(null);
                }}
              >
                Try Another
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleUseImage}
                disabled={!processedImage || isProcessing}
              >
                <Check className="w-4 h-4 mr-2" />
                Use This Page
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
