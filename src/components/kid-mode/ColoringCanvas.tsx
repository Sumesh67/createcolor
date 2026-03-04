"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil, Printer, Download, Share2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SkeletonLoader } from "@/components/ui/LoadingSpinner";
import * as Slider from "@radix-ui/react-slider";

interface ColoringCanvasProps {
  imageUrl: string | null;
  isLoading?: boolean;
  onEdit?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function ColoringCanvas({
  imageUrl,
  isLoading = false,
  onEdit,
  onPrint,
  onDownload,
  onShare,
}: ColoringCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [lineThickness, setLineThickness] = useState(3);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset loading state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
      setRetryCount(0);
    }
  }, [imageUrl]);

  // Auto-retry for Pollinations.ai (returns 530 while generating)
  useEffect(() => {
    if (imageError && imageUrl?.includes('pollinations.ai') && retryCount < 10) {
      const timer = setTimeout(() => {
        console.log(`Retrying image load, attempt ${retryCount + 2}...`);
        setImageError(false);
        setImageLoading(true);
        setRetryCount(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [imageError, imageUrl, retryCount]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  // CSS filter to simulate line thickness
  const getLineThicknessFilter = () => {
    if (lineThickness === 3) return "none";
    const contrast = 1 + (lineThickness - 3) * 0.2;
    return `contrast(${contrast})`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full aspect-square max-w-md">
          <SkeletonLoader className="absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-4xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🎨
            </motion.div>
          </div>
        </div>
        <p className="font-display text-lg text-primary animate-pulse">
          Creating your masterpiece...
        </p>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300 min-h-[300px]">
        <span className="text-6xl">🖼️</span>
        <p className="font-body text-gray-500 text-center">
          Your coloring page will appear here!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Image Container */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-card overflow-hidden"
      >
        <div
          className="relative aspect-square overflow-auto"
          style={{ touchAction: "pan-x pan-y pinch-zoom" }}
        >
          <motion.div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full"
          >
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    className="text-4xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    🎨
                  </motion.div>
                  <p className="text-sm text-gray-500">
                    {retryCount > 0
                      ? `Generating image... (attempt ${retryCount + 1}/10)`
                      : 'Generating image...'}
                  </p>
                </div>
              </div>
            )}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">😕</span>
                  <p className="text-sm text-gray-500">Failed to load image</p>
                  <button
                    onClick={() => {
                      setImageError(false);
                      setImageLoading(true);
                      setRetryCount(prev => prev + 1);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={retryCount} // Force remount on retry
              src={imageUrl}
              alt="Coloring page"
              className="w-full h-full object-contain"
              style={{ filter: getLineThicknessFilter() }}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </motion.div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-3 right-3 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomOut}
            className="p-2 bg-white/90 rounded-full shadow-md"
          >
            <ZoomOut className="w-5 h-5 text-foreground" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="p-2 bg-white/90 rounded-full shadow-md"
          >
            <RotateCcw className="w-5 h-5 text-foreground" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomIn}
            className="p-2 bg-white/90 rounded-full shadow-md"
          >
            <ZoomIn className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>
      </motion.div>

      {/* Line Thickness Slider */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-4">
          <span className="font-display text-sm text-foreground whitespace-nowrap">
            Line Thickness
          </span>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[lineThickness]}
            onValueChange={([value]) => setLineThickness(value)}
            min={1}
            max={5}
            step={1}
          >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-primary rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
          </Slider.Root>
          <span className="font-body text-sm text-gray-500 w-6 text-center">
            {lineThickness}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button variant="outline" size="md" onClick={onEdit} className="flex items-center justify-center gap-2">
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
        <Button variant="outline" size="md" onClick={onPrint} className="flex items-center justify-center gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button variant="outline" size="md" onClick={onDownload} className="flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Save
        </Button>
        <Button variant="outline" size="md" onClick={onShare} className="flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  );
}
