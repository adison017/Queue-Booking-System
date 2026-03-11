'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-border" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "relative flex items-center w-16 h-8 rounded-full p-1 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-primary/20",
        isDark 
          ? "bg-[#1A1A1A] border border-white/5 shadow-inner" 
          : "bg-slate-100 border border-slate-200 shadow-inner"
      )}
      aria-label="Toggle theme"
    >
      {/* Slider Thumb */}
      <div
        className={cn(
          "absolute left-1 top-1 w-6 h-6 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform shadow-sm",
          isDark 
            ? "translate-x-8 bg-[#2A2A2A] border border-white/5" 
            : "translate-x-0 bg-white border border-slate-100"
        )}
      />
      
      {/* Icons Container */}
      <div className="relative z-10 w-full flex justify-between items-center px-[5px]">
        <Sun 
          className={cn(
            "h-3.5 w-3.5 transition-all duration-500",
            !isDark ? "text-amber-500 scale-100 opacity-100" : "text-muted-foreground/40 scale-75 opacity-50"
          )} 
        />
        <Moon 
          className={cn(
            "h-3.5 w-3.5 transition-all duration-500",
            isDark ? "text-amber-500 scale-100 opacity-100" : "text-muted-foreground/40 scale-75 opacity-50"
          )} 
        />
      </div>
    </button>
  )
}
