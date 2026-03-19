"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Briefcase, TrendingUp, Target, Brain, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function RecommendedJobsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recommended Jobs</h1>
        <p className="text-muted-foreground">AI-powered job recommendations based on your skills</p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">✨ AI-Powered Job Matching Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Our AI engine will analyze your verified credentials and skills to recommend the perfect job opportunities tailored just for you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matched Jobs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-muted-foreground">AI matching coming soon</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Match Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-muted-foreground">AI scoring coming soon</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Today</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-muted-foreground">Real-time updates coming</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Features */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Smart Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• AI analyzes your verified credentials</li>
              <li>• Matches skills with job requirements</li>
              <li>• Considers NSQF levels and experience</li>
              <li>• Personalized match scores for each job</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              Intelligent Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Jobs ranked by compatibility</li>
              <li>• Career growth opportunities</li>
              <li>• Salary range predictions</li>
              <li>• Location-based filtering</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Skill Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Identify missing skills for dream jobs</li>
              <li>• Suggested courses and certifications</li>
              <li>• Track your skill development</li>
              <li>• Improve match scores over time</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-500" />
              One-Click Apply
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Apply with verified credentials</li>
              <li>• Auto-fill application forms</li>
              <li>• Track application status</li>
              <li>• Direct employer connections</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
