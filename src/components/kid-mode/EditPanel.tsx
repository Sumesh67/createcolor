"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Plus, Minus, RefreshCw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QUICK_EDIT_SUGGESTIONS, EditSuggestion } from "@/lib/ai/editPrompt";
import { EditMode, EditHistoryItem } from "@/types";
import { cn } from "@/lib/utils";

interface EditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEdit: (editMode: EditMode, editText: string) => void;
  editHistory?: EditHistoryItem[];
  onUndo?: (editId: string) => void;
  isProcessing?: boolean;
}

const TAB_CONFIG = [
  { id: "tweak" as EditMode, label: "Tweak", icon: Wand2, emoji: "🔧" },
  { id: "add" as EditMode, label: "Add", icon: Plus, emoji: "➕" },
  { id: "remove" as EditMode, label: "Remove", icon: Minus, emoji: "➖" },
  { id: "replace" as EditMode, label: "Replace", icon: RefreshCw, emoji: "🔄" },
];

export function EditPanel({
  isOpen,
  onClose,
  onApplyEdit,
  editHistory = [],
  onUndo,
  isProcessing = false,
}: EditPanelProps) {
  const [activeTab, setActiveTab] = useState<EditMode>("tweak");
  const [customText, setCustomText] = useState("");

  const filteredSuggestions = QUICK_EDIT_SUGGESTIONS.filter(
    (s) => s.editMode === activeTab
  );

  const handleSuggestionClick = (suggestion: EditSuggestion) => {
    onApplyEdit(suggestion.editMode, suggestion.editText);
  };

  const handleCustomSubmit = () => {
    if (customText.trim()) {
      onApplyEdit(activeTab, customText.trim());
      setCustomText("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <h2 className="font-display text-xl font-bold">Edit Your Page</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-4">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-3 font-display text-sm transition-colors",
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {/* Quick Edit Chips */}
              <div className="mb-4">
                <h3 className="font-body text-sm text-gray-600 mb-2">Quick edits</h3>
                <div className="flex flex-wrap gap-2">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((suggestion) => (
                      <motion.button
                        key={suggestion.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isProcessing}
                        className={cn(
                          "px-3 py-2 bg-white rounded-full shadow-sm border border-gray-200",
                          "font-body text-sm hover:border-primary hover:bg-primary/5",
                          "transition-colors disabled:opacity-50"
                        )}
                      >
                        {suggestion.emoji} {suggestion.label}
                      </motion.button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Type your own edit below!
                    </p>
                  )}
                </div>
              </div>

              {/* Custom Input */}
              <div className="mb-4">
                <h3 className="font-body text-sm text-gray-600 mb-2">
                  Or describe your edit
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={getPlaceholder(activeTab)}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl border border-gray-200",
                      "font-body text-foreground placeholder:text-gray-400",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                  />
                  <Button
                    variant="primary"
                    onClick={handleCustomSubmit}
                    disabled={!customText.trim() || isProcessing}
                    isLoading={isProcessing}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Edit History */}
              {editHistory.length > 0 && (
                <div>
                  <h3 className="font-body text-sm text-gray-600 mb-2">
                    Recent edits
                  </h3>
                  <div className="space-y-2">
                    {editHistory.slice(-5).reverse().map((edit) => (
                      <div
                        key={edit.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {getEditModeEmoji(edit.editMode)}
                          </span>
                          <span className="font-body text-sm text-foreground">
                            {edit.editText}
                          </span>
                        </div>
                        {onUndo && (
                          <button
                            onClick={() => onUndo(edit.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function getPlaceholder(editMode: EditMode): string {
  switch (editMode) {
    case "tweak":
      return "e.g., make it bigger, cuter...";
    case "add":
      return "e.g., a rainbow, some stars...";
    case "remove":
      return "e.g., the background, the hat...";
    case "replace":
      return "e.g., change the cat to a dog...";
    default:
      return "Describe your edit...";
  }
}

function getEditModeEmoji(editMode: EditMode): string {
  switch (editMode) {
    case "tweak":
      return "🔧";
    case "add":
      return "➕";
    case "remove":
      return "➖";
    case "replace":
      return "🔄";
    default:
      return "✏️";
  }
}
