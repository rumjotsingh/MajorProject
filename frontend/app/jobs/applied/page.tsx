"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, Clock, CheckCircle, XCircle, Eye, TrendingUp, Loader2, Briefcase, Calendar } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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

export default function AppliedJobsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState("");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
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

  const fetchApplications = async (status: StatusFilter, page: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("limit", "10");
      params.set("page", String(page));
      if (status !== "all") {
        params.set("status", status);
      }

      const response = await api.get(`/users/applications?${params.toString()}`);
      setApplications(response.data.applications || []);
      setPagination(
        response.data.pagination || {
          total: 0,
          page: 1,
          pages: 1,
          limit: 10,
        }
      );
      setSummary(
        response.data.summary || {
          total: 0,
          applied: 0,
          shortlisted: 0,
          interviewing: 0,
          rejected: 0,
          hired: 0,
          withdrawn: 0,
        }
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load your applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(activeStatus, currentPage);
  }, [activeStatus, currentPage]);

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
    { label: "All", value: "all", count: summary.total },
    { label: "Applied", value: "applied", count: summary.applied },
    { label: "Shortlisted", value: "shortlisted", count: summary.shortlisted },
    { label: "Interviewing", value: "interviewing", count: summary.interviewing },
    { label: "Hired", value: "hired", count: summary.hired },
    { label: "Rejected", value: "rejected", count: summary.rejected },
    { label: "Withdrawn", value: "withdrawn", count: summary.withdrawn },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hired":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hired</Badge>;
      case "shortlisted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Shortlisted</Badge>;
      case "interviewing":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Interviewing</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case "withdrawn":
        return <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-200">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">Applied</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applied Jobs</h1>
        <p className="text-muted-foreground">Track your job applications and their status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applied</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : summary.total}</div>
            <p className="text-xs text-muted-foreground">All job applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : summary.shortlisted + summary.interviewing}</div>
            <p className="text-xs text-muted-foreground">Shortlisted or interviewing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : summary.interviewing}</div>
            <p className="text-xs text-muted-foreground">Active interview processes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : `${successRate}%`}</div>
            <p className="text-xs text-muted-foreground">Hired out of all applications</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Application Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={activeStatus === tab.value ? "default" : "outline"}
                onClick={() => {
                  setActiveStatus(tab.value);
                  setCurrentPage(1);
                }}
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading your applications...</div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No applications yet. Go to Recommended Jobs to start applying.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const latestStatus = application.statusHistory?.[application.statusHistory.length - 1];
                const canWithdraw = !["hired", "rejected", "withdrawn"].includes(application.status);

                return (
                  <div key={application._id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{application.jobId?.title || "Job"}</p>
                          {getStatusBadge(application.status)}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {application.jobId?.employerId?.companyName || "Company"}
                          {application.jobId?.location ? ` • ${application.jobId.location}` : ""}
                          {application.jobId?.locationType ? ` (${application.jobId.locationType})` : ""}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </span>
                          {latestStatus?.changedAt && (
                            <span>Updated {new Date(latestStatus.changedAt).toLocaleDateString()}</span>
                          )}
                        </div>

                        {latestStatus?.notes && (
                          <p className="text-xs text-muted-foreground">Note: {latestStatus.notes}</p>
                        )}
                      </div>

                      {canWithdraw && (
                        <Button
                          variant="outline"
                          onClick={() => withdrawApplication(application._id)}
                          disabled={withdrawingId === application._id}
                        >
                          {withdrawingId === application._id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between border-t pt-4 mt-2">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {Math.max(1, pagination.pages)}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages || loading}
                    onClick={() => setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
