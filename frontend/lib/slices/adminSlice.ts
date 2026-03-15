import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../api'
import { API_ENDPOINTS } from '../constants'

interface AdminState {
  stats: any
  recentUsers: any[]
  pendingInstitutes: any[]
  allInstitutes: any[]
  selectedInstitute: any
  institutesPagination: {
    currentPage: number
    totalPages: number
    total: number
  }
  users: any[]
  usersPagination: {
    currentPage: number
    totalPages: number
    total: number
  }
  loading: {
    dashboard: boolean
    institutes: boolean
    users: boolean
    action: boolean
  }
  error: {
    dashboard: string | null
    institutes: string | null
    users: string | null
    action: string | null
  }
}

const initialState: AdminState = {
  stats: null,
  recentUsers: [],
  pendingInstitutes: [],
  allInstitutes: [],
  selectedInstitute: null,
  institutesPagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  users: [],
  usersPagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  loading: {
    dashboard: false,
    institutes: false,
    users: false,
    action: false,
  },
  error: {
    dashboard: null,
    institutes: null,
    users: null,
    action: null,
  },
}

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN_DASHBOARD)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats')
    }
  }
)

export const fetchPendingInstitutes = createAsyncThunk(
  'admin/fetchPendingInstitutes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_PENDING_INSTITUTES)
      return response.data.data || []
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending institutes')
    }
  }
)

export const fetchAllInstitutes = createAsyncThunk(
  'admin/fetchAllInstitutes',
  async ({ page = 1, limit = 10, status = 'all', search = '' }: any = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (status && status !== 'all') params.append('status', status)
      if (search) params.append('search', search)

      const response = await apiClient.get(`${API_ENDPOINTS.GET_ALL_INSTITUTES}?${params}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institutes')
    }
  }
)

export const approveInstitute = createAsyncThunk(
  'admin/approveInstitute',
  async (instituteId: string, { rejectWithValue }) => {
    try {
      await apiClient.put(API_ENDPOINTS.APPROVE_INSTITUTE(instituteId))
      return instituteId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve institute')
    }
  }
)

export const rejectInstitute = createAsyncThunk(
  'admin/rejectInstitute',
  async ({ instituteId, reason }: { instituteId: string; reason: string }, { rejectWithValue }) => {
    try {
      await apiClient.put(API_ENDPOINTS.REJECT_INSTITUTE(instituteId), { reason })
      return instituteId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject institute')
    }
  }
)

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async ({ role, page = 1, limit = 10 }: any, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (role) params.append('role', role)

      const response = await apiClient.get(`${API_ENDPOINTS.GET_ALL_USERS}?${params}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = {
        dashboard: null,
        institutes: null,
        users: null,
        action: null,
      }
    },
    clearActionError: (state) => {
      state.error.action = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.dashboard = true
        state.error.dashboard = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.dashboard = false
        state.stats = action.payload.stats
        state.recentUsers = action.payload.recentUsers
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.dashboard = false
        state.error.dashboard = action.payload as string
      })
      .addCase(fetchPendingInstitutes.pending, (state) => {
        state.loading.institutes = true
      })
      .addCase(fetchPendingInstitutes.fulfilled, (state, action) => {
        state.loading.institutes = false
        state.pendingInstitutes = action.payload
      })
      .addCase(fetchPendingInstitutes.rejected, (state, action) => {
        state.loading.institutes = false
        state.error.institutes = action.payload as string
      })
      .addCase(approveInstitute.fulfilled, (state, action) => {
        state.pendingInstitutes = state.pendingInstitutes.filter(
          (inst: any) => inst._id !== action.payload
        )
      })
      .addCase(fetchAllInstitutes.fulfilled, (state, action) => {
        state.loading.institutes = false
        state.allInstitutes = action.payload.institutes
        state.institutesPagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        }
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading.users = false
        state.users = action.payload.users
        state.usersPagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        }
      })
  },
})

export const { clearErrors, clearActionError } = adminSlice.actions
export default adminSlice.reducer
