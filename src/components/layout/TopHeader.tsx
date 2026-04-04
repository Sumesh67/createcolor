"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function TopHeader() {
  const { data: session, status } = useSession();

  // Don't show header if not authenticated
  if (status === "loading" || !session) {
    return null;
  }

  const userName = session.user?.name || session.user?.email?.split('@')[0] || "User";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 safe-area-inset-top">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800 font-heading">
              {userName}
            </span>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Logout</span>
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
