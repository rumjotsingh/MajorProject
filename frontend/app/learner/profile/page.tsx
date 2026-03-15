'use client'

import { useEffect, useState, useRef } from 'react'
import { Home, FileText, Compass, User, Camera, Loader2, Building2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { getLearnerProfile, updateLearnerProfile } from '@/lib/slices/learnerSlice'
import api from '@/lib/api'
import { toast } from 'sonner'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/learner/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/learner/credentials' },
  { icon: Compass, label: 'Pathways', path: '/learner/pathways' },
  { icon: Building2, label: 'Join Institute', path: '/learner/join-institute' },
  { icon: User, label: 'Profile', path: '/learner/profile' },
]

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { profile, loading } = useAppSelector((state) => state.learner)
  const { user } = useAppSelector((state) => state.auth)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    location: '',
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    }
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(getLearnerProfile())
  }, [dispatch])

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        location: profile.location || '',
        socialLinks: {
          linkedin: profile.socialLinks?.linkedin || '',
          github: profile.socialLinks?.github || '',
          portfolio: profile.socialLinks?.portfolio || ''
        }
      })
    }
  }, [profile])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData = {
        bio: formData.bio,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        location: formData.location,
        socialLinks: formData.socialLinks
      }

      await dispatch(updateLearnerProfile(updateData))
      toast.success('Profile updated!', {
        description: 'Your changes have been saved'
      })
    } catch (error: any) {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'Failed to update profile'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading && !profile) {
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your personal information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                  {profile?.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-5 h-5 text-white dark:text-black animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white dark:text-black" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {user?.email?.split('@')[0] || 'Learner'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Learner
              </p>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Level {profile?.currentLevel || 1} • {profile?.verifiedCredits || 0} credits
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={user?.email || ''} 
                    disabled 
                    className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Skills (comma separated)</Label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, Node.js, Python"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Social Links</Label>
                  <div className="space-y-3">
                    <Input
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                      })}
                      placeholder="LinkedIn URL"
                      className="h-12 rounded-xl"
                    />
                    <Input
                      value={formData.socialLinks.github}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, github: e.target.value }
                      })}
                      placeholder="GitHub URL"
                      className="h-12 rounded-xl"
                    />
                    <Input
                      value={formData.socialLinks.portfolio}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        socialLinks: { ...formData.socialLinks, portfolio: e.target.value }
                      })}
                      placeholder="Portfolio URL"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full sm:w-auto h-12 rounded-xl"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
