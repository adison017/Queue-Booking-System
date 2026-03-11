import Link from "next/link"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { CalendarDays, Clock, Store, Wallet, Users, Activity, BarChart3 } from "lucide-react"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateStoreDialog } from "./create-store-dialog"
import { DashboardAnalytics } from "@/components/dashboard-analytics"

async function getOwnerDashboardData(ownerId: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 1. Get Stores
  const stores = await db.store.findMany({
    where: { ownerId },
    include: {
      _count: {
        select: {
          services: true,
          bookings: true
        }
      }
    },
    orderBy: { id: 'desc' }
  })
  
  const storeIds = stores.map(s => s.id)

  // 2. Aggregate KPIs
  const [pendingBookingsCount, todayBookingsCount] = await Promise.all([
    db.booking.count({
      where: {
        storeId: { in: storeIds },
        status: 'PENDING'
      }
    }),
    db.booking.count({
      where: {
        storeId: { in: storeIds },
        bookingDate: {
          gte: today,
          lt: tomorrow,
        }
      }
    })
  ])

  // Estimated Revenue (Sum of COMPLETED bookings' service prices across all owned stores)
  const completedBookings = await db.booking.findMany({
    where: { 
      storeId: { in: storeIds },
      status: 'COMPLETED' 
    },
    include: { service: { select: { price: true } } }
  })
  
  const estimatedRevenue = completedBookings.reduce((sum, b) => sum + Number(b.service.price), 0)

  // 3. Recent Bookings (Across all owned stores)
  const recentBookings = await db.booking.findMany({
    where: { storeId: { in: storeIds } },
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      store: { select: { name: true } },
      service: { select: { name: true, price: true } }
    }
  })

  return {
    stores,
    metrics: {
      totalStores: stores.length,
      pendingBookingsCount,
      todayBookingsCount,
      estimatedRevenue
    },
    recentBookings
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null
  
  const { stores, metrics, recentBookings } = await getOwnerDashboardData(session.id)

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">แดชบอร์ดร้านค้า</h1>
          <p className="text-muted-foreground mt-1">
            สวัสดี, <span className="text-primary font-medium">{session!.name}</span> ยินดีต้อนรับกลับมา
          </p>
        </div>
        <div className="flex gap-2">
          <CreateStoreDialog />
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-primary/20 rounded-2xl bg-primary/5">
          <div className="h-16 w-16 text-primary/30 mb-4 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-2xl">
            ?
          </div>
          <h2 className="text-xl font-semibold text-foreground">ยังไม่มีร้านค้า</h2>
          <p className="text-muted-foreground mt-1 mb-6">สร้างร้านค้าแรกของคุณเพื่อเริ่มรับการจอง</p>
        </div>
      ) : (
        <>
          {/* Owner KPIs */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 border-primary/10 shadow-lg bg-gradient-to-br from-background to-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">ยอดจองรอยืนยัน</CardTitle>
                <Clock className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-amber-500">{metrics.pendingBookingsCount}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  คิวที่รอการตอบรับจากคุณ
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ยอดจองวันนี้</CardTitle>
                <CalendarDays className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.todayBookingsCount}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  ลูกค้าที่มีคิวเข้ามาใช้บริการวันนี้
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ประมาณการรายได้</CardTitle>
                <Wallet className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">฿{metrics.estimatedRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  จากคิวที่เสร็จสิ้นแล้วทั้งหมด
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ร้านค้าของคุณ</CardTitle>
                <Store className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.totalStores}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  ร้นค้าทั้งหมดที่อยู่ในความดูแล
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Split Layout: Stores List (Left 2 cols) vs Recent Bookings (Right 1 col) */}
            
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  รายชื่อร้านค้า
                </h2>
              </div>
              
              <div className="grid gap-5 sm:grid-cols-2">
                {stores.map((store) => {
                  const pending_count = store._count?.bookings || 0 // Currently mocking pending per store for simplicity, could refine query later
                  return (
                  <Card key={store.id} className="flex flex-col border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                          {store.profileImageUrl ? (
                            <img src={store.profileImageUrl} alt={store.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-primary font-bold">S</span>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-3 text-foreground">{store.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-2 text-center border border-border/30">
                          <p className="text-lg font-bold text-primary">{store._count?.services || 0}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">บริการ</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2 text-center border border-border/30">
                          <p className="text-lg font-bold text-primary">{store._count?.bookings || 0}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">การจองรวม</p>
                        </div>
                      </div>
                      <Link href={`/dashboard/stores/${store.id}`}>
                        <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-sm">
                          จัดการร้าน
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                )})}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                ความเคลื่อนไหวล่าสุด
              </h2>
              <Card className="shadow-md h-[fit-content]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">รายการจองล่าสุดจากทุกร้าน</CardTitle>
                  <CardDescription>ลูกค้าที่เพิ่งทำรายการเข้ามา</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      ยังไม่มีรายการจอง
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentBookings.map(booking => (
                        <div key={booking.id} className="flex flex-col gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-sm text-foreground">{booking.service.name}</p>
                              <p className="text-xs font-medium text-primary mt-0.5">{booking.store.name}</p>
                            </div>
                            <Badge variant={booking.status === 'COMPLETED' ? 'default' : booking.status === 'CONFIRMED' ? 'secondary' : booking.status === 'PENDING' ? 'destructive' : 'outline'} className="text-[10px]">
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium">
                              <Users className="h-3 w-3" /> {booking.user.name}
                            </span>
                            <span>{format(new Date(booking.bookingDate), "d MMM yyyy", { locale: th })} {booking.startTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>

          <div className="pt-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              การวิเคราะห์ข้อมูล (Analytics)
            </h2>
            <DashboardAnalytics />
          </div>
        </>
      )}
    </div>
  )
}
