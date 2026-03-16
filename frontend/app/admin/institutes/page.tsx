'use client'

import { useEffect } from 'react'
import { Search, Building2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchAllInstitutes } from '@/lib/slices/adminSlice'
import { adminSidebarItems } from '@/lib/adminSidebarItems'

export default function AllInstitutesPage() {
  const dispatch = useAppDispatch()
  const { allInstitutes, institutesPagination, loading } = useAppSelector(state => state.admin)

  useEffect(() => {
    dispatch(fetchAllInstitutes({ page: 1, limit: 10 }))
  }, [dispatch])

  return (
    <DashboardLayout sidebarItems={adminSidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            All Institutes
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage registered institutes
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input placeholder="Search institutes..." className="pl-12 h-12 rounded-xl" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Institutes ({institutesPagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.institutes ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : (
              <div className="space-y-4">
                {allInstitutes.map((institute: any) => (
                  <div key={institute._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {institute.instituteName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {institute.registrationNumber}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      {institute.status}
                    </Badge>
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
