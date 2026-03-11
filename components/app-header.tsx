'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserNav } from '@/components/user-nav'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-primary text-xl transition-all hover:opacity-80 group">
          <Image
            src="/favicon.ico?v=2"
            alt="Logo"
            width={24}
            height={24}
            className="h-6 w-6 transition-transform group-hover:scale-110"
            priority
          />
          <span className="tracking-tighter">QueueNow</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
