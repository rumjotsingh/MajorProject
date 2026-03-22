// Admin API utility with proper backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function adminRequest(endpoint: string, options: RequestOptions = {}) {
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

  const response = await fetch(`${API_URL}/admin${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const adminApi = {
  // Dashboard
  getStats: () => adminRequest('/dashboard/stats'),

  // Users
  getUsers: (params: URLSearchParams) => adminRequest(`/users?${params}`),
  getUserById: (id: string) => adminRequest(`/users/${id}`),
  createLearner: (data: any) => adminRequest('/users/learner', { method: 'POST', body: data }),
  updateLearnerProfile: (id: string, data: any) => 
    adminRequest(`/users/learner/${id}`, { method: 'PUT', body: data }),
  deleteUser: (id: string) => adminRequest(`/users/${id}`, { method: 'DELETE' }),

  // Issuers
  getIssuers: (params: URLSearchParams) => adminRequest(`/issuers?${params}`),
  getIssuerById: (id: string) => adminRequest(`/issuers/${id}`),
  createIssuer: (data: any) => adminRequest('/issuers', { method: 'POST', body: data }),
  updateIssuer: (id: string, data: any) => adminRequest(`/issuers/${id}`, { method: 'PUT', body: data }),
  approveIssuer: (id: string) => adminRequest(`/issuers/${id}/approve`, { method: 'PATCH' }),
  rejectIssuer: (id: string, reason: string) => 
    adminRequest(`/issuers/${id}/reject`, { method: 'PATCH', body: { reason } }),
  deleteIssuer: (id: string) => adminRequest(`/issuers/${id}`, { method: 'DELETE' }),

  // Employers
  getEmployers: (params: URLSearchParams) => adminRequest(`/employers?${params}`),
  getEmployerStats: () => adminRequest('/employers/stats'),
  getEmployerById: (id: string) => adminRequest(`/employers/${id}`),
  createEmployer: (data: any) => adminRequest('/employers', { method: 'POST', body: data }),
  updateEmployer: (id: string, data: any) => 
    adminRequest(`/employers/${id}`, { method: 'PUT', body: data }),
  verifyEmployer: (id: string) => adminRequest(`/employers/${id}/verify`, { method: 'PATCH' }),
  unverifyEmployer: (id: string) => adminRequest(`/employers/${id}/unverify`, { method: 'PATCH' }),
  deleteEmployer: (id: string) => adminRequest(`/employers/${id}`, { method: 'DELETE' }),

  // Credentials
  getCredentials: (params: URLSearchParams) => adminRequest(`/credentials?${params}`),
  getCredentialById: (id: string) => adminRequest(`/credentials/${id}`),
  approveCredential: (id: string, notes?: string) => 
    adminRequest(`/credentials/${id}/approve`, { method: 'PATCH', body: { notes } }),
  rejectCredential: (id: string, notes: string) => 
    adminRequest(`/credentials/${id}/reject`, { method: 'PATCH', body: { notes } }),
  deleteCredential: (id: string) => adminRequest(`/credentials/${id}`, { method: 'DELETE' }),

  // Subscriptions
  getSubscriptions: (params: URLSearchParams) => adminRequest(`/subscriptions?${params}`),
  getSubscriptionStats: () => adminRequest('/subscriptions/stats'),
  getSubscriptionById: (id: string) => adminRequest(`/subscriptions/${id}`),
  createSubscription: (data: any) => adminRequest('/subscriptions', { method: 'POST', body: data }),
  updateSubscription: (id: string, data: any) => 
    adminRequest(`/subscriptions/${id}`, { method: 'PUT', body: data }),
  cancelSubscription: (id: string) => 
    adminRequest(`/subscriptions/${id}/cancel`, { method: 'PATCH' }),
  extendSubscription: (id: string, days: number) => 
    adminRequest(`/subscriptions/${id}/extend`, { method: 'PATCH', body: { days } }),
  deleteSubscription: (id: string) => adminRequest(`/subscriptions/${id}`, { method: 'DELETE' }),

  // Blog
  getBlogs: (params: URLSearchParams) => adminRequest(`/blogs?${params}`),
  getBlogCategories: () => adminRequest('/blogs/categories'),
  getBlogById: (id: string) => adminRequest(`/blogs/${id}`),
  createBlog: (data: any) => adminRequest('/blogs', { method: 'POST', body: data }),
  updateBlog: (id: string, data: any) => adminRequest(`/blogs/${id}`, { method: 'PUT', body: data }),
  publishBlog: (id: string) => adminRequest(`/blogs/${id}/publish`, { method: 'PATCH' }),
  unpublishBlog: (id: string) => adminRequest(`/blogs/${id}/unpublish`, { method: 'PATCH' }),
  deleteBlog: (id: string) => adminRequest(`/blogs/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalyticsOverview: () => adminRequest('/analytics/overview'),
  getAnalyticsUsers: () => adminRequest('/analytics/users'),
  getAnalyticsCredentials: () => adminRequest('/analytics/credentials'),
  getAnalyticsIssuers: () => adminRequest('/analytics/issuers'),

  // NSQF
  getNSQFLevels: () => adminRequest('/nsqf/levels'),
  createNSQFLevel: (data: any) => adminRequest('/nsqf/levels', { method: 'POST', body: data }),
  updateNSQFLevel: (id: string, data: any) => 
    adminRequest(`/nsqf/levels/${id}`, { method: 'PUT', body: data }),
  deleteNSQFLevel: (id: string) => adminRequest(`/nsqf/levels/${id}`, { method: 'DELETE' }),
  getNSQFMappings: (params?: URLSearchParams) => 
    adminRequest(`/nsqf/mappings${params ? `?${params}` : ''}`),
  createNSQFMapping: (data: any) => adminRequest('/nsqf/map', { method: 'POST', body: data }),
  deleteNSQFMapping: (id: string) => adminRequest(`/nsqf/mappings/${id}`, { method: 'DELETE' }),
};

export default adminApi;
