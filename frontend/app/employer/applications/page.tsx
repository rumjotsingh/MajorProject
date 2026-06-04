'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { employerApi } from '@/lib/employer-api';
import { Users, Search, Loader2, Calendar, Briefcase, Filter, Eye } from 'lucide-react';

interface ApplicationItem {
  _id: string;
  status: string;
  appliedAt: string;
  learnerId?: {
    _id: string;
    name?: string;
    email?: string;
  };
  jobId?: {
    _id: string;
    title?: string;
    location?: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

const statusTabs = ['all', 'applied', 'shortlisted', 'interviewing', 'hired', 'rejected', 'withdrawn'];

export default function EmployerApplicationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1, limit: 10 });

  useEffect(() => {
    fetchApplications(1, status, query);
  }, [status, query]);

  const fetchApplications = async (page: number, selectedStatus: string, selectedQuery: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedQuery.trim()) params.set('search', selectedQuery.trim());

      const response = await employerApi.getApplications(params);
      setApplications(response.applications || []);
      setPagination(response.pagination || { total: 0, page: 1, pages: 1, limit: 10 });
    } catch (error) {
      console.error('Error fetching employer applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, nextStatus: string) => {
    try {
      await employerApi.updateApplicationStatus(applicationId, nextStatus);
      await fetchApplications(pagination.page, status, query);
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusVariant = (value: string) => {
    if (value === 'hired') return 'default';
    if (value === 'shortlisted') return 'secondary';
    if (value === 'interviewing') return 'secondary';
    if (value === 'rejected') return 'destructive';
    if (value === 'withdrawn') return 'outline';
    return 'secondary';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Track and manage all job applications in one place</p>
        </div>
        {/* <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search learner or job"
              className="pl-10 w-64 rounded-xl"
            />
          </div>
          <Button
            onClick={() => setQuery(search)}
            className="rounded-xl"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div> */}
      </div>

      {/* Filters */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className=" text-[18px] flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Button
                key={tab}
                variant={status === tab ? "default" : "outline"}
                onClick={() => setStatus(tab)}
                className="rounded-xl"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card className="rounded-xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">No applications found</p>
              <p className="text-muted-foreground">No applications match your current filters</p>
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div key={app._id} className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{app.learnerId?.name || 'Unknown learner'}</p>
                        <p className="text-sm text-muted-foreground">{app.learnerId?.email || 'No email'}</p>
                      </div>
                      <Badge variant={getStatusVariant(app.status)} className="rounded-xl">
                        {app.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{app.jobId?.title || 'Job'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/employer/jobs/${app.jobId?._id || ''}`)}
                      disabled={!app.jobId?._id}
                      className="rounded-xl"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Job
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/employer/learners/${app.learnerId?._id || ''}`)}
                      disabled={!app.learnerId?._id}
                      className="rounded-xl"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Candidate
                    </Button>
                    
                    {app.status === 'applied' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(app._id, 'shortlisted')}
                          className="rounded-xl"
                        >
                          Shortlist
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateStatus(app._id, 'rejected')}
                          className="rounded-xl"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {app.status === 'shortlisted' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(app._id, 'interviewing')}
                          className="rounded-xl bg-purple-600 hover:bg-purple-700"
                        >
                          Interview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(app._id, 'hired')}
                          className="rounded-xl bg-green-600 hover:bg-green-700"
                        >
                          Hire
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateStatus(app._id, 'rejected')}
                          className="rounded-xl"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {pagination.page} of {Math.max(1, pagination.pages)} ({pagination.total} applications)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || pagination.page <= 1}
            onClick={() => fetchApplications(pagination.page - 1, status, query)}
            className="rounded-xl"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || pagination.page >= pagination.pages}
            onClick={() => fetchApplications(pagination.page + 1, status, query)}
            className="rounded-xl"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
