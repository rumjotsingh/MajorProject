'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchEmployerById } from '@/lib/slices/employerSlice';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  Activity,
  FileCheck,
  Home,
  Users,
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

export default function EmployerDetails() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedEmployer: employer, loading } = useAppSelector((state) => state.employer);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchEmployerById(params.id as string));
    }
  }, [dispatch, params.id]);

  const getStatus = () => {
    if (!employer) return 'unknown';
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

  if (loading.details) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!employer) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Employer not found
          </h3>
          <Button onClick={() => router.push('/admin/employers')} variant="outline">
            Back to Employers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <Button
        variant="ghost"
        onClick={() => router.push('/admin/employers')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Employers
      </Button>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {employer.companyName || 'Unknown Company'}
                </h1>
                <Badge className={getStatusBadge(getStatus())}>{getStatus()}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {employer.email}
                </span>
                {employer.industry && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {employer.industry}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Company Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Company Name
                  </label>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {employer.companyName || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Industry</label>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {employer.industry || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Company Size
                  </label>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {employer.companySize || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Website</label>
                  {employer.website ? (
                    <a
                      href={employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      {employer.website}
                    </a>
                  ) : (
                    <p className="text-slate-500">Not specified</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Quick Links
              </h2>
              <div className="space-y-2">
                <Link
                  href={`/admin/employers/${params.id}/activity`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    View Activity Logs
                  </span>
                </Link>
                <Link
                  href={`/admin/employers/${params.id}/verifications`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    View Verification History
                  </span>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Account Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Email Verified</span>
                  {employer.isEmailVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Account Active</span>
                  {employer.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
