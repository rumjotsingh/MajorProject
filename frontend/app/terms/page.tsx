"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { motion } from "framer-motion";

export default function TermsPage() {
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
                Terms of Service
              </h1>
              <p className="text-muted-foreground">Last updated: March 16, 2026</p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using MicroCred, you agree to be bound by these Terms of Service
                  and all applicable laws and regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Use License</h2>
                <p className="text-muted-foreground mb-4">
                  Permission is granted to temporarily use MicroCred for personal, non-commercial use only.
                  This license shall automatically terminate if you violate any of these restrictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
                <p className="text-muted-foreground mb-4">When you create an account, you must:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Credential Verification</h2>
                <p className="text-muted-foreground">
                  You are responsible for ensuring that all credentials uploaded to the platform are
                  authentic and accurate. Fraudulent credentials may result in account termination.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Prohibited Activities</h2>
                <p className="text-muted-foreground mb-4">You may not:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Upload false or misleading credentials</li>
                  <li>Attempt to gain unauthorized access to the platform</li>
                  <li>Interfere with other users' access to the service</li>
                  <li>Use the platform for any illegal purpose</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Termination</h2>
                <p className="text-muted-foreground">
                  We reserve the right to terminate or suspend your account at any time for violations
                  of these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms, contact us at legal@microcred.com
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
