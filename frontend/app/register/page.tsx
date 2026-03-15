'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Building2, Briefcase, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { register, clearError } from '@/lib/slices/authSlice'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'learner',
    phone: '',
    instituteCode: '',
    learnerInstituteName: '',
    instituteName: '',
    registrationNumber: '',
    website: '',
    companyName: '',
    industry: ''
  })
  const [step, setStep] = useState(1)
  const [localError, setLocalError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    setLocalError('')
    dispatch(clearError())
  }

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value
    })
  }

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('Please fill all required fields')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return false
    }
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let payload: any = {
      email: formData.email,
      password: formData.password,
      role: formData.role
    }

    if (formData.role === 'learner') {
      payload = {
        ...payload,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        instituteCode: formData.instituteCode?.trim() || undefined,
        instituteName: formData.learnerInstituteName?.trim() || undefined
      }
    } else if (formData.role === 'institute') {
      payload = {
        ...payload,
        instituteName: formData.instituteName,
        registrationNumber: formData.registrationNumber,
        website: formData.website,
        contactPerson: {
          name: formData.firstName,
          phone: formData.phone
        }
      }
    } else if (formData.role === 'employer') {
      payload = {
        ...payload,
        companyName: formData.companyName,
        industry: formData.industry,
        contactPerson: {
          name: formData.firstName,
          phone: formData.phone
        }
      }
    }

    const result = await dispatch(register(payload))

    if (register.fulfilled.match(result)) {
      toast.success('Registration successful!', {
        description: 'Please login to continue'
      })
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } else {
      toast.error('Registration failed', {
        description: error || 'Please try again'
      })
    }
  }

  const roleOptions = [
    { value: 'learner', label: 'Learner', icon: GraduationCap, description: 'Build your credential portfolio' },
    { value: 'institute', label: 'Institute', icon: Building2, description: 'Issue verified credentials' },
    { value: 'employer', label: 'Employer', icon: Briefcase, description: 'Verify candidate credentials' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4 py-12 pb-32 md:pb-12">
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

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= 1 
                ? 'bg-black dark:bg-white text-white dark:text-black' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className={`w-16 h-0.5 transition-colors ${step >= 2 ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= 2 
                ? 'bg-black dark:bg-white text-white dark:text-black' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              2
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-black dark:text-white mb-2">
              {step === 1 ? 'Create account' : 'Complete profile'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {step === 1 ? 'Start with your account credentials' : `Enter your ${formData.role} details`}
            </p>
          </div>

          {(error || localError) && (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Email</Label>
                  <Input
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
                  <Label className="text-sm font-medium text-black dark:text-white">Password</Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
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

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Confirm password</Label>
                  <div className="relative">
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-black dark:text-white">I am a</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {roleOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleRoleChange(option.value)}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors text-left ${
                            formData.role === option.value
                              ? 'border-black dark:border-white bg-slate-50 dark:bg-slate-950'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.role === option.value
                              ? 'bg-black dark:bg-white text-white dark:text-black'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${formData.role === option.value ? 'text-black dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {option.label}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{option.description}</p>
                          </div>
                          {formData.role === option.value && (
                            <CheckCircle className="w-5 h-5 text-black dark:text-white" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Button 
                  type="button" 
                  onClick={handleNext} 
                  className="w-full h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-medium"
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && formData.role === 'learner' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-black dark:text-white">First name</Label>
                    <Input
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-black dark:text-white">Last name</Label>
                    <Input
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Phone number</Label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                    className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1 h-11 rounded-lg border-slate-300 dark:border-slate-700">
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-medium">
                    {loading ? 'Creating...' : 'Create account'}
                  </Button>
                </div>
              </>
            )}

            {step === 2 && formData.role === 'institute' && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Institute Name *</Label>
                  <Input
                    name="instituteName"
                    required
                    value={formData.instituteName}
                    onChange={handleChange}
                    placeholder="ABC College of Engineering"
                    className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Registration Number</Label>
                  <Input
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="REG/2024/12345"
                    className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Website</Label>
                  <Input
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://abc.edu"
                    className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-black dark:text-white">Contact Person *</Label>
                    <Input
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-black dark:text-white">Contact Phone</Label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 1234567890"
                      className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1 h-11 rounded-lg border-slate-300 dark:border-slate-700">
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-medium">
                    {loading ? 'Creating...' : 'Create account'}
                  </Button>
                </div>
              </>
            )}

            {step === 2 && formData.role === 'employer' && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Company Name *</Label>
                  <Input
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Tech Corp Inc."
                    className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black dark:text-white">Industry</Label>
                  <Input
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Information Technology"
                    className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-black dark:text-white">Contact Person *</Label>
                    <Input
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-black dark:text-white">Contact Phone</Label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 1234567890"
                      className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1 h-11 rounded-lg border-slate-300 dark:border-slate-700">
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-medium">
                    {loading ? 'Creating...' : 'Create account'}
                  </Button>
                </div>
              </>
            )}
          </form>

          {step === 1 && (
            <>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-black dark:text-white font-medium hover:underline">
                  Sign in
                </Link>
              </p>

              <div className="text-center">
                <Link href="/" className="text-sm text-slate-500 hover:text-black dark:hover:text-white transition-colors">
                  ← Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
