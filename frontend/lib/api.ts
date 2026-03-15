import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }
    
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch(err => Promise.reject(err))
    }
    
    originalRequest._retry = true
    isRefreshing = true
    
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
    
    if (!refreshToken) {
      isRefreshing = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
    
    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken })
      const { accessToken } = response.data.data
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken)
      }
      
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      
      processQueue(null, accessToken)
      isRefreshing = false
      
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      isRefreshing = false
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      
      return Promise.reject(refreshError)
    }
  }
)

export const API_BASE_URL = BASE_URL
export default apiClient
