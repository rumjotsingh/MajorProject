'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getMyPathway, getLearnerProfile } from '@/lib/slices/learnerSlice';
import { getLearnerSidebarItems } from '@/lib/learnerSidebarItems';
import type { RootState } from '@/lib/store';
import type { LearnerState } from '@/lib/slices/learnerSlice';
import { DashboardLayout } from '@/components/dashboard-layout';
import EmptyState from '@/components/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Award, TrendingUp, User, Plus, BookOpen, CheckCircle, Lock, Building2 } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function MyPathway() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const myPathway = useAppSelector((state: RootState) => (state.learner as LearnerState).myPathway);
  const profile = useAppSelector((state: RootState) => (state.learner as LearnerState).profile);
  const loading = useAppSelector((state: RootState) => (state.learner as LearnerState).loading);

  const hasJoinedInstitute = !!profile?.user?.instituteId;
  const sidebarItems = getLearnerSidebarItems(hasJoinedInstitute);

  useEffect(() => {
    dispatch(getMyPathway());
    dispatch(getLearnerProfile());
  }, [dispatch]);

  if (loading && !myPathway) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!myPathway) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <EmptyState
          icon={BookOpen}
          title="No pathway enrolled"
          description="Enroll in a pathway to start tracking your progress"
          action={
            <Button onClick={() => router.push(ROUTES.LEARNER_PATHWAYS)}>
              Browse Pathways
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  const { pathway, currentLevel, verifiedCredits } = myPathway;

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{pathway.name}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{pathway.description}</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Current Level</p>
              <p className="text-3xl font-bold text-blue-600">{currentLevel}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Verified Credits</p>
              <p className="text-3xl font-bold text-green-600">{verifiedCredits}</p>
            </div>
          </div>

          <div className="space-y-4">
            {pathway.levels?.map((level: any) => (
              <div
                key={level.level}
                className={`p-4 rounded-lg border-2 transition-all ${
                  level.isCompleted
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                    : level.isCurrent
                    ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        level.isCompleted
                          ? 'bg-green-500'
                          : level.isCurrent
                          ? 'bg-blue-500'
                          : 'bg-slate-300'
                      }`}
                    >
                      {level.isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : level.isCurrent ? (
                        <span className="text-white font-bold">{level.level}</span>
                      ) : (
                        <Lock className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Level {level.level}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {level.requiredCredits} credits required
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {level.progress}% Complete
                    </p>
                    {level.isCurrent && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        In Progress
                      </p>
                    )}
                  </div>
                </div>

                {level.isCurrent && (
                  <div className="mt-3">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${level.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-center">
          <Button onClick={() => router.push(ROUTES.LEARNER_CREDENTIALS)}>
            View My Credentials
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
