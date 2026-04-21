import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-2 py-1 text-badge font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-notion-blue-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Notion pill badge - primary
        default: "bg-badge-blue-bg text-badge-blue-text border-0",
        // Secondary warm gray
        secondary: "bg-warm-white text-warm-gray-500 border-0",
        // Success - teal
        success: "bg-teal/10 text-teal border-0",
        // Warning - orange
        warning: "bg-orange/10 text-orange border-0",
        // Destructive
        destructive: "bg-orange/10 text-orange border-0",
        // Outline with whisper border
        outline: "text-near-black border-whisper bg-white",
        // Green
        green: "bg-green/10 text-green border-0",
        // Pink
        pink: "bg-pink/10 text-pink border-0",
        // Purple
        purple: "bg-purple/10 text-purple border-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
