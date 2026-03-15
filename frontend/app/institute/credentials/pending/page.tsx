'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getPendingCredentials, verifyCredential, rejectCredential } from '@/lib/slices/instituteSlice';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  Award,
  Clock,
  ExternalLink,
  AlertCircle,
  Home,
  Settings,
  Users,
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/institute/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/institute/credentials' },
  { icon: Users, label: 'Learners', path: '/institute/learners' },
  { icon: Settings, label: 'Settings', path: '/institute/settings' },
];

export default function PendingCredentials() {
  const dispatch = useAppDispatch()
  const { pendingCredentials, loading } = useAppSelector((state) => state.institute)
  
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(getPendingCredentials({ page: 1, limit: 50 }))
  }, [dispatch]);

  const openVerifyModal = (credential: any) => {
    setSelectedCredential(credential);
    setRemarks('');
    setShowVerifyModal(true);
  };

  const openRejectModal = (credential: any) => {
    setSelectedCredential(credential);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleVerify = async () => {
    if (!selectedCredential) return;

    setActionLoading(true);
    const result = await dispatch(verifyCredential({ 
      credentialId: selectedCredential._id, 
      remarks 
    }))
    
    if (result.type === 'institute/verifyCredential/fulfilled') {
      toast.success('Credential verified!', {
        description: 'Learner has been notified'
      })
      setShowVerifyModal(false);
      setSelectedCredential(null);
    } else {
      toast.error('Verification failed', {
        description: 'Please try again'
      })
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedCredential || !rejectionReason.trim()) return;

    setActionLoading(true);
    const result = await dispatch(rejectCredential({ 
      credentialId: selectedCredential._id, 
      reason: rejectionReason 
    }))
    
    if (result.type === 'institute/rejectCredential/fulfilled') {
      toast.success('Credential rejected', {
        description: 'Learner has been notified'
      })
      setShowRejectModal(false);
      setSelectedCredential(null);
    } else {
      toast.error('Rejection failed', {
        description: 'Please try again'
      })
    }
    setActionLoading(false);
  };

  if (loading && !pendingCredentials) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-500" />
              Pending Credentials
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Review and verify learner credential submissions
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-400">Awaiting Review</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCredentials?.length || 0}</p>
          </div>
        </div>

        {!pendingCredentials || pendingCredentials.length === 0 ? (
          <Card className="border-0 p-12">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
              <p className="text-slate-500 dark:text-slate-400">No credentials pending verification</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingCredentials.map((credential: any) => (
              <Card
                key={credential._id}
                className="shadow-lg overflow-hidden border-l-4 border-l-amber-500"
              >
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">
                          {credential.title}
                        </span>
                        {credential.certificateNumber && (
                          <p className="text-sm text-slate-500">#{credential.certificateNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                        Level {credential.nsqLevel}
                      </Badge>
                      <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400">
                        {credential.credits} Credits
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <User className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase">Learner</p>
                          <p className="text-slate-900 dark:text-white font-medium">
                            {credential.learnerId?.email || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase">Submitted</p>
                          <p className="text-slate-900 dark:text-white font-medium">
                            {new Date(credential.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase">Issue Date</p>
                          <p className="text-slate-900 dark:text-white font-medium">
                            {credential.issueDate
                              ? new Date(credential.issueDate).toLocaleDateString()
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>

                      {credential.certificateUrl && (
                        <div className="flex items-center justify-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <a
                            href={credential.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                          >
                            <ExternalLink className="h-5 w-5" />
                            View Certificate
                          </a>
                        </div>
                      )}
                    </div>

                    {credential.description && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Description</p>
                        <p className="text-slate-700 dark:text-slate-300">{credential.description}</p>
                      </div>
                    )}

                    {credential.skills && credential.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {credential.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        onClick={() => openVerifyModal(credential)}
                        disabled={actionLoading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Verify Credential
                      </Button>
                      <Button
                        onClick={() => openRejectModal(credential)}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Verify Modal */}
      {showVerifyModal && selectedCredential && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Verify Credential
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                You are about to verify <strong>{selectedCredential.title}</strong> for{' '}
                <strong>{selectedCredential.learnerId?.email}</strong>
              </p>
              <p className="text-sm text-slate-500">
                This will add {selectedCredential.credits} credits to the learner&apos;s profile.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Add any verification remarks..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <Button onClick={() => setShowVerifyModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? 'Verifying...' : 'Confirm Verify'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCredential && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                Reject Credential
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  This action cannot be undone. The learner will be notified.
                </p>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                You are about to reject <strong>{selectedCredential.title}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <Button onClick={() => setShowRejectModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
