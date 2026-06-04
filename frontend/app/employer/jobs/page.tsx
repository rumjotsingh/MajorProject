'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, Users, Eye, Edit, Trash2, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { employerApi } from '@/lib/employer-api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  nsqfLevel: number;
  location: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  status: string;
  createdAt: string;
  applicationsCount?: number;
  applicationStats?: {
    total: number;
    applied: number;
    shortlisted: number;
    interviewing: number;
    rejected?: number;
    hired: number;
  };
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'danger' | 'warning' | 'success' | 'info',
  });

  useEffect(() => {
    fetchJobs(currentPage);
  }, [filter, currentPage]);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('page', String(page));
      params.append('limit', '10');
      
      const data = await employerApi.getJobs(params);
      setJobs(data.jobs || []);
      setPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (jobId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await employerApi.deleteJob(jobId);
          fetchJobs();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('Error deleting job:', error);
        }
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Listings</h1>
          <p className="text-muted-foreground">Manage your job postings</p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs/create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex text-[16px] items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['all', 'open', 'closed'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => {
                  setFilter(status);
                  setCurrentPage(1);
                }}
                className="rounded-xl"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      ) : jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <Card key={job._id} className="rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h6 className="text-xl font-bold">{job.title}</h6>
                        <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="rounded-xl">
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>NSQF Level {job.nsqfLevel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{job.applicationStats?.total || 0} applications</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {job.applicationStats && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="rounded-xl">
                            Total: {job.applicationStats.total || 0}
                          </Badge>
                          <Badge variant="outline" className="rounded-xl bg-yellow-50 text-yellow-700 border-yellow-200">
                            Applied: {job.applicationStats.applied || 0}
                          </Badge>
                          <Badge variant="outline" className="rounded-xl bg-blue-50 text-blue-700 border-blue-200">
                            Shortlisted: {job.applicationStats.shortlisted || 0}
                          </Badge>
                          <Badge variant="outline" className="rounded-xl bg-purple-50 text-purple-700 border-purple-200">
                            Interviewing: {job.applicationStats.interviewing || 0}
                          </Badge>
                          <Badge variant="outline" className="rounded-xl bg-red-50 text-red-700 border-red-200">
                            Rejected: {job.applicationStats.rejected || 0}
                          </Badge>
                          <Badge variant="outline" className="rounded-xl bg-green-50 text-green-700 border-green-200">
                            Hired: {job.applicationStats.hired || 0}
                          </Badge>
                        </div>
                      )}

                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="rounded-xl">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" asChild className="rounded-xl">
                        <Link href={`/employer/jobs/${job._id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="rounded-xl">
                        <Link href={`/employer/jobs/edit/${job._id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(job._id)}
                        className="text-destructive hover:text-destructive rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing page {currentPage} of {Math.max(1, pages)} ({total} jobs)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="rounded-xl"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loading || currentPage >= pages}
                onClick={() => setCurrentPage((prev) => Math.min(pages, prev + 1))}
                className="rounded-xl"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card className="rounded-xl">
          <CardContent className="text-center py-12">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">Start by posting your first job</p>
            <Button asChild>
              <Link href="/employer/jobs/create">
                Post a Job
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
