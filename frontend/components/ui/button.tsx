import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Notion Primary Blue Button
        default: "bg-notion-blue text-white border border-transparent rounded-micro hover:bg-notion-blue-active hover:text-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-notion-blue-focus focus-visible:outline-offset-2",
        // Notion Secondary Button
        secondary: "bg-black/5 text-near-black rounded-micro hover:bg-black/8 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-notion-blue-focus focus-visible:outline-offset-2",
        // Ghost/Link Button
        ghost: "bg-transparent text-near-black hover:underline active:scale-[0.98]",
        // Outline variant
        outline: "border-whisper bg-background hover:bg-warm-white rounded-micro focus-visible:outline-2 focus-visible:outline-notion-blue-focus focus-visible:outline-offset-2",
        // Destructive
        destructive: "bg-orange text-white rounded-micro hover:bg-orange/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-orange focus-visible:outline-offset-2",
        // Link style
        link: "text-notion-blue underline-offset-4 hover:underline",
        // Pill Badge Button
        pill: "bg-badge-blue-bg text-badge-blue-text rounded-pill text-badge px-2 py-1",
      },
      size: {
        default: "h-8 px-4 text-nav",
        xs: "h-6 px-2 text-xs",
        sm: "h-7 px-3 text-sm",
        lg: "h-10 px-5 text-base",
        icon: "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
