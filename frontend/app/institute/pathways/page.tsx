'use client'

import { useEffect, useState } from 'react'
import { Home, FileText, Users, Settings, Plus, Trash2, Edit, Target } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toast } from 'sonner'
import api from '@/lib/api'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/institute/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/institute/credentials' },
  { icon: Target, label: 'Pathways', path: '/institute/pathways' },
  { icon: Users, label: 'Learners', path: '/institute/learners' },
  { icon: Settings, label: 'Settings', path: '/institute/settings' },
]

interface Level {
  level: number
  requiredCredits: number
  title: string
  description: string
}

export default function InstitutePathwaysPage() {
  const dispatch = useAppDispatch()
  const [pathways, setPathways] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedPathway, setSelectedPathway] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Technology',
    totalLevels: 5,
  })

  const [levels, setLevels] = useState<Level[]>([
    { level: 1, requiredCredits: 10, title: 'Level 1', description: '' },
    { level: 2, requiredCredits: 25, title: 'Level 2', description: '' },
    { level: 3, requiredCredits: 45, title: 'Level 3', description: '' },
    { level: 4, requiredCredits: 70, title: 'Level 4', description: '' },
    { level: 5, requiredCredits: 100, title: 'Level 5', description: '' },
  ])

  useEffect(() => {
    fetchPathways()
  }, [])

  const fetchPathways = async () => {
    setLoading(true)
    try {
      const response = await api.get('/institute/pathways')
      setPathways(response.data.data || [])
    } catch (error: any) {
      toast.error('Failed to fetch pathways', {
        description: error.response?.data?.message || 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePathway = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Missing fields', {
        description: 'Name and description are required'
      })
      return
    }

    try {
      await api.post('/institute/pathways', {
        ...formData,
        levels: levels.slice(0, formData.totalLevels)
      })
      
      toast.success('Pathway created!', {
        description: 'Your pathway is now available to learners'
      })
      
      setCreateModalOpen(false)
      resetForm()
      fetchPathways()
    } catch (error: any) {
      toast.error('Creation failed', {
        description: error.response?.data?.message || 'Please try again'
      })
    }
  }

  const handleDeletePathway = async (pathwayId: string) => {
    if (!confirm('Are you sure you want to delete this pathway?')) return

    try {
      await api.delete(`/institute/pathways/${pathwayId}`)
      toast.success('Pathway deleted')
      fetchPathways()
    } catch (error: any) {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'Please try again'
      })
    }
  }

  const handleToggleActive = async (pathwayId: string, isActive: boolean) => {
    try {
      await api.patch(`/institute/pathways/${pathwayId}`, { isActive: !isActive })
      toast.success(isActive ? 'Pathway deactivated' : 'Pathway activated')
      fetchPathways()
    } catch (error: any) {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'Please try again'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Technology',
      totalLevels: 5,
    })
    setLevels([
      { level: 1, requiredCredits: 10, title: 'Level 1', description: '' },
      { level: 2, requiredCredits: 25, title: 'Level 2', description: '' },
      { level: 3, requiredCredits: 45, title: 'Level 3', description: '' },
      { level: 4, requiredCredits: 70, title: 'Level 4', description: '' },
      { level: 5, requiredCredits: 100, title: 'Level 5', description: '' },
    ])
  }

  const updateLevel = (index: number, field: keyof Level, value: string | number) => {
    const newLevels = [...levels]
    newLevels[index] = { ...newLevels[index], [field]: value }
    setLevels(newLevels)
  }

  const addLevel = () => {
    const newLevel = levels.length + 1
    setLevels([...levels, {
      level: newLevel,
      requiredCredits: levels[levels.length - 1].requiredCredits + 20,
      title: `Level ${newLevel}`,
      description: ''
    }])
    setFormData({ ...formData, totalLevels: newLevel })
  }

  const removeLevel = (index: number) => {
    if (levels.length <= 1) {
      toast.error('Must have at least 1 level')
      return
    }
    const newLevels = levels.filter((_, i) => i !== index)
    setLevels(newLevels)
    setFormData({ ...formData, totalLevels: newLevels.length })
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Pathways
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Create and manage learning pathways for your learners
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Pathway
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
          </div>
        ) : pathways.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">No pathways created yet</p>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Pathway
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pathways.map((pathway: any) => (
              <Card key={pathway._id} className="shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{pathway.name}</CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {pathway.description}
                      </p>
                    </div>
                    <Badge className={pathway.isActive ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}>
                      {pathway.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Category:</span>
                      <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                        {pathway.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Total Levels:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{pathway.totalLevels}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Enrolled:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{pathway.enrolledCount || 0}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(pathway._id, pathway.isActive)}
                        className="flex-1"
                      >
                        {pathway.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePathway(pathway._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Pathway Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Pathway</DialogTitle>
              <DialogDescription>
                Define a learning pathway with multiple levels for your learners
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label>Pathway Name *</Label>
                  <Input
                    placeholder="e.g., Web Development Pathway"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe the pathway and what learners will achieve..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="h-12 w-full rounded-xl border-2 border-slate-300 dark:border-white bg-slate-50 dark:bg-slate-900 px-3 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 outline-none"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Business">Business</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Arts">Arts</option>
                      <option value="Science">Science</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Levels */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Levels ({levels.length})</Label>
                  <Button size="sm" onClick={addLevel} variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Level
                  </Button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {levels.map((level, index) => (
                    <Card key={index} className="border-2 border-slate-200 dark:border-slate-800">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                            Level {level.level}
                          </Badge>
                          {levels.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLevel(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Required Credits</Label>
                            <Input
                              type="number"
                              value={level.requiredCredits}
                              onChange={(e) => updateLevel(index, 'requiredCredits', parseInt(e.target.value) || 0)}
                              className="h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={level.title}
                              onChange={(e) => updateLevel(index, 'title', e.target.value)}
                              placeholder="e.g., Beginner"
                              className="h-10"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={level.description}
                            onChange={(e) => updateLevel(index, 'description', e.target.value)}
                            placeholder="Describe what learners achieve at this level..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateModalOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreatePathway}>
                <Plus className="w-4 h-4 mr-2" />
                Create Pathway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
