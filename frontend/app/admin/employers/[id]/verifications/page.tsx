'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/empty-state';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchEmployerVerifications } from '@/lib/slices/employerSlice';
import {
  ArrowLeft,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  User,
  Home,
  Users,
  Building2,
  GraduationCap,
  TrendingUp,
  Briefcase,
  Shield,
  BarChart3,
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Building2, label: 'Institutes', path: '/admin/institutes' },
  { icon: GraduationCap, label: 'Learners', path: '/admin/learners' },
  { icon: Award, label: 'Credentials', path: '/admin/credentials' },
  { icon: TrendingUp, label: 'Pathways', path: '/admin/pathways' },
  { icon: Briefcase, label: 'Employers', path: '/admin/employers' },
  { icon: Shield, label: 'Security', path: '/admin/security' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
];

export default function EmployerVerifications() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { verifications, verificationStats: stats, loading } = useAppSelector(
    (state) => state.employer
  );

  useEffect(() => {
    if (params.id) {
      dispatch(fetchEmployerVerifications({ employerId: params.id as string, page: 1, limit: 20 }));
    }
  }, [dispatch, params.id]);

  if (loading.verifications) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <Button
        variant="ghost"
        onClick={() => router.push(`/admin/employers/${params.id}`)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Employer Details
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-blue-600" />
            Verification History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Credential verification logs</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Successful</p>
                  <p className="text-2xl font-bold text-green-700">{stats.successful}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {verifications.length === 0 ? (
          <Card className="p-12">
            <EmptyState
              icon={FileCheck}
              title="No verifications found"
              description="No credential verifications have been performed by this employer"
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Credential
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Learner
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Result
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {verifications.map((verification: any) => (
                    <tr
                      key={verification._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Award className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {verification.credential?.title || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {verification.learner?.email || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {verification.metadata?.result ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 dark:text-green-400 font-medium">
                              Verified
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-700 dark:text-red-400 font-medium">Failed</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          {new Date(verification.createdAt).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
