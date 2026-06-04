"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { motion } from "framer-motion";

export default function TermsPage() {
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
                Terms of Service
              </h1>
              <p className="text-body text-warm-gray-500">Last updated: March 16, 2026</p>
            </div>

            <div className="space-y-12">
              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Agreement to Terms</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  By accessing or using CredMatrix, you agree to be bound by these Terms of Service and all
                  applicable laws and regulations. If you do not agree with any of these terms, you are
                  prohibited from using this platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Use License</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed mb-4">
                  Permission is granted to temporarily access CredMatrix for personal, non-commercial use only.
                  This license does not include:
                </p>
                <div className="space-y-3 pl-6">
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Modifying or copying the platform materials
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Using the materials for commercial purposes
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Attempting to reverse engineer any software
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Removing copyright or proprietary notations
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">User Accounts</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed mb-4">
                  When you create an account with us, you must provide accurate and complete information.
                  You are responsible for:
                </p>
                <div className="space-y-3 pl-6">
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Maintaining the security of your account credentials
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      All activities that occur under your account
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      Notifying us immediately of any unauthorized access
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Credential Verification</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  You agree to provide accurate information about your credentials and qualifications.
                  Submitting false or misleading information may result in account termination and legal action.
                  We reserve the right to verify any credentials submitted to our platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Prohibited Uses</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed mb-4">
                  You may not use CredMatrix:
                </p>
                <div className="space-y-3 pl-6">
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      In any way that violates applicable laws or regulations
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      To transmit harmful or malicious code
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      To harass, abuse, or harm other users
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      To impersonate others or provide false information
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-notion-blue">•</span>
                    <p className="text-body text-warm-gray-500">
                      To scrape or collect data without permission
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Intellectual Property</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  The platform and its original content, features, and functionality are owned by CredMatrix
                  and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Termination</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  We may terminate or suspend your account immediately, without prior notice, for any reason,
                  including breach of these Terms. Upon termination, your right to use the platform will
                  immediately cease.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Limitation of Liability</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  CredMatrix shall not be liable for any indirect, incidental, special, consequential, or
                  punitive damages resulting from your use of or inability to use the platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Disclaimer</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  The platform is provided "as is" without warranties of any kind, either express or implied.
                  We do not warrant that the platform will be uninterrupted, secure, or error-free.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Changes to Terms</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any material
                  changes by posting the new Terms of Service on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-display-small font-bold text-near-black">Governing Law</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
                  in which CredMatrix operates, without regard to its conflict of law provisions.
                </p>
              </section>

              <section className="space-y-4 pt-8 x">
                <h2 className="text-display-small font-bold text-near-black">Contact Us</h2>
                <p className="text-body-large text-warm-gray-500 leading-relaxed">
                  If you have questions about these Terms of Service, please contact us at{" "}
                  <a href="mailto:legal@credmatrix.com" className="text-notion-blue hover:underline">
                    legal@credmatrix.com
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
