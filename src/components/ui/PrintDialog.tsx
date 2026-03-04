"use client";

import { useState } from "react";
import Image from "next/image";
import { Printer, Download, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PrintLayout } from "@/types";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onPrint: (layout: PrintLayout, paperSize: "a4" | "letter") => Promise<void>;
  pdfUrl?: string;
  qrCodeUrl?: string;
  isLoading?: boolean;
}

const LAYOUT_OPTIONS: { id: PrintLayout; label: string; icon: string }[] = [
  { id: "single", label: "Full Page", icon: "▢" },
  { id: "double", label: "2 per Page", icon: "▢▢" },
  { id: "quad", label: "4 per Page", icon: "▢▢\n▢▢" },
];

export function PrintDialog({
  isOpen,
  onClose,
  imageUrl,
  onPrint,
  pdfUrl: _pdfUrl,
  qrCodeUrl,
  isLoading = false,
}: PrintDialogProps) {
  const [layout, setLayout] = useState<PrintLayout>("single");
  const [paperSize, setPaperSize] = useState<"a4" | "letter">("letter");
  const [activeTab, setActiveTab] = useState<"print" | "qr">("print");

  const handlePrint = async () => {
    await onPrint(layout, paperSize);
  };

  const handleDirectPrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Coloring Page</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                img { width: 100%; height: auto; max-height: 100vh; object-fit: contain; }
              }
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
              }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="Coloring Page" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-lg z-50 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-display text-xl font-bold">
              Print Options
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("print")}
              className={cn(
                "flex-1 py-3 font-display text-sm flex items-center justify-center gap-2",
                activeTab === "print"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500"
              )}
            >
              <Printer className="w-4 h-4" />
              Print Now
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={cn(
                "flex-1 py-3 font-display text-sm flex items-center justify-center gap-2",
                activeTab === "qr"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500"
              )}
            >
              <QrCode className="w-4 h-4" />
              Scan to Print
            </button>
          </div>

          {activeTab === "print" ? (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Layout Selection */}
              <div>
                <label className="block font-display text-sm font-semibold mb-2">
                  Layout
                </label>
                <div className="flex gap-2">
                  {LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setLayout(option.id)}
                      className={cn(
                        "flex-1 p-3 rounded-xl border-2 text-center",
                        layout === option.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200"
                      )}
                    >
                      <div className="font-mono text-xs whitespace-pre">
                        {option.icon}
                      </div>
                      <div className="font-body text-xs mt-1">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Size */}
              <div>
                <label className="block font-display text-sm font-semibold mb-2">
                  Paper Size
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaperSize("letter")}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-xl border-2 font-body text-sm",
                      paperSize === "letter"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    )}
                  >
                    Letter (US)
                  </button>
                  <button
                    onClick={() => setPaperSize("a4")}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-xl border-2 font-body text-sm",
                      paperSize === "a4"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    )}
                  >
                    A4
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDirectPrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Quick Print
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handlePrint}
                  isLoading={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {qrCodeUrl ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-card">
                    <Image
                      src={qrCodeUrl}
                      alt="QR Code"
                      width={200}
                      height={200}
                    />
                  </div>
                  <p className="font-body text-sm text-gray-600 mt-4 text-center">
                    Scan this QR code with your phone to download and print the PDF!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <QrCode className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="font-body text-gray-500 text-center">
                    Generate a PDF first to get a QR code
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={handlePrint}
                    isLoading={isLoading}
                  >
                    Generate PDF
                  </Button>
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
