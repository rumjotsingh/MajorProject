import { Home, Users, FileText, Compass, Shield, Building2, UserCheck, Briefcase } from 'lucide-react'

export const adminSidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: UserCheck, label: 'Learners', path: '/admin/learners' },
  { icon: Building2, label: 'Institutes', path: '/admin/institutes' },
  { icon: Briefcase, label: 'Employers', path: '/admin/employers' },
  { icon: FileText, label: 'Credentials', path: '/admin/credentials' },
  { icon: Compass, label: 'Pathways', path: '/admin/pathways' },
  { icon: Shield, label: 'Security', path: '/admin/security' },
]
