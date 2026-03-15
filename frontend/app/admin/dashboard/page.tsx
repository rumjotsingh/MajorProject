'use client'

import { Home, Users, FileText, Compass, Shield, Building2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Building2, label: 'Institutes', path: '/admin/institutes' },
  { icon: FileText, label: 'Credentials', path: '/admin/credentials' },
  { icon: Compass, label: 'Pathways', path: '/admin/pathways' },
  { icon: Shield, label: 'Security', path: '/admin/security' },
]

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '50,234', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Institutes', value: '523', icon: Building2, color: 'from-emerald-500 to-green-500' },
    { label: 'Credentials', value: '102K', icon: FileText, color: 'from-violet-500 to-purple-500' },
    { label: 'Pathways', value: '45', icon: Compass, color: 'from-amber-500 to-orange-500' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
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
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
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
      </div>
    </DashboardLayout>
  )
}
