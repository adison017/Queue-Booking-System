import { format } from "date-fns"
import { th } from "date-fns/locale"
import { CalendarDays, Store, Users, FileCheck2, Wallet, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"

async function getAdminDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Basic Counts
  const [userCount, storeCount, bookingCount, todayBookings] = await Promise.all([
    db.user.count(),
    db.store.count(),
    db.booking.count(),
    db.booking.count({
      where: {
        bookingDate: {
          gte: today,
          lt: tomorrow,
        }
      }
    })
  ])

  // Estimated Revenue (Sum of COMPLETED bookings' service prices)
  const completedBookings = await db.booking.findMany({
    where: { status: 'COMPLETED' },
    include: { service: { select: { price: true } } }
  })
  
  const estimatedRevenue = completedBookings.reduce((sum, b) => sum + Number(b.service.price), 0)

  // Recent Stores (Last 5)
  const recentStores = await db.store.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { owner: { select: { name: true } } }
  })

  // Recent Bookings (Last 5)
  const recentBookings = await db.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      store: { select: { name: true } },
      service: { select: { name: true, price: true } }
    }
  })

  return {
    userCount,
    storeCount,
    bookingCount,
    todayBookings,
    estimatedRevenue,
    recentStores,
    recentBookings
  }
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData()

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight">แอดมินแดชบอร์ด</h1>
        <p className="text-muted-foreground mt-2">ภาพรวมสถิติ ข้อมูลการใช้งาน และรายได้ของระบบ QueueNow</p>
      </div>

      {/* High-Level KPIs */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-primary/10 shadow-lg bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ประมาณการรายได้รวบ</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">฿{data.estimatedRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              จากคำขอจองที่เสร็จสิ้นแล้วทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">การจองวันนี้</CardTitle>
            <CalendarDays className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.todayBookings}</div>
            <p className="text-xs text-muted-foreground mt-2">
              คิวทั้งหมดในระบบสำหรับวันนี้
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ผู้ใช้งานทั้งหมด</CardTitle>
            <Users className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.userCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              บัญชีทั้งหมดที่ลงทะเบียน
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ร้านค้าและบริการ</CardTitle>
            <Store className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.storeCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              ร้านค้าที่เปิดให้บริการบนระบบ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Stores */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5 text-primary" />
              ร้านค้าที่เข้าร่วมล่าสุด
            </CardTitle>
            <CardDescription>5 ร้านค้าใหม่ล่าสุดที่เปิดให้บริการ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentStores.map(store => (
                <div key={store.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{store.name}</p>
                      <p className="text-xs text-muted-foreground">โดย {store.owner.name}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {format(new Date(store.createdAt), "d MMM", { locale: th })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
              รายการจองล่าสุด
            </CardTitle>
            <CardDescription>ความเคลื่อนไหวการจองแบบ Real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentBookings.map(booking => (
                <div key={booking.id} className="flex flex-col gap-2 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm text-primary">{booking.store.name}</p>
                      <p className="text-xs font-medium">{booking.service.name}</p>
                    </div>
                    <Badge variant={booking.status === 'COMPLETED' ? 'default' : booking.status === 'CONFIRMED' ? 'secondary' : 'outline'} className="text-[10px] w-fit">
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {booking.user.name}
                    </span>
                    <span className="font-mono text-primary/80 font-bold">฿{Number(booking.service.price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
