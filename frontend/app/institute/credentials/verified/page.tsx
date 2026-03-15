'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import EmptyState from '@/components/empty-state';
import api from '@/lib/api';
import {
  Award,
  CheckCircle,
  User,
  Calendar,
  ExternalLink,
  Search,
  Home,
  FileText,
  Settings,
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/institute/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/institute/credentials' },
  { icon: Settings, label: 'Settings', path: '/institute/settings' },
];

export default function VerifiedCredentials() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/institute/credentials');
      const verified =
        response.data.data?.filter((c: any) => c.verificationStatus === 'verified') || [];
      setCredentials(verified);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCredentials = credentials.filter(
    (cred) =>
      cred.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.learnerId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              Verified Credentials
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {credentials.length} credentials have been verified by your institution
            </p>
          </div>
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or learner email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </Card>

        {filteredCredentials.length === 0 ? (
          <Card className="p-12">
            <EmptyState
              icon={CheckCircle}
              title="No verified credentials"
              description="Verified credentials will appear here"
            />
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCredentials.map((credential) => (
              <Card key={credential._id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Award className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {credential.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        {credential.description || 'No description'}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <User className="w-4 h-4" />
                          {credential.learnerId?.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          Verified: {new Date(credential.verifiedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                          Level {credential.nsqLevel}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                          {credential.credits} Credits
                        </span>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {credential.certificateUrl && (
                    <a
                      href={credential.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Certificate
                    </a>
                  )}
                </div>

                {credential.remarks && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>Remarks:</strong> {credential.remarks}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <Card className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Verification Summary</h3>
              <p className="text-green-100 mt-1">
                Total verified credentials issued by your institution
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{credentials.length}</p>
              <p className="text-green-100 text-sm">Credentials</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
