"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { pdf } from "@react-pdf/renderer";
import { WorksheetPDF } from "@/lib/pdf/WorksheetPDF";
import { cn } from "@/lib/utils";

type WorksheetType = "trace" | "connect-dots" | "math" | "reading";

const GRADE_LEVELS = ["K", "1", "2", "3", "4", "5", "6", "7", "8"];

const WORKSHEET_TYPES: { value: WorksheetType; label: string; icon: string; description: string }[] = [
  { value: "trace", label: "Trace", icon: "✏️", description: "Tracing letters, shapes & outlines" },
  { value: "connect-dots", label: "Connect Dots", icon: "🔢", description: "Number dot-to-dot puzzles" },
  { value: "math", label: "Math", icon: "🧮", description: "Color-by-number & math activities" },
  { value: "reading", label: "Reading", icon: "📚", description: "Labeled scene vocabulary" },
];

const WEEKLY_CREDITS = 5;

export default function TeacherPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("K");
  const [worksheetType, setWorksheetType] = useState<WorksheetType>("trace");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string>("");
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const user = session?.user as { role?: string; name?: string } | undefined;
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  // Redirect unauthenticated users — must be in useEffect, not render
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?message=Please sign in to access the Teacher dashboard.");
    }
  }, [status, router]);

  // Fetch current credit count on load once confirmed as teacher
  useEffect(() => {
    if (status === "authenticated" && isTeacher) {
      fetch("/api/teacher/credits")
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.remaining === "number") setCreditsRemaining(d.remaining);
        })
        .catch(() => {});
    }
  }, [status, isTeacher]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen bg-background" />;
  }

  if (status === "authenticated" && !isTeacher) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-card p-8">
          <span className="text-5xl block mb-4">🏫</span>
          <h1 className="font-display text-2xl font-bold mb-3">Teacher Accounts Only</h1>
          <p className="font-body text-foreground/60 mb-6">
            This feature is available for verified teacher accounts. Sign up with your school email to get 5 free Chalkboard Credits per week.
          </p>
          <button
            onClick={() => router.push("/signup")}
            className="w-full py-3 px-6 bg-primary text-white rounded-xl font-display font-bold hover:bg-primary/90 transition-colors"
          >
            Sign Up as Teacher
          </button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or subject.");
      return;
    }
    setError("");
    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch("/api/teacher/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), gradeLevel, type: worksheetType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate worksheet. Please try again.");
        return;
      }

      setGeneratedImageUrl(data.imageUrl);
      setTeacherName(data.teacherName || user?.name || "Teacher");
      setCreditsRemaining(data.creditsRemaining);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!generatedImageUrl) return;
    setIsDownloading(true);
    try {
      const doc = (
        <WorksheetPDF
          imageUrl={generatedImageUrl}
          teacherName={teacherName}
          topic={topic}
          gradeLevel={gradeLevel}
        />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `worksheet-${topic.replace(/\s+/g, "-").toLowerCase()}-grade${gradeLevel}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [generatedImageUrl, teacherName, topic, gradeLevel]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="font-display text-xl font-bold">
          Create<span className="text-primary">and</span>Color
        </button>
        <div className="flex items-center gap-3">
          <span className="font-body text-sm text-foreground/60">Teacher Dashboard</span>
          {creditsRemaining !== null && (
            <span className="bg-blue-100 text-blue-700 text-xs font-display font-bold px-3 py-1 rounded-full">
              {creditsRemaining}/{WEEKLY_CREDITS} Credits
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Worksheet Generator ✏️
          </h1>
          <p className="font-body text-foreground/60">
            Generate printable coloring worksheets for your class. Each worksheet includes a branded footer that introduces CreateColor to parents.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
            <span className="text-amber-600 font-display font-bold text-sm">Chalkboard Credits:</span>
            <span className="font-body text-sm text-amber-700">
              {creditsRemaining !== null ? creditsRemaining : WEEKLY_CREDITS} remaining this week (resets Sunday)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-card p-6 space-y-5">
              {/* Topic */}
              <div>
                <label className="block font-display text-sm font-bold text-foreground mb-2">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Solar System, Frogs, Addition to 10..."
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border border-gray-200",
                    "font-body text-foreground placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                  maxLength={80}
                />
              </div>

              {/* Grade Level */}
              <div>
                <label className="block font-display text-sm font-bold text-foreground mb-2">
                  Grade Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRADE_LEVELS.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setGradeLevel(grade)}
                      className={cn(
                        "px-3 py-2 rounded-xl border-2 font-display font-bold text-sm transition-colors",
                        gradeLevel === grade
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-foreground/60 hover:border-gray-300"
                      )}
                    >
                      {grade === "K" ? "K" : `G${grade}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Worksheet Type */}
              <div>
                <label className="block font-display text-sm font-bold text-foreground mb-2">
                  Worksheet Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {WORKSHEET_TYPES.map((wt) => (
                    <button
                      key={wt.value}
                      type="button"
                      onClick={() => setWorksheetType(wt.value)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-colors",
                        worksheetType === wt.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span className="text-xl block mb-1">{wt.icon}</span>
                      <span className="font-display text-sm font-bold block">{wt.label}</span>
                      <span className="font-body text-xs text-foreground/50">{wt.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className={cn(
                  "w-full py-4 rounded-xl font-display font-bold text-white transition-all",
                  isGenerating || !topic.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
                )}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span> Generating Worksheet...
                  </span>
                ) : (
                  "Generate Worksheet ✏️"
                )}
              </button>
            </div>

            {/* Watermark preview note */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="font-display text-xs font-bold text-foreground/50 uppercase tracking-wide mb-1">About the footer</p>
              <p className="font-body text-sm text-foreground/60">
                Every printed worksheet includes a branded footer: <em>&quot;Magic Coloring Worksheet generated for [Your Name]&apos;s class by CreateColor.com&quot;</em>. This helps parents discover the app.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col">
            <div className="bg-white rounded-3xl shadow-card flex-1 flex flex-col overflow-hidden min-h-80">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center gap-4 p-8"
                  >
                    <div className="text-5xl animate-bounce">✏️</div>
                    <p className="font-display text-lg font-bold text-foreground/70">Creating your worksheet...</p>
                    <p className="font-body text-sm text-foreground/40 text-center">
                      Gemini is crafting the educational prompt, then FLUX is drawing the artwork.
                    </p>
                  </motion.div>
                ) : generatedImageUrl ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Worksheet preview */}
                    <div className="flex-1 p-4 flex flex-col">
                      {/* Header preview */}
                      <div className="flex justify-between items-end mb-3 pb-2 border-b border-gray-200">
                        <span className="text-xs font-body text-gray-600">Name: ______________________</span>
                        <span className="text-xs font-body text-gray-600">Date: ____________</span>
                      </div>
                      {/* Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={generatedImageUrl}
                        alt="Generated worksheet"
                        className="flex-1 object-contain rounded-xl"
                      />
                      {/* Footer preview */}
                      <div className="mt-3 bg-gray-900 rounded-xl p-3 text-center">
                        <p className="text-white text-xs font-bold">
                          ✨ Magic Coloring Worksheet generated specifically for {teacherName.split(" ").pop()}&apos;s class by CreateColor.com
                        </p>
                      </div>
                    </div>

                    {/* Download button */}
                    <div className="p-4 border-t border-gray-100">
                      <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-display font-bold transition-colors disabled:opacity-50"
                      >
                        {isDownloading ? "Preparing PDF..." : "Download PDF for Printing"}
                      </button>
                      <p className="text-center text-xs text-foreground/40 font-body mt-2">
                        Print and hand out to your class
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center"
                  >
                    <div className="text-6xl">🏫</div>
                    <p className="font-display text-lg font-bold text-foreground/50">
                      Your worksheet will appear here
                    </p>
                    <p className="font-body text-sm text-foreground/30">
                      Fill in the topic and settings, then click Generate
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
