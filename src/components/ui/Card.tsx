"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";

interface CardProps {
  hover?: boolean;
  className?: string;
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
        className={cn(
          "bg-white rounded-2xl shadow-card p-4",
          "transition-shadow duration-200",
          hover && "cursor-pointer hover:shadow-lg",
          className
        )}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

interface CardChildProps {
  className?: string;
  children?: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardChildProps>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn("mb-4", className)}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, CardChildProps>(
  ({ className, children }, ref) => (
    <h3
      ref={ref}
      className={cn("font-display text-xl font-bold text-foreground", className)}
    >
      {children}
    </h3>
  )
);

CardTitle.displayName = "CardTitle";

const CardContent = forwardRef<HTMLDivElement, CardChildProps>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn("", className)}
    >
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
