"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PartyPackBuilder } from "@/components/parent/PartyPackBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Palette, Printer, Calendar, Settings } from "lucide-react";
import { PrintLayout } from "@/types";

interface PartyPackResult {
  pdfUrl: string;
  pageCount: number;
}

export default function ParentPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PartyPackResult | null>(null);

  const handleGeneratePartyPack = async (config: {
    theme: string;
    count: number;
    layout: PrintLayout;
    childName?: string;
  }) => {
    setIsGenerating(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 1000);

      const response = await fetch("/api/party-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate");
      }

      setResult({
        pdfUrl: data.pdfUrl,
        pageCount: data.pageCount,
      });
    } catch (error) {
      console.error("Failed to generate party pack:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Demo stats
  const stats = [
    { label: "Pages Created", value: 24, icon: Palette, color: "text-primary" },
    { label: "Pages Printed", value: 12, icon: Printer, color: "text-secondary" },
    { label: "This Week", value: 5, icon: Calendar, color: "text-purple" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm">Back</span>
          </Link>
          <h1 className="font-display text-lg font-bold">Parent Portal</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-5 h-5 text-foreground/70" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-4 text-center">
                  <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="font-body text-xs text-gray-500">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Party Pack Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PartyPackBuilder
            onGenerate={handleGeneratePartyPack}
            isGenerating={isGenerating}
            progress={progress}
            result={result}
          />
        </motion.div>

        {/* Print History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-secondary" />
                Print History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Demo print history items */}
                {[
                  { date: "Today", layout: "Single", pages: 3 },
                  { date: "Yesterday", layout: "Party Pack (10)", pages: 10 },
                  { date: "Dec 15", layout: "Double", pages: 4 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <div className="font-body text-sm">{item.layout}</div>
                      <div className="font-body text-xs text-gray-500">{item.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-sm text-gray-500">
                        {item.pages} pages
                      </span>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple" />
                Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-sm font-semibold">Safe Mode</div>
                    <div className="font-body text-xs text-gray-500">
                      Extra content filtering for young children
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-sm font-semibold">Allow Community Sharing</div>
                    <div className="font-body text-xs text-gray-500">
                      Let your child share pages to the community gallery
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
