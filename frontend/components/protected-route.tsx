'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'
import { LoadingSpinner } from './loading-spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, loading } = useAppSelector(state => state.auth)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!loading && isAuthenticated && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      const dashboardMap: Record<string, string> = {
        learner: '/learner/dashboard',
        institute: '/institute/dashboard',
        admin: '/admin/dashboard',
        employer: '/employer/dashboard',
      }
      router.push(dashboardMap[user.role] || '/')
    }
  }, [isAuthenticated, user, loading, allowedRoles, router])

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
