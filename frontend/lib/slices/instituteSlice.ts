import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../api'
import { API_ENDPOINTS } from '../constants'

interface InstituteState {
  dashboard: any
  credentials: any[]
  pendingCredentials: any[]
  verifiedCredentials: any[]
  learners: any[]
  stats: any
  pagination: any
  loading: boolean
  error: string | null
}

const initialState: InstituteState = {
  dashboard: null,
  credentials: [],
  pendingCredentials: [],
  verifiedCredentials: [],
  learners: [],
  stats: null,
  pagination: null,
  loading: false,
  error: null,
}

export const getDashboard = createAsyncThunk(
  'institute/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INSTITUTE_DASHBOARD)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard')
    }
  }
)

export const getCredentials = createAsyncThunk(
  'institute/getCredentials',
  async ({ page = 1, limit = 10, status = '' }: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.INSTITUTE_CREDENTIALS}?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credentials')
    }
  }
)

export const getPendingCredentials = createAsyncThunk(
  'institute/getPendingCredentials',
  async ({ page = 1, limit = 20 }: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.INSTITUTE_PENDING_CREDENTIALS}?page=${page}&limit=${limit}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending credentials')
    }
  }
)

export const verifyCredential = createAsyncThunk(
  'institute/verifyCredential',
  async ({ credentialId, remarks }: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `/institute/credentials/${credentialId}/verify`,
        { remarks }
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify credential')
    }
  }
)

export const rejectCredential = createAsyncThunk(
  'institute/rejectCredential',
  async ({ credentialId, reason }: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `/institute/credentials/${credentialId}/reject`,
        { reason }
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject credential')
    }
  }
)

export const getLearners = createAsyncThunk(
  'institute/getLearners',
  async ({ page = 1, limit = 20, search = '' }: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.INSTITUTE_LEARNERS}?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch learners')
    }
  }
)

const instituteSlice = createSlice({
  name: 'institute',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboard.pending, (state) => {
        state.loading = true
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.dashboard = action.payload
        state.stats = action.payload.stats
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getCredentials.pending, (state) => {
        state.loading = true
      })
      .addCase(getCredentials.fulfilled, (state, action) => {
        state.loading = false
        state.credentials = action.payload
      })
      .addCase(getCredentials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getPendingCredentials.pending, (state) => {
        state.loading = true
      })
      .addCase(getPendingCredentials.fulfilled, (state, action) => {
        state.loading = false
        state.pendingCredentials = action.payload
      })
      .addCase(getPendingCredentials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(verifyCredential.fulfilled, (state, action) => {
        state.pendingCredentials = state.pendingCredentials.filter(
          (c: any) => c._id !== action.meta.arg.credentialId
        )
      })
      .addCase(rejectCredential.fulfilled, (state, action) => {
        state.pendingCredentials = state.pendingCredentials.filter(
          (c: any) => c._id !== action.meta.arg.credentialId
        )
      })
      .addCase(getLearners.pending, (state) => {
        state.loading = true
      })
      .addCase(getLearners.fulfilled, (state, action) => {
        state.loading = false
        state.learners = action.payload.results
        state.pagination = action.payload.pagination
      })
      .addCase(getLearners.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = instituteSlice.actions
export default instituteSlice.reducer
export type { InstituteState }
