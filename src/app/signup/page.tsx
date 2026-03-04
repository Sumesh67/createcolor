"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PARENT" | "CHILD">("PARENT");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      router.push("/login?message=Account created! Please sign in.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
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
            Create your free account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block font-body text-sm text-foreground mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-gray-200",
                  "font-body text-foreground placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                )}
                placeholder="Your name"
                required
              />
            </div>

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
                placeholder="Create a password"
                minLength={6}
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block font-body text-sm text-foreground mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("PARENT")}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-colors",
                    role === "PARENT"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span className="text-2xl block mb-1">👨‍👩‍👧</span>
                  <span className="font-display text-sm">Parent</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("CHILD")}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-colors",
                    role === "CHILD"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span className="text-2xl block mb-1">🧒</span>
                  <span className="font-display text-sm">Kid</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center mt-6 font-body text-sm text-foreground/60">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
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
