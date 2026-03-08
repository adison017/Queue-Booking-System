import { notFound } from "next/navigation"
import { Store, Clock, Banknote, CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { BookingSection } from "./booking-section"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

async function getStore(storeId: string) {
  const store = await db.store.findUnique({
    where: {
      id: parseInt(storeId)
    },
    include: {
      owner: {
        select: {
          name: true
        }
      }
    }
  })
  
  if (!store) return null
  
  return {
    id: store.id,
    name: store.name,
    description: store.description,
    owner_name: store.owner.name
  }
}

async function getServices(storeId: string) {
  const services = await db.service.findMany({
    where: {
      storeId: parseInt(storeId)
    },
    orderBy: {
      id: 'asc'
    }
  })
  
  return services.map(service => ({
    id: service.id,
    name: service.name,
    duration_minutes: service.durationMinutes,
    price: Number(service.price)
  }))
}

async function getSlots(storeId: string) {
  const slots = await db.timeSlot.findMany({
    where: {
      storeId: parseInt(storeId),
      slotTime: {
        gt: new Date()
      },
      isAvailable: true
    },
    orderBy: {
      slotTime: 'asc'
    }
  })
  
  return slots.map(slot => ({
    id: slot.id,
    slot_time: slot.slotTime,
    is_available: slot.isAvailable
  }))
}

export default async function StoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const [store, services, slots, session] = await Promise.all([
    getStore(storeId),
    getServices(storeId),
    getSlots(storeId),
    getSession(),
  ])

  if (!store) notFound()

  const availableSlots = slots.filter((s: { is_available: boolean }) => s.is_available)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10">
        {/* Store header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Store className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{store.name}</h1>
            <p className="text-muted-foreground mt-1">{store.description || "ไม่มีคำอธิบาย"}</p>
            <p className="text-sm text-muted-foreground mt-1">เจ้าของร้าน: {store.owner_name}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Services */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-primary" />
                  บริการทั้งหมด
                </CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="text-muted-foreground text-sm">ยังไม่มีบริการ</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {services.map((sv: { id: number; name: string; duration_minutes: number; price: number }) => (
                      <li key={sv.id} className="flex items-start justify-between gap-2 pb-3 border-b border-border last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-sm">{sv.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{sv.duration_minutes} นาที</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          ฿{Number(sv.price).toLocaleString()}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Slot summary */}
            <Card className="mt-4">
              <CardContent className="p-4 flex items-center gap-3">
                <CalendarClock className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <p className="font-semibold">{availableSlots.length} ช่วงเวลาว่าง</p>
                  <p className="text-xs text-muted-foreground">จาก {slots.length} ช่วงเวลาทั้งหมด</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking section */}
          <div className="lg:col-span-2">
            <BookingSection
              storeId={store.id}
              services={services}
              slots={slots}
              isLoggedIn={!!session}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
