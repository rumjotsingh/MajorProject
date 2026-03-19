"use client";

import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackToHomeProps {
  showBackButton?: boolean;
}

export function BackToHome({ showBackButton = false }: BackToHomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 left-4 z-40 md:left-6"
    >
      <Link href="/">
        <Button
          variant="outline"
          size="sm"
          className="glass glass-border shadow-lg backdrop-blur-xl gap-2 hover:bg-primary/10 transition-all"
        >
          {showBackButton ? (
            <>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </>
          ) : (
            <>
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </>
          )}
        </Button>
      </Link>
    </motion.div>
  );
}
