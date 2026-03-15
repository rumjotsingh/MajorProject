'use client'

import { useEffect, useState } from 'react'
import { Home, FileText, Users, Settings, Search, User, TrendingUp } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { getLearners } from '@/lib/slices/instituteSlice'
import { formatDistanceToNow } from 'date-fns'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/institute/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/institute/credentials' },
  { icon: Users, label: 'Learners', path: '/institute/learners' },
  { icon: Settings, label: 'Settings', path: '/institute/settings' },
]

export default function InstituteLearnersPage() {
  const dispatch = useAppDispatch()
  const { learners, pagination, loading } = useAppSelector((state) => state.institute)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(getLearners({ page: currentPage, limit: 20, search: searchTerm }))
  }, [dispatch, currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    dispatch(getLearners({ page: 1, limit: 20, search: searchTerm }))
  }

  if (loading && !learners) {
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
            Learners
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage learners from your institute
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>All Learners ({pagination?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!learners || learners.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No learners found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {learners.map((learner: any) => (
                  <div 
                    key={learner._id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {learner.firstName && learner.lastName 
                            ? `${learner.firstName} ${learner.lastName}`
                            : learner.email}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {learner.email} • Joined {formatDistanceToNow(new Date(learner.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {learner.activePathways > 0 && (
                        <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {learner.activePathways} Pathways
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
