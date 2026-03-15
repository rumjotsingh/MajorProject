'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/empty-state';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchEmployerActivity } from '@/lib/slices/employerSlice';
import {
  ArrowLeft,
  Activity,
  Clock,
  Shield,
  Home,
  Users,
  Building2,
  GraduationCap,
  Award,
  TrendingUp,
  Briefcase,
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

export default function EmployerActivity() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activities, loading } = useAppSelector((state) => state.employer);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchEmployerActivity({ employerId: params.id as string, page: 1, limit: 20 }));
    }
  }, [dispatch, params.id]);

  if (loading.activity) {
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
            <Activity className="w-8 h-8 text-blue-600" />
            Activity Logs
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">All activity history</p>
        </div>

        {activities.length === 0 ? (
          <Card className="p-12">
            <EmptyState
              icon={Activity}
              title="No activity found"
              description="No activity has been recorded for this employer"
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Activity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activities.map((activity: any) => (
                    <tr
                      key={activity._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900 dark:text-white capitalize">
                          {activity.activityType?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          {new Date(activity.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-sm">
                        {activity.ipAddress || 'Unknown'}
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
