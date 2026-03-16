'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmptyState from '@/components/empty-state';
import api from '@/lib/api';
import { adminSidebarItems } from '@/lib/adminSidebarItems';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Users,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
} from 'lucide-react';

const CATEGORIES = ['Technology', 'Business', 'Healthcare', 'Engineering', 'Arts', 'Science', 'Other'];

export default function AdminPathways() {
  const [pathways, setPathways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<any>(null);
  const [expandedPathway, setExpandedPathway] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Technology',
    icon: '📚',
    levels: [] as any[],
  });

  useEffect(() => {
    fetchPathways();
  }, []);

  const fetchPathways = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pathways');
      setPathways(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pathways:', error);
      setError('Failed to load pathways');
    } finally {
      setLoading(false);
    }
  };

  const generateLevels = () => {
    const levels = [];
    for (let i = 1; i <= 10; i++) {
      levels.push({
        level: i,
        title: `Level ${i}`,
        description: `Complete required credits to achieve Level ${i}`,
        requiredCredits: i * 50,
      });
    }
    return levels;
  };

  const handleCreatePathway = async () => {
    if (!formData.name || !formData.description) {
      setError('Name and description are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await api.post('/admin/pathways', formData);
      setSuccess('Pathway created successfully!');
      setShowCreateModal(false);
      fetchPathways();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create pathway');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePathway = async () => {
    if (!formData.name || !formData.description) {
      setError('Name and description are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await api.put(`/admin/pathways/${selectedPathway._id}`, formData);
      setSuccess('Pathway updated successfully!');
      setShowEditModal(false);
      fetchPathways();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update pathway');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePathway = async (pathwayId: string) => {
    if (!window.confirm('Are you sure you want to delete this pathway?')) {
      return;
    }

    try {
      await api.delete(`/admin/pathways/${pathwayId}`);
      setSuccess('Pathway deleted successfully!');
      fetchPathways();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete pathway');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: 'from-blue-500 to-cyan-500',
      Business: 'from-green-500 to-emerald-500',
      Healthcare: 'from-red-500 to-pink-500',
      Engineering: 'from-orange-500 to-amber-500',
      Arts: 'from-purple-500 to-violet-500',
      Science: 'from-indigo-500 to-blue-500',
      Other: 'from-slate-500 to-slate-500',
    };
    return colors[category] || colors.Other;
  };

  if (loading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pathway Management</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create and manage learning pathways
            </p>
          </div>
          <Button
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                category: 'Technology',
                icon: '📚',
                levels: generateLevels(),
              });
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Pathway
          </Button>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Pathways</p>
                <p className="text-2xl font-bold text-blue-700">{pathways.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active</p>
                <p className="text-2xl font-bold text-green-700">
                  {pathways.filter((p) => p.isActive).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Categories</p>
                <p className="text-2xl font-bold text-purple-700">
                  {new Set(pathways.map((p) => p.category)).size}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Total Enrollments</p>
                <p className="text-2xl font-bold text-amber-700">
                  {pathways.reduce((sum, p) => sum + (p.enrolledCount || 0), 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Pathways List */}
        {pathways.length === 0 ? (
          <Card className="p-12">
            <EmptyState
              icon={TrendingUp}
              title="No pathways yet"
              description="Create your first learning pathway to get started"
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {pathways.map((pathway) => (
              <Card key={pathway._id} className="overflow-hidden">
                <div
                  className={`p-6 cursor-pointer ${!pathway.isActive ? 'opacity-60' : ''}`}
                  onClick={() =>
                    setExpandedPathway(expandedPathway === pathway._id ? null : pathway._id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${getCategoryColor(
                          pathway.category
                        )} rounded-xl flex items-center justify-center text-2xl shadow-lg`}
                      >
                        {pathway.icon || '📚'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {pathway.name}
                          </h3>
                          {!pathway.isActive && (
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                          {pathway.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span
                            className={`px-2 py-1 bg-gradient-to-r ${getCategoryColor(
                              pathway.category
                            )} text-white text-xs rounded-full`}
                          >
                            {pathway.category}
                          </span>
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {pathway.enrolledCount || 0} enrolled
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPathway(pathway);
                          setFormData({
                            name: pathway.name,
                            description: pathway.description,
                            category: pathway.category,
                            icon: pathway.icon || '📚',
                            levels: pathway.levels || generateLevels(),
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePathway(pathway._id);
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedPathway === pathway._id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedPathway === pathway._id && pathway.levels && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                      Level Requirements
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {pathway.levels.map((level: any) => (
                        <div
                          key={level.level}
                          className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-center"
                        >
                          <p className="text-lg font-bold text-blue-600">Level {level.level}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {level.requiredCredits} credits
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create New Pathway</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="name">Pathway Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Full Stack Development"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Describe the learning pathway..."
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📚"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreatePathway} disabled={saving} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Creating...' : 'Create Pathway'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPathway && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Edit Pathway</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="edit-name">Pathway Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Full Stack Development"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Describe the learning pathway..."
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-icon">Icon (Emoji)</Label>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📚"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdatePathway} disabled={saving} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Updating...' : 'Update Pathway'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
