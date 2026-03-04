"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface VoicePromptProps {
  onTranscript: (text: string) => void;
  isGenerating?: boolean;
}

export function VoicePrompt({ onTranscript, isGenerating = false }: VoicePromptProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      const transcriptText = current[0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setError("Microphone access was denied. Please allow microphone access.");
      } else {
        setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    (window as any).currentRecognition = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
    }
    setIsListening(false);
  }, []);

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-card">
        <MicOff className="w-12 h-12 text-gray-400" />
        <p className="text-center text-gray-600 font-body">
          Sorry, voice input isn&apos;t available in your browser.
          Try using Chrome or Safari!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Microphone Button */}
      <motion.button
        className={cn(
          "relative w-32 h-32 rounded-full flex items-center justify-center",
          "transition-colors duration-300",
          isListening
            ? "bg-primary text-white"
            : "bg-white text-primary border-4 border-primary"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? stopListening : startListening}
        disabled={isGenerating}
      >
        {isListening && (
          <>
            {/* Pulsing rings */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}
        <Mic className="w-12 h-12 relative z-10" />
      </motion.button>

      {/* Status Text */}
      <div className="text-center">
        {isListening ? (
          <motion.p
            className="font-display text-lg text-primary"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Listening...
          </motion.p>
        ) : (
          <p className="font-body text-gray-600">
            Tap the microphone and describe your coloring page!
          </p>
        )}
      </div>

      {/* Sound Wave Visualization */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-1"
          >
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 bg-primary rounded-full"
                animate={{
                  height: [12, Math.random() * 40 + 12, 12],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <div className="bg-white rounded-2xl shadow-card p-4">
              <p className="font-body text-lg text-center text-foreground">
                &ldquo;{transcript}&rdquo;
              </p>
            </div>

            {!isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-4"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  isLoading={isGenerating}
                >
                  Create This!
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-red-500 text-sm text-center font-body"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hint */}
      <div className="bg-accent/30 rounded-2xl p-4 w-full">
        <p className="font-body text-sm text-center text-foreground/70">
          <span className="font-semibold">Try saying:</span> &ldquo;A dinosaur riding a skateboard in space!&rdquo;
        </p>
      </div>
    </div>
  );
}
