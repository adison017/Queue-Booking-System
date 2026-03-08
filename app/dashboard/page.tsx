import Link from "next/link"
import { ArrowRight, Bookmark, CalendarClock, BarChart3, Plus, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { CreateStoreDialog } from "./create-store-dialog"

async function getOwnerStores(ownerId: number) {
  const stores = await db.store.findMany({
    where: {
      ownerId
    },
    include: {
      _count: {
        select: {
          services: true,
          timeSlots: true,
          bookings: {
            where: {
              status: 'PENDING'
            }
          }
        }
      }
    },
    orderBy: {
      id: 'desc'
    }
  })
  
  return stores.map(store => ({
    id: store.id,
    name: store.name,
    description: store.description,
    service_count: store._count.services,
    slot_count: store._count.timeSlots,
    booking_count: store._count.bookings,
    pending_count: store._count.bookings
  }))
}

export default async function DashboardPage() {
  const session = await getSession()
  const stores = await getOwnerStores(session!.id)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
          <p className="text-muted-foreground mt-1">สวัสดี, {session!.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/analytics">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              การวิเคราะห์
            </Button>
          </Link>
          <CreateStoreDialog />
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-2xl">
          <Store className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold">ยังไม่มีร้านค้า</h2>
          <p className="text-muted-foreground mt-1 mb-6">สร้างร้านค้าแรกของคุณเพื่อเริ่มรับการจอง</p>
          <CreateStoreDialog />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  {store.pending_count > 0 && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                      {store.pending_count} รอยืนยัน
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">{store.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {store.description || "ไม่มีคำอธิบาย"}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "บริการ", value: store.service_count, icon: Bookmark },
                    { label: "ช่วงเวลา", value: store.slot_count, icon: CalendarClock },
                    { label: "การจอง", value: store.booking_count, icon: Plus },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-muted/50 p-2.5 text-center">
                      <p className="text-xl font-bold text-primary">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <Link href={`/dashboard/stores/${store.id}`}>
                  <Button className="w-full gap-2" variant="outline">
                    จัดการร้าน
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
