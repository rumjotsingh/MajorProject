"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Shield, TrendingUp, Users, CheckCircle, Sparkles, Zap, Globe, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

const features = [
  {
    icon: Award,
    title: "Unified Portfolio",
    description: "Aggregate credentials from multiple sources into one elegant, shareable portfolio.",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Shield,
    title: "Blockchain Verified",
    description: "Tamper-proof verification ensures every credential is authentic and trusted.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: TrendingUp,
    title: "Skill Analytics",
    description: "Visualize your growth with intelligent skill mapping and gap analysis.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Employer Connect",
    description: "Get discovered by top companies actively searching for your unique skill set.",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
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
    <div className="flex min-h-screen flex-col">
      <LandingNav />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 dot-pattern opacity-40" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-500/6 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />

        <div className="container relative section-padding">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl text-center space-y-8"
          >
            {/* Badge */}
            <motion.div custom={0} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-4 py-1.5 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-medium">
                  Trusted by 50,000+ learners worldwide
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Your Skills,
              <br />
              <span className="gradient-text">One Portfolio</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              custom={2}
              variants={fadeUp}
              className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
            >
              Aggregate credentials from universities, training providers, and edtech platforms
              into a unified digital skill portfolio that showcases your true potential.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3}
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gap-2 h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Start Building Your Portfolio
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base rounded-full hover:bg-muted/50"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>

            {/* Social proof mini */}
            <motion.div custom={4} variants={fadeUp} className="pt-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-purple-500/60"
                      style={{ opacity: 1 - i * 0.15 }}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Join <span className="font-semibold text-foreground">2,000+</span> new signups this month
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="relative border-y bg-muted/30">
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
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="features" className="section-padding">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium mb-2">
              <Sparkles className="h-4 w-4" />
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A comprehensive platform for learners, employers, and training providers
            </p>
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
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ BENEFITS ════════════════ */}
      <section className="relative section-padding bg-muted/20">
        <div className="absolute inset-0 gradient-mesh opacity-20 pointer-events-none" />
        <div className="container relative">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium mb-4">
                  Why CredMatrix
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Built for Modern Learners
                </h2>
                <p className="text-muted-foreground text-lg mt-4 leading-relaxed">
                  Build a comprehensive skill portfolio that stands out to employers and showcases your continuous learning journey.
                </p>
              </div>
              <div className="grid gap-4">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-background/60 transition-colors"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-muted/80 to-muted/40 border-2 border-border/50 p-10 flex items-center justify-center overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
                <div className="absolute bottom-8 left-8 w-40 h-40 rounded-full bg-purple-500/5 blur-2xl" />
                
                <div className="relative z-10 space-y-5 w-full">
                  {/* Mock credential card 1 */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                    className="bg-background/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gradient-to-r from-primary/30 to-purple-400/30 rounded-full w-3/4 mb-2" />
                        <div className="h-2 bg-muted rounded-full w-1/2" />
                      </div>
                      <div className="h-6 px-2.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium flex items-center">
                        Verified
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded-full w-full" />
                      <div className="h-2 bg-muted rounded-full w-5/6" />
                    </div>
                  </motion.div>
                  
                  {/* Mock credential card 2 */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-background/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border translate-x-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-full w-2/3 mb-2" />
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

      {/* ════════════════ CTA ════════════════ */}
      <section className="section-padding">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* CTA Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-600" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            
            <div className="relative p-12 md:p-16 text-center text-white">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Ready to Build Your Portfolio?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of learners who are already showcasing their skills and getting discovered by top employers.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gap-2 h-12 px-8 text-base rounded-full bg-white text-purple-700 hover:bg-white/90 shadow-xl shadow-black/20"
                >
                  Get Started for Free
                  <ArrowRight className="h-4 w-4" />
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
