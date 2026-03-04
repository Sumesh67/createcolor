"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Gallery } from "@/components/parent/Gallery";
import { Button } from "@/components/ui/Button";
import { ColoringPage } from "@/types";
import { ArrowLeft, Package } from "lucide-react";

export default function GalleryPage() {
  const { data: session } = useSession();
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchGallery();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery");
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemix = (page: ColoringPage) => {
    // Navigate to create with this prompt
    window.location.href = `/create?prompt=${encodeURIComponent(page.prompt)}`;
  };

  const handlePrint = (page: ColoringPage) => {
    window.open(page.imageUrl, "_blank");
  };

  const handleDelete = async (pageId: string) => {
    try {
      await fetch(`/api/gallery?pageId=${pageId}`, { method: "DELETE" });
      setPages((prev) => prev.filter((p) => p.id !== pageId));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleTogglePublic = async (pageId: string, isPublic: boolean) => {
    try {
      await fetch("/api/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, isPublic }),
      });
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, isPublic } : p))
      );
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm">Back</span>
          </Link>
          <h1 className="font-display text-lg font-bold">My Gallery</h1>
          <Link href="/parent">
            <Button variant="secondary" size="sm">
              <Package className="w-4 h-4 mr-2" />
              Party Pack
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Gallery
          pages={pages}
          isLoading={isLoading}
          onRemix={handleRemix}
          onPrint={handlePrint}
          onDelete={handleDelete}
          onTogglePublic={handleTogglePublic}
        />

        {/* Create CTA */}
        {!isLoading && pages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <Link href="/create">
              <Button variant="primary" size="lg">
                Create Your First Page
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
