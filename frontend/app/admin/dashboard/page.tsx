'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import adminApi from '@/lib/admin-api';
import {
  Users,
  Building2,
  Award,
  FileText,
  CreditCard,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  Shield,
} from 'lucide-react';

interface DashboardStats {
  users: {
    total: number;
    learners: number;
    employers: number;
    issuers: number;
  };
  credentials: {
    total: number;
    verified: number;
    pending: number;
  };
  blogs: {
    total: number;
    published: number;
  };
  issuers: {
    pending: number;
    approved: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user' | 'credential' | 'issuer' | 'blog' | 'subscription';
  action: string;
  user: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, learners: 0, employers: 0, issuers: 0 },
    credentials: { total: 0, verified: 0, pending: 0 },
    blogs: { total: 0, published: 0 },
    issuers: { pending: 0, approved: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    // Mock recent activity - you can implement this endpoint
    setRecentActivity([
      {
        id: '1',
        type: 'user',
        action: 'New user registered',
        user: 'John Doe',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'credential',
        action: 'Credential verified',
        user: 'Jane Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        type: 'issuer',
        action: 'Issuer approved',
        user: 'ABC Institute',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'credential':
        return <Award className="w-4 h-4 text-green-600" />;
      case 'issuer':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'blog':
        return <FileText className="w-4 h-4 text-orange-600" />;
      case 'subscription':
        return <CreditCard className="w-4 h-4 text-pink-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: Users,
      color: 'blue',
      href: '/admin/users',
    },
    {
      title: 'Manage Issuers',
      description: 'Approve and manage issuers',
      icon: Building2,
      color: 'purple',
      href: '/admin/issuers',
    },
    {
      title: 'Manage Credentials',
      description: 'Review and verify credentials',
      icon: Award,
      color: 'green',
      href: '/admin/credentials',
    },
    {
      title: 'Manage Blogs',
      description: 'Create and edit blog posts',
      icon: FileText,
      color: 'orange',
      href: '/admin/blog',
    },
    {
      title: 'Manage Employers',
      description: 'View and verify employers',
      icon: Shield,
      color: 'indigo',
      href: '/admin/employers',
    },
    {
      title: 'Manage Subscriptions',
      description: 'Handle user subscriptions',
      icon: CreditCard,
      color: 'pink',
      href: '/admin/subscriptions',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.users.total}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Learners: {stats.users.learners}</span>
                <span>Employers: {stats.users.employers}</span>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.credentials.total}</h3>
            <p className="text-sm text-gray-600">Total Credentials</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  {stats.credentials.verified}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-600" />
                  {stats.credentials.pending}
                </span>
              </div>
            </div>
          </div>

          {/* Issuers */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-yellow-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {stats.issuers.pending} pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.issuers.approved}</h3>
            <p className="text-sm text-gray-600">Approved Issuers</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/issuers"
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                Review pending
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Blog Posts */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +5%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.blogs.total}</h3>
            <p className="text-sm text-gray-600">Blog Posts</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Published: {stats.blogs.published}</span>
                <span>Drafts: {stats.blogs.total - stats.blogs.published}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
                purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
                green: 'bg-green-100 text-green-600 hover:bg-green-200',
                orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
                indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
                pink: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
              };

              return (
                <Link
                  key={index}
                  href={action.href}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClasses[action.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
