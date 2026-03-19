"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { BackToHome } from "@/components/back-to-home";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const posts = [
  {
    title: "The Future of Credential Management",
    excerpt: "Exploring how blockchain and AI are transforming the way we verify and share educational achievements.",
    category: "Technology",
    date: "March 15, 2026",
    readTime: "5 min read",
    image: "gradient-1",
  },
  {
    title: "Building Your Digital Skill Portfolio",
    excerpt: "A comprehensive guide to creating a portfolio that stands out to employers and showcases your continuous learning.",
    category: "Career",
    date: "March 12, 2026",
    readTime: "8 min read",
    image: "gradient-2",
  },
  {
    title: "NSQF Levels Explained",
    excerpt: "Understanding the National Skills Qualifications Framework and how it maps to your credentials.",
    category: "Education",
    date: "March 10, 2026",
    readTime: "6 min read",
    image: "gradient-3",
  },
  {
    title: "Micro-Credentials: The New Currency",
    excerpt: "Why micro-credentials are becoming increasingly valuable in today's job market and how to leverage them.",
    category: "Trends",
    date: "March 8, 2026",
    readTime: "7 min read",
    image: "gradient-4",
  },
  {
    title: "Employer's Guide to Skill Verification",
    excerpt: "How employers can use CredMatrix to verify candidate credentials and find the right talent faster.",
    category: "Business",
    date: "March 5, 2026",
    readTime: "5 min read",
    image: "gradient-5",
  },
  {
    title: "Success Stories: Learners Who Made It",
    excerpt: "Inspiring stories from learners who used CredMatrix to land their dream jobs and advance their careers.",
    category: "Inspiration",
    date: "March 1, 2026",
    readTime: "10 min read",
    image: "gradient-6",
  },
];

const gradients = {
  "gradient-1": "from-blue-500 to-purple-500",
  "gradient-2": "from-purple-500 to-pink-500",
  "gradient-3": "from-pink-500 to-orange-500",
  "gradient-4": "from-orange-500 to-yellow-500",
  "gradient-5": "from-green-500 to-teal-500",
  "gradient-6": "from-teal-500 to-blue-500",
};

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <BackToHome />

      <main className="flex-1">
        <section className="container py-16 md:py-24">
          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2">📝 Blog Coming Soon</h3>
                  <p className="text-muted-foreground">
                    We're preparing insightful articles about credentials, skills, and career growth. 
                    The posts shown below are preview content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center space-y-4 md:space-y-6 mb-12 md:mb-16 px-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter">
              Blog & <span className="text-primary">Insights</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
              Stay updated with the latest trends in credential management, skill development, and career growth.
            </p>
          </motion.div>

          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
            {posts.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/blog/${i + 1}`}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                    <div className={`h-48 bg-gradient-to-br ${gradients[post.image as keyof typeof gradients]} rounded-t-xl`} />
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{post.category}</Badge>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription>{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary mt-4 group-hover:gap-3 transition-all">
                        <span className="text-sm font-medium">Read more</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
