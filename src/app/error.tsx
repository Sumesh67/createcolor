'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-6">🎨</div>
        <h1 className="font-display text-3xl text-gray-800 mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-8">
          Don&apos;t worry, even the best artists make mistakes! Let&apos;s try that again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-body font-semibold rounded-full shadow-playful hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </motion.button>
          <Link href="/">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-body font-semibold rounded-full border-2 border-gray-200 hover:border-primary transition-all"
            >
              <Home className="w-5 h-5" />
              Go Home
            </motion.span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
