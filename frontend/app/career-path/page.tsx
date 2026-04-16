"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase, Target, ArrowRight, BookOpen, Code, Sparkles,
  BarChart3, Loader2, Award, TrendingUp, CheckCircle2, Plus, Map, Zap, User,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PricingModal } from "@/components/pricing-modal";
import { dashboardAPI, type LearnerProfile, type Credential } from "@/lib/dashboard-api";

type CareerPath = {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  averageSalary?: string;
  demand?: string;
  industry?: string;
  experienceLevel?: string;
  growthRate?: string;
  jobOpenings?: number;
  tools?: string[];
  certifications?: string[];
  color?: string;
};

type SkillGapItem = { name: string; gap: number; current: number; required: number };
type SkillGap = { proficiency: number; skillGaps: SkillGapItem[] };

type Recommendations = {
  courses?: { title: string; platform?: string; targetSkill?: string }[];
  projects?: { title: string; difficulty?: string; skills?: string[] }[];
  recommendedJobs?: { title: string; matchScore?: number | string; salaryRange?: string }[];
  recommendedCertifications?: { name: string; provider?: string; level?: string }[];
};

const COLORS = {
  blue: "from-blue-500 to-cyan-500",
  indigo: "from-indigo-500 to-purple-500",
  green: "from-green-500 to-emerald-500",
  orange: "from-orange-500 to-amber-500",
  pink: "from-pink-500 to-rose-500",
  violet: "from-violet-500 to-purple-500",
  teal: "from-teal-500 to-cyan-500",
  red: "from-red-500 to-orange-500",
};

export default function CareerPathPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeTab, setActiveTab] = useState<"skills" | "paths">("skills");
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (profile && credentials.length > 0 && canvasRef.current && activeTab === "skills") {
      drawSkillWeb();
    }
  }, [profile, credentials, activeTab]);

  const loadData = async () => {
    try {
      const res = await api.get("/payment/subscription");
      setSubscription(res.data);
      
      if (res.data.subscription.features.aiRecommendations) {
        const [p, c, paths] = await Promise.all([
          dashboardAPI.getProfile(),
          dashboardAPI.getCredentials(),
          api.get("/recommendations/career-paths"),
        ]);
        setProfile(p);
        setCredentials(c);
        setCareerPaths(paths.data.careerPaths || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePathSelect = async (pathTitle: string) => {
    setSelectedPath(pathTitle);
    setAnalyzing(true);
    try {
      const [gapRes, recRes] = await Promise.all([
        api.post("/recommendations/skill-gap", { careerPath: pathTitle }),
        api.post("/recommendations/generate", { careerPath: pathTitle }),
      ]);
      setSkillGap(gapRes.data);
      setRecommendations(recRes.data);
      toast({ title: "✓ Analysis Complete", description: `Ready for ${pathTitle}` });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.error || "Failed", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const drawSkillWeb = () => {
    const canvas = canvasRef.current;
    if (!canvas || !profile) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const size = Math.min(canvas.parentElement?.clientWidth || 400, 400);
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2, cy = size / 2, maxR = size * 0.35;
    
    ctx.clearRect(0, 0, size, size);
    const skills = dashboardAPI.getSkillDistribution(profile, credentials).slice(0, 6);
    if (!skills.length) return;
    
    const step = (Math.PI * 2) / skills.length;
    
    // Grid
    ctx.strokeStyle = "rgba(100,116,139,0.1)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      for (let j = 0; j <= skills.length; j++) {
        const a = step * j - Math.PI / 2;
        const r = (maxR / 5) * i;
        j === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.stroke();
    }
    
    // Spokes
    skills.forEach((_, i) => {
      const a = step * i - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
      ctx.strokeStyle = "rgba(100,116,139,0.15)";
      ctx.stroke();
    });
    
    // Data
    ctx.strokeStyle = "rgba(99,102,241,0.8)";
    ctx.fillStyle = "rgba(99,102,241,0.2)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    skills.forEach((skill, i) => {
      const a = step * i - Math.PI / 2;
      const r = (maxR * skill.level) / 100;
      i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Points & Labels
    skills.forEach((skill, i) => {
      const a = step * i - Math.PI / 2;
      const r = (maxR * skill.level) / 100;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      
      ctx.fillStyle = "#6366f1";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      const lx = cx + Math.cos(a) * (maxR + 20), ly = cy + Math.sin(a) * (maxR + 20);
      ctx.fillStyle = "#475569";
      ctx.font = "600 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(skill.name.length > 12 ? skill.name.slice(0, 12) + "…" : skill.name, lx, ly);
    });
  };

  const skillDistribution = profile && credentials.length > 0
    ? dashboardAPI.getSkillDistribution(profile, credentials)
    : [];

  // Paywall
  if (!loading && subscription && !subscription.subscription.features.aiRecommendations) {
    return (
      <div className="flex items-center justify-center min-h-[600px] p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-10 pb-10 text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
              <p className="text-muted-foreground text-sm">
                Unlock AI-powered career insights and skill mapping
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button size="lg" onClick={() => setPricingModalOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" /> View Plans
              </Button>
              <Link href="/dashboard"><Button variant="outline" size="lg">Dashboard</Button></Link>
            </div>
          </CardContent>
        </Card>
        <PricingModal open={pricingModalOpen} onOpenChange={setPricingModalOpen}
          currentPlan={subscription?.subscription?.plan || "free"}
          onSubscriptionComplete={() => { setPricingModalOpen(false); loadData(); }} />
      </div>
    );
  }

  if (loading) {
    return <CareerStudioSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Career Studio
          </h1>
          <p className="text-muted-foreground text-sm">Map your skills and discover career paths</p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
          <Link href="/credentials/upload">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Credential
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Credentials", value: credentials.length, icon: BookOpen, color: "text-blue-500" },
            { label: "Skills", value: profile.skills.length, icon: Target, color: "text-green-500" },
            { label: "NSQF Level", value: profile.nsqfLevel || 1, icon: TrendingUp, color: "text-purple-500" },
            { label: "Paths", value: careerPaths.length, icon: Map, color: "text-orange-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-muted/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-muted/40 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === "skills" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Map className="h-4 w-4" /> Skills
        </button>
        <button
          onClick={() => setActiveTab("paths")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === "paths" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="h-4 w-4" /> Paths
        </button>
      </div>

      {/* SKILLS TAB */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          {/* Profile Update Reminder */}
          {profile && (profile.skills.length === 0 || !profile.bio) && (
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">Complete Your Profile</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Add your bio, skills, education, and experience to get better career recommendations
                    </p>
                    <Link href="/profile">
                      <Button size="sm" variant="outline" className="gap-2">
                        <User className="h-3.5 w-3.5" />
                        Go to Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Skill Web */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skill Web</CardTitle>
              <CardDescription>Visual map of your top skills</CardDescription>
            </CardHeader>
            <CardContent>
              {skillDistribution.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <p className="font-medium mb-1">No skills tracked yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Upload credentials or update your profile to start tracking skills</p>
                  <div className="flex gap-2 justify-center">
                    <Link href="/credentials/upload">
                      <Button size="sm">Upload Credential</Button>
                    </Link>
                    <Link href="/profile">
                      <Button size="sm" variant="outline">Update Profile</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="flex justify-center">
                    <canvas ref={canvasRef} className="max-w-full" />
                  </div>
                  <div className="space-y-2">
                    {skillDistribution.slice(0, 6).map((skill, i) => (
                      <div key={skill.name} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted/30 transition">
                        <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${Object.values(COLORS)[i % 8]} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                          {skill.count}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{skill.name}</p>
                          <p className="text-xs text-muted-foreground">{skill.count} credential{skill.count > 1 ? "s" : ""}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{Math.round(skill.level)}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Cloud */}
          {profile && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className={`px-3 py-1.5 bg-gradient-to-br ${Object.values(COLORS)[i % 8]} text-white border-0 shadow-sm`}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {credentials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {credentials.slice(0, 5).map((cred) => (
                    <div key={cred._id} className="flex items-start gap-3 border-l-2 border-primary/40 pl-3 pb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{cred.title}</h4>
                        <p className="text-xs text-muted-foreground">{cred.issuerId.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cred.skills.slice(0, 3).map((s, j) => <Badge key={j} variant="outline" className="text-xs">{s}</Badge>)}
                          {cred.skills.length > 3 && <Badge variant="outline" className="text-xs">+{cred.skills.length - 3}</Badge>}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(cred.issueDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* PATHS TAB */}
      {activeTab === "paths" && (
        <div className="space-y-6">
          {/* Simple Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="font-semibold text-sm">Pick a career below</p>
                  <p className="text-xs text-muted-foreground">Click any card to see which skills you need</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Cards - Simple Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {careerPaths.map((path) => (
              <Card key={path._id} onClick={() => handlePathSelect(path.title)}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPath === path.title 
                    ? "border-2 border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20" 
                    : "hover:border-primary/40 hover:scale-[1.02]"
                }`}>
                <CardContent className="pt-5 pb-5 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base leading-tight">{path.title}</h3>
                    {path.demand && (
                      <Badge 
                        variant={path.demand === "Very High" ? "default" : "secondary"} 
                        className="text-xs shrink-0"
                      >
                        {path.demand}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2">{path.description}</p>
                  
                  {/* Skills Box */}
                  {path.requiredSkills && path.requiredSkills.length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-primary" />
                        <p className="text-xs font-semibold">You'll Need:</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {path.requiredSkills.slice(0, 5).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-medium">
                            {s}
                          </Badge>
                        ))}
                        {path.requiredSkills.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{path.requiredSkills.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    {path.averageSalary && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                          {path.averageSalary}
                        </span>
                      </div>
                    )}
                    {path.jobOpenings && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {path.jobOpenings.toLocaleString()} jobs
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Click indicator */}
                  {selectedPath !== path.title && (
                    <div className="text-center pt-1">
                      <span className="text-xs text-primary font-medium">Click to analyze →</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {analyzing && (
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">Analyzing your skills for {selectedPath}...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analyzing Skeleton */}
          {analyzing && (
            <div className="space-y-6">
              {/* Match Score Skeleton */}
              <Card className="border-2">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center space-y-3">
                    <Skeleton className="inline-flex w-20 h-20 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-40 mx-auto" />
                      <Skeleton className="h-4 w-64 mx-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Gap Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-lg border-2">
                        <div className="flex items-center justify-between mb-3">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-3 w-full rounded-full" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          {skillGap && !analyzing && selectedPath && (
            <>
              {/* Step 2 Indicator */}
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-sm">Your Results for {selectedPath}</p>
                      <p className="text-xs text-muted-foreground">See what skills you need to learn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Simple Match Score */}
              <Card className="border-2">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20">
                      <span className="text-3xl font-bold text-primary">{skillGap.proficiency}%</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">Your Match Score</p>
                      <p className="text-sm text-muted-foreground">
                        {skillGap.proficiency >= 80 ? "🎉 Excellent! You're ready" : 
                         skillGap.proficiency >= 60 ? "👍 Good! Just a few skills to learn" :
                         "📚 Keep learning! You'll get there"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Skills You Need to Learn */}
              {skillGap.skillGaps.length === 0 ? (
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                  <CardContent className="pt-8 pb-8 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
                    <p className="font-bold text-lg mb-1">Perfect Match! 🎉</p>
                    <p className="text-sm text-muted-foreground">You already have all the skills needed for this career</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📚 Skills to Learn ({skillGap.skillGaps.length})</CardTitle>
                    <CardDescription>Focus on these to become job-ready</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {skillGap.skillGaps.map((gap, i) => (
                        <div key={i} className="p-4 rounded-lg border-2 bg-card hover:bg-muted/30 transition">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-base">{gap.name}</h4>
                            <Badge variant="outline" className="text-xs font-semibold">
                              Need +{gap.gap} levels
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Your Level: <strong>{gap.current}</strong></span>
                              <span className="text-muted-foreground">Target: <strong>{gap.required}</strong></span>
                            </div>
                            
                            <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                              <div 
                                className="absolute h-full bg-gradient-to-r from-orange-500 to-primary transition-all duration-500" 
                                style={{ width: `${Math.min(100, (gap.current / gap.required) * 100)}%` }} 
                              />
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              {gap.current === 0 ? "Start learning this skill" :
                               gap.gap <= 2 ? "Almost there! Just a bit more practice" :
                               gap.gap <= 4 ? "Keep practicing to reach the target" :
                               "This will take some time, but you can do it!"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Career Details */}
              {careerPaths.find(p => p.title === selectedPath) && (
                <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      About {selectedPath}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {careerPaths.find(p => p.title === selectedPath)?.averageSalary && (
                        <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <p className="text-xs text-muted-foreground mb-1">💰 Salary</p>
                          <p className="font-bold text-sm">{careerPaths.find(p => p.title === selectedPath)?.averageSalary}</p>
                        </div>
                      )}
                      {careerPaths.find(p => p.title === selectedPath)?.demand && (
                        <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <p className="text-xs text-muted-foreground mb-1">📈 Demand</p>
                          <Badge variant="default" className="text-xs">{careerPaths.find(p => p.title === selectedPath)?.demand}</Badge>
                        </div>
                      )}
                      {careerPaths.find(p => p.title === selectedPath)?.jobOpenings && (
                        <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <p className="text-xs text-muted-foreground mb-1">💼 Jobs</p>
                          <p className="font-bold text-sm">{careerPaths.find(p => p.title === selectedPath)?.jobOpenings.toLocaleString()}</p>
                        </div>
                      )}
                      {careerPaths.find(p => p.title === selectedPath)?.growthRate && (
                        <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <p className="text-xs text-muted-foreground mb-1">📊 Growth</p>
                          <p className="font-bold text-sm">{careerPaths.find(p => p.title === selectedPath)?.growthRate}</p>
                        </div>
                      )}
                    </div>
                    
                    {careerPaths.find(p => p.title === selectedPath)?.tools && careerPaths.find(p => p.title === selectedPath)?.tools.length > 0 && (
                      <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">🛠️ Tools You'll Use:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {careerPaths.find(p => p.title === selectedPath)?.tools.map((tool, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Recommendations */}
          {recommendations && !analyzing && (
            <>
              {recommendations.courses && recommendations.courses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" />Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {recommendations.courses.map((c, i) => (
                        <div key={i} className="p-3 rounded-lg border hover:shadow-sm transition">
                          <p className="font-semibold text-sm mb-1">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.platform}</p>
                          {c.targetSkill && <Badge variant="secondary" className="text-xs mt-2">{c.targetSkill}</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {recommendations.projects && recommendations.projects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Code className="h-5 w-5" />Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {recommendations.projects.map((p, i) => (
                        <div key={i} className="p-3 rounded-lg border hover:shadow-sm transition">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-sm">{p.title}</p>
                            <Badge variant="outline" className="text-xs shrink-0 ml-2">{p.difficulty}</Badge>
                          </div>
                          {p.skills && (
                            <div className="flex flex-wrap gap-1">
                              {p.skills.map((s, j) => <Badge key={j} variant="secondary" className="text-xs">{s}</Badge>)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {recommendations.recommendedJobs && recommendations.recommendedJobs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5" />Jobs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {recommendations.recommendedJobs.map((job, i) => (
                        <div key={i} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{job.title}</p>
                            <Badge className="text-xs">{Math.max(0, Math.min(100, Number(job.matchScore) || 0))}%</Badge>
                          </div>
                          {job.salaryRange && <p className="text-xs text-muted-foreground">{job.salaryRange}</p>}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {recommendations.recommendedCertifications && recommendations.recommendedCertifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />Certifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {recommendations.recommendedCertifications.map((cert, i) => (
                        <div key={i} className="p-3 rounded-lg border">
                          <p className="font-medium text-sm mb-1">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{[cert.provider, cert.level].filter(Boolean).join(" • ")}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {!selectedPath && !analyzing && (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Select a career path to begin</p>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-sm">Ready to grow?</p>
              <p className="text-xs text-muted-foreground">Upload more credentials for better insights</p>
            </div>
            <Link href="/credentials/upload"><Button size="sm">Upload Credential</Button></Link>
          </div>
        </CardContent>
      </Card>

      <PricingModal open={pricingModalOpen} onOpenChange={setPricingModalOpen}
        currentPlan={subscription?.subscription?.plan || "free"}
        onSubscriptionComplete={() => { setPricingModalOpen(false); loadData(); }} />
    </div>
  );
}

// Skeleton Loader Component
function CareerStudioSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header Skeleton */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-muted/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-7 w-12" />
                </div>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 bg-muted/40 p-1 rounded-lg w-fit">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {/* Instruction Card Skeleton */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Cards Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-5 pb-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-8 w-full" />
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
