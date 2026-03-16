'use client'

import { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchAllUsers } from '@/lib/slices/adminSlice'
import { adminSidebarItems } from '@/lib/adminSidebarItems'

export default function AllUsersPage() {
  const dispatch = useAppDispatch()
  const { users, usersPagination, loading } = useAppSelector(state => state.admin)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchAllUsers({ page: 1, limit: 10 }))
  }, [dispatch])

  return (
    <DashboardLayout sidebarItems={adminSidebarItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              All Users
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage platform users
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl" 
            />
          </div>
          <Button variant="outline" className="h-12 rounded-xl">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Users ({usersPagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.users ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : (
              <div className="space-y-4">
                {users.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {user.firstName} {user.lastName} ({user.email})
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Role: {user.role}
                      </p>
                    </div>
                    <Badge className={user.isActive ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'}>
                      {user.isActive ? 'Active' : 'Inactive'}
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
