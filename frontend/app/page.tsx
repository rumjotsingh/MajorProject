"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Shield, TrendingUp, Users, Sparkles, Zap, Globe, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

const features = [
  {
    icon: Award,
    title: "Unified Portfolio",
    description: "Aggregate credentials from multiple sources into one elegant, shareable portfolio.",
  },
  {
    icon: Shield,
    title: "Secure Verification",
    description: "Tamper-proof verification ensures every credential is authentic and trusted.",
  },
  {
    icon: TrendingUp,
    title: "Skill Analytics",
    description: "Visualize your growth with intelligent skill mapping and gap analysis.",
  },
  {
    icon: Users,
    title: "Employer Connect",
    description: "Get discovered by top companies actively searching for your unique skill set.",
  },
];

const stats = [
  { value: "50K+", label: "Active Learners" },
  { value: "500+", label: "Partner Institutions" },
  { value: "100K+", label: "Credentials Issued" },
  { value: "95%", label: "Verification Rate" },
];

const benefits = [
  { icon: Zap, text: "Centralized credential management" },
  { icon: BarChart3, text: "NSQF level mapping & analytics" },
  { icon: Shield, text: "Instant verification" },
  { icon: TrendingUp, text: "Career path recommendations" },
  { icon: Globe, text: "Skill gap analysis" },
  { icon: Users, text: "Employer matching" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden border-b border-whisper bg-white">
        <div className="container relative section-spacing">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-5xl text-center space-y-8">
            <motion.div custom={0} variants={fadeUp}>
              <div className="badge-pill inline-flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-notion-blue animate-pulse" />
                <span>Trusted by 50,000+ learners worldwide</span>
              </div>
            </motion.div>

            <motion.h1 custom={1} variants={fadeUp} className="text-display-hero text-near-black">
              Your Skills,
              <br />
              One Portfolio
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} className="mx-auto max-w-2xl text-body-large text-warm-gray-500">
              Aggregate credentials from universities, training providers, and edtech platforms into a unified digital skill portfolio that showcases your true potential.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 group">
                  Start Building Your Portfolio
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="secondary">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="relative border-b border-whisper bg-warm-white">
        <div className="container py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-subheading-large text-notion-blue">{stat.value}</div>
                <div className="text-caption text-warm-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="section-spacing bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <div className="badge-pill inline-flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Features</span>
            </div>
            <h2 className="text-section-heading text-near-black">Everything You Need</h2>
            <p className="text-body-large text-warm-gray-500 max-w-2xl mx-auto">A comprehensive platform for learners, employers, and training providers</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="card-notion hover-notion-lift p-6 h-full flex flex-col items-start text-left space-y-4">
                  <div className="p-3 rounded-standard bg-badge-blue-bg border-whisper group-hover:bg-notion-blue/10 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-notion-blue" />
                  </div>
                  <h3 className="text-card-title text-near-black">{feature.title}</h3>
                  <p className="text-body text-warm-gray-500">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Benefits ═══ */}
      <section className="relative section-spacing bg-warm-white">
        <div className="container relative">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <div className="badge-pill inline-flex items-center gap-2 mb-4">
                  <span>Why CredMatrix</span>
                </div>
                <h2 className="text-section-heading text-near-black">Built for Modern Learners</h2>
                <p className="text-body-large text-warm-gray-500 mt-4">
                  Build a comprehensive skill portfolio that stands out to employers and showcases your continuous learning journey.
                </p>
              </div>
              <div className="grid gap-3">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-3 rounded-standard hover:bg-white transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-standard bg-badge-blue-bg border-whisper flex items-center justify-center group-hover:bg-notion-blue/10 transition-colors">
                      <benefit.icon className="h-5 w-5 text-notion-blue" />
                    </div>
                    <span className="text-body-medium text-near-black">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative aspect-square rounded-large bg-white border-whisper p-10 flex items-center justify-center overflow-hidden shadow-notion-card">
                <div className="relative z-10 space-y-5 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-comfortable p-5 shadow-notion-card border-whisper"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-11 h-11 rounded-standard bg-badge-blue-bg border-whisper flex items-center justify-center">
                        <Award className="h-5 w-5 text-notion-blue" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-warm-gray-300/40 rounded-pill w-3/4 mb-2" />
                        <div className="h-2 bg-warm-gray-300/30 rounded-pill w-1/2" />
                      </div>
                      <div className="badge-pill">
                        Verified
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-warm-gray-300/30 rounded-pill w-full" />
                      <div className="h-2 bg-warm-gray-300/30 rounded-pill w-5/6" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-comfortable p-5 shadow-notion-card border-whisper translate-x-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-standard bg-badge-blue-bg border-whisper flex items-center justify-center">
                        <Shield className="h-5 w-5 text-notion-blue" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-warm-gray-300/40 rounded-pill w-2/3 mb-2" />
                        <div className="h-2 bg-warm-gray-300/30 rounded-pill w-1/3" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section-spacing bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-large overflow-hidden bg-notion-blue p-12 md:p-16 text-center text-white"
          >
            <h2 className="text-section-heading text-white mb-4">Ready to Build Your Portfolio?</h2>
            <p className="text-body-large opacity-90 max-w-2xl mx-auto mb-8">
              Join thousands of learners who are already showcasing their skills and getting discovered by top employers.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2 bg-white text-notion-blue hover:bg-white/90 group">
                Get Started for Free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
