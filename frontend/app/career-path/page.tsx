"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Briefcase, 
  TrendingUp, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  Circle,
  BookOpen,
  Code,
  Sparkles,
  BarChart3,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PricingModal } from "@/components/pricing-modal";

export default function CareerPathPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [skillAnalysis, setSkillAnalysis] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [skillGap, setSkillGap] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  useEffect(() => {
    loadCareerPaths();
    loadSubscription();
  }, []);

  useEffect(() => {
    if (!loadingSubscription && subscription?.subscription.features.aiRecommendations) {
      analyzeSkills();
    }
  }, [loadingSubscription, subscription]);

  const loadSubscription = async () => {
    try {
      const response = await api.get("/payment/subscription");
      setSubscription(response.data);
    } catch (error) {
      console.error("Failed to load subscription:", error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const loadCareerPaths = async () => {
    try {
      const response = await api.get("/recommendations/career-paths");
      setCareerPaths(response.data.careerPaths || []);
    } catch (error) {
      console.error("Failed to load career paths:", error);
    }
  };

  const analyzeSkills = async () => {
    try {
      setAnalyzing(true);
      const response = await api.post("/recommendations/analyze");
      setSkillAnalysis(response.data);
    } catch (error: any) {
      console.error("Failed to analyze skills:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCareerPathSelect = async (pathName: string) => {
    setSelectedPath(pathName);
    setLoading(true);

    try {
      const [gapResponse, recResponse] = await Promise.all([
        api.post("/recommendations/skill-gap", { careerPath: pathName }),
        api.post("/recommendations/generate", { careerPath: pathName }),
      ]);

      setSkillGap(gapResponse.data);
      setRecommendations(recResponse.data);

      toast({
        title: "Analysis Complete",
        description: `Generated personalized recommendations for ${pathName}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If user doesn't have AI features, show upgrade page
  if (!loadingSubscription && subscription && !subscription.subscription.features.aiRecommendations) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-2xl">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-3">🔒 Upgrade Required</h2>
              <p className="text-lg text-muted-foreground mb-2">
                AI-Powered Career Path Analysis
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This feature is available in Pro and Enterprise plans. Upgrade now to unlock AI-powered skill gap analysis, personalized recommendations, and career path guidance.
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="font-semibold mb-3">What you'll get:</h3>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>AI-powered skill gap analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Personalized course recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Project suggestions based on your skills</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Career path guidance and roadmaps</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button size="lg" className="gap-2 rounded-full shadow-md shadow-primary/20" onClick={() => setPricingModalOpen(true)}>
                <Sparkles className="h-4 w-4" />
                View Plans & Upgrade
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              Current Plan: <Badge variant="secondary" className="rounded-full">{subscription.subscription.plan.toUpperCase()}</Badge>
            </p>
          </CardContent>
        </Card>

        <PricingModal
          open={pricingModalOpen}
          onOpenChange={setPricingModalOpen}
          currentPlan={subscription?.subscription?.plan || 'free'}
          onSubscriptionComplete={() => {
            setPricingModalOpen(false);
            loadSubscription();
          }}
        />
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Career Path</h1>
        <p className="text-muted-foreground">
          Get personalized recommendations based on your credentials and skills
        </p>
      </div>

      {/* Skill Analysis Summary */}
      {skillAnalysis && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Credentials</p>
                <p className="text-2xl font-bold">{skillAnalysis.totalCredentials}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{skillAnalysis.totalCredits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NSQF Level</p>
                <p className="text-2xl font-bold">
                  {skillAnalysis.nsqfLevel} - {skillAnalysis.levelName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Skills Mastered</p>
                <p className="text-2xl font-bold">{skillAnalysis.totalSkills}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Path Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Select Your Target Career Path
          </CardTitle>
          <CardDescription>
            Choose a career path to get personalized skill gap analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {careerPaths.map((path) => (
              <motion.div
                key={path.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedPath === path.name
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleCareerPathSelect(path.name)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold">{path.name}</h3>
                      <Badge variant={path.demand === "Very High" ? "default" : "secondary"}>
                        {path.demand}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {path.requiredSkills.slice(0, 3).map((skill: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {path.requiredSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{path.requiredSkills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">{path.averageSalary}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Analyzing your skills and generating recommendations...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill Gap Analysis */}
      {skillGap && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Skill Gap Analysis
            </CardTitle>
            <CardDescription>
              Your proficiency: {skillGap.proficiency}% match with {selectedPath}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillGap.skillGaps.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Congratulations!</p>
                  <p className="text-muted-foreground">
                    You have all the required skills for this career path
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {skillGap.skillGaps.map((gap: any, i: number) => (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{gap.name}</h4>
                        <Badge variant="outline">
                          Gap: {gap.gap} levels
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Current: Level {gap.current}</span>
                            <span>Required: Level {gap.required}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(gap.current / gap.required) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && (
        <>
          {/* Courses */}
          {recommendations.courses && recommendations.courses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recommended Courses
                </CardTitle>
                <CardDescription>
                  Courses to help you fill your skill gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recommendations.courses.map((course: any, i: number) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{course.platform}</p>
                        {course.targetSkill && (
                          <Badge variant="secondary" className="text-xs">
                            {course.targetSkill}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {recommendations.projects && recommendations.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Recommended Projects
                </CardTitle>
                <CardDescription>
                  Hands-on projects to practice your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recommendations.projects.map((project: any, i: number) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          <Badge variant="outline">{project.difficulty}</Badge>
                        </div>
                        {project.skills && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {project.skills.map((skill: string, j: number) => (
                              <Badge key={j} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Career Roles */}
          {recommendations.careerRoles && recommendations.careerRoles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Suggested Career Roles
                </CardTitle>
                <CardDescription>
                  Roles that match your skill profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {recommendations.careerRoles.map((role: string, i: number) => (
                    <div key={i} className="p-4 rounded-lg border flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{role}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to advance your career?</h3>
              <p className="text-sm text-muted-foreground">
                Upload more credentials to get better recommendations
              </p>
            </div>
            <Link href="/credentials/upload">
              <Button>Upload Credential</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      {/* Pricing Modal */}
      <PricingModal
        open={pricingModalOpen}
        onOpenChange={setPricingModalOpen}
        currentPlan={subscription?.subscription?.plan || 'free'}
        onSubscriptionComplete={() => {
          setPricingModalOpen(false);
          loadSubscription();
        }}
      />
    </div>
  );
}
