'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { login, clearError } from '@/lib/slices/authSlice'
import { toast } from 'sonner'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    dispatch(clearError())
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const result = await dispatch(login(formData))
    
    if (login.fulfilled.match(result)) {
      const userData = result.payload.user
      const role = userData?.role
      
      toast.success('Login successful!', {
        description: `Welcome back, ${userData?.email?.split('@')[0] || 'user'}!`
      })
      
      // Force full page redirect
      setTimeout(() => {
        if (role === 'admin') {
          window.location.href = '/admin/dashboard'
        } else if (role === 'institute') {
          window.location.href = '/institute/dashboard'
        } else if (role === 'employer') {
          window.location.href = '/employer/dashboard'
        } else {
          window.location.href = '/learner/dashboard'
        }
      }, 500)
    } else {
      toast.error('Login failed', {
        description: error || 'Invalid credentials'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4 pb-32 md:pb-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-semibold">CM</span>
            </div>
            <span className="text-xl font-semibold text-black dark:text-white">
              CredMatrix
            </span>
          </Link>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-black dark:text-white mb-2">
              Sign in
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome back to CredMatrix
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-black dark:text-white">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-black dark:text-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-medium"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-black dark:text-white font-medium hover:underline">
              Create account
            </Link>
          </p>

          <div className="text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-black dark:hover:text-white transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
