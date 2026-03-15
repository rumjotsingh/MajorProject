'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import NotificationBell from './notification-bell'
import { Button } from './ui/button'
import { useAppDispatch } from '@/lib/hooks'
import { logout } from '@/lib/slices/authSlice'
import { toast } from 'sonner'

interface DashboardLayoutProps {
  children: ReactNode
  sidebarItems: Array<{
    icon: any
    label: string
    path: string
  }>
}

export function DashboardLayout({ children, sidebarItems }: DashboardLayoutProps) {
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully', {
      description: 'See you next time!'
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Floating Top Bar */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-7xl">
        <div className="px-6 py-3 rounded-full backdrop-blur-2xl bg-white/70 dark:bg-black/70 shadow-2xl shadow-slate-900/5 dark:shadow-slate-900/50">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-xs">CM</span>
              </div>
              <span className="text-base font-semibold text-black dark:text-white">
                CredMatrix
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden sm:flex h-9 w-9">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-24 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 fixed left-0 top-24 bottom-0 bg-white dark:bg-black">
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path || pathname?.startsWith(item.path + '/')
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-900 text-black dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
