'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Calendar, Edit2 } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  currentSubscription?: {
    plan: string;
    status: string;
  };
}

interface LearnerProfile {
  _id: string;
  userId: string;
  bio: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  totalCredits: number;
  nsqfLevel: number;
}

interface Credential {
  _id: string;
  title: string;
  verificationStatus: string;
  credits: number;
  createdAt: string;
  issuerId: {
    name: string;
  };
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: [] as string[],
    education: [] as any[],
    experience: [] as any[],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
  });
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUserById(userId);
      setUser(data.user);
      
      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          bio: data.profile.bio || '',
          skills: data.profile.skills || [],
          education: data.profile.education || [],
          experience: data.profile.experience || [],
        });
      }
      
      if (data.credentials) {
        setCredentials(data.credentials);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Update learner profile if user is a learner
      if (user?.role === 'Learner' && profile) {
        await adminApi.updateLearnerProfile(userId, {
          bio: formData.bio,
          skills: formData.skills,
          education: formData.education,
          experience: formData.experience,
        });
      }

      setMessage({ type: 'success', text: 'User updated successfully!' });
      setEditMode(false);
      fetchUserData();
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage({ type: 'error', text: 'Failed to update user' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill),
    });
  };

  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      setFormData({
        ...formData,
        education: [...formData.education, { ...newEducation }],
      });
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
      });
    }
  };

  const handleRemoveEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const handleAddExperience = () => {
    if (newExperience.company && newExperience.position) {
      setFormData({
        ...formData,
        experience: [...formData.experience, { ...newExperience }],
      });
      setNewExperience({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      });
    }
  };

  const handleRemoveExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
              <p className="text-gray-600">View and edit user information</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    fetchUserData();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{user.name}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Award className="w-5 h-5 text-gray-400" />
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {user.role}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {profile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NSQF Level</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">Level {profile.nsqfLevel} ({profile.totalCredits} credits)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Learner Profile Section */}
        {user.role === 'Learner' && profile && (
          <>
            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Bio</h2>
              {editMode ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter bio..."
                />
              ) : (
                <p className="text-gray-700">{profile.bio || 'No bio provided'}</p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {skill}
                    {editMode && (
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {editMode && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a skill..."
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
              <div className="space-y-4 mb-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        </div>
                        <p className="text-gray-700">{edu.institution}</p>
                        {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                        <p className="text-sm text-gray-500 mt-2">
                          {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                        </p>
                      </div>
                      {editMode && (
                        <button
                          onClick={() => handleRemoveEducation(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {editMode && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-3">
                  <h3 className="font-medium text-gray-900">Add Education</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Institution"
                    />
                    <input
                      type="text"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={newEducation.field}
                      onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Field of Study"
                    />
                    <input
                      type="text"
                      value={newEducation.startDate}
                      onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Start Date (e.g., 2020)"
                    />
                    <input
                      type="text"
                      value={newEducation.endDate}
                      onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="End Date"
                      disabled={newEducation.current}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newEducation.current}
                        onChange={(e) => setNewEducation({ ...newEducation, current: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Currently studying</span>
                    </label>
                  </div>
                  <button
                    onClick={handleAddEducation}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Education
                  </button>
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-4 mb-4">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                        </div>
                        <p className="text-gray-700">{exp.company}</p>
                        {exp.description && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
                        <p className="text-sm text-gray-500 mt-2">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </p>
                      </div>
                      {editMode && (
                        <button
                          onClick={() => handleRemoveExperience(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {editMode && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-3">
                  <h3 className="font-medium text-gray-900">Add Experience</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newExperience.company}
                      onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Company"
                    />
                    <input
                      type="text"
                      value={newExperience.position}
                      onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Position"
                    />
                    <input
                      type="text"
                      value={newExperience.startDate}
                      onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Start Date (e.g., Jan 2020)"
                    />
                    <input
                      type="text"
                      value={newExperience.endDate}
                      onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="End Date"
                      disabled={newExperience.current}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newExperience.current}
                        onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Currently working</span>
                    </label>
                  </div>
                  <textarea
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Description"
                  />
                  <button
                    onClick={handleAddExperience}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Experience
                  </button>
                </div>
              )}
            </div>

            {/* Credentials */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Credentials</h2>
              {credentials.length > 0 ? (
                <div className="space-y-3">
                  {credentials.map((credential) => (
                    <div key={credential._id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{credential.title}</h3>
                          <p className="text-sm text-gray-600">
                            Issued by {credential.issuerId?.name || 'Unknown'} • {credential.credits} credits
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        credential.verificationStatus === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : credential.verificationStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {credential.verificationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No credentials yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
