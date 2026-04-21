"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { motion } from "framer-motion";
import { Award, Target, Users, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission Driven",
    description: "Democratizing access to skill verification and credential management for everyone.",
  },
  {
    icon: Users,
    title: "Learner First",
    description: "Every decision we make puts learners and their success at the center.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Constantly pushing boundaries to create better learning experiences.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Committed to delivering the highest quality platform and support.",
  },
];

export default function AboutPage() {
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
                About CredMatrix
              </h1>
              <p className="text-body-large text-warm-gray-500 leading-relaxed">
                We're building the future of credential management and skill verification,
                empowering learners to showcase their true potential.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="border-b border-whisper py-20 md:py-28">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl space-y-8"
            >
              <h2 className="text-display-medium font-bold text-near-black">Our Story</h2>
              <div className="space-y-6 text-body-large text-warm-gray-500 leading-relaxed">
                <p>
                  CredMatrix was founded with a simple yet powerful vision: to create a world where
                  every skill, every achievement, and every learning milestone can be easily verified
                  and shared.
                </p>
                <p>
                  In today's rapidly evolving job market, traditional credentials alone don't tell
                  the full story of a person's capabilities. We believe that micro-credentials,
                  certifications, and continuous learning achievements deserve equal recognition.
                </p>
                <p>
                  Our platform brings together learners, educational institutions, and employers in
                  a unified ecosystem that values lifelong learning and skill development.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="container py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-display-medium font-bold text-near-black">Our Values</h2>
            <p className="text-body-large text-warm-gray-500 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-4 p-6 rounded-standard bg-white border border-whisper hover:shadow-notion transition-all duration-200"
              >
                <div className="mx-auto w-14 h-14 rounded-standard bg-notion-blue/10 flex items-center justify-center">
                  <value.icon className="h-7 w-7 text-notion-blue" />
                </div>
                <h3 className="text-body-large font-semibold text-near-black">{value.title}</h3>
                <p className="text-body text-warm-gray-500">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="border-t border-whisper bg-white py-20 md:py-28">
          <div className="container">
            <div className="grid gap-12 md:grid-cols-3 text-center max-w-4xl mx-auto">
              {[
                { value: "2024", label: "Founded" },
                { value: "50K+", label: "Active Users" },
                { value: "500+", label: "Partner Institutions" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-2"
                >
                  <div className="text-display-large font-bold text-notion-blue">{stat.value}</div>
                  <div className="text-body text-warm-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
