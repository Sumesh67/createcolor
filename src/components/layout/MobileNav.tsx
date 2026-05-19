"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Wand2, Image, Settings, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home", emoji: "🏠" },
  { href: "/create", icon: Wand2, label: "Create", emoji: "🪄" },
  { href: "/storybook", icon: BookOpen, label: "Story", emoji: "📖" },
  { href: "/gallery", icon: Image, label: "Gallery", emoji: "🖼️" },
  { href: "/parent", icon: Settings, label: "Parents", emoji: "⚙️" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-gray-400"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                {isActive ? (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-xl"
                  >
                    {item.emoji}
                  </motion.span>
                ) : (
                  <item.icon className="w-6 h-6" />
                )}
                <span className={cn(
                  "text-[10px] mt-1 font-body",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
