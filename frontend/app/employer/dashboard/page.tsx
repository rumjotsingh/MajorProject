'use client'

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAppSelector } from '@/lib/hooks'
import { Briefcase, CheckCircle, Clock, Users } from 'lucide-react'

export default function EmployerDashboardPage() {
  const { user } = useAppSelector((state) => state.auth)

  const stats = [
    { label: 'Verifications', value: '0', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending', value: '0', icon: Clock, color: 'text-yellow-600' },
    { label: 'Candidates', value: '0', icon: Users, color: 'text-blue-600' },
    { label: 'This Month', value: '0', icon: Briefcase, color: 'text-purple-600' },
  ]

  const sidebarItems = [
    { label: 'Dashboard', path: '/employer/dashboard', icon: 'LayoutDashboard' },
    { label: 'Verify Credentials', path: '/employer/verify', icon: 'CheckCircle' },
    { label: 'History', path: '/employer/history', icon: 'History' },
    { label: 'Settings', path: '/employer/settings', icon: 'Settings' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-black dark:text-white">
            Employer Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back, {user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-3xl font-semibold text-black dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <div className="text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            </div>
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Credential Verification
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Verify candidate credentials instantly and securely. Start by searching for a candidate or scanning their credential QR code.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
