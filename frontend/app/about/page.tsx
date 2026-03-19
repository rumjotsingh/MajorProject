"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { BackToHome } from "@/components/back-to-home";
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
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <BackToHome />

      <main className="flex-1">
        {/* Hero */}
        <section className="container py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center space-y-4 md:space-y-6 mb-12 md:mb-16 px-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter">
              About <span className="text-primary">CredMatrix</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
              We're building the future of credential management and skill verification,
              empowering learners to showcase their true potential.
            </p>
          </motion.div>
        </section>

        {/* Story */}
        <section className="bg-muted/30 py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-8">
              <h2 className="text-3xl font-bold">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
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
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="container py-24">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Values</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-4"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-muted/30 py-24">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">2024</div>
                <div className="text-muted-foreground">Founded</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Partner Institutions</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
