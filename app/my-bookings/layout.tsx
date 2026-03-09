import { FloatingNav } from "@/components/floating-nav"
import { AppHeader } from "@/components/app-header"
import { getSession } from "@/lib/auth"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { CalendarDays } from "lucide-react"

export default async function MyBookingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const isManagement = session?.role === 'ADMIN' || session?.role === 'OWNER'

  if (isManagement) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="font-bold text-primary flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                <span>QueueNow (การจอง)</span>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-8 md:px-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
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
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10">
        {children}
      </main>
    </div>
  )
}
