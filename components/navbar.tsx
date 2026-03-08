"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { CalendarDays, LayoutDashboard, LogOut, Menu, Store, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

export function Navbar() {
  const router = useRouter()
  const { user, logout, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("ออกจากระบบแล้ว")
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error("ไม่สามารถออกจากระบบได้")
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <CalendarDays className="h-6 w-6" />
          <span>QueueNow</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/stores">
            <Button variant="ghost" size="sm" className="gap-2">
              <Store className="h-4 w-4" />
              ร้านค้าทั้งหมด
            </Button>
          </Link>
          {user ? (
            <>
              {user.role === "OWNER" && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    แดชบอร์ด
                  </Button>
                </Link>
              )}
              <Link href="/my-bookings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  การจองของฉัน
                </Button>
              </Link>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium leading-tight">{user.name}</span>
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    {user.role === "OWNER" ? "เจ้าของร้าน" : "ลูกค้า"}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">เข้าสู่ระบบ</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">สมัครสมาชิก</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden flex flex-col gap-2">
          <Link href="/stores" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Store className="h-4 w-4" />ร้านค้าทั้งหมด
            </Button>
          </Link>
          {user ? (
            <>
              {user.role === "OWNER" && (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <LayoutDashboard className="h-4 w-4" />แดชบอร์ด
                  </Button>
                </Link>
              )}
              <Link href="/my-bookings" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <CalendarDays className="h-4 w-4" />การจองของฉัน
                </Button>
              </Link>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span className="ml-1">ออกจากระบบ</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">เข้าสู่ระบบ</Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">สมัครสมาชิก</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
