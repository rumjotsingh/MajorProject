"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { motion } from "framer-motion";

export default function CookiesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <LandingNav />

      <main className="flex-1">
        <section className="container py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl space-y-12"
          >
            <div className="text-center space-y-4 pb-8 ">
              <h1 className="text-display-large md:text-display-xlarge font-bold text-near-black">
                Cookie Policy
              </h1>
              <p className="text-body text-warm-gray-500">Last updated: March 16, 2026</p>
            </div>

            <div className="space-y-12">
              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">What Are Cookies</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  Cookies are small text files that are placed on your device when you visit our website.
                  They help us provide you with a better experience by remembering your preferences and
                  understanding how you use our platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">How We Use Cookies</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed mb-4">
                  We use cookies for the following purposes:
                </p>
                <div className="space-y-3 pl-6">
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      <strong className="text-near-black">Essential Cookies:</strong> Required for the platform to function properly
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      <strong className="text-near-black">Preference Cookies:</strong> Remember your settings and preferences
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      <strong className="text-near-black">Analytics Cookies:</strong> Help us understand how you use our platform
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      <strong className="text-near-black">Marketing Cookies:</strong> Used to deliver relevant advertisements
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-display-small font-bold text-near-black">Types of Cookies We Use</h2>
                <div className="space-y-6">
                  <div className="p-6 rounded-standard bg-white border border-whisper">
                    <h3 className="text-body-large font-semibold text-near-black mb-2">Session Cookies</h3>
                    <p className="text-body text-warm-gray-500 leading-relaxed">
                      Temporary cookies that expire when you close your browser. These are essential
                      for maintaining your login session.
                    </p>
                  </div>
                  <div className="p-6 rounded-standard bg-white">
                    <h3 className="text-body-large font-semibold text-near-black mb-2">Persistent Cookies</h3>
                    <p className="text-body text-warm-gray-500 leading-relaxed">
                      Remain on your device for a set period or until you delete them. These remember
                      your preferences across visits.
                    </p>
                  </div>
                  <div className="p-6 rounded-standard bg-white ">
                    <h3 className="text-body-large font-semibold text-near-black mb-2">Third-Party Cookies</h3>
                    <p className="text-body text-warm-gray-500 leading-relaxed">
                      Set by external services we use, such as analytics providers and social media platforms.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Managing Cookies</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed mb-4">
                  You can control and manage cookies in various ways:
                </p>
                <div className="space-y-3 pl-6">
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Browser settings: Most browsers allow you to refuse or delete cookies
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Cookie preferences: Use our cookie consent tool to manage your preferences
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Opt-out tools: Use third-party opt-out mechanisms for analytics cookies
                    </p>
                  </div>
                </div>
                <p className="text-body text-warm-gray-500 leading-relaxed mt-4 p-4 rounded-standard bg-amber-50 border border-amber-200">
                  Note: Disabling certain cookies may affect the functionality of our platform.
                </p>
              </section>

              <section className="space-y-4 pt-8 ">
                <h2 className="text-display-small font-bold text-near-black">Contact Us</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  If you have questions about our use of cookies, please contact us at{" "}
                  <a href="mailto:cookies@credmatrix.com" className="text-notion-blue hover:underline">
                    cookies@credmatrix.com
                  </a>
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
