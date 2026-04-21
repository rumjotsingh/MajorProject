'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { employerApi } from '@/lib/employer-api';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [] as string[],
    nsqfLevel: 1,
    location: '',
    salaryRange: {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    status: 'open',
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [params.id]);

  const fetchJobDetails = async () => {
    try {
      setFetching(true);
      const response = await employerApi.getJobById(params.id as string);
      const job = response.job; // Extract job from response
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requiredSkills: job.requiredSkills || [],
        nsqfLevel: job.nsqfLevel || 1,
        location: job.location || '',
        salaryRange: {
          min: job.salaryRange?.min || 0,
          max: job.salaryRange?.max || 0,
          currency: job.salaryRange?.currency || 'INR',
        },
        status: job.status || 'open',
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      alert('Failed to load job details');
      router.push('/employer/jobs');
    } finally {
      setFetching(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(s => s !== skill),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await employerApi.updateJob(params.id as string, formData);
      router.push('/employer/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-gray-600">Update the job listing details</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 border border-[rgba(0,0,0,0.1)] space-y-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Job Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Senior Full Stack Developer"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
              rows={8}
              placeholder="Describe the role, responsibilities, and requirements..."
              required
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <p className="text-xs text-gray-500">Line breaks will be preserved in the job description</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Required Skills *</label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-3 border border-gray-200 rounded-xl bg-gray-50">
              {formData.requiredSkills.length === 0 ? (
                <span className="text-sm text-gray-400">No skills added yet</span>
              ) : (
                formData.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Type a skill and press Enter or click Add"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">NSQF Level *</label>
              <select
                value={formData.nsqfLevel}
                onChange={(e) => setFormData({ ...formData, nsqfLevel: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Remote, New York, Hybrid"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Salary Range (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">Minimum Salary</label>
                <input
                  type="number"
                  value={formData.salaryRange.min || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    salaryRange: { ...formData.salaryRange, min: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">Maximum Salary</label>
                <input
                  type="number"
                  value={formData.salaryRange.max || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    salaryRange: { ...formData.salaryRange, max: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="100000"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">Currency</label>
                <select
                  value={formData.salaryRange.currency}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    salaryRange: { ...formData.salaryRange, currency: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Job Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="open">Open - Accepting Applications</option>
              <option value="closed">Closed - Not Accepting Applications</option>
            </select>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? 'Updating Job...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
