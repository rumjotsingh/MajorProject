'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { uploadCredential, getPathways, getLearnerProfile } from '@/lib/slices/learnerSlice';
import { getLearnerSidebarItems } from '@/lib/learnerSidebarItems';
import type { RootState } from '@/lib/store';
import type { LearnerState } from '@/lib/slices/learnerSlice';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, CheckCircle, Home, Award, TrendingUp, User, Plus as PlusIcon, Building2 } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AddCredential() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state: RootState) => (state.learner as LearnerState).loading);
  const error = useAppSelector((state: RootState) => (state.learner as LearnerState).error);
  const pathways = useAppSelector((state: RootState) => (state.learner as LearnerState).pathways);
  const profile = useAppSelector((state: RootState) => (state.learner as LearnerState).profile);

  const hasJoinedInstitute = !!profile?.user?.instituteId;
  const sidebarItems = getLearnerSidebarItems(hasJoinedInstitute);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    nsqLevel: '',
    credits: '',
    pathwayId: '',
    certificateNumber: '',
    issueDate: '',
    skills: '',
  });

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');

  useEffect(() => {
    dispatch(getPathways());
    dispatch(getLearnerProfile());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'File size must be less than 10MB'
        })
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Only PDF, JPG, and PNG files are allowed'
        })
        return;
      }

      setCertificateFile(file);
      setUploadError('');
      setUploadedUrl('');
      toast.success('File selected', {
        description: file.name
      })
    }
  };

  const uploadFile = async () => {
    if (!certificateFile) return null;

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('certificate', certificateFile);

      const response = await api.post('/upload/certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(progress);
        },
      });

      const url = response.data.data.url;
      setUploadedUrl(url);
      toast.success('File uploaded!', {
        description: 'Certificate uploaded successfully'
      })
      return url;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to upload file'
      setUploadError(errorMsg);
      toast.error('Upload failed', {
        description: errorMsg
      })
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if user has joined an institute
    if (!profile?.user?.instituteId) {
      toast.error('Join institute first', {
        description: 'You need to join an institute before uploading credentials'
      })
      return;
    }

    if (!formData.pathwayId) {
      setUploadError('Please select a pathway');
      return;
    }

    if (!certificateFile && !uploadedUrl) {
      setUploadError('Please upload a certificate file');
      return;
    }

    let certificateUrl = uploadedUrl;

    // Auto-upload file if not already uploaded
    if (certificateFile && !uploadedUrl) {
      try {
        certificateUrl = await uploadFile() || '';
      } catch (error) {
        return;
      }
    }

    if (!certificateUrl) {
      setUploadError('Failed to upload certificate');
      return;
    }

    const credentialData = {
      title: formData.title,
      description: formData.description,
      nsqLevel: parseInt(formData.nsqLevel),
      credits: parseInt(formData.credits),
      pathwayId: formData.pathwayId,
      institutionId: profile.user.instituteId,
      certificateUrl: certificateUrl,
      certificateNumber: formData.certificateNumber,
      issueDate: formData.issueDate,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };

    const result = await dispatch(uploadCredential(credentialData));
    if (result.type === 'learner/uploadCredential/fulfilled') {
      toast.success('Credential uploaded!', {
        description: 'Your credential is pending verification'
      })
      setTimeout(() => {
        router.push(ROUTES.LEARNER_CREDENTIALS);
      }, 1000)
    } else {
      toast.error('Upload failed', {
        description: error || 'Failed to upload credential'
      })
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Add Credential</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Upload a new credential to your profile
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <Card className="border-0 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., React.js Certification"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full mt-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Brief description of the credential"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pathwayId">Pathway *</Label>
                <select
                  id="pathwayId"
                  name="pathwayId"
                  value={formData.pathwayId}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">Select pathway</option>
                  {pathways.map((pathway: any) => (
                    <option key={pathway._id} value={pathway._id}>
                      {pathway.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="nsqLevel">NSQ Level * (1-10)</Label>
                <Input
                  id="nsqLevel"
                  name="nsqLevel"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.nsqLevel}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Institute Selection */}
            <div>
              <Label>Institution *</Label>
              {profile?.user?.instituteId ? (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {profile.institute?.instituteName || 'Your Institute'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Joined Institute
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/learner/join-institute')}
                    className="w-full h-12 rounded-xl"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Join Institute First
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    You need to join an institute before uploading credentials
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  name="credits"
                  type="number"
                  min="1"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  name="certificateNumber"
                  value={formData.certificateNumber}
                  onChange={handleChange}
                  placeholder="CERT-2024-001"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
              <Label className="block mb-3">Upload Certificate *</Label>

              {!certificateFile && !uploadedUrl ? (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="mt-4">
                    <label htmlFor="certificate-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500">
                        Click to upload certificate
                      </span>
                      <input
                        id="certificate-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {certificateFile?.name || 'Uploaded file'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {certificateFile ? formatFileSize(certificateFile.size) : 'File ready'}
                        </p>
                      </div>
                    </div>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => {
                          setCertificateFile(null);
                          setUploadedUrl('');
                          setUploadProgress(0);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {uploading && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Uploading...</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadedUrl && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">File uploaded successfully!</span>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                  {uploadError}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                name="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Redux, JavaScript"
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit" disabled={loading || uploading}>
                {loading ? 'Submitting...' : uploading ? 'Uploading...' : 'Submit Credential'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(ROUTES.LEARNER_CREDENTIALS)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
