"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/create";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error('Login error:', result.error);
        setError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (_err) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="font-display text-3xl font-bold">
              Create<span className="text-primary">and</span>Color
            </h1>
          </Link>
          <p className="font-body text-foreground/60 mt-2">
            Sign in to start creating!
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card p-8">
          {/* Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block font-body text-sm text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-gray-200",
                  "font-body text-foreground placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                )}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block font-body text-sm text-foreground mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-gray-200",
                  "font-body text-foreground placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                )}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center mt-6 font-body text-sm text-foreground/60">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="font-body text-sm text-foreground/60 hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
