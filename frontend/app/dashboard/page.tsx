"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award, CheckCircle, Clock, Plus, ArrowRight, Target,
  AlertCircle, Sparkles, Crown, TrendingUp, BarChart3,
  Upload, Star, Zap, Calendar, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { dashboardAPI, type Credential, type LearnerProfile, type DashboardStats } from "@/lib/dashboard-api";
import { useToast } from "@/hooks/use-toast";
import { PricingModal } from "@/components/pricing-modal";

const nsqfLevelNames: Record<number, string> = {
  1: "Basic", 2: "Elementary", 3: "Intermediate", 4: "Secondary",
  5: "Diploma", 6: "Advanced Diploma", 7: "Bachelor's", 8: "Master's",
  9: "Doctoral", 10: "Post-Doctoral",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
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

  useEffect(() => { checkUserRoleAndRedirect(); }, []);

  const checkUserRoleAndRedirect = async () => {
    try {
      const userResponse = await api.get("/auth/me");
      const role = userResponse.data.role;
      if (role === "Issuer") { router.push("/issuer/dashboard"); return; }
      if (role === "Employer") { router.push("/employer/dashboard"); return; }
      if (role === "Admin") { router.push("/admin/dashboard"); return; }
      if (role === "Learner") await loadDashboardData();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to load user data", variant: "destructive" });
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
      setStats(dashboardAPI.calculateStats(credentialsData, profileData));
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to load dashboard", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const verifyPct = () => stats && stats.totalCredentials > 0 ? Math.round((stats.verifiedCredentials / stats.totalCredentials) * 100) : 0;
  const skillDistribution = profile && credentials.length > 0 ? dashboardAPI.getSkillDistribution(profile, credentials) : [];

  // greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return <DashboardSkeleton />;

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md text-center">
        <CardContent className="pt-6 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Profile Not Found</h3>
          <p className="text-sm text-muted-foreground">Unable to load your profile. Please try logging in again.</p>
          <Button onClick={() => window.location.href = "/login"} className="rounded-full">Go to Login</Button>
        </CardContent>
      </Card>
    </div>
  );

  const isFreePlan = subscription?.subscription?.plan === "free";
  const credentialPct = subscription
    ? subscription.usage.maxCredentials === -1
      ? 90
      : Math.min(100, (subscription.usage.credentials / subscription.usage.maxCredentials) * 100)
    : 0;

  const statsConfig = [
    { icon: Award, label: "Total Credentials", value: stats?.totalCredentials ?? 0, sub: `${credentials.length} in portfolio`, color: "from-primary/20 to-primary/5", iconColor: "text-primary", iconBg: "bg-primary/10" },
    { icon: TrendingUp, label: "NSQF Level", value: stats?.nsqfLevel ?? 1, sub: nsqfLevelNames[stats?.nsqfLevel ?? 1], color: "from-violet-500/20 to-violet-500/5", iconColor: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/10" },
    { icon: CheckCircle, label: "Verified", value: stats?.verifiedCredentials ?? 0, sub: `${verifyPct()}% verified`, color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500/10" },
    { icon: Clock, label: "Pending", value: stats?.pendingCredentials ?? 0, sub: "Awaiting review", color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6 pb-4">

      {/* ── Upgrade Banner ── */}
      {isFreePlan && (
        <motion.div custom={0} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 via-primary/4 to-transparent p-5">
            <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Unlock Premium — AI Recommendations, Unlimited Credentials</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Currently on Free · upgrade for advanced analytics &amp; priority support</p>
                </div>
              </div>
              <Button onClick={() => setPricingModalOpen(true)} size="sm" className="rounded-full flex-shrink-0">
                Upgrade <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Greeting ── */}
      <motion.div custom={0.5} variants={fadeUp} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting} 👋</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-0.5">
            {profile?.userId?.name?.split(" ")[0] || "Learner"}&apos;s Dashboard
          </h1>
        </div>
        <Link href="/credentials/upload">
          <Button className="gap-2 rounded-full group">
            <Plus className="h-4 w-4" />
            Add Credential
            <ArrowRight className="h-3.5 w-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
          </Button>
        </Link>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((s, i) => (
          <motion.div key={i} custom={i + 1} variants={fadeUp}>
            <Card className="overflow-hidden group hover-lift">
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl`} />
              <CardContent className="relative p-5">
                <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}>
                  <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                </div>
                <div className="text-2xl md:text-3xl font-bold">{s.value}</div>
                <p className="text-xs font-medium text-foreground/80 mt-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid gap-6 lg:grid-cols-7">

        {/* Recent Credentials */}
        <motion.div custom={5} variants={fadeUp} className="lg:col-span-4 space-y-4">

          {/* Verification analytics inline mini-bar */}
          {stats && stats.totalCredentials > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold">Verification Overview</p>
                  <span className="text-xs text-muted-foreground">{stats.totalCredentials} total</span>
                </div>
                <div className="flex gap-1.5 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${verifyPct()}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-emerald-500 rounded-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalCredentials > 0 ? (stats.pendingCredentials / stats.totalCredentials) * 100 : 0}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-amber-400 rounded-full"
                  />
                  <div className="flex-1 bg-muted rounded-full" />
                </div>
                <div className="flex gap-4 mt-2">
                  {[
                    { label: "Verified", color: "bg-emerald-500", count: stats.verifiedCredentials },
                    { label: "Pending", color: "bg-amber-400", count: stats.pendingCredentials },
                    { label: "Rejected", color: "bg-muted-foreground/30", count: stats.totalCredentials - stats.verifiedCredentials - stats.pendingCredentials },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`h-2 w-2 rounded-full ${item.color}`} />
                      {item.label} ({item.count})
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base">Recent Credentials</CardTitle>
              <Link href="/credentials">
                <Button variant="ghost" size="sm" className="gap-1.5 rounded-full text-xs group">
                  View All <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {credentials.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-7 w-7 text-primary/50" />
                  </div>
                  <p className="font-semibold text-sm">No credentials yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Upload your first one to start building your portfolio</p>
                  <Link href="/credentials/upload">
                    <Button variant="outline" size="sm" className="rounded-full border-border/60 hover:border-primary/30">Upload Credential</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {credentials.slice(0, 6).map((cred, i) => (
                    <motion.div
                      key={cred._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 hover:bg-muted/30 hover:border-primary/10 transition-all duration-200 group cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                        <Award className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="font-medium text-sm truncate">{cred.title}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{cred.issuerId.name}</span>
                          <span className="opacity-40">•</span>
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(cred.issueDate)}</span>
                          <span className="opacity-40">•</span>
                          <span>L{cred.nsqfLevel}</span>
                        </div>
                      </div>
                      <Badge
                        variant={cred.verificationStatus === "verified" ? "success" : cred.verificationStatus === "rejected" ? "destructive" : "warning"}
                        className="rounded-full text-[10px] flex-shrink-0"
                      >
                        {cred.verificationStatus === "verified" ? "✓ Verified" : cred.verificationStatus === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-4">

          {/* Skill Distribution */}
          <motion.div custom={6} variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Top Skills</CardTitle>
                  <Link href="/skill-map">
                    <Button variant="ghost" size="sm" className="gap-1.5 rounded-full text-xs group">
                      Skill Map <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {skillDistribution.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-primary/50" />
                    </div>
                    <p className="text-sm font-medium">No skills yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add credentials with skills to track them</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {skillDistribution.map((skill, i) => {
                      const colors = ["bg-primary", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-blue-500", "bg-rose-500"];
                      return (
                        <motion.div key={skill.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="font-medium truncate">{skill.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{skill.count} cred{skill.count > 1 ? "s" : ""}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ delay: i * 0.07 + 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                              className={`h-full rounded-full ${colors[i % colors.length]}`}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Usage */}
          {subscription && (
            <motion.div custom={7} variants={fadeUp}>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">Plan Usage</CardTitle>
                    </div>
                    <Badge variant={isFreePlan ? "secondary" : "default"} className="rounded-full text-[10px]">
                      {subscription.subscription.plan.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Credentials used</span>
                      <span className="font-semibold">
                        {subscription.usage.credentials}
                        <span className="text-muted-foreground font-normal">
                          /{subscription.usage.maxCredentials === -1 ? "∞" : subscription.usage.maxCredentials}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${credentialPct}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className={`h-full rounded-full transition-colors ${credentialPct >= 80 ? "bg-amber-500" : "bg-primary"}`}
                      />
                    </div>
                    {credentialPct >= 80 && isFreePlan && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5">⚠️ Approaching limit — upgrade for more</p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "AI", value: subscription.subscription.features.aiRecommendations },
                      { label: "Analytics", value: subscription.subscription.features.analytics },
                      { label: "Priority", value: subscription.subscription.features.prioritySupport },
                    ].map((f) => (
                      <div key={f.label} className={`rounded-lg p-2 text-center text-[10px] font-medium ${f.value ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                        {f.value ? "✓" : "✗"} {f.label}
                      </div>
                    ))}
                  </div>
                  {isFreePlan && (
                    <Button onClick={() => setPricingModalOpen(true)} size="sm" className="w-full rounded-full gap-2" variant="outline">
                      <Zap className="h-3.5 w-3.5" /> Upgrade Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div custom={8} variants={fadeUp}>
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { href: "/credentials/upload", icon: Upload, label: "Upload Credential", color: "text-primary", bg: "bg-primary/10" },
                  { href: "/credentials", icon: Award, label: "View All Credentials", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
                  { href: "/skill-map", icon: Target, label: "Open Skill Map", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
                  { href: "/jobs/recommended", icon: Star, label: "Job Recommendations", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
                ].map((a) => (
                  <Link key={a.href} href={a.href}>
                    <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer group">
                      <div className={`h-8 w-8 rounded-lg ${a.bg} flex items-center justify-center flex-shrink-0`}>
                        <a.icon className={`h-4 w-4 ${a.color}`} />
                      </div>
                      <span className="text-sm font-medium flex-1">{a.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <motion.div custom={9} variants={fadeUp}>
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">About You</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p></CardContent>
          </Card>
        </motion.div>
      )}

      <PricingModal
        open={pricingModalOpen}
        onOpenChange={setPricingModalOpen}
        currentPlan={subscription?.subscription?.plan || "free"}
        onSubscriptionComplete={loadDashboardData}
      />
    </motion.div>
  );
}

// ── Skeleton ──
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-4 w-28 rounded-lg" /><Skeleton className="h-8 w-52 rounded-xl" /></div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-8 w-14 rounded-lg" /><Skeleton className="h-3 w-24 rounded" /></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4"><CardHeader><Skeleton className="h-5 w-40 rounded-lg" /></CardHeader>
          <CardContent className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</CardContent>
        </Card>
        <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-5 w-32 rounded-lg" /></CardHeader>
          <CardContent className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="space-y-2"><Skeleton className="h-4 w-full rounded" /><Skeleton className="h-1.5 w-full rounded-full" /></div>)}</CardContent>
        </Card>
      </div>
    </div>
  );
}
