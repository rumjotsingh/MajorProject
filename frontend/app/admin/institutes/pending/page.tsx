'use client'

import { useEffect } from 'react'
import { Home, Users, FileText, Compass, Shield, Building2, CheckCircle, X } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchPendingInstitutes, approveInstitute, rejectInstitute } from '@/lib/slices/adminSlice'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Building2, label: 'Institutes', path: '/admin/institutes' },
  { icon: FileText, label: 'Credentials', path: '/admin/credentials' },
  { icon: Compass, label: 'Pathways', path: '/admin/pathways' },
  { icon: Shield, label: 'Security', path: '/admin/security' },
]

export default function PendingInstitutesPage() {
  const dispatch = useAppDispatch()
  const { pendingInstitutes, loading } = useAppSelector(state => state.admin)

  useEffect(() => {
    dispatch(fetchPendingInstitutes())
  }, [dispatch])

  const handleApprove = (id: string) => {
    dispatch(approveInstitute(id))
  }

  const handleReject = (id: string) => {
    dispatch(rejectInstitute({ instituteId: id, reason: 'Rejected by admin' }))
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Pending Institutes
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Review and approve institute registrations
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pending Approvals ({pendingInstitutes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.institutes ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : pendingInstitutes.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No pending institutes
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInstitutes.map((institute: any) => (
                  <div key={institute._id} className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            {institute.instituteName}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {institute.registrationNumber}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Email:</span>
                        <span className="ml-2 text-slate-900 dark:text-white">{institute.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Website:</span>
                        <span className="ml-2 text-slate-900 dark:text-white">{institute.website || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleApprove(institute._id)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleReject(institute._id)}
                        variant="outline"
                        className="flex-1 rounded-xl border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
