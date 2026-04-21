"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award, CheckCircle, Clock, Plus, ArrowRight, Target,
  AlertCircle, TrendingUp, Upload, ChevronRight, Crown, Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { dashboardAPI, type Credential, type LearnerProfile, type DashboardStats } from "@/lib/dashboard-api";
import { useToast } from "@/hooks/use-toast";
import { PricingModal } from "@/components/pricing-modal";

const nsqfNames: Record<number, string> = {
  1: "Basic", 2: "Elementary", 3: "Intermediate", 4: "Secondary",
  5: "Diploma", 6: "Advanced Diploma", 7: "Bachelor's", 8: "Master's",
  9: "Doctoral", 10: "Post-Doctoral",
};

const hour = new Date().getHours();
const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data.role === "Issuer")    { router.push("/issuer/dashboard");   return; }
      if (data.role === "Employer")  { router.push("/employer/dashboard"); return; }
      if (data.role === "Admin")     { router.push("/admin/dashboard");    return; }
      await load();
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.error || "Failed to load", variant: "destructive" });
      setLoading(false);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const [prof, creds, sub] = await Promise.all([
        dashboardAPI.getProfile(),
        dashboardAPI.getCredentials(),
        api.get("/payment/subscription").catch(() => ({ data: null })),
      ]);
      setProfile(prof);
      setCredentials(creds);
      setSubscription(sub.data);
      setStats(dashboardAPI.calculateStats(creds, prof));
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.error || "Failed to load dashboard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-3">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="font-medium">Profile not found</p>
        <Button onClick={() => router.push("/login")} size="sm">Go to Login</Button>
      </div>
    </div>
  );

  const isFreePlan = subscription?.subscription?.plan === "free";
  const verifyPct = stats && stats.totalCredentials > 0
    ? Math.round((stats.verifiedCredentials / stats.totalCredentials) * 100) : 0;
  const credPct = subscription
    ? subscription.usage.maxCredentials === -1 ? 60
      : Math.min(100, (subscription.usage.credentials / subscription.usage.maxCredentials) * 100)
    : 0;
  const skillDist = profile && credentials.length > 0
    ? dashboardAPI.getSkillDistribution(profile, credentials) : [];
  const firstName = profile?.userId?.name?.split(" ")[0] || "Learner";

  const statCards = [
    { icon: Award,       label: "Credentials",  value: stats?.totalCredentials ?? 0,   sub: "total",                color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/30" },
    { icon: TrendingUp,  label: "NSQF Level",   value: stats?.nsqfLevel ?? 1,           sub: nsqfNames[stats?.nsqfLevel ?? 1], color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
    { icon: CheckCircle, label: "Verified",      value: stats?.verifiedCredentials ?? 0, sub: `${verifyPct}% rate`,  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { icon: Clock,       label: "Pending",       value: stats?.pendingCredentials ?? 0,  sub: "awaiting review",     color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30" },
  ];

  return (
    <div className="space-y-6 pb-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{greeting}</p>
          <button
            onClick={() => router.push("/profile")}
            className="mt-0.5 text-2xl font-bold tracking-tight hover:text-primary transition-colors text-left block"
          >
            {profile?.userId?.name || firstName}
          </button>
          <p className="text-xs text-muted-foreground mt-0.5">{profile?.userId?.email}</p>
        </div>
        <Link href="/credentials/upload">
          <Button size="sm" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add Credential
          </Button>
        </Link>
      </div>

      {/* Upgrade banner */}
      {isFreePlan && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <Crown className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm">Unlock AI recommendations, unlimited credentials &amp; more.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setPricingOpen(true)} className="shrink-0 gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Upgrade
          </Button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-card p-4">
            <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium text-foreground/80 mt-0.5">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Recent credentials */}
        <div className="lg:col-span-3 rounded-xl border border-[rgba(0,0,0,0.1)] bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
            <p className="font-semibold text-sm">Recent Credentials</p>
            <Link href="/credentials">
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>

          {credentials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No credentials yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Upload your first credential to get started</p>
              <Link href="/credentials/upload">
                <Button size="sm" variant="outline">Upload Credential</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(0,0,0,0.06)]">
              {credentials.slice(0, 6).map((cred) => (
                <div key={cred._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cred.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cred.issuerId.name} · {new Date(cred.issueDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    cred.verificationStatus === "verified"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : cred.verificationStatus === "rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {cred.verificationStatus === "verified" ? "Verified" : cred.verificationStatus === "rejected" ? "Rejected" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Top skills */}
          <div className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
              <p className="font-semibold text-sm">Top Skills</p>
              <Link href="/career-path">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  Career Studio <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
            <div className="px-5 py-4">
              {skillDist.length === 0 ? (
                <div className="text-center py-6">
                  <Target className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No skills tracked yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {skillDist.map((skill, i) => {
                    const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
                    return (
                      <div key={skill.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium truncate">{skill.name}</span>
                          <span className="text-muted-foreground ml-2 shrink-0">{skill.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${colors[i % colors.length]}`}
                            style={{ width: `${skill.level}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-card">
            <p className="px-5 py-4 font-semibold text-sm border-b border-[rgba(0,0,0,0.06)]">Quick Actions</p>
            <div className="p-2">
              {[
                { href: "/user/credentials/upload", icon: Upload,      label: "Upload Credential" },
                { href: "/user/credentials",        icon: Award,       label: "My Credentials" },
                { href: "/user/career-path",        icon: Target,      label: "Career Studio" },
                { href: "/user/jobs/recommended",   icon: TrendingUp,  label: "Job Recommendations" },
                { href: "/profile",            icon: ChevronRight, label: "Edit Profile" },
              ].map((a) => (
                <Link key={a.href} href={a.href}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors group">
                    <a.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span className="text-sm flex-1">{a.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Plan usage */}
          {subscription && (
            <div className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-card px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Plan</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isFreePlan ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {subscription.subscription.plan.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Credentials</span>
                  <span>{subscription.usage.credentials} / {subscription.usage.maxCredentials === -1 ? "∞" : subscription.usage.maxCredentials}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${credPct >= 80 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${credPct}%` }} />
                </div>
              </div>
              {isFreePlan && (
                <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => setPricingOpen(true)}>
                  <Zap className="h-3.5 w-3.5" /> Upgrade Plan
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <PricingModal
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        currentPlan={subscription?.subscription?.plan || "free"}
        onSubscriptionComplete={load}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8 max-w-6xl">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-xl border border-[rgba(0,0,0,0.1)] p-4 space-y-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-[rgba(0,0,0,0.1)]">
          <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.06)]"><Skeleton className="h-4 w-36" /></div>
          <div className="divide-y divide-[rgba(0,0,0,0.06)]">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[rgba(0,0,0,0.1)]">
            <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.06)]"><Skeleton className="h-4 w-24" /></div>
            <div className="px-5 py-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="space-y-1.5"><Skeleton className="h-3 w-full" /><Skeleton className="h-1.5 w-full rounded-full" /></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
