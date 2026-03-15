'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/lib/hooks';
import api from '@/lib/api';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
  FileText,
  Home,
  Settings as SettingsIcon,
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/institute/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/institute/credentials' },
  { icon: SettingsIcon, label: 'Settings', path: '/institute/settings' },
];

export default function Settings() {
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [instituteData, setInstituteData] = useState({
    instituteName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    registrationNumber: '',
    institutionType: '',
  });

  useEffect(() => {
    if (user) {
      setInstituteData({
        instituteName: (user as any).instituteName || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        website: (user as any).website || '',
        address: (user as any).address || '',
        city: (user as any).city || '',
        state: (user as any).state || '',
        registrationNumber: (user as any).registrationNumber || '',
        institutionType: (user as any).institutionType || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstituteData({ ...instituteData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/institute/profile', instituteData);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Institute Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your institution&apos;s profile and settings
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {instituteData.instituteName}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {instituteData.institutionType || 'Educational Institution'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified Institute
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Institution Details
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="instituteName">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Institution Name
                  </div>
                </Label>
                <Input
                  id="instituteName"
                  name="instituteName"
                  value={instituteData.instituteName}
                  onChange={handleChange}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800"
                />
                <p className="text-xs text-slate-500 mt-1">Contact admin to change</p>
              </div>

              <div>
                <Label htmlFor="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </div>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={instituteData.email}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </div>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={instituteData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="website">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </div>
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={instituteData.website}
                  onChange={handleChange}
                  placeholder="https://www.example.edu"
                />
              </div>

              <div>
                <Label htmlFor="registrationNumber">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Registration Number
                  </div>
                </Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  value={instituteData.registrationNumber}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <Label htmlFor="institutionType">Institution Type</Label>
                <Input
                  id="institutionType"
                  name="institutionType"
                  value={instituteData.institutionType}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={instituteData.address}
                    onChange={handleChange}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={instituteData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={instituteData.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Verification Status</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Your institution has been verified by the platform administrator. Learners can submit
                credentials for verification by your institution.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
