"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Shield, TrendingUp, Users, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

const features = [
  {
    icon: Award,
    title: "Unified Portfolio",
    description: "Aggregate all your credentials from multiple sources in one beautiful portfolio",
  },
  {
    icon: Shield,
    title: "Verified Credentials",
    description: "Blockchain-backed verification ensures authenticity and trust",
  },
  {
    icon: TrendingUp,
    title: "Skill Mapping",
    description: "Visual representation of your skill growth and career progression",
  },
  {
    icon: Users,
    title: "Connect with Employers",
    description: "Get discovered by top companies looking for your unique skills",
  },
];

const stats = [
  { value: "50K+", label: "Active Learners" },
  { value: "500+", label: "Partner Institutions" },
  { value: "100K+", label: "Credentials Issued" },
  { value: "95%", label: "Verification Rate" },
];

const benefits = [
  "Centralized credential management",
  "NSQF level mapping",
  "Instant verification",
  "Career path recommendations",
  "Skill gap analysis",
  "Employer matching",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container relative py-24 md:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 rounded-full border bg-background/50 backdrop-blur-sm px-4 py-2 text-sm"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Trusted by 50,000+ learners worldwide</span>
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Your Skills,
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                One Portfolio
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              Aggregate credentials from universities, training providers, and edtech platforms
              into a unified digital skill portfolio that showcases your true potential.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button size="lg" className="gap-2 h-12 px-8 text-base">
                  Start Building Your Portfolio
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive platform for learners, employers, and training providers
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-all"
            >
              <div className="p-3 rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Why Choose MicroCred?
              </h2>
              <p className="text-muted-foreground text-lg">
                Build a comprehensive skill portfolio that stands out to employers and showcases your continuous learning journey.
              </p>
              <div className="grid gap-4">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-base">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border-2 border-primary/20 p-12 flex items-center justify-center overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
                
                {/* Main credential illustration */}
                <div className="relative z-10 space-y-6 w-full">
                  <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-primary/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-primary/30 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-5/6" />
                    </div>
                  </div>
                  
                  <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-primary/20 transform translate-x-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-primary/30 rounded w-2/3 mb-2" />
                        <div className="h-2 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-12 text-center text-primary-foreground"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
            Ready to Build Your Portfolio?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of learners who are already showcasing their skills and getting hired.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2 h-12 px-8 text-base">
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}
