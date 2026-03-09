'use client'

import React from 'react'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-xl transition-opacity hover:opacity-80">
          <CalendarDays className="h-6 w-6" />
          <span>QueueNow</span>
        </Link>
      </div>
    </header>
  )
}
