import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";

// Notion uses Inter as NotionInter (modified Inter)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const interDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "CredMatrix — Unified Digital Skill Portfolio",
  description: "Aggregate, verify, and showcase your credentials from multiple sources in one premium digital portfolio. Trusted by 50,000+ learners worldwide.",
  keywords: ["credentials", "portfolio", "skills", "verification", "NSQF", "career"],
  authors: [{ name: "CredMatrix" }],
  openGraph: {
    title: "CredMatrix — Unified Digital Skill Portfolio",
    description: "Aggregate, verify, and showcase your credentials in one premium digital portfolio.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, interDisplay.variable)}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
