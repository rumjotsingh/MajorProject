"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, CheckCircle, Clock, Plus, ArrowRight, Target, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
  { icon: Award, label: "Total Credentials", value: "24", change: "+3 this month", color: "text-blue-500" },
  { icon: Target, label: "NSQF Level", value: "6", change: "Advanced Diploma", color: "text-purple-500" },
  { icon: CheckCircle, label: "Verified", value: "21", change: "87.5% verified", color: "text-green-500" },
  { icon: Clock, label: "Pending", value: "3", change: "Awaiting verification", color: "text-orange-500" },
];

const recentCredentials = [
  {
    title: "Full Stack Web Development",
    issuer: "Coursera",
    date: "Dec 2024",
    verified: true,
    nsqfLevel: 6,
  },
  {
    title: "Data Science Specialization",
    issuer: "edX",
    date: "Nov 2024",
    verified: true,
    nsqfLevel: 7,
  },
  {
    title: "Cloud Architecture",
    issuer: "AWS",
    date: "Oct 2024",
    verified: false,
    nsqfLevel: 6,
  },
];

const skills = [
  { name: "Web Development", level: 85, color: "bg-blue-500" },
  { name: "Data Science", level: 70, color: "bg-purple-500" },
  { name: "Cloud Computing", level: 65, color: "bg-green-500" },
  { name: "Machine Learning", level: 55, color: "bg-orange-500" },
];

const recommendations = [
  {
    title: "Advanced React Patterns",
    provider: "Frontend Masters",
    duration: "8 hours",
    level: "Advanced",
  },
  {
    title: "AWS Solutions Architect",
    provider: "AWS Training",
    duration: "40 hours",
    level: "Professional",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back! 👋</h1>
          <p className="text-sm md:text-base text-muted-foreground">Here's your learning overview</p>
        </div>
        <Link href="/credentials/upload">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Credential</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Credentials */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Credentials</CardTitle>
            <Link href="/credentials">
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCredentials.map((cred, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-sm md:text-base">{cred.title}</p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground flex-wrap">
                      <span>{cred.issuer}</span>
                      <span>•</span>
                      <span>{cred.date}</span>
                      <span>•</span>
                      <span>NSQF {cred.nsqfLevel}</span>
                    </div>
                  </div>
                  <Badge variant={cred.verified ? "default" : "secondary"} className="ml-2">
                    {cred.verified ? "Verified" : "Pending"}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills.map((skill, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                      className={`h-full ${skill.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recommended for You</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Based on your skill profile</p>
          </div>
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {rec.title}
                  </h3>
                  <Badge variant="outline">{rec.level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.provider}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{rec.duration}</span>
                  <Button size="sm" variant="ghost" className="gap-2 group-hover:gap-3 transition-all">
                    Explore
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
