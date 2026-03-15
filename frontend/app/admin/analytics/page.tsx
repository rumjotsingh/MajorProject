'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchDashboardStats } from '@/lib/slices/adminSlice';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Award,
  ArrowUpRight,
  Briefcase,
  RefreshCw,
  Home,
  Shield,
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

export default function DashboardAnalytics() {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.admin);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+12%',
      isPositive: true,
      icon: Users,
      color: 'blue',
      href: '/admin/users',
    },
    {
      title: 'Total Institutes',
      value: stats?.institutes?.total || 0,
      change: '+5%',
      isPositive: true,
      icon: Building2,
      color: 'purple',
      href: '/admin/institutes',
    },
    {
      title: 'Total Learners',
      value: stats?.learners?.total || 0,
      change: '+18%',
      isPositive: true,
      icon: GraduationCap,
      color: 'green',
      href: '/admin/learners',
    },
    {
      title: 'Total Credentials',
      value: stats?.credentials?.total || 0,
      change: '+24%',
      isPositive: true,
      icon: Award,
      color: 'amber',
      href: '/admin/credentials',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600' },
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600' },
      green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' },
      amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Overview of platform statistics and trends
            </p>
          </div>
          <Button
            onClick={() => dispatch(fetchDashboardStats())}
            disabled={loading.dashboard}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading.dashboard ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                href={stat.href}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium ${
                      stat.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
              </Link>
            );
          })}
        </div>

        <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/employers"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Manage Employers</span>
            </Link>
            <Link
              href="/admin/security"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>View Security Logs</span>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
