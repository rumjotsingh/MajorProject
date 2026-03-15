'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Home, FileText, Compass, User, Award, TrendingUp, CheckCircle, Clock, Upload, Camera, Plus, Building2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { getDashboard, getLearnerProfile, updateLearnerProfile } from '@/lib/slices/learnerSlice'
import { formatDistanceToNow } from 'date-fns'
import api from '@/lib/api'
import { toast } from 'sonner'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/learner/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/learner/credentials' },
  { icon: Compass, label: 'Pathways', path: '/learner/pathways' },
  { icon: Building2, label: 'Join Institute', path: '/learner/join-institute' },
  { icon: User, label: 'Profile', path: '/learner/profile' },
]

export default function LearnerDashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { dashboard, profile, loading } = useAppSelector((state) => state.learner)
  const { user } = useAppSelector((state) => state.auth)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    dispatch(getDashboard())
    dispatch(getLearnerProfile())
  }, [dispatch])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const uploadResponse = await api.post('/upload/image', formData)
      const photoUrl = uploadResponse.data.data.url

      await dispatch(updateLearnerProfile({ profilePicture: photoUrl }))
      dispatch(getLearnerProfile())
      toast.success('Photo updated!', {
        description: 'Your profile photo has been updated'
      })
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.response?.data?.message || 'Failed to upload photo'
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const stats = [
    { 
      label: 'Total Credentials', 
      value: dashboard?.stats?.totalCredentials || 0, 
      icon: Award, 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      label: 'Verified', 
      value: dashboard?.stats?.verifiedCredentials || 0, 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-green-500' 
    },
    { 
      label: 'Pending', 
      value: dashboard?.stats?.pendingCredentials || 0, 
      icon: Clock, 
      color: 'from-amber-500 to-orange-500' 
    },
    { 
      label: 'NSQ Level', 
      value: dashboard?.profile?.currentLevel || 1, 
      icon: TrendingUp, 
      color: 'from-violet-500 to-purple-500' 
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">Verified</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">Rejected</Badge>
      default:
        return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">Unknown</Badge>
    }
  }

  if (loading && !dashboard) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-7 h-7 bg-black dark:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-4 h-4 text-white dark:text-black" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Welcome Back, {user?.email?.split('@')[0] || 'Learner'}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {dashboard?.profile?.enrolledPathway?.name || 'No pathway enrolled yet'}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push('/learner/add-credential')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Credential
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Level Progress */}
        {dashboard?.levelProgress && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Level {dashboard.levelProgress.currentLevel} → Level {dashboard.levelProgress.nextLevel}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {dashboard.profile.verifiedCredits} / {dashboard.levelProgress.creditsForNextLevel} credits
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${dashboard.levelProgress.progressPercentage || 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {dashboard.levelProgress.progressPercentage?.toFixed(1)}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Credentials */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Credentials</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/learner/credentials')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!dashboard?.recentCredentials || dashboard.recentCredentials.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">No credentials yet</p>
                <Button onClick={() => router.push('/learner/add-credential')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Your First Credential
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.recentCredentials.map((credential: any) => (
                  <div 
                    key={credential._id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => router.push(`/learner/credentials`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{credential.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {credential.institutionId?.instituteName || 'Unknown Institute'} • {formatDistanceToNow(new Date(credential.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(credential.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
