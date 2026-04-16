'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, Users, Eye, Edit, Trash2, Calendar } from 'lucide-react';
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
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
            <p className="text-gray-600">Manage your job postings</p>
          </div>
          <Link href="/employer/jobs/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'open', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.status === 'open' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
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
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            Total: {job.applicationStats.total || 0}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                            Applied: {job.applicationStats.applied || 0}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            Shortlisted: {job.applicationStats.shortlisted || 0}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800">
                            Interviewing: {job.applicationStats.interviewing || 0}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                            Rejected: {job.applicationStats.rejected || 0}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            Hired: {job.applicationStats.hired || 0}
                          </span>
                        </div>
                      )}

                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link href={`/employer/jobs/${job._id}`}>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details">
                          <Eye className="w-5 h-5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing page {currentPage} of {Math.max(1, pages)} ({total} jobs)
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
                  disabled={loading || currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
                  disabled={loading || currentPage >= pages}
                  onClick={() => setCurrentPage((prev) => Math.min(pages, prev + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Start by posting your first job</p>
            <Link href="/employer/jobs/create">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Post a Job
              </button>
            </Link>
          </div>
        )}
      </div>

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
