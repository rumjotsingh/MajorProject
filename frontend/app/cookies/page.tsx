"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { motion } from "framer-motion";

export default function CookiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />

      <main className="flex-1">
        <section className="container py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
                Cookie Policy
              </h1>
              <p className="text-muted-foreground">Last updated: March 16, 2026</p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are placed on your device when you visit our website.
                  They help us provide you with a better experience by remembering your preferences and
                  understanding how you use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
                <p className="text-muted-foreground mb-4">We use cookies for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Essential Cookies:</strong> Required for the platform to function properly</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Session Cookies</h3>
                    <p className="text-muted-foreground">
                      Temporary cookies that expire when you close your browser. These are essential
                      for maintaining your login session.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Persistent Cookies</h3>
                    <p className="text-muted-foreground">
                      Remain on your device for a set period or until you delete them. These remember
                      your preferences across visits.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Third-Party Cookies</h3>
                    <p className="text-muted-foreground">
                      Set by external services we use, such as analytics providers and social media platforms.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  You can control and manage cookies in various ways:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Browser settings: Most browsers allow you to refuse or delete cookies</li>
                  <li>Cookie preferences: Use our cookie consent tool to manage your preferences</li>
                  <li>Opt-out tools: Use third-party opt-out mechanisms for analytics cookies</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Note: Disabling certain cookies may affect the functionality of our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about our use of cookies, please contact us at cookies@CredMatrix.com
                </p>
              </section>
            </div>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
