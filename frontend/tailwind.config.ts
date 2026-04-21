import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        "accent-brand": {
          DEFAULT: "hsl(var(--accent-brand))",
          foreground: "hsl(var(--accent-brand-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Notion-specific colors
        "notion-blue": "hsl(var(--notion-blue))",
        "notion-blue-active": "hsl(var(--notion-blue-active))",
        "notion-blue-focus": "hsl(var(--notion-blue-focus))",
        "notion-blue-light": "hsl(var(--notion-blue-light))",
        "warm-white": "hsl(var(--warm-white))",
        "warm-dark": "hsl(var(--warm-dark))",
        "warm-gray-500": "hsl(var(--warm-gray-500))",
        "warm-gray-300": "hsl(var(--warm-gray-300))",
        "near-black": "hsl(var(--near-black))",
        teal: "hsl(var(--teal))",
        green: "hsl(var(--green))",
        orange: "hsl(var(--orange))",
        pink: "hsl(var(--pink))",
        purple: "hsl(var(--purple))",
        brown: "hsl(var(--brown))",
        "badge-blue-bg": "hsl(var(--badge-blue-bg))",
        "badge-blue-text": "hsl(var(--badge-blue-text))",
      },
      borderRadius: {
        micro: "4px",
        subtle: "5px",
        standard: "8px",
        comfortable: "12px",
        large: "16px",
        pill: "9999px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      spacing: {
        // Notion's 8px base spacing system
        "0.5": "2px",
        "0.75": "3px",
        "1.25": "5px",
        "1.5": "6px",
        "1.75": "7px",
        "2.75": "11px",
        "3.5": "14px",
      },
      fontSize: {
        // Notion typography scale
        "display-hero": ["4rem", { lineHeight: "1.00", letterSpacing: "-2.125px", fontWeight: "700" }],
        "display-secondary": ["3.38rem", { lineHeight: "1.04", letterSpacing: "-1.875px", fontWeight: "700" }],
        "section-heading": ["3rem", { lineHeight: "1.00", letterSpacing: "-1.5px", fontWeight: "700" }],
        "subheading-large": ["2.5rem", { lineHeight: "1.50", fontWeight: "700" }],
        "subheading": ["1.63rem", { lineHeight: "1.23", letterSpacing: "-0.625px", fontWeight: "700" }],
        "card-title": ["1.38rem", { lineHeight: "1.27", letterSpacing: "-0.25px", fontWeight: "700" }],
        "body-large": ["1.25rem", { lineHeight: "1.40", letterSpacing: "-0.125px", fontWeight: "600" }],
        "body": ["1rem", { lineHeight: "1.50", fontWeight: "400" }],
        "body-medium": ["1rem", { lineHeight: "1.50", fontWeight: "500" }],
        "body-semibold": ["1rem", { lineHeight: "1.50", fontWeight: "600" }],
        "nav": ["0.94rem", { lineHeight: "1.33", fontWeight: "600" }],
        "caption": ["0.88rem", { lineHeight: "1.43", fontWeight: "500" }],
        "badge": ["0.75rem", { lineHeight: "1.33", letterSpacing: "0.125px", fontWeight: "600" }],
      },
      boxShadow: {
        // Notion shadow system
        "notion-card": "0px 4px 18px rgba(0, 0, 0, 0.04), 0px 2.025px 7.84688px rgba(0, 0, 0, 0.027), 0px 0.8px 2.925px rgba(0, 0, 0, 0.02), 0px 0.175px 1.04062px rgba(0, 0, 0, 0.01)",
        "notion-deep": "0px 1px 3px rgba(0, 0, 0, 0.01), 0px 3px 7px rgba(0, 0, 0, 0.02), 0px 7px 15px rgba(0, 0, 0, 0.02), 0px 14px 28px rgba(0, 0, 0, 0.04), 0px 23px 52px rgba(0, 0, 0, 0.05)",
        "whisper": "0 0 0 1px rgba(0, 0, 0, 0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
