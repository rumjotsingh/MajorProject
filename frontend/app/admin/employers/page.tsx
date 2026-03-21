'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Building2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Users,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Employer {
  _id: string;
  companyName: string;
  contactEmail: string;
  mobile: string;
  verified: boolean;
  userId: {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

interface Stats {
  total: number;
  verified: number;
  active: number;
  unverified: number;
}

export default function AdminEmployersPage() {
  const router = useRouter();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  });
  const [filters, setFilters] = useState({
    search: '',
    verified: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    verified: 0,
    active: 0,
    unverified: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'danger' | 'warning' | 'success' | 'info',
  });
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    mobile: '',
    password: '',
    verified: false,
  });

  useEffect(() => {
    fetchEmployers();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.verified && { verified: filters.verified }),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/employers?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setEmployers(data.employers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching employers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/employers/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/employers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          companyName: '',
          contactEmail: '',
          mobile: '',
          password: '',
          verified: false,
        });
        fetchEmployers();
        fetchStats();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create employer');
      }
    } catch (error) {
      console.error('Error creating employer:', error);
      alert('Failed to create employer');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployer) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/employers/${selectedEmployer._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            companyName: formData.companyName,
            contactEmail: formData.contactEmail,
            mobile: formData.mobile,
            verified: formData.verified,
          }),
        }
      );

      if (res.ok) {
        setShowEditModal(false);
        setSelectedEmployer(null);
        fetchEmployers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating employer:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Employer',
      message: 'Are you sure you want to delete this employer? This will also delete their user account.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/employers/${id}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.ok) {
            fetchEmployers();
            fetchStats();
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          }
        } catch (error) {
          console.error('Error deleting employer:', error);
        }
      },
    });
  };

  const handleVerifyToggle = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const action = currentStatus ? 'unverify' : 'verify';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/employers/${id}/${action}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        fetchEmployers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const openEditModal = (employer: Employer) => {
    setSelectedEmployer(employer);
    setFormData({
      companyName: employer.companyName,
      contactEmail: employer.contactEmail,
      mobile: employer.mobile || '',
      password: '',
      verified: employer.verified,
    });
    setShowEditModal(true);
  };

  if (loading && employers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Employer Management</h1>
          <p className="text-gray-600">Manage employer accounts and verification</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Employers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Verified</p>
                <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unverified</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.unverified}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-purple-600">{stats.active}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by company name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            <button
              onClick={() => {
                setFormData({
                  companyName: '',
                  contactEmail: '',
                  mobile: '',
                  password: '',
                  verified: false,
                });
                setShowCreateModal(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-5 h-5" />
              Add Employer
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <select
                  value={filters.verified}
                  onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Employers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employers.map((employer) => (
                  <tr key={employer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {employer.companyName}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {employer._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {employer.contactEmail}
                        </div>
                        {employer.mobile && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {employer.mobile}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleVerifyToggle(employer._id, employer.verified)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            employer.verified
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {employer.verified ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Unverified
                            </>
                          )}
                        </button>
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              employer.userId.isActive
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {employer.userId.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(employer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(employer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employer._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {employers.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No employers found</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.verified
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first employer'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Employer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Employer</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  minLength={6}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="verified" className="text-sm text-gray-700">
                  Mark as verified
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700"
                >
                  Create Employer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Employer</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified-edit"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="verified-edit" className="text-sm text-gray-700">
                  Verified
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEmployer(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700"
                >
                  Update Employer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
