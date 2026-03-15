'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, FileText, Users, Settings, Award, Clock, CheckCircle, XCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { getDashboard } from '@/lib/slices/instituteSlice'
import { formatDistanceToNow } from 'date-fns'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/institute/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/institute/credentials' },
  { icon: Users, label: 'Learners', path: '/institute/learners' },
  { icon: Settings, label: 'Settings', path: '/institute/settings' },
]

export default function InstituteDashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { dashboard, loading } = useAppSelector((state) => state.institute)

  useEffect(() => {
    dispatch(getDashboard())
  }, [dispatch])

  const stats = [
    { 
      label: 'Total Credentials', 
      value: dashboard?.stats?.total || 0, 
      icon: Award,
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      label: 'Pending Review', 
      value: dashboard?.stats?.pending || 0, 
      icon: Clock,
      color: 'from-amber-500 to-orange-500' 
    },
    { 
      label: 'Verified', 
      value: dashboard?.stats?.verified || 0, 
      icon: CheckCircle,
      color: 'from-emerald-500 to-green-500' 
    },
    { 
      label: 'Rejected', 
      value: dashboard?.stats?.rejected || 0, 
      icon: XCircle,
      color: 'from-red-500 to-rose-500' 
    },
  ]

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

  if (loading && !dashboard) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Institute Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage credentials and learners
            </p>
          </div>
          {dashboard?.stats?.pending > 0 && (
            <Button onClick={() => router.push('/institute/credentials/pending')}>
              <Clock className="w-4 h-4 mr-2" />
              Review {dashboard.stats.pending} Pending
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Credentials</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/institute/credentials')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!dashboard?.recentCredentials || dashboard.recentCredentials.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No credentials yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.recentCredentials.map((credential: any) => (
                  <div 
                    key={credential._id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => router.push('/institute/credentials')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{credential.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {credential.learnerId?.email || 'Unknown'} • {formatDistanceToNow(new Date(credential.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(credential.status)}
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
