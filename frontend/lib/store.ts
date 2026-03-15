import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import learnerReducer from './slices/learnerSlice'
import adminReducer from './slices/adminSlice'
import employerReducer from './slices/employerSlice'
import instituteReducer from './slices/instituteSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    learner: learnerReducer,
    admin: adminReducer,
    employer: employerReducer,
    institute: instituteReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
