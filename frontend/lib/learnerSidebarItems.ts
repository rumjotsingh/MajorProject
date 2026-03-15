import { Home, FileText, Compass, User, Building2 } from 'lucide-react'

export const getLearnerSidebarItems = (hasJoinedInstitute: boolean) => {
  const baseItems = [
    { icon: Home, label: 'Dashboard', path: '/learner/dashboard' },
    { icon: FileText, label: 'Credentials', path: '/learner/credentials' },
    { icon: Compass, label: 'Pathways', path: '/learner/pathways' },
  ]

  // Only show "Join Institute" if learner hasn't joined yet
  if (!hasJoinedInstitute) {
    baseItems.push({ icon: Building2, label: 'Join Institute', path: '/learner/join-institute' })
  }

  baseItems.push({ icon: User, label: 'Profile', path: '/learner/profile' })

  return baseItems
}
