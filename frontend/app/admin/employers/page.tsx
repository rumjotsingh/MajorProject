'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/empty-state';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAllEmployers } from '@/lib/slices/employerSlice';
import { adminSidebarItems } from '@/lib/adminSidebarItems';
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';

export default function Employers() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { employers, pagination, loading } = useAppSelector((state) => state.employer);

  useEffect(() => {
    dispatch(fetchAllEmployers({ page: 1, limit: 20 }));
  }, [dispatch]);

  const getEmployerStatus = (employer: any) => {
    if (employer.isSuspended) return 'suspended';
    if (!employer.isActive) return 'inactive';
    if (!employer.isEmailVerified) return 'unverified';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      suspended: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400',
      unverified: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    };
    return styles[status] || styles.inactive;
  };

  if (loading.list) {
    return (
      <DashboardLayout sidebarItems={adminSidebarItems}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={adminSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Employers
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage employer accounts and verification activities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-xl font-bold text-blue-700">{pagination?.total || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Active</p>
                <p className="text-xl font-bold text-green-700">
                  {employers?.filter((e: any) => e.isActive && !e.isSuspended).length || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium">Suspended</p>
                <p className="text-xl font-bold text-amber-700">
                  {employers?.filter((e: any) => e.isSuspended).length || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500 rounded-lg">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Inactive</p>
                <p className="text-xl font-bold text-slate-700">
                  {employers?.filter((e: any) => !e.isActive).length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {!employers || employers.length === 0 ? (
          <Card className="p-12">
            <EmptyState
              icon={Building2}
              title="No employers found"
              description="No employers have registered yet"
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Industry
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Verifications
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employers.map((employer: any) => {
                    const status = getEmployerStatus(employer);
                    return (
                      <tr
                        key={employer._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {employer.companyName || 'N/A'}
                              </p>
                              <p className="text-xs text-slate-500">{employer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {employer.industry || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                            {employer.verifiedCredentials?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={getStatusBadge(status)}>{status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-400">
                          {new Date(employer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/employers/${employer._id}`)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
