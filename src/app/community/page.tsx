"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonLoader } from "@/components/ui/LoadingSpinner";
import { ColoringPage } from "@/types";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommunityPage() {
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunityPages();
  }, []);

  const fetchCommunityPages = async () => {
    try {
      const response = await fetch("/api/gallery");
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error("Failed to fetch community pages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemix = (page: ColoringPage) => {
    window.location.href = `/create?prompt=${encodeURIComponent(page.prompt)}`;
  };

  // Filter pages
  const filteredPages = pages.filter((page) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!page.prompt.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (selectedTag && !page.tags.includes(selectedTag)) {
      return false;
    }
    return true;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(pages.flatMap((p) => p.tags)));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm">Back</span>
          </Link>
          <h1 className="font-display text-lg font-bold">Community Gallery</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coloring pages..."
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200",
                "font-body text-foreground placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              )}
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                  !selectedTag
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 hover:border-primary"
                )}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                    selectedTag === tag
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-200 hover:border-primary"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <SkeletonLoader key={i} className="aspect-square" />
            ))}
          </div>
        ) : filteredPages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="group overflow-hidden">
                  <div className="relative aspect-square -m-4 mb-3">
                    <Image
                      src={page.thumbnailUrl || page.imageUrl}
                      alt={page.prompt}
                      fill
                      className="object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRemix(page)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Remix
                      </Button>
                    </div>

                    {/* Remix Count */}
                    {page.remixCount > 0 && (
                      <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-body">
                        {page.remixCount} remixes
                      </div>
                    )}
                  </div>

                  <p className="font-body text-sm text-gray-600 truncate" title={page.prompt}>
                    {page.prompt}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="font-display text-xl font-bold mb-2">No pages found</h3>
            <p className="font-body text-gray-600">
              Try a different search or explore more!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
