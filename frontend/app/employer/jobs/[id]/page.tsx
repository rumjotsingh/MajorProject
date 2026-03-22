'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, MapPin, Award, Calendar, Users, DollarSign } from 'lucide-react';
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
}

interface Application {
  _id: string;
  learnerId: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    nsqfLevel: number;
    totalCredits: number;
    skills: string[];
  };
  status: string;
  appliedAt: string;
}

export default function EmployerJobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'danger' | 'warning' | 'success' | 'info',
  });

  useEffect(() => {
    fetchJobDetails();
    fetchApplications();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const data = await employerApi.getJobById(jobId);
      setJob(data.job);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await employerApi.getJobApplications(jobId);
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      await employerApi.updateApplicationStatus(applicationId, status);
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleDeleteJob = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await employerApi.deleteJob(jobId);
          router.push('/employer/jobs');
        } catch (error) {
          console.error('Error deleting job:', error);
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Job not found</p>
          <button
            onClick={() => router.push('/employer/jobs')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600">Job Details & Applications</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteJob}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span>NSQF Level {job.nsqfLevel}</span>
                </div>
                {job.salaryRange && (job.salaryRange.min || job.salaryRange.max) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {job.salaryRange.currency || 'INR'} {job.salaryRange.min?.toLocaleString() || '0'} - {job.salaryRange.max?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Applications ({applications.length})
              </h2>
            </div>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => {
                const learner = application.learnerId;
                const learnerName = learner?.userId?.name || 'Unknown';
                const learnerEmail = learner?.userId?.email || '';
                
                return (
                  <div key={application._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{learnerName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{learnerEmail}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>NSQF Level {learner?.nsqfLevel || 0}</span>
                          <span>•</span>
                          <span>{learner?.totalCredits || 0} credits</span>
                          <span>•</span>
                          <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>

                        {learner?.skills && learner.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {learner.skills.slice(0, 5).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                            {learner.skills.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{learner.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {application.status === 'applied' && (
                          <>
                            <button
                              onClick={() => handleUpdateApplicationStatus(application._id, 'shortlisted')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(application._id, 'rejected')}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {application.status === 'shortlisted' && (
                          <>
                            <button
                              onClick={() => handleUpdateApplicationStatus(application._id, 'hired')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              Hire
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(application._id, 'rejected')}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => router.push(`/employer/learners/${learner?.userId?._id}`)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">Applications will appear here once candidates apply</p>
            </div>
          )}
        </div>
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
