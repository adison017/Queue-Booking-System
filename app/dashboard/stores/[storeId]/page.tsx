import { notFound, redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { ServicesTab } from "./services-tab"
import { SlotsTab } from "./slots-tab"
import { BookingsTab } from "./bookings-tab"
import { Store, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getStore(storeId: string, ownerId: number) {
  const store = await db.store.findFirst({
    where: {
      id: parseInt(storeId),
      ownerId
    }
  })
  return store
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
      }
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

async function getBookings(storeId: string) {
  const bookings = await db.booking.findMany({
    where: {
      storeId: parseInt(storeId)
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      service: {
        select: {
          name: true,
          price: true
        }
      },
      slot: {
        select: {
          slotTime: true
        }
      }
    },
    orderBy: {
      slot: {
        slotTime: 'desc'
      }
    }
  })
  
  return bookings.map(booking => ({
    id: booking.id,
    status: booking.status,
    created_at: booking.createdAt,
    customer_name: booking.user.name,
    customer_email: booking.user.email,
    service_name: booking.service.name,
    price: Number(booking.service.price),
    slot_time: booking.slot.slotTime
  }))
}

export default async function StoreManagePage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const session = await getSession()
  if (!session || session.role !== "OWNER") redirect("/login")

  const [store, services, slots, bookings] = await Promise.all([
    getStore(storeId, session.id),
    getServices(storeId),
    getSlots(storeId),
    getBookings(storeId),
  ])

  if (!store) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            กลับแดชบอร์ด
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{store.name}</h1>
            <p className="text-muted-foreground text-sm">{store.description || "ไม่มีคำอธิบาย"}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="mb-6">
          <TabsTrigger value="bookings">การจอง ({bookings.length})</TabsTrigger>
          <TabsTrigger value="services">บริการ ({services.length})</TabsTrigger>
          <TabsTrigger value="slots">ช่วงเวลา ({slots.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          <BookingsTab storeId={Number(storeId)} bookings={bookings} />
        </TabsContent>
        <TabsContent value="services">
          <ServicesTab storeId={Number(storeId)} services={services} />
        </TabsContent>
        <TabsContent value="slots">
          <SlotsTab storeId={Number(storeId)} slots={slots} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
