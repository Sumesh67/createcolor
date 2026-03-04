"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, Printer, RefreshCw, Globe, Lock, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonLoader } from "@/components/ui/LoadingSpinner";
import { ColoringPage } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";

interface GalleryProps {
  pages: ColoringPage[];
  isLoading?: boolean;
  onRemix?: (page: ColoringPage) => void;
  onPrint?: (page: ColoringPage) => void;
  onDelete?: (pageId: string) => void;
  onTogglePublic?: (pageId: string, isPublic: boolean) => void;
}

type FilterOption = "all" | "recent" | "public" | "private";

export function Gallery({
  pages,
  isLoading = false,
  onRemix,
  onPrint,
  onDelete,
  onTogglePublic,
}: GalleryProps) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredPages = pages.filter((page) => {
    switch (filter) {
      case "recent":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(page.createdAt) > weekAgo;
      case "public":
        return page.isPublic;
      case "private":
        return !page.isPublic;
      default:
        return true;
    }
  });

  const handleDelete = (pageId: string) => {
    if (onDelete) {
      onDelete(pageId);
    }
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonLoader key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="text-6xl mb-4">🖼️</span>
        <h3 className="font-display text-xl font-bold mb-2">No coloring pages yet!</h3>
        <p className="font-body text-gray-600 text-center max-w-md">
          Start creating coloring pages and they&apos;ll appear here in your gallery.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["all", "recent", "public", "private"] as FilterOption[]).map((option) => (
          <Button
            key={option}
            variant={filter === option ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <GalleryCard
                page={page}
                onRemix={onRemix}
                onPrint={onPrint}
                onDelete={() => setDeleteConfirm(page.id)}
                onTogglePublic={onTogglePublic}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No pages match this filter.</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-md z-50 shadow-xl">
            <Dialog.Title className="font-display text-xl font-bold mb-2">
              Delete Coloring Page?
            </Dialog.Title>
            <Dialog.Description className="font-body text-gray-600 mb-6">
              This action cannot be undone. The coloring page will be permanently deleted.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-500 hover:bg-red-600"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

interface GalleryCardProps {
  page: ColoringPage;
  onRemix?: (page: ColoringPage) => void;
  onPrint?: (page: ColoringPage) => void;
  onDelete?: () => void;
  onTogglePublic?: (pageId: string, isPublic: boolean) => void;
}

function GalleryCard({ page, onRemix, onPrint, onDelete, onTogglePublic }: GalleryCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card hover className="group relative overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square -m-4 mb-3">
        <Image
          src={page.thumbnailUrl || page.imageUrl}
          alt={page.prompt}
          fill
          className="object-cover"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            {onRemix && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemix(page)}
                className="p-2 bg-white rounded-full shadow-lg"
              >
                <RefreshCw className="w-5 h-5 text-primary" />
              </motion.button>
            )}
            {onPrint && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onPrint(page)}
                className="p-2 bg-white rounded-full shadow-lg"
              >
                <Printer className="w-5 h-5 text-secondary" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Public/Private Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "px-2 py-1 text-xs rounded-full flex items-center gap-1",
              page.isPublic
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {page.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {page.isPublic ? "Public" : "Private"}
          </span>
        </div>

        {/* Menu Button */}
        <div className="absolute top-2 right-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg py-1 min-w-[140px] z-10"
              >
                {onTogglePublic && (
                  <button
                    onClick={() => {
                      onTogglePublic(page.id, !page.isPublic);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    {page.isPublic ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    {page.isPublic ? "Make Private" : "Make Public"}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info */}
      <div className="pt-2">
        <p className="font-body text-sm text-gray-600 truncate" title={page.prompt}>
          {page.prompt}
        </p>
        <p className="font-body text-xs text-gray-400 mt-1">
          {formatDate(new Date(page.createdAt))}
        </p>
      </div>
    </Card>
  );
}
