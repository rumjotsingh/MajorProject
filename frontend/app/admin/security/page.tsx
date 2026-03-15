'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/empty-state';
import api from '@/lib/api';
import {
  Shield,
  Activity,
  AlertTriangle,
  Lock,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Search,
  Filter,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
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

export default function AdminSecurity() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/audit-logs');
      const data = response.data.data;
      if (Array.isArray(data)) {
        setAuditLogs(data);
      } else if (data?.logs) {
        setAuditLogs(data.logs);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = {
      login: CheckCircle,
      logout: Lock,
      institute_approve: CheckCircle,
      institute_reject: XCircle,
      account_lock: Lock,
      credential_verify: CheckCircle,
      credential_reject: XCircle,
    };
    return icons[action] || Activity;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      login: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      logout: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
      institute_approve: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      institute_reject: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      account_lock: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      credential_verify: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      credential_reject: 'text-red-500 bg-red-100 dark:bg-red-900/30',
    };
    return colors[action] || 'text-slate-500 bg-slate-100 dark:bg-slate-800';
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const stats = {
    total: auditLogs.length,
    approvals: auditLogs.filter(
      (log) => log.action?.includes('approve') || log.action?.includes('verify')
    ).length,
    rejections: auditLogs.filter((log) => log.action?.includes('reject')).length,
    locks: auditLogs.filter(
      (log) => log.action?.includes('lock') || log.action?.includes('deactivate')
    ).length,
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter = selectedFilter === 'all' || log.action?.includes(selectedFilter);
    const matchesSearch =
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetUser?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Security & Audit
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor system activities and security events
            </p>
          </div>
          <Button onClick={fetchAuditLogs} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Events</p>
                <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Approvals</p>
                <p className="text-2xl font-bold text-green-700">{stats.approvals}</p>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Rejections</p>
                <p className="text-2xl font-bold text-red-700">{stats.rejections}</p>
              </div>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Account Locks</p>
                <p className="text-2xl font-bold text-orange-700">{stats.locks}</p>
              </div>
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Events</option>
              <option value="approve">Approvals</option>
              <option value="reject">Rejections</option>
              <option value="lock">Account Locks</option>
              <option value="login">Logins</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Activity Log</h2>
            <span className="text-sm text-slate-500">({filteredLogs.length} events)</span>
          </div>

          {paginatedLogs.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Performed By
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Target
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {paginatedLogs.map((log) => {
                      const ActionIcon = getActionIcon(log.action);
                      const colorClass = getActionColor(log.action);

                      return (
                        <tr
                          key={log._id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}
                              >
                                <ActionIcon className="w-4 h-4" />
                              </span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {formatAction(log.action)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              </div>
                              <span className="text-slate-700 dark:text-slate-300">
                                {log.performedBy?.email || 'System'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                            {log.targetUser?.email || log.targetId || '-'}
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {log.details || '-'}
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {new Date(log.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-12">
              <EmptyState
                icon={Activity}
                title="No Activity Logs"
                description="No audit events have been recorded yet"
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
