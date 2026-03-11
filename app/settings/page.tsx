import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { FloatingNav } from "@/components/floating-nav"
import { ProfileSettings } from "@/components/profile-settings"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const isManagement = session.role === 'ADMIN' || session.role === 'OWNER'

  if (isManagement) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="font-bold text-primary flex items-center gap-2">
                <Image
                  src="/favicon.ico?v=2"
                  alt="Logo"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                  priority
                />
                <span>{session.role === 'ADMIN' ? 'แผงควบคุมแอดมิน' : 'แผงควบคุมร้านค้า'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 p-6 md:p-10 bg-background">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">ตั้งค่า<span className="text-primary">บัญชีผู้ใช้</span></h1>
                <p className="text-muted-foreground mt-2 text-lg">จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชีคุณ</p>
              </div>
              <ProfileSettings />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <FloatingNav />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">ตั้งค่า<span className="text-primary">บัญชีผู้ใช้</span></h1>
          <p className="text-muted-foreground mt-2 text-lg">จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชีคุณ</p>
        </div>
        <ProfileSettings />
      </main>
      <footer className="border-t border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
        © 2024 <span className="text-primary font-medium">QueueNow</span> — ระบบจองคิวออนไลน์
      </footer>
    </div>
  )
}
