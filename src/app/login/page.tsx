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

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl });
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
          {/* Google Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full mb-6"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-body">
                or continue with email
              </span>
            </div>
          </div>

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
