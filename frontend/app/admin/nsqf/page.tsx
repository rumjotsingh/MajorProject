'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Award, Map } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { adminApi } from '@/lib/admin-api';

interface NSQFLevel {
  _id: string;
  level: number;
  title: string;
  description: string;
  minCredits: number;
  maxCredits: number;
}

interface NSQFMapping {
  _id: string;
  credentialType: string;
  nsqfLevel: number;
  description: string;
}

export default function AdminNSQFPage() {
  const [activeTab, setActiveTab] = useState<'levels' | 'mappings'>('levels');
  const [levels, setLevels] = useState<NSQFLevel[]>([]);
  const [mappings, setMappings] = useState<NSQFMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<NSQFLevel | null>(null);
  const [editingMapping, setEditingMapping] = useState<NSQFMapping | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'danger' | 'warning' | 'success' | 'info',
  });

  const [levelForm, setLevelForm] = useState({
    level: 1,
    title: '',
    description: '',
    minCredits: 0,
    maxCredits: 40,
  });

  const [mappingForm, setMappingForm] = useState({
    credentialType: '',
    nsqfLevel: 1,
    description: '',
  });

  useEffect(() => {
    if (activeTab === 'levels') {
      fetchLevels();
    } else {
      fetchMappings();
    }
  }, [activeTab]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getNSQFLevels();
      setLevels(data.levels || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getNSQFMappings();
      setMappings(data.mappings || []);
    } catch (error) {
      console.error('Error fetching mappings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLevel = () => {
    setEditingLevel(null);
    setLevelForm({
      level: 1,
      title: '',
      description: '',
      minCredits: 0,
      maxCredits: 40,
    });
    setShowLevelModal(true);
  };

  const handleEditLevel = (level: NSQFLevel) => {
    setEditingLevel(level);
    setLevelForm({
      level: level.level,
      title: level.title,
      description: level.description,
      minCredits: level.minCredits,
      maxCredits: level.maxCredits,
    });
    setShowLevelModal(true);
  };

  const handleSubmitLevel = async () => {
    try {
      if (editingLevel) {
        await adminApi.updateNSQFLevel(editingLevel._id, levelForm);
      } else {
        await adminApi.createNSQFLevel(levelForm);
      }
      setShowLevelModal(false);
      fetchLevels();
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  const handleDeleteLevel = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete NSQF Level',
      message: 'Are you sure you want to delete this NSQF level? This may affect credential calculations.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminApi.deleteNSQFLevel(id);
          fetchLevels();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('Error deleting level:', error);
        }
      },
    });
  };

  const handleCreateMapping = () => {
    setEditingMapping(null);
    setMappingForm({
      credentialType: '',
      nsqfLevel: 1,
      description: '',
    });
    setShowMappingModal(true);
  };

  const handleSubmitMapping = async () => {
    try {
      await adminApi.createNSQFMapping(mappingForm);
      setShowMappingModal(false);
      fetchMappings();
    } catch (error) {
      console.error('Error saving mapping:', error);
    }
  };

  const handleDeleteMapping = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete NSQF Mapping',
      message: 'Are you sure you want to delete this credential mapping?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminApi.deleteNSQFMapping(id);
          fetchMappings();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('Error deleting mapping:', error);
        }
      },
    });
  };

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">NSQF Management</h1>
          <p className="text-gray-600">Manage NSQF levels and credential mappings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'levels'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award className="w-5 h-5 inline mr-2" />
            NSQF Levels
          </button>
          <button
            onClick={() => setActiveTab('mappings')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'mappings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Map className="w-5 h-5 inline mr-2" />
            Credential Mappings
          </button>
        </div>

        {/* Content */}
        {activeTab === 'levels' ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleCreateLevel}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add NSQF Level
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levels.map((level) => (
                <div key={level._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditLevel(level)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLevel(level._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Level {level.level}</h3>
                  <p className="text-sm font-medium text-gray-700 mb-2">{level.title}</p>
                  <p className="text-sm text-gray-600 mb-4">{level.description}</p>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Credits: {level.minCredits} - {level.maxCredits}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleCreateMapping}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Mapping
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Credential Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      NSQF Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mappings.map((mapping) => (
                    <tr key={mapping._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{mapping.credentialType}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          Level {mapping.nsqfLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{mapping.description}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteMapping(mapping._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Level Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingLevel ? 'Edit' : 'Add'} NSQF Level
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level Number</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={levelForm.level}
                  onChange={(e) => setLevelForm({ ...levelForm, level: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={levelForm.title}
                  onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={levelForm.description}
                  onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Credits</label>
                  <input
                    type="number"
                    value={levelForm.minCredits}
                    onChange={(e) => setLevelForm({ ...levelForm, minCredits: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Credits</label>
                  <input
                    type="number"
                    value={levelForm.maxCredits}
                    onChange={(e) => setLevelForm({ ...levelForm, maxCredits: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLevelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitLevel}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700"
              >
                {editingLevel ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Credential Mapping</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credential Type</label>
                <input
                  type="text"
                  value={mappingForm.credentialType}
                  onChange={(e) => setMappingForm({ ...mappingForm, credentialType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Certificate, Diploma, Degree"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NSQF Level</label>
                <select
                  value={mappingForm.nsqfLevel}
                  onChange={(e) => setMappingForm({ ...mappingForm, nsqfLevel: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <option key={level} value={level}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={mappingForm.description}
                  onChange={(e) => setMappingForm({ ...mappingForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMappingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitMapping}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700"
              >
                Create
              </button>
            </div>
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
