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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
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
        "slide-in-left": {
          from: { transform: "translateX(-10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px -5px hsl(var(--primary) / 0.2)",
          },
          "50%": {
            boxShadow: "0 0 30px -5px hsl(var(--primary) / 0.35)",
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "spin-slow": "spin-slow 8s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      boxShadow: {
        "glow-sm": "0 0 15px -3px hsl(var(--primary) / 0.15)",
        "glow": "0 0 30px -5px hsl(var(--primary) / 0.2)",
        "glow-lg": "0 0 60px -10px hsl(var(--primary) / 0.25)",
        "inner-glow": "inset 0 1px 0 0 hsl(var(--primary) / 0.05)",
        "premium": "0 4px 20px -5px hsl(var(--primary) / 0.1), 0 0 0 1px hsl(var(--primary) / 0.05)",
        "premium-lg": "0 8px 40px -10px hsl(var(--primary) / 0.15), 0 0 0 1px hsl(var(--primary) / 0.08)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, hsl(var(--primary)), hsl(250, 80%, 60%), hsl(280, 65%, 55%))",
        "gradient-brand-subtle": "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(250, 80%, 60% / 0.05))",
      },
    },
  },
  plugins: [],
};

export default config;
