import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../api'
import { API_ENDPOINTS } from '../constants'

interface LearnerState {
  profile: any
  dashboard: any
  credentials: any[]
  pathways: any[]
  enrollments: any[]
  myPathway: any
  institutions: any[]
  searchResults: any
  pagination: any
  loading: boolean
  error: string | null
}

const initialState: LearnerState = {
  profile: null,
  dashboard: null,
  credentials: [],
  pathways: [],
  enrollments: [],
  myPathway: null,
  institutions: [],
  searchResults: null,
  pagination: null,
  loading: false,
  error: null,
}

export const getLearnerProfile = createAsyncThunk(
  'learner/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LEARNER_PROFILE)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

export const updateLearnerProfile = createAsyncThunk(
  'learner/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.LEARNER_PROFILE, profileData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

export const getDashboard = createAsyncThunk(
  'learner/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LEARNER_DASHBOARD)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard')
    }
  }
)

export const getCredentials = createAsyncThunk(
  'learner/getCredentials',
  async ({ page = 1, limit = 10, sort = '-createdAt' }: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.LEARNER_CREDENTIALS}?page=${page}&limit=${limit}&sort=${sort}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credentials')
    }
  }
)

export const uploadCredential = createAsyncThunk(
  'learner/uploadCredential',
  async (credentialData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LEARNER_UPLOAD_CREDENTIAL, credentialData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload credential')
    }
  }
)

export const getPathways = createAsyncThunk(
  'learner/getPathways',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LEARNER_PATHWAYS)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pathways')
    }
  }
)

export const enrollPathway = createAsyncThunk(
  'learner/enrollPathway',
  async (pathwayId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LEARNER_ENROLL_PATHWAY, { pathwayId })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enroll in pathway')
    }
  }
)

export const getEnrollments = createAsyncThunk(
  'learner/getEnrollments',
  async ({ page = 1, limit = 20, status = 'active' }: any = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.LEARNER_ENROLLMENTS}?page=${page}&limit=${limit}&status=${status}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollments')
    }
  }
)

export const getMyPathway = createAsyncThunk(
  'learner/getMyPathway',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LEARNER_MY_PATHWAY)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pathway')
    }
  }
)

export const searchInstitutions = createAsyncThunk(
  'learner/searchInstitutions',
  async (keyword: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.LEARNER_INSTITUTIONS_SEARCH}?keyword=${keyword}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search institutions')
    }
  }
)

export const getAvailableInstitutes = createAsyncThunk(
  'learner/getAvailableInstitutes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LEARNER_INSTITUTIONS)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institutions')
    }
  }
)

export const joinInstitute = createAsyncThunk(
  'learner/joinInstitute',
  async (instituteCode: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LEARNER_JOIN_INSTITUTE, { instituteCode })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join institute')
    }
  }
)

export const createInstitutionManually = createAsyncThunk(
  'learner/createInstitutionManually',
  async (institutionData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/learner/institutions/create-manually', institutionData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create institution')
    }
  }
)

const learnerSlice = createSlice({
  name: 'learner',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCredentials: (state) => {
      state.credentials = []
      state.pagination = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLearnerProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLearnerProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(getLearnerProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getDashboard.pending, (state) => {
        state.loading = true
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.dashboard = action.payload
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
        state.credentials = action.payload.results
        state.pagination = action.payload.pagination
      })
      .addCase(getCredentials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getPathways.pending, (state) => {
        state.loading = true
      })
      .addCase(getPathways.fulfilled, (state, action) => {
        state.loading = false
        state.pathways = action.payload
      })
      .addCase(getPathways.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(enrollPathway.fulfilled, (state, action) => {
        state.enrollments = [action.payload, ...state.enrollments]
      })
      .addCase(getEnrollments.fulfilled, (state, action) => {
        state.loading = false
        state.enrollments = action.payload.results || []
      })
      .addCase(getMyPathway.fulfilled, (state, action) => {
        state.loading = false
        state.myPathway = action.payload
      })
      .addCase(getAvailableInstitutes.pending, (state) => {
        state.loading = true
      })
      .addCase(getAvailableInstitutes.fulfilled, (state, action) => {
        state.loading = false
        state.institutions = action.payload
      })
      .addCase(getAvailableInstitutes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(searchInstitutions.pending, (state) => {
        state.loading = true
      })
      .addCase(searchInstitutions.fulfilled, (state, action) => {
        state.loading = false
        state.searchResults = action.payload
      })
      .addCase(searchInstitutions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(joinInstitute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(joinInstitute.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(joinInstitute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createInstitutionManually.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInstitutionManually.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createInstitutionManually.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCredentials } = learnerSlice.actions
export default learnerSlice.reducer
export type { LearnerState }
