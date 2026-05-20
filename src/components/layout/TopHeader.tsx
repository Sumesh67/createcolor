"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/create", label: "Create", emoji: "🪄" },
  { href: "/storybook", label: "Storybook", emoji: "📖" },
  { href: "/gallery", label: "Gallery", emoji: "🖼️" },
];

export function TopHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14" />;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 safe-area-inset-top">
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto h-14">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-gray-900 text-base hidden sm:block">
            Create &amp; <span className="text-primary">Color</span>
          </span>
        </Link>

        {/* Desktop nav links — hidden on mobile (bottom nav handles it) */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <span>{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: auth */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 shrink-0"
        >
          {session ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-800 font-heading">
                  {session.user?.name?.split(" ")[0] || session.user?.email?.split("@")[0] || "User"}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button
                size="sm"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold px-4 rounded-xl shadow-sm"
              >
                <User className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}
        </motion.div>

      </div>
    </header>
  );
}
