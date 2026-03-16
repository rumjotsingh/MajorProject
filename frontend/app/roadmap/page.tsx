"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { BackToHome } from "@/components/back-to-home";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock } from "lucide-react";

const roadmapItems = [
  {
    quarter: "Q1 2026",
    status: "completed",
    items: [
      "Platform launch with core features",
      "Learner portfolio management",
      "Basic credential verification",
      "Mobile responsive design",
      "Dark mode support",
    ],
  },
  {
    quarter: "Q2 2026",
    status: "in-progress",
    items: [
      "Blockchain-based verification",
      "Advanced skill mapping",
      "Employer dashboard",
      "API for third-party integrations",
      "Multilingual support (5 languages)",
    ],
  },
  {
    quarter: "Q3 2026",
    status: "planned",
    items: [
      "AI-powered career recommendations",
      "Video credential verification",
      "Mobile native apps (iOS & Android)",
      "Advanced analytics dashboard",
      "White-label solutions for institutions",
    ],
  },
  {
    quarter: "Q4 2026",
    status: "planned",
    items: [
      "NFT-based credentials",
      "Peer-to-peer skill endorsements",
      "Virtual career fairs",
      "Integration with major LMS platforms",
      "Advanced fraud detection",
    ],
  },
];

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
    label: "Completed",
  },
  "in-progress": {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "In Progress",
  },
  planned: {
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Planned",
  },
};

export default function RoadmapPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <BackToHome />

      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center space-y-4 md:space-y-6 mb-12 md:mb-16 px-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
              Product <span className="text-primary">Roadmap</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
              See what we're building and what's coming next for MicroCred
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4">
            {roadmapItems.map((item, i) => {
              const config = statusConfig[item.status as keyof typeof statusConfig];
              const Icon = config.icon;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">{item.quarter}</CardTitle>
                          <CardDescription className="mt-1">
                            {item.items.length} features
                          </CardDescription>
                        </div>
                        <Badge className={`${config.bg} ${config.color} border-0`}>
                          <Icon className="h-4 w-4 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {item.items.map((feature, j) => (
                          <motion.li
                            key={j}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + j * 0.05 }}
                            className="flex items-start gap-3"
                          >
                            <div className={`mt-0.5 ${config.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-muted-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Card className="max-w-2xl mx-auto bg-muted/30">
              <CardHeader>
                <CardTitle>Have a Feature Request?</CardTitle>
                <CardDescription>
                  We'd love to hear your ideas! Help us shape the future of MicroCred.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Email us at <a href="mailto:feedback@microcred.com" className="text-primary hover:underline">feedback@microcred.com</a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
