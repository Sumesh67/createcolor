"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FolderPlus, Check, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./Button";

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt: string;
  onDownload: () => void;
}

export function SaveDialog({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  onDownload,
}: SaveDialogProps) {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [savedTo, setSavedTo] = useState<"download" | "gallery" | "both" | null>(null);

  const handleDownloadOnly = () => {
    onDownload();
    setSavedTo("download");
    setTimeout(() => {
      setSavedTo(null);
      onClose();
    }, 1500);
  };

  const handleSaveToGallery = async () => {
    if (!session?.user) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageUrl,
          isPublic: false,
        }),
      });

      if (response.ok) {
        setSavedTo("gallery");
        setTimeout(() => {
          setSavedTo(null);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save to gallery:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBoth = async () => {
    if (!session?.user) return;

    setIsSaving(true);
    onDownload();

    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageUrl,
          isPublic: false,
        }),
      });

      if (response.ok) {
        setSavedTo("both");
        setTimeout(() => {
          setSavedTo(null);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save to gallery:", error);
      setSavedTo("download");
      setTimeout(() => {
        setSavedTo(null);
        onClose();
      }, 1500);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Save Coloring Page</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success Message */}
          {savedTo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-xl mb-4"
            >
              <Check className="w-5 h-5 text-green-500" />
              <span className="font-body text-green-700">
                {savedTo === "download" && "Downloaded!"}
                {savedTo === "gallery" && "Saved to gallery!"}
                {savedTo === "both" && "Downloaded and saved to gallery!"}
              </span>
            </motion.div>
          )}

          {/* Options */}
          {!savedTo && (
            <div className="space-y-3">
              {/* Download Only */}
              <button
                onClick={handleDownloadOnly}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Download className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-display font-semibold">Download Only</p>
                  <p className="font-body text-sm text-gray-500">
                    Save to your device
                  </p>
                </div>
              </button>

              {/* Save to Gallery */}
              {session?.user ? (
                <>
                  <button
                    onClick={handleSaveToGallery}
                    disabled={isSaving}
                    className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <FolderPlus className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-display font-semibold">Save to Gallery</p>
                      <p className="font-body text-sm text-gray-500">
                        Add to your collection
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={handleSaveBoth}
                    disabled={isSaving}
                    className="w-full flex items-center gap-4 p-4 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-display font-semibold text-primary">Both</p>
                      <p className="font-body text-sm text-gray-500">
                        Download and save to gallery
                      </p>
                    </div>
                  </button>
                </>
              ) : (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <LogIn className="w-5 h-5 text-yellow-600" />
                    <p className="font-body text-sm text-yellow-700">
                      Sign in to save to your gallery
                    </p>
                  </div>
                  <Link href="/login">
                    <Button variant="secondary" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Cancel Button */}
          {!savedTo && (
            <button
              onClick={onClose}
              className="w-full mt-4 py-3 font-body text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
