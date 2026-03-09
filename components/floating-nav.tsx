'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, CalendarDays, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function FloatingNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Floating menu is only for customers and non-logged in users (guests)
  if (user && (user.role === 'OWNER' || user.role === 'ADMIN')) {
    return null
  }

  const navItems = [
    {
      name: 'หน้าแรก',
      href: '/',
      icon: Home,
    },
    {
      name: 'ร้านค้า',
      href: '/stores',
      icon: Store,
    },
    ...(user?.role === 'CUSTOMER' ? [{
      name: 'การจอง',
      href: '/my-bookings',
      icon: CalendarDays,
    }] : []),
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-1 p-1.5 rounded-full bg-background/80 backdrop-blur-xl border border-border shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-inherit")} />
              <span className={cn(
                "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                isActive ? "w-auto opacity-100" : "w-0 opacity-0 md:w-auto md:opacity-100"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}

        <div className="w-px h-6 bg-border mx-1 hidden md:block" />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 rounded-full hover:bg-accent transition-colors group">
                <Avatar className="h-8 w-8 border border-border group-hover:border-primary/50 transition-colors">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-xs font-medium text-muted-foreground group-hover:text-foreground">
                  {user.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56 mb-4 bg-card border-border text-card-foreground">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {user.role === 'OWNER' && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>แดชบอร์ดร้านค้า</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              {user.role === 'ADMIN' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>แอดมินแดชบอร์ด</span>
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-1">
            <Link href="/login">
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                เข้าสู่ระบบ
              </button>
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all">
                ลงทะเบียน
              </button>
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}
