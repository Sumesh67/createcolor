"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Toast as ToastType, ToastVariant } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const config = getToastConfig(toast.variant);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px]",
        config.bgColor
      )}
    >
      <span className="text-xl">{config.emoji}</span>
      <p className={cn("flex-1 font-body text-sm", config.textColor)}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className={cn("p-1 rounded-full hover:bg-black/10", config.textColor)}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function getToastConfig(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        emoji: "✅",
      };
    case "error":
      return {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        emoji: "❌",
      };
    case "info":
    default:
      return {
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        emoji: "ℹ️",
      };
  }
}
