// Employer API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function employerRequest(endpoint: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}/employer${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const employerApi = {
  // Profile
  getProfile: () => employerRequest('/profile'),
  updateProfile: (data: any) => employerRequest('/profile', { method: 'PUT', body: data }),

  // Dashboard
  getDashboardStats: () => employerRequest('/dashboard/stats'),

  // Search Learners
  searchLearners: (params: URLSearchParams) => employerRequest(`/search?${params}`),
  getLearnerDetails: (id: string) => employerRequest(`/learners/${id}`),

  // Bookmarks
  addBookmark: (learnerId: string) => employerRequest(`/bookmark/${learnerId}`, { method: 'POST' }),
  getBookmarks: () => employerRequest('/bookmarks'),
  removeBookmark: (learnerId: string) => employerRequest(`/bookmark/${learnerId}`, { method: 'DELETE' }),

  // Jobs
  createJob: (data: any) => employerRequest('/jobs', { method: 'POST', body: data }),
  getJobs: (params?: URLSearchParams) => employerRequest(`/jobs${params ? `?${params}` : ''}`),
  getJobById: (id: string) => employerRequest(`/jobs/${id}`),
  updateJob: (id: string, data: any) => employerRequest(`/jobs/${id}`, { method: 'PUT', body: data }),
  deleteJob: (id: string) => employerRequest(`/jobs/${id}`, { method: 'DELETE' }),

  // Applications
  getJobApplications: (jobId: string) => employerRequest(`/jobs/${jobId}/applications`),
  updateApplicationStatus: (applicationId: string, status: string) => 
    employerRequest(`/applications/${applicationId}/status`, { method: 'PATCH', body: { status } }),

  // Credential Verification
  verifyCredential: (credentialId: string) => employerRequest(`/verify/${credentialId}`, { method: 'POST' }),
};

export default employerApi;
