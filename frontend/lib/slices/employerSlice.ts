import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../api'
import { API_ENDPOINTS } from '../constants'

interface EmployerState {
  employers: any[]
  pagination: any
  selectedEmployer: any
  employerStats: any
  recentActivity: any[]
  activities: any[]
  activityPagination: any
  verifications: any[]
  verificationStats: any
  verificationPagination: any
  analytics: any
  loading: {
    list: boolean
    details: boolean
    activity: boolean
    verifications: boolean
    analytics: boolean
    action: boolean
  }
  error: {
    list: string | null
    details: string | null
    activity: string | null
    verifications: string | null
    analytics: string | null
    action: string | null
  }
  actionSuccess: string | null
}

const initialState: EmployerState = {
  employers: [],
  pagination: { currentPage: 1, totalPages: 1, total: 0, limit: 10, hasMore: false },
  selectedEmployer: null,
  employerStats: null,
  recentActivity: [],
  activities: [],
  activityPagination: { currentPage: 1, totalPages: 1, total: 0, limit: 10 },
  verifications: [],
  verificationStats: null,
  verificationPagination: { currentPage: 1, totalPages: 1, total: 0, limit: 10 },
  analytics: null,
  loading: {
    list: false,
    details: false,
    activity: false,
    verifications: false,
    analytics: false,
    action: false,
  },
  error: {
    list: null,
    details: null,
    activity: null,
    verifications: null,
    analytics: null,
    action: null,
  },
  actionSuccess: null,
}

export const fetchAllEmployers = createAsyncThunk(
  'employer/fetchAllEmployers',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, status = 'all', search = '', sortBy = 'createdAt', sortOrder = 'desc' } = params
      const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString(), sortBy, sortOrder })
      if (status && status !== 'all') queryParams.append('status', status)
      if (search) queryParams.append('search', search)

      const response = await apiClient.get(`${API_ENDPOINTS.GET_ALL_EMPLOYERS}?${queryParams}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employers')
    }
  }
)

export const fetchEmployerById = createAsyncThunk(
  'employer/fetchEmployerById',
  async (employerId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_EMPLOYER_BY_ID(employerId))
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employer')
    }
  }
)

export const approveEmployer = createAsyncThunk(
  'employer/approveEmployer',
  async (employerId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.APPROVE_EMPLOYER(employerId))
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve employer')
    }
  }
)

export const fetchEmployerActivity = createAsyncThunk(
  'employer/fetchEmployerActivity',
  async (params: { employerId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const { employerId, page = 1, limit = 20 } = params
      const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      const response = await apiClient.get(`${API_ENDPOINTS.GET_EMPLOYER_ACTIVITY(employerId)}?${queryParams}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employer activity')
    }
  }
)

export const fetchEmployerVerifications = createAsyncThunk(
  'employer/fetchEmployerVerifications',
  async (params: { employerId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const { employerId, page = 1, limit = 20 } = params
      const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      const response = await apiClient.get(`${API_ENDPOINTS.GET_EMPLOYER_VERIFICATIONS(employerId)}?${queryParams}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employer verifications')
    }
  }
)

const employerSlice = createSlice({
  name: 'employer',
  initialState,
  reducers: {
    clearError: (state, action) => {
      if (action.payload) {
        state.error[action.payload as keyof typeof state.error] = null
      } else {
        state.error = initialState.error
      }
    },
    clearActionSuccess: (state) => {
      state.actionSuccess = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEmployers.pending, (state) => {
        state.loading.list = true
        state.error.list = null
      })
      .addCase(fetchAllEmployers.fulfilled, (state, action) => {
        state.loading.list = false
        state.employers = action.payload.employers
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAllEmployers.rejected, (state, action) => {
        state.loading.list = false
        state.error.list = action.payload as string
      })
      .addCase(fetchEmployerById.pending, (state) => {
        state.loading.details = true
      })
      .addCase(fetchEmployerById.fulfilled, (state, action) => {
        state.loading.details = false
        state.selectedEmployer = action.payload.employer
        state.employerStats = action.payload.stats
        state.recentActivity = action.payload.recentActivity
      })
      .addCase(fetchEmployerById.rejected, (state, action) => {
        state.loading.details = false
        state.error.details = action.payload as string
      })
      .addCase(fetchEmployerActivity.pending, (state) => {
        state.loading.activity = true
        state.error.activity = null
      })
      .addCase(fetchEmployerActivity.fulfilled, (state, action) => {
        state.loading.activity = false
        state.activities = action.payload.activities || action.payload
        state.activityPagination = action.payload.pagination || state.activityPagination
      })
      .addCase(fetchEmployerActivity.rejected, (state, action) => {
        state.loading.activity = false
        state.error.activity = action.payload as string
      })
      .addCase(fetchEmployerVerifications.pending, (state) => {
        state.loading.verifications = true
        state.error.verifications = null
      })
      .addCase(fetchEmployerVerifications.fulfilled, (state, action) => {
        state.loading.verifications = false
        state.verifications = action.payload.verifications || action.payload
        state.verificationStats = action.payload.stats || state.verificationStats
        state.verificationPagination = action.payload.pagination || state.verificationPagination
      })
      .addCase(fetchEmployerVerifications.rejected, (state, action) => {
        state.loading.verifications = false
        state.error.verifications = action.payload as string
      })
  },
})

export const { clearError, clearActionSuccess } = employerSlice.actions
export default employerSlice.reducer
