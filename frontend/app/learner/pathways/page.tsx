'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, FileText, Compass, User, Target, CheckCircle, Globe, Building2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { getPathways, enrollPathway, getLearnerProfile } from '@/lib/slices/learnerSlice'
import { getLearnerSidebarItems } from '@/lib/learnerSidebarItems'
import { toast } from 'sonner'

export default function PathwaysPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { pathways, profile, loading } = useAppSelector((state) => state.learner)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    dispatch(getPathways())
    dispatch(getLearnerProfile())
  }, [dispatch])

  const hasJoinedInstitute = !!profile?.user?.instituteId
  const sidebarItems = getLearnerSidebarItems(hasJoinedInstitute)

  const handleEnroll = async (pathwayId: string) => {
    setEnrolling(pathwayId)
    try {
      await dispatch(enrollPathway(pathwayId))
      dispatch(getPathways())
      toast.success('Enrolled successfully!', {
        description: 'You can now upload credentials for this pathway'
      })
    } catch (error) {
      toast.error('Enrollment failed', {
        description: 'Failed to enroll in pathway'
      })
    } finally {
      setEnrolling(null)
    }
  }

  if (loading && pathways.length === 0) {
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
            Learning Pathways
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Enroll in NSQ-aligned career pathways
          </p>
        </div>

        {pathways.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Compass className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No pathways available
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Join an institute to access pathways
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pathways.map((pathway: any) => (
              <Card key={pathway._id} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Target className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{pathway.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {pathway.category}
                          </Badge>
                          {pathway.isGlobal ? (
                            <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              Global
                            </Badge>
                          ) : (
                            <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              Institute
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {pathway.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      {pathway.levels?.length || 0} levels
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {pathway.enrolledCount || 0} enrolled
                    </span>
                  </div>
                  {pathway.isEnrolled ? (
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl"
                      onClick={() => router.push('/learner/my-pathway')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      View Progress
                    </Button>
                  ) : (
                    <Button 
                      className="w-full rounded-xl"
                      onClick={() => handleEnroll(pathway._id)}
                      disabled={enrolling === pathway._id}
                    >
                      {enrolling === pathway._id ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
