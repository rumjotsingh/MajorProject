'use client'

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchDashboardStats } from '@/lib/slices/adminSlice'
import { adminSidebarItems } from '@/lib/adminSidebarItems'

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((state) => state.admin)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  const statsDisplay = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: adminSidebarItems[1].icon, 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      label: 'Learners', 
      value: stats?.totalLearners || 0, 
      icon: adminSidebarItems[2].icon, 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      label: 'Institutes', 
      value: stats?.totalInstitutes || 0, 
      icon: adminSidebarItems[3].icon, 
      color: 'from-emerald-500 to-green-500' 
    },
    { 
      label: 'Employers', 
      value: stats?.totalEmployers || 0, 
      icon: adminSidebarItems[4].icon, 
      color: 'from-orange-500 to-amber-500' 
    },
    { 
      label: 'Total Credentials', 
      value: stats?.totalCredentials || 0, 
      icon: adminSidebarItems[5].icon, 
      color: 'from-violet-500 to-purple-500' 
    },
    { 
      label: 'Verified Credentials', 
      value: stats?.verifiedCredentials || 0, 
      icon: adminSidebarItems[5].icon, 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      label: 'Pending Credentials', 
      value: stats?.pendingCredentials || 0, 
      icon: adminSidebarItems[5].icon, 
      color: 'from-amber-500 to-orange-500' 
    },
    { 
      label: 'Pathways', 
      value: stats?.totalPathways || 0, 
      icon: adminSidebarItems[6].icon, 
      color: 'from-purple-500 to-pink-500' 
    },
  ]

  if (loading.dashboard) {
    return (
      <DashboardLayout sidebarItems={adminSidebarItems}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={adminSidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Platform overview and management
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsDisplay.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
