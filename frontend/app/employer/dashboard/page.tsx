"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  Search, 
  TrendingUp, 
  Target, 
  Plus,
  Eye,
  ArrowRight,
  Bookmark,
  Clock,
  CheckCircle,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { employerApi } from '@/lib/employer-api';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  hiredApplications: number;
  totalBookmarks: number;
  recentApplications: any[];
}

interface Job {
  _id: string;
  title: string;
  status: string;
  applicationsCount: number;
  createdAt: string;
}

export default function EmployerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, jobsData, applicationsData] = await Promise.all([
        employerApi.getDashboardStats(),
        employerApi.getJobs(new URLSearchParams({ limit: '5' })),
        employerApi.getApplications(new URLSearchParams({ limit: '5' })),
      ]);

      const statusMap: Record<string, number> = {};
      (statsData.applicationsByStatus || []).forEach((entry: { _id: string; count: number }) => {
        statusMap[entry._id] = entry.count;
      });
      
      setStats({
        totalJobs: statsData?.stats?.totalJobs || 0,
        activeJobs: statsData?.stats?.activeJobs || 0,
        totalApplications: statsData?.stats?.totalApplications || 0,
        pendingApplications: statusMap.applied || 0,
        shortlistedApplications: statusMap.shortlisted || 0,
        hiredApplications: statusMap.hired || 0,
        totalBookmarks: statsData?.stats?.bookmarkCount || 0,
        recentApplications: applicationsData?.applications || [],
      });
      setRecentJobs(jobsData.jobs || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Find and hire skilled talent</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/employer/search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Talent
            </Link>
          </Button>
          <Button asChild>
            <Link href="/employer/jobs/create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Post Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalJobs || 0} total jobs
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingApplications || 0} pending review
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.shortlistedApplications || 0}</div>
              <p className="text-xs text-muted-foreground">
                Candidates in pipeline
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hires</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.hiredApplications || 0}</div>
              <p className="text-xs text-muted-foreground">
                Successful placements
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/employer/search">
          <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-[18px] gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Talent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Find skilled learners by skills, NSQF level, and experience
              </p>
              <div className="flex items-center text-sm text-primary font-medium">
                Start searching
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employer/jobs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-[18px] gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Manage Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Post new jobs and manage existing job listings
              </p>
              <div className="flex items-center text-sm text-primary font-medium">
                View all jobs
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employer/bookmarks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-[18px] gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                Bookmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {stats?.totalBookmarks || 0} saved candidates for future reference
              </p>
              <div className="flex items-center text-sm text-primary font-medium">
                View bookmarks
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Jobs & Applications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Jobs */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[18px]">Recent Jobs</CardTitle>
              <Link href="/employer/jobs" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <Link  className="" key={job._id} href={`/employer/jobs/${job._id}`}>
                    <div className="p-3 bg-muted/50 rounded-xl space-y-3  hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="  font-semibold">{job.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {job.applicationsCount || 0} applications
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'open' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                <Button asChild>
                  <Link href="/employer/jobs/create">
                    Post Your First Job
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[18px]">Recent Applications</CardTitle>
              <Link href="/employer/applications" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentApplications && stats.recentApplications.length > 0 ? (
              <div className="space-y-4">
                {stats.recentApplications.map((app: any) => (
                  <div key={app._id} className="p-3 bg-muted/50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{app.learnerId?.name || 'Unknown learner'}</p>
                        <p className="text-sm text-muted-foreground">{app.jobId?.title || 'Job'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'applied' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : app.status === 'shortlisted'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : app.status === 'hired'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No applications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
