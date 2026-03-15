'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, FileText, Compass, User, Search, Building2, Plus, List } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { searchInstitutions, joinInstitute, createInstitutionManually, getAvailableInstitutes } from '@/lib/slices/learnerSlice'
import { toast } from 'sonner'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/learner/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/learner/credentials' },
  { icon: Compass, label: 'Pathways', path: '/learner/pathways' },
  { icon: User, label: 'Profile', path: '/learner/profile' },
]

export default function JoinInstitutePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { searchResults, institutions, loading } = useAppSelector((state) => state.learner)

  const [searchKeyword, setSearchKeyword] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAllInstitutes, setShowAllInstitutes] = useState(false)
  const [joiningCode, setJoiningCode] = useState('')
  const [createFormData, setCreateFormData] = useState({
    instituteName: '',
    website: '',
    city: '',
    state: '',
    district: '',
    country: 'India'
  })

  useEffect(() => {
    if (showAllInstitutes && institutions.length === 0) {
      dispatch(getAvailableInstitutes())
    }
  }, [showAllInstitutes, institutions.length, dispatch])

  const handleSearch = async () => {
    if (searchKeyword.trim().length < 3) {
      toast.error('Search too short', {
        description: 'Please enter at least 3 characters'
      })
      return
    }
    await dispatch(searchInstitutions(searchKeyword))
  }

  const handleJoinWithCode = async () => {
    if (!joiningCode.trim()) {
      toast.error('Code required', {
        description: 'Please enter institute code'
      })
      return
    }

    const result = await dispatch(joinInstitute(joiningCode.toUpperCase()))
    if (result.type === 'learner/joinInstitute/fulfilled') {
      toast.success('Joined institute!', {
        description: 'You can now access institute pathways'
      })
      setTimeout(() => router.push('/learner/dashboard'), 1500)
    } else {
      const errorMsg = result.payload as string || 'Invalid institute code or already joined'
      toast.error('Join failed', {
        description: errorMsg
      })
    }
  }

  const handleCreateInstitute = async () => {
    if (!createFormData.instituteName || !createFormData.state) {
      toast.error('Missing fields', {
        description: 'Institute name and state are required'
      })
      return
    }

    const result = await dispatch(createInstitutionManually(createFormData))
    if (result.type === 'learner/createInstitutionManually/fulfilled') {
      toast.success('Institute created!', {
        description: 'Pending admin approval. You will be notified.'
      })
      setShowCreateForm(false)
      setCreateFormData({
        instituteName: '',
        website: '',
        city: '',
        state: '',
        district: '',
        country: 'India'
      })
    } else {
      toast.error('Creation failed', {
        description: 'Failed to create institute'
      })
    }
  }

  const handleJoinExternal = async (inst: any) => {
    toast.info('Creating institute...', {
      description: 'Adding to database'
    })

    const result = await dispatch(createInstitutionManually({
      instituteName: inst.instituteName,
      website: '',
      city: '',
      state: inst.state,
      district: inst.district,
      country: 'India'
    }))

    if (result.type === 'learner/createInstitutionManually/fulfilled') {
      toast.success('Institute added!', {
        description: 'Pending admin approval. You will be notified.'
      })
    } else {
      toast.error('Failed to add', {
        description: 'Could not add institute'
      })
    }
  }

  const handleJoinInternal = async (instituteCode: string, instituteName: string) => {
    const result = await dispatch(joinInstitute(instituteCode))
    if (result.type === 'learner/joinInstitute/fulfilled') {
      toast.success(`Joined ${instituteName}!`, {
        description: 'You can now access institute pathways'
      })
      setTimeout(() => router.push('/learner/dashboard'), 1500)
    } else {
      const errorMsg = result.payload as string || 'Failed to join institute'
      toast.error('Join failed', {
        description: errorMsg
      })
    }
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Join Institute
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Search and join your educational institution
          </p>
        </div>

        {/* Join with Code */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Have an Institute Code?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Enter institute code (e.g., IIT001)"
                value={joiningCode}
                onChange={(e) => setJoiningCode(e.target.value.toUpperCase())}
                className="h-12 rounded-xl"
              />
              <Button onClick={handleJoinWithCode} disabled={loading}>
                Join
              </Button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ask your institute for their unique code
            </p>
          </CardContent>
        </Card>

        {/* Search Institutes */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Search Institutes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by name (min 3 characters)"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-12 rounded-xl"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="space-y-4 mt-6">
                {/* Internal (Verified) Institutions */}
                {searchResults.internal && searchResults.internal.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Verified Institutions
                    </h3>
                    <div className="space-y-3">
                      {searchResults.internal.map((inst: any) => (
                        <div
                          key={inst._id}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {inst.instituteName}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {inst.city}, {inst.state}
                                </p>
                                {inst.website && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {inst.website}
                                  </p>
                                )}
                                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">
                                  Code: {inst.instituteCode || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleJoinInternal(inst.instituteCode || inst._id, inst.instituteName)}
                              disabled={!inst.instituteCode}
                            >
                              Join
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* External (Unverified) Institutions */}
                {searchResults.external && searchResults.external.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Other Institutions (Unverified)
                    </h3>
                    <div className="space-y-3">
                      {searchResults.external.map((inst: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          onClick={() => handleJoinExternal(inst)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {inst.instituteName}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {inst.district}, {inst.state}
                                </p>
                                <Badge className="mt-2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-xs">
                                  Click to Add
                                </Badge>
                              </div>
                            </div>
                            <Plus className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.internal?.length === 0 && searchResults.external?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      No institutions found
                    </p>
                    <Button variant="outline" onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Institute
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Institute Manually */}
        {showCreateForm && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Create New Institute</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Institute Name *</Label>
                <Input
                  value={createFormData.instituteName}
                  onChange={(e) => setCreateFormData({ ...createFormData, instituteName: e.target.value })}
                  placeholder="ABC College of Engineering"
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={createFormData.website}
                  onChange={(e) => setCreateFormData({ ...createFormData, website: e.target.value })}
                  placeholder="https://abc.edu"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State *</Label>
                  <Input
                    value={createFormData.state}
                    onChange={(e) => setCreateFormData({ ...createFormData, state: e.target.value })}
                    placeholder="Delhi"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={createFormData.city}
                    onChange={(e) => setCreateFormData({ ...createFormData, city: e.target.value })}
                    placeholder="New Delhi"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label>District</Label>
                <Input
                  value={createFormData.district}
                  onChange={(e) => setCreateFormData({ ...createFormData, district: e.target.value })}
                  placeholder="Central Delhi"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreateInstitute} disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Institute
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Note: New institutes require admin approval before you can join
              </p>
            </CardContent>
          </Card>
        )}

        {!showCreateForm && !searchResults && (
          <div className="text-center space-y-3">
            <Button 
              variant="outline" 
              onClick={() => setShowAllInstitutes(!showAllInstitutes)}
              className="mr-3"
            >
              <List className="w-4 h-4 mr-2" />
              {showAllInstitutes ? 'Hide' : 'View'} All Approved Institutes
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Can&apos;t find your institute? Create it
            </Button>
          </div>
        )}

        {/* All Available Institutes */}
        {showAllInstitutes && institutions.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>All Approved Institutes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {institutions.map((inst: any) => (
                  <div
                    key={inst._id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {inst.instituteName}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {inst.address?.city}, {inst.address?.state}
                          </p>
                          {inst.website && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {inst.website}
                            </p>
                          )}
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">
                            Code: {inst.instituteCode || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoinInternal(inst.instituteCode || inst._id, inst.instituteName)}
                        disabled={!inst.instituteCode}
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
