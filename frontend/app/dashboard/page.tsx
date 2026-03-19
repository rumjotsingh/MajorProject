"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, CheckCircle, Clock, Plus, ArrowRight, Target, BookOpen, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { dashboardAPI, type Credential, type LearnerProfile, type DashboardStats } from "@/lib/dashboard-api";
import { useToast } from "@/hooks/use-toast";

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
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRoleAndRedirect();
  }, []);

  const checkUserRoleAndRedirect = async () => {
    try {
      // Check user role first
      const userResponse = await api.get("/auth/me");
      const userRole = userResponse.data.role;

      // If user is an Issuer, redirect to issuer dashboard
      if (userRole === "Issuer") {
        router.push("/issuer/dashboard");
        return;
      }

      // If user is an Employer, redirect to employer dashboard (when implemented)
      if (userRole === "Employer") {
        toast({
          title: "Coming Soon",
          description: "Employer dashboard is under development",
        });
        // For now, continue to learner dashboard or create employer dashboard
      }

      // If user is Admin, redirect to admin dashboard (when implemented)
      if (userRole === "Admin") {
        toast({
          title: "Coming Soon",
          description: "Admin dashboard is under development",
        });
        // For now, continue to learner dashboard or create admin dashboard
      }

      // For Learners, load dashboard data
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
      
      // Fetch profile and credentials in parallel
      const [profileData, credentialsData] = await Promise.all([
        dashboardAPI.getProfile(),
        dashboardAPI.getCredentials(),
      ]);

      setProfile(profileData);
      setCredentials(credentialsData);
      
      // Calculate stats
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
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Profile Not Found</h3>
            <p className="text-sm text-muted-foreground">
              Unable to load your profile. Please try logging in again.
            </p>
            <Button onClick={() => window.location.href = "/login"}>
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
      color: "text-blue-500" 
    },
    { 
      icon: Target, 
      label: "NSQF Level", 
      value: stats?.nsqfLevel.toString() || "1", 
      change: nsqfLevelNames[stats?.nsqfLevel || 1], 
      color: "text-purple-500" 
    },
    { 
      icon: CheckCircle, 
      label: "Verified", 
      value: stats?.verifiedCredentials.toString() || "0", 
      change: `${getVerificationPercentage()} verified`, 
      color: "text-green-500" 
    },
    { 
      icon: Clock, 
      label: "Pending", 
      value: stats?.pendingCredentials.toString() || "0", 
      change: "Awaiting verification", 
      color: "text-orange-500" 
    },
  ];

  const recentCredentials = credentials.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {profile?.userId?.name?.split(" ")[0] || "User"}! 👋
          </h1>
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
        {statsConfig.map((stat, i) => (
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
            {recentCredentials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No credentials yet</p>
                <Link href="/credentials/upload">
                  <Button variant="outline" size="sm" className="mt-4">
                    Upload Your First Credential
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCredentials.map((cred, i) => (
                  <motion.div
                    key={cred._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm md:text-base">{cred.title}</p>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground flex-wrap">
                        <span>{cred.issuerId.name}</span>
                        <span>•</span>
                        <span>{formatDate(cred.issueDate)}</span>
                        <span>•</span>
                        <span>NSQF {cred.nsqfLevel}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={cred.verificationStatus === "verified" ? "default" : cred.verificationStatus === "rejected" ? "destructive" : "secondary"} 
                      className="ml-2"
                    >
                      {cred.verificationStatus === "verified" ? "Verified" : cred.verificationStatus === "rejected" ? "Rejected" : "Pending"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skill Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {skillDistribution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No skills tracked yet</p>
                <p className="text-xs mt-2">Upload credentials to track your skills</p>
              </div>
            ) : (
              <div className="space-y-4">
                {skillDistribution.map((skill, i) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground">{skill.count} credential{skill.count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                        className={`h-full ${skillColors[i % skillColors.length]}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary */}
      {profile?.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage your credentials and profile</p>
          </div>
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/credentials/upload">
              <motion.div
                whileHover={{ y: -4 }}
                className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Plus className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    Upload Credential
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add a new certificate or credential
                </p>
              </motion.div>
            </Link>

            <Link href="/credentials">
              <motion.div
                whileHover={{ y: -4 }}
                className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Award className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    View All Credentials
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Browse your complete portfolio
                </p>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ y: -4 }}
              className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  Skill Analysis
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                View detailed skill breakdown
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
