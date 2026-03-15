'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, FileText, Compass, User, Award, Plus, Search, ExternalLink, Building2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { getCredentials, getLearnerProfile } from '@/lib/slices/learnerSlice'
import { getLearnerSidebarItems } from '@/lib/learnerSidebarItems'
import { formatDistanceToNow } from 'date-fns'

export default function CredentialsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { credentials, pagination, profile, loading } = useAppSelector((state) => state.learner)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(getCredentials({ page: currentPage, limit: 10 }))
    dispatch(getLearnerProfile())
  }, [dispatch, currentPage])

  const hasJoinedInstitute = !!profile?.user?.instituteId
  const sidebarItems = getLearnerSidebarItems(hasJoinedInstitute)

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

  const filteredCredentials = credentials.filter((cred: any) => {
    const matchesSearch = cred.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || cred.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              My Credentials
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {pagination?.total || 0} total credentials
            </p>
          </div>
          <Button onClick={() => router.push('/learner/add-credential')}>
            <Plus className="w-5 h-5 mr-2" />
            Add Credential
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search credentials..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl" 
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white h-12"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading && credentials.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No credentials found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start building your credential portfolio
              </p>
              <Button onClick={() => router.push('/learner/add-credential')}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Credential
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {filteredCredentials.map((cred: any) => (
                <Card key={cred._id} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Award className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {cred.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-3">
                            {cred.institutionId?.instituteName || 'Unknown Institute'}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span>NSQ Level {cred.nsqLevel}</span>
                            <span>•</span>
                            <span>{cred.credits} credits</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(cred.createdAt), { addSuffix: true })}</span>
                          </div>
                          {cred.skills && cred.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {cred.skills.map((skill: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        {getStatusBadge(cred.status)}
                        {cred.certificateUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(cred.certificateUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
