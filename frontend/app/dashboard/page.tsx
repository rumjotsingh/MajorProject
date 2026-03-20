"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, CheckCircle, Clock, Plus, ArrowRight, Target, BookOpen, AlertCircle, Sparkles, Crown, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { dashboardAPI, type Credential, type LearnerProfile, type DashboardStats } from "@/lib/dashboard-api";
import { useToast } from "@/hooks/use-toast";
import { PricingModal } from "@/components/pricing-modal";

const nsqfLevelNames: Record<number, string> = {
  1: "Basic",
  2: "Elementary",
  3: "Intermediate",
  4: "Secondary",
  5: "Diploma",
  6: "Advanced Diploma",
  7: "Bachelor's",
  8: "Master's",
  9: "Doctoral",
  10: "Post-Doctoral",
};

const skillColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRoleAndRedirect();
  }, []);

  const checkUserRoleAndRedirect = async () => {
    try {
      const userResponse = await api.get("/auth/me");
      const userRole = userResponse.data.role;

      if (userRole === "Issuer") {
        router.push("/issuer/dashboard");
        return;
      }
      if (userRole === "Employer") {
        toast({ title: "Coming Soon", description: "Employer dashboard is under development" });
      }
      if (userRole === "Admin") {
        toast({ title: "Coming Soon", description: "Admin dashboard is under development" });
      }
      if (userRole === "Learner") {
        await loadDashboardData();
      }
    } catch (error: any) {
      console.error("Failed to check user role:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load user data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, credentialsData, subscriptionData] = await Promise.all([
        dashboardAPI.getProfile(),
        dashboardAPI.getCredentials(),
        api.get("/payment/subscription").catch(() => ({ data: null })),
      ]);

      setProfile(profileData);
      setCredentials(credentialsData);
      setSubscription(subscriptionData.data);
      const calculatedStats = dashboardAPI.calculateStats(credentialsData, profileData);
      setStats(calculatedStats);
    } catch (error: any) {
      console.error("Failed to load dashboard:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const getVerificationPercentage = () => {
    if (!stats || stats.totalCredentials === 0) return "0%";
    return `${Math.round((stats.verifiedCredentials / stats.totalCredentials) * 100)}%`;
  };

  const skillDistribution = profile && credentials.length > 0
    ? dashboardAPI.getSkillDistribution(profile, credentials)
    : [];

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Profile Not Found</h3>
            <p className="text-sm text-muted-foreground">
              Unable to load your profile. Please try logging in again.
            </p>
            <Button onClick={() => window.location.href = "/login"} className="rounded-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsConfig = [
    {
      icon: Award,
      label: "Total Credentials",
      value: stats?.totalCredentials.toString() || "0",
      change: credentials.length > 0 ? `${credentials.length} earned` : "No credentials yet",
      gradient: "from-violet-500/10 to-purple-500/10",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      icon: TrendingUp,
      label: "NSQF Level",
      value: stats?.nsqfLevel.toString() || "1",
      change: nsqfLevelNames[stats?.nsqfLevel || 1],
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: CheckCircle,
      label: "Verified",
      value: stats?.verifiedCredentials.toString() || "0",
      change: `${getVerificationPercentage()} verified`,
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Clock,
      label: "Pending",
      value: stats?.pendingCredentials.toString() || "0",
      change: "Awaiting verification",
      gradient: "from-amber-500/10 to-orange-500/10",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  const recentCredentials = credentials.slice(0, 5);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ═══ Upgrade Banner ═══ */}
      {subscription && subscription.subscription.plan === "free" && (
        <motion.div custom={0} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 p-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold">Unlock Premium Features</h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Upgrade to Pro or Enterprise for AI-powered recommendations, unlimited credentials, advanced analytics, and priority support.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["✨ AI Recommendations", "∞ Unlimited", "📊 Analytics", "🎯 Priority Support"].map((badge) => (
                    <span key={badge} className="inline-flex items-center px-2.5 py-1 rounded-full bg-background/60 border text-xs font-medium">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => setPricingModalOpen(true)}
                className="rounded-full shadow-md shadow-primary/20 flex-shrink-0"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ Current Plan ═══ */}
      {subscription && (
        <motion.div custom={0.5} variants={fadeUp}>
          <Card className="border-primary/10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      Current Plan
                      <Badge
                        variant={subscription.subscription.plan === "free" ? "secondary" : "default"}
                        className="rounded-full text-xs"
                      >
                        {subscription.subscription.plan.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {subscription.subscription.plan === "free" && "Free forever with basic features"}
                      {subscription.subscription.plan === "pro" && "Professional plan with advanced features"}
                      {subscription.subscription.plan === "enterprise" && "Enterprise plan with unlimited access"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setPricingModalOpen(true)}
                >
                  {subscription.subscription.plan === "free" ? "Upgrade" : "Manage Plan"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Credentials</p>
                  <p className="text-lg font-bold">
                    {subscription.usage.credentials}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{subscription.usage.maxCredentials === -1 ? "∞" : subscription.usage.maxCredentials}
                    </span>
                  </p>
                  {subscription.usage.maxCredentials !== -1 && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          subscription.usage.credentials / subscription.usage.maxCredentials >= 0.8
                            ? "bg-amber-500"
                            : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min((subscription.usage.credentials / subscription.usage.maxCredentials) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                {[
                  { label: "AI Features", value: subscription.subscription.features.aiRecommendations },
                  { label: "Analytics", value: subscription.subscription.features.analytics },
                  { label: "Support", value: subscription.subscription.features.prioritySupport, trueLabel: "Priority", falseLabel: "Standard" },
                ].map((feature) => (
                  <div key={feature.label} className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">{feature.label}</p>
                    <p className="text-sm font-semibold">
                      {feature.trueLabel
                        ? feature.value
                          ? feature.trueLabel
                          : feature.falseLabel
                        : feature.value
                        ? "✓ Enabled"
                        : "✗ Disabled"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ═══ Welcome ═══ */}
      <motion.div custom={1} variants={fadeUp}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {profile?.userId?.name?.split(" ")[0] || "User"} <span className="inline-block animate-pulse">👋</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here's your learning overview</p>
          </div>
          <Link href="/credentials/upload">
            <Button className="gap-2 rounded-full shadow-md shadow-primary/20">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Credential</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ═══ Stats Grid ═══ */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat, i) => (
          <motion.div key={i} custom={i + 1.5} variants={fadeUp}>
            <Card className="hover-lift overflow-hidden">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Credentials */}
        <motion.div custom={6} variants={fadeUp} className="lg:col-span-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base">Recent Credentials</CardTitle>
              <Link href="/credentials">
                <Button variant="ghost" size="sm" className="gap-2 rounded-full text-xs">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentCredentials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No credentials yet</p>
                  <p className="text-xs mt-1">Upload your first credential to get started</p>
                  <Link href="/credentials/upload">
                    <Button variant="outline" size="sm" className="mt-4 rounded-full">
                      Upload Your First Credential
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentCredentials.map((cred, i) => (
                    <motion.div
                      key={cred._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between p-3.5 rounded-xl border hover:bg-muted/30 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {cred.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>{cred.issuerId.name}</span>
                          <span className="text-border/60">•</span>
                          <span>{formatDate(cred.issueDate)}</span>
                          <span className="text-border/60">•</span>
                          <span>NSQF {cred.nsqfLevel}</span>
                        </div>
                      </div>
                      <Badge
                        variant={cred.verificationStatus === "verified" ? "default" : cred.verificationStatus === "rejected" ? "destructive" : "secondary"}
                        className="ml-2 rounded-full text-[10px]"
                      >
                        {cred.verificationStatus === "verified" ? "Verified" : cred.verificationStatus === "rejected" ? "Rejected" : "Pending"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Skill Distribution */}
        <motion.div custom={7} variants={fadeUp} className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Skill Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {skillDistribution.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No skills tracked yet</p>
                  <p className="text-xs mt-1">Upload credentials to track your skills</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {skillDistribution.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{skill.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {skill.count} credential{skill.count > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ delay: i * 0.08 + 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-full ${skillColors[i % skillColors.length]}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ About ═══ */}
      {profile?.bio && (
        <motion.div custom={8} variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ═══ Quick Actions ═══ */}
      <motion.div custom={9} variants={fadeUp}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Manage your credentials and profile</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  href: "/credentials/upload",
                  icon: Plus,
                  iconBg: "bg-violet-500/10",
                  iconColor: "text-violet-600 dark:text-violet-400",
                  title: "Upload Credential",
                  description: "Add a new certificate or credential",
                },
                {
                  href: "/credentials",
                  icon: Award,
                  iconBg: "bg-blue-500/10",
                  iconColor: "text-blue-600 dark:text-blue-400",
                  title: "View All Credentials",
                  description: "Browse your complete portfolio",
                },
                {
                  href: "/skill-map",
                  icon: Target,
                  iconBg: "bg-emerald-500/10",
                  iconColor: "text-emerald-600 dark:text-emerald-400",
                  title: "Skill Analysis",
                  description: "View detailed skill breakdown",
                },
              ].map((action, i) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 cursor-pointer group h-full"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl ${action.iconBg}`}>
                        <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing Modal */}
      <PricingModal
        open={pricingModalOpen}
        onOpenChange={setPricingModalOpen}
        currentPlan={subscription?.subscription?.plan || "free"}
        onSubscriptionComplete={loadDashboardData}
      />
    </motion.div>
  );
}

// ═══ Loading Skeleton ═══
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-3 w-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-5 w-40 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-40 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
