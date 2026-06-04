"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
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
                Privacy Policy
              </h1>
              <p className="text-body text-warm-gray-500">Last updated: March 16, 2026</p>
            </div>

            <div className="space-y-12">
              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Introduction</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  At CredMatrix, we take your privacy seriously. This Privacy Policy explains how we collect,
                  use, disclose, and safeguard your information when you use our platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Information We Collect</h2>
                <div className="space-y-6">
                  <div className="p-6 rounded-standard bg-white border border-whisper">
                    <h3 className="text-body-large font-semibold text-near-black mb-2">Personal Information</h3>
                    <p className="text-body text-warm-gray-500 leading-relaxed">
                      We collect information you provide directly, including name, email address, profile information,
                      credentials, and educational background.
                    </p>
                  </div>
                  <div className="p-6 rounded-standard bg-white border border-whisper">
                    <h3 className="text-body-large font-semibold text-near-black mb-2">Usage Information</h3>
                    <p className="text-body text-warm-gray-500 leading-relaxed">
                      We automatically collect information about how you interact with our platform, including
                      pages visited, features used, and time spent on the platform.
                    </p>
                  </div>
                  <div className="p-6 rounded-standard bg-white border border-whisper">
                    <h3 className="text-body-large font-semibold text-near-black mb-2">Device Information</h3>
                    <p className="text-body text-warm-gray-500 leading-relaxed">
                      We collect information about the device you use to access our platform, including
                      IP address, browser type, and operating system.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">How We Use Your Information</h2>
                <div className="space-y-3 pl-6">
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      To provide, maintain, and improve our services
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      To verify credentials and facilitate connections between learners and employers
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      To send you updates, security alerts, and support messages
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      To analyze usage patterns and improve user experience
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      To comply with legal obligations and protect our rights
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Information Sharing</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  We do not sell your personal information. We may share your information in the following circumstances:
                </p>
                <div className="space-y-3 pl-6">
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      With your consent or at your direction
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      With service providers who assist in operating our platform
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      When required by law or to protect our rights
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      In connection with a business transaction (merger, acquisition, etc.)
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Data Security</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information.
                  However, no method of transmission over the internet is 100% secure, and we cannot guarantee
                  absolute security.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Your Rights</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <div className="space-y-3 pl-6">
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Access and receive a copy of your personal information
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Correct inaccurate or incomplete information
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Request deletion of your personal information
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Opt-out of marketing communications
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Object to processing of your information
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Children's Privacy</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  Our platform is not intended for children under 13 years of age. We do not knowingly collect
                  personal information from children under 13.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Changes to This Policy</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by
                  posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="space-y-4 pt-8 ">
                <h2 className="text-display-small font-bold text-near-black">Contact Us</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@credmatrix.com" className="text-notion-blue hover:underline">
                    privacy@credmatrix.com
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
