'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className={`w-5 h-5 text-slate-700 dark:text-slate-400 transition-all ${
        theme === 'light' ? 'opacity-100' : 'opacity-0 absolute'
      }`} />
      <Moon className={`w-5 h-5 text-slate-700 dark:text-slate-400 transition-all ${
        theme === 'dark' ? 'opacity-100' : 'opacity-0 absolute'
      }`} />
    </button>
  )
}
