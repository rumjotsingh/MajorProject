import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
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
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
