"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, TrendingUp, Award, BookOpen, Plus, Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { dashboardAPI, type LearnerProfile, type Credential } from "@/lib/dashboard-api";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";

export default function SkillMapPage() {
  const [loading, setLoading] = useState(true);
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [skillGap, setSkillGap] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadCareerPaths();
  }, []);

  useEffect(() => {
    if (profile && credentials.length > 0 && canvasRef.current) {
      drawSpiderWeb();
    }
  }, [profile, credentials]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, credentialsData] = await Promise.all([
        dashboardAPI.getProfile(),
        dashboardAPI.getCredentials(),
      ]);
      setProfile(profileData);
      setCredentials(credentialsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load skill map",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const handleCareerPathSelect = async (pathName: string) => {
    setSelectedPath(pathName);
    setAnalyzingGap(true);

    try {
      // Get skill gap
      const gapResponse = await api.post("/recommendations/skill-gap", {
        careerPath: pathName,
      });
      setSkillGap(gapResponse.data);

      // Get recommendations
      const recResponse = await api.post("/recommendations/generate", {
        careerPath: pathName,
      });
      setRecommendations(recResponse.data);

      toast({
        title: "Analysis Complete",
        description: `Skill gap analysis for ${pathName} is ready`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to analyze skill gap",
        variant: "destructive",
      });
    } finally {
      setAnalyzingGap(false);
    }
  };

  const drawSpiderWeb = () => {
    const canvas = canvasRef.current;
    if (!canvas || !profile) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const size = Math.min(canvas.parentElement?.clientWidth || 600, 600);
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size * 0.4;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const skillDistribution = dashboardAPI.getSkillDistribution(profile, credentials);
    const skills = skillDistribution.slice(0, 8); // Max 8 skills for clean web

    if (skills.length === 0) return;

    const angleStep = (Math.PI * 2) / skills.length;

    // Draw web rings
    ctx.strokeStyle = "rgba(100, 100, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const radius = (maxRadius / 5) * i;
      for (let j = 0; j <= skills.length; j++) {
        const angle = angleStep * j - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw spokes
    ctx.strokeStyle = "rgba(100, 100, 255, 0.15)";
    ctx.lineWidth = 1;
    skills.forEach((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * maxRadius,
        centerY + Math.sin(angle) * maxRadius
      );
      ctx.stroke();
    });

    // Draw skill levels
    ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    skills.forEach((skill, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const radius = (maxRadius * skill.level) / 100;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw skill points
    skills.forEach((skill, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const radius = (maxRadius * skill.level) / 100;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Draw point
      ctx.fillStyle = "#3B82F6";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.6)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw center point
    ctx.fillStyle = "#3B82F6";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const skillDistribution = profile && credentials.length > 0
    ? dashboardAPI.getSkillDistribution(profile, credentials)
    : [];

  const skillColors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-yellow-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-green-500",
    "from-red-500 to-orange-500",
  ];

  if (loading) {
    return <SkillMapSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Skill Map & Gap Analysis
          </h1>
          <p className="text-muted-foreground">Visualize your skills and identify gaps for your career goals</p>
        </div>
        <Link href="/credentials/upload">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Credential
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.skills.length || 0}</div>
              <p className="text-xs text-muted-foreground">Across all credentials</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NSQF Level</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.nsqfLevel || 1}</div>
              <p className="text-xs text-muted-foreground">{profile?.levelName || 'Basic/Foundation'}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credentials</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{credentials.length}</div>
              <p className="text-xs text-muted-foreground">Total earned</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.totalCredits || 0}</div>
              <p className="text-xs text-muted-foreground">Accumulated</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Career Path Selection for Gap Analysis */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI-Powered Skill Gap Analysis
          </CardTitle>
          <CardDescription>
            Select a career path to see which skills you need to develop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedPath} onValueChange={handleCareerPathSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a career path to analyze..." />
            </SelectTrigger>
            <SelectContent>
              {careerPaths.map((path) => (
                <SelectItem key={path.id} value={path.name}>
                  {path.name} - {path.demand} Demand
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {analyzingGap && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Analyzing your skill gaps...</span>
            </div>
          )}

          {skillGap && !analyzingGap && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Skill Gap Analysis for {selectedPath}</h3>
                <Badge variant={skillGap.proficiency >= 80 ? "default" : "secondary"}>
                  {skillGap.proficiency}% Match
                </Badge>
              </div>

              {skillGap.skillGaps.length === 0 ? (
                <div className="text-center py-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">Perfect Match!</p>
                  <p className="text-sm text-muted-foreground">You have all required skills</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You need to develop {skillGap.skillGaps.length} skill{skillGap.skillGaps.length > 1 ? 's' : ''}:
                  </p>
                  {skillGap.skillGaps.map((gap: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{gap.name}</span>
                        </div>
                        <Badge variant="outline">Gap: {gap.gap} levels</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Current: Level {gap.current}</span>
                            <span>Required: Level {gap.required}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-orange-500"
                              style={{ width: `${(gap.current / gap.required) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link href="/career-path">
                <Button className="w-full">
                  View Full Recommendations
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spider Web Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Skill Web Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skillDistribution.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No skills tracked yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Upload credentials to start tracking your skills
              </p>
              <Link href="/credentials/upload">
                <Button>Upload Credential</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Canvas */}
              <div className="flex justify-center">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {skillDistribution.slice(0, 8).map((skill, i) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r hover:shadow-md transition-all cursor-pointer"
                    style={{
                      backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    }}
                  >
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${skillColors[i % skillColors.length]} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {skill.count}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{skill.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {skill.count} credential{skill.count > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {Math.round(skill.level)}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Skills Cloud */}
      {profile && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Cloud</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center">
              {profile.skills.map((skill, i) => {
                const size = Math.random() * 0.5 + 0.8;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: size }}
                    transition={{ delay: i * 0.03, type: "spring" }}
                    whileHover={{ scale: size * 1.1, rotate: Math.random() * 10 - 5 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className={`text-sm px-4 py-2 bg-gradient-to-br ${skillColors[i % skillColors.length]} text-white border-0 shadow-md`}
                      style={{ fontSize: `${size}rem` }}
                    >
                      {skill}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Growth Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Growth Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No credentials to display timeline
            </p>
          ) : (
            <div className="space-y-4">
              {credentials.slice(0, 5).map((cred, i) => (
                <motion.div
                  key={cred._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 border-l-2 border-primary pl-4 pb-4 hover:border-l-4 transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{cred.title}</h4>
                    <p className="text-sm text-muted-foreground">{cred.issuerId.name}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cred.skills.slice(0, 3).map((skill, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {cred.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{cred.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(cred.issueDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SkillMapSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
