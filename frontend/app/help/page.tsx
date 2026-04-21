"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { motion } from "framer-motion";
import { BookOpen, HelpCircle, Mail, MessageSquare } from "lucide-react";

const helpCategories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics of CredMatrix",
    articles: [
      "Creating your account",
      "Setting up your profile",
      "Adding your first credential",
      "Understanding skill mapping",
    ],
  },
  {
    icon: HelpCircle,
    title: "Credentials",
    description: "Managing your credentials",
    articles: [
      "How to add credentials",
      "Verifying credentials",
      "Sharing credentials with employers",
      "Credential privacy settings",
    ],
  },
  {
    icon: MessageSquare,
    title: "For Employers",
    description: "Hiring and verification",
    articles: [
      "Searching for candidates",
      "Verifying learner credentials",
      "Posting job opportunities",
      "Managing applications",
    ],
  },
  {
    icon: Mail,
    title: "Account & Billing",
    description: "Manage your account",
    articles: [
      "Subscription plans",
      "Payment methods",
      "Account security",
      "Canceling your subscription",
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b border-whisper">
          <div className="container py-20 md:py-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl text-center space-y-6 px-4"
            >
              <h1 className="text-display-large md:text-display-xlarge font-bold text-near-black">
                Help Center
              </h1>
              <p className="text-body-large text-warm-gray-500 leading-relaxed">
                Find answers to common questions and learn how to make the most of CredMatrix
              </p>
            </motion.div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="container py-20 md:py-28">
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {helpCategories.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-standard bg-white border border-whisper hover:shadow-notion transition-all duration-200"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-standard bg-notion-blue/10 flex items-center justify-center flex-shrink-0">
                    <category.icon className="h-6 w-6 text-notion-blue" />
                  </div>
                  <div>
                    <h3 className="text-body-large font-semibold text-near-black mb-1">
                      {category.title}
                    </h3>
                    <p className="text-body text-warm-gray-500">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {category.articles.map((article, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-body text-warm-gray-500 hover:text-notion-blue transition-colors duration-200 flex items-center gap-2"
                      >
                        <span className="text-notion-blue">→</span>
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="border-t border-whisper bg-white py-20 md:py-28">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center space-y-6"
            >
              <h2 className="text-display-medium font-bold text-near-black">
                Still need help?
              </h2>
              <p className="text-body-large text-warm-gray-500">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a
                  href="/contact"
                  className="px-6 py-3 rounded-standard bg-notion-blue text-white hover:bg-notion-blue/90 transition-colors duration-200 text-body-semibold"
                >
                  Contact Support
                </a>
                <a
                  href="mailto:support@credmatrix.com"
                  className="px-6 py-3 rounded-standard bg-white border border-whisper text-near-black hover:bg-warm-white transition-colors duration-200 text-body-semibold"
                >
                  Email Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
