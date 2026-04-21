"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase, Target, Sparkles, Loader2, MapPin, Building2, Send, 
  CheckCircle2, DollarSign, Zap 
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type LiveJob = {
  _id: string;
  title: string;
  description: string;
  location: string;
  locationType: "onsite" | "remote" | "hybrid";
  employmentType: string;
  requiredSkills: string[];
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  whyMatch?: string;
  hasApplied: boolean;
  applicationStatus: string | null;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  employerId?: {
    companyName?: string;
    industry?: string;
  };
};

export default function RecommendedJobsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [liveJobs, setLiveJobs] = useState<LiveJob[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<string>("");
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<LiveJob | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      setLoading(true);
      // Use the correct endpoint that filters jobs with 50%+ match
      const jobsRes = await api.get("/recommendations/jobs/relevant?minMatch=50&limit=50");
      const jobs = jobsRes.data.jobs || [];
      setLiveJobs(jobs);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openApplyModal = (job: LiveJob) => {
    setSelectedJob(job);
    setCoverLetter("");
    setResumeUrl("");
    setApplyModalOpen(true);
  };

  const applyToJob = async () => {
    if (!selectedJob) return;

    try {
      setApplyingJobId(selectedJob._id);
      await api.post(`/recommendations/jobs/${selectedJob._id}/apply`, {
        coverLetter: coverLetter.trim() || undefined,
        resume: resumeUrl.trim() || undefined,
      });
      toast({
        title: "✓ Application Submitted",
        description: "Your application has been sent successfully.",
      });
      setApplyModalOpen(false);
      await initialize();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Could not submit application",
        variant: "destructive",
      });
    } finally {
      setApplyingJobId("");
    }
  };

  const averageMatch = liveJobs.length
    ? Math.round(liveJobs.reduce((sum, job) => sum + job.matchScore, 0) / liveJobs.length)
    : 0;

  if (loading) {
    return <JobsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Job Recommendations
          </h1>
          <p className="text-muted-foreground text-sm">AI-matched jobs based on your skills</p>
        </div>
        <Link href="/career-path">
          <Button variant="outline" size="sm" className="gap-2">
            <Target className="h-4 w-4" />
            Career Studio
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-muted/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{liveJobs.length}</p>
              </div>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Match</p>
                <p className="text-2xl font-bold">{averageMatch}%</p>
              </div>
              <Target className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold">{liveJobs.filter(j => j.hasApplied).length}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{liveJobs.filter(j => !j.hasApplied).length}</p>
              </div>
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">AI-Matched Jobs</p>
              <p className="text-xs text-muted-foreground">
                Showing jobs with 50%+ skill match based on your verified credentials. 
                Upload more credentials to see better matches.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      {liveJobs.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="font-semibold mb-1">No jobs available</p>
            <p className="text-sm text-muted-foreground mb-4">
              Upload more credentials to improve your matches
            </p>
            <Link href="/credentials/upload">
              <Button>Upload Credential</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {liveJobs.map((job) => (
            <Card key={job._id} className={`transition-all hover:shadow-md ${job.hasApplied ? "bg-muted/30" : ""}`}>
              <CardContent className="pt-5 pb-5 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-base leading-tight">{job.title}</h3>
                  <Badge variant={job.matchScore >= 80 ? "default" : "secondary"} className="shrink-0">
                    {job.matchScore}%
                  </Badge>
                </div>

                {/* Company & Location */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {job.employerId?.companyName || "Company"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <Badge variant="outline" className="text-xs">{job.locationType}</Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                {/* Salary */}
                {job.salaryRange && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                    <DollarSign className="h-4 w-4" />
                    {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()} {job.salaryRange.currency}
                  </div>
                )}

                {/* Skills Match */}
                <div className="space-y-2">
                  {job.matchedSkills && job.matchedSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                        ✓ You have: {job.matchedSkills.length} skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {job.matchedSkills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                            {skill}
                          </Badge>
                        ))}
                        {job.matchedSkills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{job.matchedSkills.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {job.missingSkills && job.missingSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                        ⚠ Missing: {job.missingSkills.length} skill{job.missingSkills.length > 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {job.missingSkills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Why Match */}
                {job.whyMatch && (
                  <p className="text-xs text-muted-foreground italic">💡 {job.whyMatch}</p>
                )}

                {/* Action Button */}
                {job.hasApplied ? (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Applied ({job.applicationStatus || "pending"})
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => openApplyModal(job)}
                    disabled={applyingJobId === job._id}
                  >
                    {applyingJobId === job._id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Apply Now
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply to {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.employerId?.companyName && `at ${selectedJob.employerId.companyName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-muted-foreground">
                <strong>Match Score:</strong> {selectedJob?.matchScore}% • 
                <strong className="ml-2">Skills Match:</strong> {selectedJob?.matchedSkills?.length || 0}/{(selectedJob?.matchedSkills?.length || 0) + (selectedJob?.missingSkills?.length || 0)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Letter</label>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write a brief introduction and why you're a great fit..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resume URL (Optional)</label>
              <Input
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://example.com/your-resume.pdf"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyToJob} disabled={!selectedJob || applyingJobId === selectedJob?._id}>
              {applyingJobId === selectedJob?._id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Skeleton Loader
function JobsSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header Skeleton */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-40" />
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

      {/* Filter Skeleton */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full max-w-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-5 pb-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
