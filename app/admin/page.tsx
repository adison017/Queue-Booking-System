import { CalendarDays, Store, Users, FileCheck2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"

async function getAdminStats() {
  const [userCount, storeCount, serviceCount, bookingCount] = await Promise.all([
    db.user.count(),
    db.store.count(),
    db.service.count(),
    db.booking.count(),
  ])

  return {
    userCount,
    storeCount,
    serviceCount,
    bookingCount,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">แอดมินแดชบอร์ด</h1>
        <p className="text-muted-foreground mt-1">ภาพรวมของระบบทั้งหมด</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Users Stat */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ผู้ใช้งานทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              บัญชีทั้งหมดในระบบ
            </p>
          </CardContent>
        </Card>

        {/* Stores Stat */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ร้านค้าทั้งหมด</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ร้านค้าที่ให้บริการในระบบ
            </p>
          </CardContent>
        </Card>

        {/* Services Stat */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">บริการทั้งหมด</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.serviceCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              บริการทั้งหมดจากทุกร้าน
            </p>
          </CardContent>
        </Card>

        {/* Bookings Stat */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">การจองทั้งหมด</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              คิวทั้งหมดที่ถูกจองผ่านระบบ
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
