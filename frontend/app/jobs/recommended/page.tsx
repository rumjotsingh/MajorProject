"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, TrendingUp, Target, Sparkles, Loader2, MapPin, Building2, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type CareerPath = {
  id: string;
  name: string;
};

type AiJob = {
  title: string;
  matchScore?: number | string;
  salaryRange?: string;
  whyMatch?: string;
};

type LiveJob = {
  _id: string;
  title: string;
  description: string;
  location: string;
  locationType: "onsite" | "remote" | "hybrid";
  employmentType: string;
  requiredSkills: string[];
  matchScore: number;
  hasApplied: boolean;
  applicationStatus: string | null;
  employerId?: {
    companyName?: string;
    industry?: string;
  };
};

export default function RecommendedJobsPage() {
  const MIN_MATCH_SCORE = 50;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadingLiveJobs, setLoadingLiveJobs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [liveJobs, setLiveJobs] = useState<LiveJob[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<string>("");
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<LiveJob | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [summary, setSummary] = useState<string>("");

  const loadCareerPaths = async () => {
    const response = await api.get("/recommendations/career-paths");
    const paths = response.data.careerPaths || [];
    setCareerPaths(paths);
    if (!selectedPath && paths[0]?.name) {
      setSelectedPath(paths[0].name);
      return paths[0].name;
    }
    return selectedPath;
  };

  const loadRecommendations = async (pathName?: string) => {
    const payload = pathName ? { careerPath: pathName } : {};
    const response = await api.post("/recommendations/generate", payload);
    const filteredJobs = (response.data.recommendedJobs || []).filter(
      (job: AiJob) => (Number(job.matchScore) || 0) > MIN_MATCH_SCORE
    );
    setJobs(filteredJobs);
    setSummary(response.data.recommendationSummary || "");
  };

  const loadLiveJobs = async () => {
    try {
      setLoadingLiveJobs(true);
      const response = await api.get("/users/jobs?limit=50");
      const filteredLiveJobs = (response.data.jobs || []).filter(
        (job: LiveJob) => (Number(job.matchScore) || 0) > MIN_MATCH_SCORE
      );
      setLiveJobs(filteredLiveJobs);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load live jobs",
        variant: "destructive",
      });
    } finally {
      setLoadingLiveJobs(false);
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
      await api.post(`/users/jobs/${selectedJob._id}/apply`, {
        coverLetter: coverLetter.trim() || undefined,
        resume: resumeUrl.trim() || undefined,
      });
      toast({
        title: "Application submitted",
        description: "Your application has been sent successfully.",
      });
      setApplyModalOpen(false);
      await loadLiveJobs();
    } catch (error: any) {
      toast({
        title: "Apply failed",
        description: error.response?.data?.error || "Could not submit application",
        variant: "destructive",
      });
    } finally {
      setApplyingJobId("");
    }
  };

  const initialize = async () => {
    try {
      setLoading(true);
      const defaultPath = await loadCareerPaths();
      await Promise.all([loadRecommendations(defaultPath), loadLiveJobs()]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load job recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const refreshForPath = async (pathName: string) => {
    try {
      setSelectedPath(pathName);
      setRefreshing(true);
      await loadRecommendations(pathName);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to refresh recommendations",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const averageMatch = jobs.length
    ? Math.round(jobs.reduce((sum, job) => sum + (Number(job.matchScore) || 0), 0) / jobs.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recommended Jobs</h1>
        <p className="text-muted-foreground">AI-powered job recommendations based on your verified skills</p>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-cyan-500/10 border-primary/20">
        <CardContent className="pt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Target Career Path</p>
            <Select value={selectedPath} onValueChange={refreshForPath}>
              <SelectTrigger className="w-[320px] max-w-full">
                <SelectValue placeholder="Choose career path" />
              </SelectTrigger>
              <SelectContent>
                {careerPaths.map((path) => (
                  <SelectItem key={path.id} value={path.name}>
                    {path.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => refreshForPath(selectedPath)} disabled={refreshing || !selectedPath}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh Matches
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matched Jobs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : jobs.length}</div>
            <p className="text-xs text-muted-foreground">Personalized by your profile</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Match</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : `${averageMatch}%`}</div>
            <p className="text-xs text-muted-foreground">Skill-to-role compatibility</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Engine</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gemini</div>
            <p className="text-xs text-muted-foreground">Structured career recommendations</p>
          </CardContent>
        </Card>
      </div>

      {summary && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">{summary}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Live Jobs You Can Apply To
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLiveJobs ? (
            <div className="py-10 text-center text-muted-foreground">Loading live jobs...</div>
          ) : liveJobs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No open jobs above 50% match right now.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {liveJobs.map((job) => (
                <div key={job._id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold leading-snug">{job.title}</p>
                    <Badge variant="secondary">{job.matchScore}% match</Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {job.employerId?.companyName || "Company"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location} ({job.locationType})
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{job.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.requiredSkills?.slice(0, 4).map((skill, i) => (
                      <Badge key={`${skill}-${i}`} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {(job.requiredSkills?.length || 0) > 4 && (
                      <Badge variant="outline" className="text-xs">+{job.requiredSkills.length - 4}</Badge>
                    )}
                  </div>

                  {job.hasApplied ? (
                    <Button variant="outline" className="w-full" disabled>
                      Applied ({job.applicationStatus || "applied"})
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => openApplyModal(job)}
                      disabled={applyingJobId === job._id}
                    >
                      {applyingJobId === job._id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                      Apply Now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply to {selectedJob?.title || "Job"}</DialogTitle>
            <DialogDescription>
              Add a short cover letter and resume link before submitting your application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Cover Letter</p>
              <Textarea
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                placeholder="Write a brief introduction and why you are a fit for this role..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Resume URL</p>
              <Input
                value={resumeUrl}
                onChange={(event) => setResumeUrl(event.target.value)}
                placeholder="https://example.com/your-resume"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyToJob} disabled={!selectedJob || applyingJobId === selectedJob?._id}>
              {applyingJobId === selectedJob?._id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Loading recommendations...</div>
          ) : jobs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No matches available yet. Add more credentials and try again.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {jobs.map((job, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-medium">{job.title}</p>
                    <Badge>{Math.max(0, Math.min(100, Number(job.matchScore) || 0))}%</Badge>
                  </div>
                  {job.salaryRange && <p className="text-xs text-muted-foreground mb-1">{job.salaryRange}</p>}
                  {job.whyMatch && <p className="text-sm text-muted-foreground">{job.whyMatch}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
