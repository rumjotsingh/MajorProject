"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileCheck, Clock, CheckCircle, XCircle, Eye, TrendingUp, Loader2, 
  Briefcase, Calendar, Search, ChevronLeft, ChevronRight, Building2,
  MapPin, ExternalLink, Filter, MoreHorizontal, Star, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type JobRef = {
  _id: string;
  title: string;
  location: string;
  locationType: string;
  employerId?: {
    companyName?: string;
  };
};

type StatusHistory = {
  status: string;
  changedAt?: string;
  notes?: string;
};

type Application = {
  _id: string;
  status: string;
  appliedAt: string;
  jobId?: JobRef;
  statusHistory?: StatusHistory[];
};

type Summary = {
  total: number;
  applied: number;
  shortlisted: number;
  interviewing: number;
  rejected: number;
  hired: number;
  withdrawn: number;
};

type Pagination = {
  total: number;
  page: number;
  pages: number;
  limit: number;
};

type StatusFilter = "all" | "applied" | "shortlisted" | "interviewing" | "rejected" | "hired" | "withdrawn";

const statusConfig = {
  applied: { 
    label: "Applied", 
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: FileCheck,
    description: "Application submitted"
  },
  shortlisted: { 
    label: "Shortlisted", 
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Star,
    description: "Under review"
  },
  interviewing: { 
    label: "Interviewing", 
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    icon: Eye,
    description: "Interview scheduled"
  },
  hired: { 
    label: "Hired", 
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle,
    description: "Congratulations!"
  },
  rejected: { 
    label: "Rejected", 
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
    description: "Not selected"
  },
  withdrawn: { 
    label: "Withdrawn", 
    color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    icon: AlertCircle,
    description: "Application withdrawn"
  }
};

const fmt = (date: string) => new Date(date).toLocaleDateString("en-US", { 
  month: "short", 
  day: "numeric", 
  year: "numeric" 
});

export default function AppliedJobsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState("");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    applied: 0,
    shortlisted: 0,
    interviewing: 0,
    rejected: 0,
    hired: 0,
    withdrawn: 0,
  });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchApplications = async (status: StatusFilter, page: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("page", String(page));
      if (status !== "all") params.set("status", status);
      if (debouncedSearch) params.set("search", debouncedSearch);

      console.log('Fetching applications with params:', params.toString());
      const response = await api.get(`/users/applications?${params.toString()}`);
      console.log('Applications response:', response.data);
      
      setApplications(response.data.applications || []);
      setPagination(response.data.pagination || { total: 0, page: 1, pages: 1, limit: 10 });
      setSummary(response.data.summary || { total: 0, applied: 0, shortlisted: 0, interviewing: 0, rejected: 0, hired: 0, withdrawn: 0 });
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(activeStatus, currentPage);
  }, [activeStatus, currentPage, debouncedSearch, limit]);

  const withdrawApplication = async (applicationId: string) => {
    try {
      setWithdrawingId(applicationId);
      await api.patch(`/users/applications/${applicationId}/withdraw`);
      toast({
        title: "Application withdrawn",
        description: "Your application has been withdrawn successfully.",
      });
      await fetchApplications(activeStatus, currentPage);
    } catch (error: any) {
      toast({
        title: "Unable to withdraw",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    } finally {
      setWithdrawingId("");
    }
  };

  const successRate = useMemo(() => {
    if (!summary.total) return 0;
    return Math.round((summary.hired / summary.total) * 100);
  }, [summary]);

  const statusTabs: Array<{ label: string; value: StatusFilter; count: number }> = [
    { label: "All Applications", value: "all", count: summary.total },
    { label: "Applied", value: "applied", count: summary.applied },
    { label: "Shortlisted", value: "shortlisted", count: summary.shortlisted },
    { label: "Interviewing", value: "interviewing", count: summary.interviewing },
    { label: "Hired", value: "hired", count: summary.hired },
    { label: "Rejected", value: "rejected", count: summary.rejected },
    { label: "Withdrawn", value: "withdrawn", count: summary.withdrawn },
  ];

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.applied;
    const Icon = config.icon;
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
    );
  };

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, pagination.total);

  return (
    <div className="space-y-6 pb-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Applied Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your job applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {pagination.total} application{pagination.total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Applied</p>
              <p className="text-2xl font-bold mt-1">{loading ? "--" : summary.total}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold mt-1">{loading ? "--" : summary.shortlisted + summary.interviewing}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interviews</p>
              <p className="text-2xl font-bold mt-1">{loading ? "--" : summary.interviewing}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold mt-1">{loading ? "--" : `${successRate}%`}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-9 rounded-xl"
          />
        </div>
        <Select value={limit.toString()} onValueChange={v => { setLimit(parseInt(v)); setCurrentPage(1); }}>
          <SelectTrigger className="w-32 h-9 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50].map(n => <SelectItem key={n} value={n.toString()}>{n} / page</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveStatus(tab.value); setCurrentPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
              activeStatus === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border/40">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">
              {search || activeStatus !== "all" ? "No applications found" : "No applications yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {search || activeStatus !== "all" 
                ? "Try adjusting your filters or search terms" 
                : "Start applying to jobs to track your applications here"
              }
            </p>
            {!search && activeStatus === "all" && (
              <Button size="sm" variant="outline">Browse Jobs</Button>
            )}
          </div>
        ) : (
          <>
            {/* Applications */}
            <div className="divide-y divide-border/40">
              {applications.map((application, index) => {
                const latestStatus = application.statusHistory?.[application.statusHistory.length - 1];
                const canWithdraw = !["hired", "rejected", "withdrawn"].includes(application.status);
                const config = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.applied;

                return (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                  >
                    {/* Job Icon */}
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{application.jobId?.title || "Job Title"}</p>
                        {getStatusBadge(application.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {application.jobId?.employerId?.companyName || "Company"}
                        </span>
                        {application.jobId?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {application.jobId.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Applied {fmt(application.appliedAt)}
                        </span>
                      </div>
                      {latestStatus?.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          "{latestStatus.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {canWithdraw && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => withdrawApplication(application._id)}
                          disabled={withdrawingId === application._id}
                          className="h-8"
                        >
                          {withdrawingId === application._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Withdraw"
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/10">
              <p className="text-sm text-muted-foreground">
                Showing {start}–{end} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const n = pagination.pages <= 5 ? i + 1 : 
                    currentPage <= 3 ? i + 1 : 
                    currentPage >= pagination.pages - 2 ? pagination.pages - 4 + i : 
                    currentPage - 2 + i;
                  return (
                    <Button
                      key={n}
                      size="sm"
                      variant={currentPage === n ? "default" : "outline"}
                      onClick={() => setCurrentPage(n)}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {n}
                    </Button>
                  );
                })}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}