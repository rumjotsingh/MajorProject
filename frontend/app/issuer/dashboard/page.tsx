"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Users, CheckCircle, Clock, Plus, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Credential {
  _id: string;
  title: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  skills: string[];
  nsqfLevel: number;
  issueDate: string;
  verificationStatus: "verified" | "pending" | "rejected";
  revoked: boolean;
  createdAt: string;
}

export default function IssuerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRoleAndLoad();
  }, []);

  const checkUserRoleAndLoad = async () => {
    try {
      // Check user role first
      const userResponse = await api.get("/auth/me");
      const userRole = userResponse.data.role;

      // If user is NOT an Issuer, redirect to appropriate dashboard
      if (userRole === "Learner") {
        router.push("/dashboard");
        return;
      }

      if (userRole === "Employer") {
        toast({
          title: "Access Denied",
          description: "This page is for issuers only",
        });
        router.push("/dashboard");
        return;
      }

      if (userRole === "Admin") {
        // Admins can access issuer dashboard
        await loadCredentials();
        return;
      }

      // For Issuers, load dashboard data
      if (userRole === "Issuer") {
        await loadCredentials();
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

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const response = await api.get("/issuer/dashboard/credentials");
      
      // Handle both old array format and new pagination format
      if (response.data.credentials) {
        setCredentials(response.data.credentials);
      } else if (Array.isArray(response.data)) {
        setCredentials(response.data);
      } else {
        setCredentials([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load credentials",
        variant: "destructive",
      });
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: credentials.length,
    verified: credentials.filter((c) => c.verificationStatus === "verified").length,
    pending: credentials.filter((c) => c.verificationStatus === "pending").length,
    learners: new Set(credentials.map((c) => c.userId._id)).size,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issuer Dashboard</h1>
          <p className="text-muted-foreground">Manage issued credentials and learners</p>
        </div>
        <Link href="/issuer/issue">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Issue Credential
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Credentials issued</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% verification rate
              </p>
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
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
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
              <CardTitle className="text-sm font-medium">Learners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.learners}</div>
              <p className="text-xs text-muted-foreground">Unique learners</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Issued Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No credentials issued yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Start issuing credentials to learners
              </p>
              <Link href="/issuer/issue">
                <Button>Issue First Credential</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {credentials.slice(0, 10).map((cred, i) => (
                <motion.div
                  key={cred._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{cred.title}</p>
                      {cred.revoked && (
                        <Badge variant="destructive" className="text-xs">
                          Revoked
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span>{cred.userId.name}</span>
                      <span>•</span>
                      <span>{cred.userId.email}</span>
                      <span>•</span>
                      <span>NSQF {cred.nsqfLevel}</span>
                      <span>•</span>
                      <span>{formatDate(cred.issueDate)}</span>
                    </div>
                    {cred.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cred.skills.slice(0, 3).map((skill, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {cred.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{cred.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={
                      cred.verificationStatus === "verified"
                        ? "default"
                        : cred.verificationStatus === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                    className="ml-4"
                  >
                    {cred.verificationStatus}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {credentials.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Skills Issued
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const skillCount: Record<string, number> = {};
                credentials.forEach((cred) => {
                  cred.skills.forEach((skill) => {
                    skillCount[skill] = (skillCount[skill] || 0) + 1;
                  });
                });
                const topSkills = Object.entries(skillCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5);

                return topSkills.length > 0 ? (
                  <div className="space-y-3">
                    {topSkills.map(([skill, count], i) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-sm">{skill}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills data</p>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {credentials.slice(0, 5).map((cred) => (
                  <div key={cred._id} className="text-sm">
                    <p className="font-medium">{cred.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Issued to {cred.userId.name} • {formatDate(cred.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
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
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
