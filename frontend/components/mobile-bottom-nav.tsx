'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, FileText, Compass } from 'lucide-react'
import { useAppSelector } from '@/lib/hooks'

export function MobileBottomNav() {
  const pathname = usePathname()
  const user = useAppSelector(state => state.auth.user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) return null
  
  if (!user) return null

  const getNavItems = () => {
    switch (user.role) {
      case 'learner':
        return [
          { icon: Home, label: 'Home', path: '/learner/dashboard' },
          { icon: FileText, label: 'Credentials', path: '/learner/credentials' },
          { icon: Compass, label: 'Pathways', path: '/learner/pathways' },
          { icon: User, label: 'Profile', path: '/learner/profile' },
        ]
      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: User, label: 'Users', path: '/admin/users' },
          { icon: FileText, label: 'Credentials', path: '/admin/credentials' },
          { icon: Compass, label: 'Pathways', path: '/admin/pathways' },
        ]
      case 'institute':
        return [
          { icon: Home, label: 'Dashboard', path: '/institute/dashboard' },
          { icon: FileText, label: 'Credentials', path: '/institute/credentials' },
          { icon: User, label: 'Learners', path: '/institute/learners' },
          { icon: User, label: 'Settings', path: '/institute/settings' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="rounded-full backdrop-blur-2xl bg-white/70 dark:bg-black/70 shadow-2xl shadow-slate-900/10 dark:shadow-slate-900/50 px-4 py-3">
        <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/')
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center gap-1 px-3 py-2 transition-colors"
            >
              <Icon className={`w-6 h-6 ${
                isActive 
                  ? 'text-black dark:text-white' 
                  : 'text-slate-400 dark:text-slate-600'
              }`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs font-medium ${
                isActive 
                  ? 'text-black dark:text-white' 
                  : 'text-slate-400 dark:text-slate-600'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
        </div>
      </div>
    </nav>
  )
}
