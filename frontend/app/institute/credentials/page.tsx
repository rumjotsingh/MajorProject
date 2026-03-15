'use client'

import { useEffect, useState } from 'react'
import { Home, FileText, Users, Settings, Award, Search, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { getCredentials, verifyCredential, rejectCredential } from '@/lib/slices/instituteSlice'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/institute/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/institute/credentials' },
  { icon: Users, label: 'Learners', path: '/institute/learners' },
  { icon: Settings, label: 'Settings', path: '/institute/settings' },
]

export default function InstituteCredentialsPage() {
  const dispatch = useAppDispatch()
  const { credentials, loading } = useAppSelector((state) => state.institute)
  
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedCredential, setSelectedCredential] = useState<any>(null)
  const [remarks, setRemarks] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    dispatch(getCredentials({ page: 1, limit: 50, status: statusFilter }))
  }, [dispatch, statusFilter])

  const filteredCredentials = credentials?.filter((cred: any) =>
    cred.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.learnerId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleVerifyClick = (credential: any) => {
    setSelectedCredential(credential)
    setRemarks('')
    setVerifyModalOpen(true)
  }

  const handleRejectClick = (credential: any) => {
    setSelectedCredential(credential)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const handleVerifyConfirm = async () => {
    if (!selectedCredential) return

    const result = await dispatch(verifyCredential({
      credentialId: selectedCredential._id,
      remarks
    }))

    if (result.type === 'institute/verifyCredential/fulfilled') {
      toast.success('Credential verified!', {
        description: 'Learner level will be updated automatically'
      })
      setVerifyModalOpen(false)
      setSelectedCredential(null)
      setRemarks('')
      dispatch(getCredentials({ page: 1, limit: 50, status: statusFilter }))
    } else {
      toast.error('Verification failed', {
        description: 'Please try again'
      })
    }
  }

  const handleRejectConfirm = async () => {
    if (!selectedCredential || !rejectionReason.trim()) {
      toast.error('Reason required', {
        description: 'Please provide a reason for rejection'
      })
      return
    }

    const result = await dispatch(rejectCredential({
      credentialId: selectedCredential._id,
      reason: rejectionReason
    }))

    if (result.type === 'institute/rejectCredential/fulfilled') {
      toast.success('Credential rejected', {
        description: 'Learner has been notified'
      })
      setRejectModalOpen(false)
      setSelectedCredential(null)
      setRejectionReason('')
      dispatch(getCredentials({ page: 1, limit: 50, status: statusFilter }))
    } else {
      toast.error('Rejection failed', {
        description: 'Please try again'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">Verified</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">Rejected</Badge>
      default:
        return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">Unknown</Badge>
    }
  }

  if (loading && !credentials) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Credentials
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage learner credentials
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by title or learner email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === '' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'approved' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('approved')}
            >
              Verified
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
            </Button>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Credentials ({filteredCredentials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCredentials.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No credentials found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCredentials.map((cred: any) => (
                  <div key={cred._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{cred.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {cred.learnerId?.email || 'Unknown'} • {formatDistanceToNow(new Date(cred.createdAt), { addSuffix: true })}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs">
                            Level {cred.nsqLevel}
                          </Badge>
                          <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs">
                            {cred.credits} Credits
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(cred.status)}
                      {cred.certificateUrl && (
                        <a
                          href={cred.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </a>
                      )}
                      {cred.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyClick(cred)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectClick(cred)}
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verify Modal */}
        <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Credential</DialogTitle>
              <DialogDescription>
                Confirm verification of this credential. The learner&apos;s level will be updated automatically.
              </DialogDescription>
            </DialogHeader>
            {selectedCredential && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedCredential.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedCredential.learnerId?.email}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs">
                      Level {selectedCredential.nsqLevel}
                    </Badge>
                    <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs">
                      {selectedCredential.credits} Credits
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Remarks (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any remarks or notes..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleVerifyConfirm} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Credential
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Credential</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this credential. The learner will be notified.
              </DialogDescription>
            </DialogHeader>
            {selectedCredential && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedCredential.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedCredential.learnerId?.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Rejection Reason *
                  </label>
                  <Textarea
                    placeholder="Explain why this credential is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRejectConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Credential
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
