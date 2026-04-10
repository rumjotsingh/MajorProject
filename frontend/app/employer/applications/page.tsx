'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { employerApi } from '@/lib/employer-api';
import { Users, Search, Loader2, Calendar, Briefcase } from 'lucide-react';

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

  const getStatusClass = (value: string) => {
    if (value === 'hired') return 'bg-green-100 text-green-800';
    if (value === 'shortlisted') return 'bg-blue-100 text-blue-800';
    if (value === 'interviewing') return 'bg-indigo-100 text-indigo-800';
    if (value === 'rejected') return 'bg-red-100 text-red-800';
    if (value === 'withdrawn') return 'bg-gray-200 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Applications</h1>
            <p className="text-gray-600">Track and manage all job applications in one place.</p>
          </div>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search learner or job"
              className="w-64 max-w-full px-3 py-2 border rounded-lg"
            />
            <button
              onClick={() => setQuery(search)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                status === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100">
          {loading ? (
            <div className="py-16 text-center text-gray-600">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No applications found.
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div key={app._id} className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{app.learnerId?.name || 'Unknown learner'}</p>
                    <p className="text-sm text-gray-600">{app.learnerId?.email || 'No email'}</p>
                    <p className="text-sm text-gray-700 inline-flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {app.jobId?.title || 'Job'}
                    </p>
                    <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(app.status)}`}>
                      {app.status}
                    </span>
                    <button
                      className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      onClick={() => router.push(`/employer/jobs/${app.jobId?._id || ''}`)}
                      disabled={!app.jobId?._id}
                    >
                      View Job
                    </button>
                    <button
                      className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      onClick={() => router.push(`/employer/learners/${app.learnerId?._id || ''}`)}
                      disabled={!app.learnerId?._id}
                    >
                      View Candidate
                    </button>
                    {app.status === 'applied' && (
                      <>
                        <button
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                          onClick={() => updateStatus(app._id, 'shortlisted')}
                        >
                          Shortlist
                        </button>
                        <button
                          className="px-3 py-1.5 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50"
                          onClick={() => updateStatus(app._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {app.status === 'shortlisted' && (
                      <>
                        <button
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                          onClick={() => updateStatus(app._id, 'interviewing')}
                        >
                          Interview
                        </button>
                        <button
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                          onClick={() => updateStatus(app._id, 'hired')}
                        >
                          Hire
                        </button>
                        <button
                          className="px-3 py-1.5 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50"
                          onClick={() => updateStatus(app._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {Math.max(1, pagination.pages)}
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
              disabled={loading || pagination.page <= 1}
              onClick={() => fetchApplications(pagination.page - 1, status, query)}
            >
              Previous
            </button>
            <button
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
              disabled={loading || pagination.page >= pagination.pages}
              onClick={() => fetchApplications(pagination.page + 1, status, query)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
