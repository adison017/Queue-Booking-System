import Link from "next/link"
import {
  CalendarCheck,
  Clock,
  Shield,
  Store,
  Users,
  LayoutDashboard,
  CalendarDays,
  ChevronRight,
  TrendingUp,
  Settings,
  ArrowRight
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FloatingNav } from "@/components/floating-nav"
import { AppHeader } from "@/components/app-header"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function HomePage() {
  const session = await getSession()
  const storeCount = await db.store.count()

  // Guest View
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <FloatingNav />
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 px-4 py-28 border-b border-primary/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
              <Store className="h-4 w-4" />
              {storeCount} ร้านค้าในระบบ
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-balance md:text-6xl text-foreground">
              จองคิวง่าย ๆ<br />
              <span className="text-primary">ที่ QueueNow</span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground text-balance md:text-xl">
              ระบบจองคิวออนไลน์ที่รองรับหลายร้าน ไม่ต้องรอคิวหน้าร้าน<br />
              เลือกเวลาที่สะดวก จองได้ทุกที่ทุกเวลา
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/stores">
                <Button size="lg" className="gap-2 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_24px_rgba(245,197,24,0.3)] hover:shadow-[0_4px_32px_rgba(245,197,24,0.5)] transition-all">
                  <Store className="h-5 w-5" />
                  ดูร้านค้าทั้งหมด
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="gap-2 text-base font-semibold border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all">
                  สมัครสมาชิกฟรี
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="px-4 py-20 bg-background">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-3 text-center text-3xl font-bold text-balance text-foreground">ทำไมต้องใช้ <span className="text-primary">QueueNow</span>?</h2>
            <p className="mb-12 text-center text-muted-foreground text-balance">ระบบจองคิวที่ออกแบบมาเพื่อทั้งลูกค้าและเจ้าของร้าน</p>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: CalendarCheck, title: "จองง่าย รวดเร็ว", desc: "เลือกร้าน เลือกบริการ เลือกเวลา จบใน 3 ขั้นตอน ไม่ต้องรอคิวหน้าร้าน" },
                { icon: Clock, title: "จัดการเวลาได้", desc: "ดูตารางนัดหมายของตัวเอง ยกเลิกหรือแก้ไขได้ทุกเวลาผ่านระบบออนไลน์" },
                { icon: Shield, title: "ปลอดภัย น่าเชื่อถือ", desc: "ข้อมูลของคุณได้รับการปกป้องด้วยระบบเข้ารหัสมาตรฐานสากล" },
              ].map((f) => (
                <Card key={f.title} className="border-border/50 bg-card hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <footer className="border-t border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 <span className="text-primary font-medium">QueueNow</span> — ระบบจองคิวออนไลน์
        </footer>
      </div>
    )
  }

  // Admin View
  if (session.role === "ADMIN") {
    const userCount = await db.user.count()
    const bookingCount = await db.booking.count()

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
                <span>QueueNow Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 px-4 py-10 md:px-8 bg-background">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">สวัสดี, <span className="text-primary">{session.name}</span> 👋</h1>
                <p className="text-muted-foreground">ยินดีต้อนรับสู่แผงควบคุมหลักสำหรับผู้ดูแลระบบ</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3 mb-10">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ผู้ใช้งานทั้งหมด</p>
                      <p className="text-2xl font-bold text-foreground">{userCount} คน</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Store className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ร้านค้าในระบบ</p>
                      <p className="text-2xl font-bold text-foreground">{storeCount} ร้าน</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-violet-500/5 to-violet-500/10 border-violet-500/20">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-violet-500/15 flex items-center justify-center">
                      <CalendarDays className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">การจองทั้งหมด</p>
                      <p className="text-2xl font-bold text-foreground">{bookingCount} รายการ</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="hover:border-primary/40 transition-colors cursor-pointer group border-border/50">
                  <Link href="/admin/stores">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center text-xl text-foreground">
                        จัดการร้านค้า
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </CardTitle>
                      <CardDescription>อนุมัติร้านค้าใหม่, ตรวจสอบสถานะ และจัดการข้อมูลร้านค้าทั้งหมดในระบบ</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
                <Card className="hover:border-primary/40 transition-colors cursor-pointer group border-border/50">
                  <Link href="/admin/users">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center text-xl text-foreground">
                        จัดการผู้ใช้งาน
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </CardTitle>
                      <CardDescription>ตรวจสอบรายชื่อผู้ใช้งาน, เปลี่ยนบทบาท และจัดการสิทธิ์การเข้าถึงข้อมูล</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Owner View
  if (session.role === "OWNER") {
    const ownerStores = await db.store.findMany({
      where: { ownerId: session.id },
      include: { _count: { select: { bookings: true, services: true } } }
    })

    const totalBookings = ownerStores.reduce((acc, store) => acc + store._count.bookings, 0)

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
                <span>ร้านค้าของฉัน</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 px-4 py-10 md:px-8 bg-background">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">แผงควบคุมร้านค้า 👋</h1>
                  <p className="text-muted-foreground">สวัสดีคุณ <span className="text-primary font-medium">{session.name}</span>, ตรวจสอบภาพรวมของร้านค้าคุณได้ที่นี่</p>
                </div>
                <Link href="/dashboard">
                  <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_16px_rgba(245,197,24,0.2)]">
                    <LayoutDashboard className="h-4 w-4" />
                    เข้าสู่แดชบอร์ดหลัก
                  </Button>
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-3 mb-10">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-primary mb-1">ร้านค้าของคุณ</p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold text-foreground">{ownerStores.length}</p>
                      <Store className="h-8 w-8 text-primary/30" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-emerald-400 mb-1">การจองทั้งหมด</p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold text-foreground">{totalBookings}</p>
                      <TrendingUp className="h-8 w-8 text-emerald-500/30" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-violet-500/5 to-violet-500/10 border-violet-500/20">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-violet-400 mb-1">บริการในร้าน</p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold text-foreground">{ownerStores.reduce((acc, s) => acc + s._count.services, 0)}</p>
                      <Settings className="h-8 w-8 text-violet-500/30" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-foreground">ร้านค้าที่คุณจัดการ</h2>
              <div className="grid gap-4">
                {ownerStores.map(store => (
                  <Card key={store.id} className="overflow-hidden group hover:border-primary/30 hover:shadow-[0_0_24px_rgba(245,197,24,0.08)] transition-all border-border/50">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="bg-primary/20 w-2 flex-shrink-0" />
                      <div className="flex-1 p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors text-foreground">{store.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{store.description || "ยังไม่มีรายละเอียด"}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-muted-foreground">การจองวันนี้</p>
                              <p className="text-sm font-bold text-primary">{store._count.bookings}</p>
                            </div>
                            <Link href={`/dashboard/stores/${store.id}`}>
                              <Button variant="outline" size="sm" className="gap-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50">
                                จัดการร้าน
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Customer View
  const myBookingsCount = await db.booking.count({ where: { userId: session.id } })
  const nextBooking = await db.booking.findFirst({
    where: {
      userId: session.id,
      bookingDate: { gte: new Date() },
      status: "CONFIRMED"
    },
    include: { store: true, service: true },
    orderBy: { bookingDate: 'asc' }
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <FloatingNav />
      <main className="flex-1">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-background via-background to-primary/5 border-b border-primary/10">
          <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-4xl font-bold mb-4 text-foreground">ยินดีต้อนรับคุณ <span className="text-primary">{session.name}</span> 👋</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  ค้นหาร้านค้าที่ถูกใจ และเริ่มจองคิวออนไลน์ได้ทันที ไม่ต้องรอคิวหน้าร้านให้เสียเวลา
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/stores">
                    <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_24px_rgba(245,197,24,0.3)]">
                      <Store className="h-5 w-5" />
                      ค้นหาร้านค้า
                    </Button>
                  </Link>
                  <Link href="/my-bookings">
                    <Button size="lg" variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                      <CalendarDays className="h-5 w-5" />
                      การจองของฉัน
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats/Next Booking Card */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur opacity-40" />
                <Card className="relative border-primary/20 bg-card">
                  <CardContent className="p-6">
                    {nextBooking ? (
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">นัดหมายถัดไปของคุณ</p>
                        <h3 className="text-xl font-bold mb-1 text-foreground">{nextBooking.service.name}</h3>
                        <p className="text-muted-foreground flex items-center gap-1 mb-4">
                          <Store className="h-3 w-3" /> {nextBooking.store.name}
                        </p>
                        <div className="flex items-center gap-4 py-3 border-y border-border/50 mb-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{format(nextBooking.bookingDate, 'd MMM yyyy', { locale: th })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{nextBooking.startTime} น.</span>
                          </div>
                        </div>
                        <Link href="/my-bookings">
                          <Button variant="link" className="px-0 h-auto text-primary font-bold group">
                            ดูรายละเอียดการจอง <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CalendarCheck className="h-10 w-10 text-primary/20 mx-auto mb-3" />
                        <h3 className="font-bold text-foreground">ยังไม่มีนัดหมายใหม่</h3>
                        <p className="text-sm text-muted-foreground mb-4">เริ่มจองคิวแรกของคุณวันนี้เลย!</p>
                        <Link href="/stores">
                          <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">ไปที่หน้าร้านค้า</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links / Explore Section */}
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">เมนูแนะนำสำหรับคุณ</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/stores">
              <Card className="hover:border-primary/40 transition-all cursor-pointer group h-full border-border/50">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:shadow-[0_0_16px_rgba(245,197,24,0.3)] transition-all">
                    <Store className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg text-foreground">ค้นหาร้านค้า</CardTitle>
                  <CardDescription>เลือกร้านทำเลดี บริการเด่น และดูตารางคิวที่ว่างอยู่ได้ทันที</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/my-bookings">
              <Card className="hover:border-primary/40 transition-all cursor-pointer group h-full border-border/50">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:shadow-[0_0_16px_rgba(245,197,24,0.3)] transition-all">
                    <CalendarDays className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg text-foreground">การจองของฉัน</CardTitle>
                  <CardDescription>ตรวจสอบประวัติการจอง, เลื่อนนัด หรือเช็กสถานะคิวปัจจุบันของคุณ</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Card className="bg-primary/5 border-dashed border-2 border-primary/20 h-full">
              <CardContent className="flex items-center justify-center h-full p-6 text-center">
                <p className="text-sm text-primary/60 italic">
                  รวม {myBookingsCount} การนัดหมายที่คุณเคยจัดทำผ่านระบบ QueueNow
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
        © 2024 <span className="text-primary font-medium">QueueNow</span> — ระบบจองคิวออนไลน์
      </footer>
    </div>
  )
}
