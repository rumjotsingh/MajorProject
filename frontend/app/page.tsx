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
    title: "Blockchain Verified",
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
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 gradient-mesh-hero" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-orb-1" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-primary/[0.07] blur-3xl animate-orb-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-3xl" />

        <div className="container relative section-padding">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-5xl text-center space-y-8">
            <motion.div custom={0} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm backdrop-blur-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-medium text-primary">Trusted by 50,000+ learners worldwide</span>
              </div>
            </motion.div>

            <motion.h1 custom={1} variants={fadeUp} className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-gradient-brand">Your Skills,</span>
              <br />
              One Portfolio
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
              Aggregate credentials from universities, training providers, and edtech platforms into a unified digital skill portfolio that showcases your true potential.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 h-12 px-8 text-base rounded-full group">
                  Start Building Your Portfolio
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full bg-background/60 backdrop-blur-sm border-border/60 hover:border-primary/30">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="relative border-b border-border/40 bg-muted/30">
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
                <div className="text-3xl md:text-4xl font-bold text-gradient-brand">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="section-padding">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary">Features</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A comprehensive platform for learners, employers, and training providers</p>
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
                <div className="premium-card-interactive p-6 h-full flex flex-col items-start text-left space-y-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Benefits ═══ */}
      <section className="relative section-padding bg-muted/10 border-y border-border/40">
        <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />
        <div className="container relative">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium mb-4">
                  <span className="text-primary">Why CredMatrix</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for Modern Learners</h2>
                <p className="text-muted-foreground text-lg mt-4 leading-relaxed">
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
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-background/60 transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative aspect-square rounded-3xl bg-background border-2 border-border/60 p-10 flex items-center justify-center overflow-hidden">
                <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl animate-orb-1" />
                <div className="absolute bottom-8 left-8 w-40 h-40 rounded-full bg-primary/[0.07] blur-2xl animate-orb-2" />
                <div className="relative z-10 space-y-5 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                    className="bg-background/95 rounded-2xl p-5 shadow-lg shadow-primary/[0.04] border border-border/50"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-foreground/20 rounded-full w-3/4 mb-2" />
                        <div className="h-2 bg-muted rounded-full w-1/2" />
                      </div>
                      <div className="h-6 px-2.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center shadow-sm shadow-primary/20">
                        Verified
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded-full w-full" />
                      <div className="h-2 bg-muted rounded-full w-5/6" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-background/95 rounded-2xl p-5 shadow-lg shadow-primary/[0.04] border border-border/50 translate-x-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-foreground/20 rounded-full w-2/3 mb-2" />
                        <div className="h-2 bg-muted rounded-full w-1/3" />
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
      <section className="section-padding">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 gradient-brand" />
            <div className="absolute inset-0 dot-pattern opacity-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            <div className="relative p-12 md:p-16 text-center text-white">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Ready to Build Your Portfolio?</h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of learners who are already showcasing their skills and getting discovered by top employers.
              </p>
              <Link href="/signup">
                <Button size="lg" className="gap-2 h-12 px-8 text-base rounded-full bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/20 group">
                  Get Started for Free
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
