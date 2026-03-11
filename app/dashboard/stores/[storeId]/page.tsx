import { notFound, redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { ServicesTab } from "./services-tab"
import { ScheduleTab } from "./schedule-tab"
import { BookingsTab } from "./bookings-tab"
import { BookingSchedule } from "./booking-schedule"
import { SettingsTab } from "./settings-tab"
import { ReviewsTab } from "./reviews-tab"
import { 
  Store, 
  ArrowLeft, 
  CalendarCheck, 
  Clock, 
  ConciergeBell, 
  Star, 
  Settings as SettingsIcon 
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getStore(storeId: string, ownerId: number) {
  const store = await db.store.findFirst({
    where: {
      id: parseInt(storeId),
      ownerId
    },
    include: {
      images: {
        orderBy: {
          id: 'asc'
        }
      }
    } as any
  })
  return store
}
async function getServices(storeId: string) {
  const services = await db.service.findMany({
    where: {
      storeId: parseInt(storeId)
    },
    include: {
      category: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  })
  
  return services.map(service => ({
    id: service.id,
    name: service.name,
    duration_days: service.durationDays,
    duration_minutes: service.durationMinutes,
    price: Number(service.price),
    categoryId: service.categoryId,
    category_name: service.category?.name || "ทั่วไป"
  }))
}

async function getCategories() {
  return await db.category.findMany({
    orderBy: {
      id: 'asc'
    }
  })
}

async function getSchedules(storeId: string) {
  const schedules = await db.storeSchedule.findMany({
    where: {
      storeId: parseInt(storeId),
    },
    include: {
      slots: {
        orderBy: {
          startTime: 'asc'
        }
      }
    },
    orderBy: {
      dayOfWeek: 'asc'
    }
  })
  
  return schedules.map(schedule => ({
    id: schedule.id,
    day_of_week: schedule.dayOfWeek,
    is_closed: schedule.isClosed,
    slots: schedule.slots.map(s => ({
      id: s.id,
      start_time: s.startTime,
      end_time: s.endTime
    }))
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
      }
    },
    orderBy: {
      bookingDate: 'desc'
    }
  })
  
  const statusPriority: Record<string, number> = {
    'PENDING': 1,
    'CONFIRMED': 2,
    'CANCELLED': 3,
    'COMPLETED': 4
  }

  const sortedBookings = bookings.sort((a, b) => {
    const priorityA = statusPriority[a.status] || 99
    const priorityB = statusPriority[b.status] || 99
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    return b.bookingDate.getTime() - a.bookingDate.getTime()
  })
  
  return sortedBookings.map(booking => ({
    id: booking.id,
    status: booking.status,
    created_at: booking.createdAt,
    customer_name: booking.user.name,
    customer_email: booking.user.email,
    service_name: booking.service.name,
    price: Number(booking.service.price),
    booking_date: booking.bookingDate,
    start_time: booking.startTime,
    end_time: booking.endTime
  }))
}

export default async function StoreManagePage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const session = await getSession()
  if (!session || session.role !== "OWNER") redirect("/login")

  const [store, services, schedules, bookings, categories] = await Promise.all([
    getStore(storeId, session.id),
    getServices(storeId),
    getSchedules(storeId),
    getBookings(storeId),
    getCategories()
  ])

  if (!store) notFound()

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2 text-muted-foreground" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            กลับแดชบอร์ด
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 overflow-hidden">
            {(store as any).profileImageUrl ? (
              <img src={(store as any).profileImageUrl} alt={store.name} className="h-full w-full object-cover" />
            ) : (
              <Store className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{store.name}</h1>
            <p className="text-muted-foreground text-sm">{store.description || "ไม่มีคำอธิบาย"}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="bookings" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap gap-1 border border-border/50 rounded-xl">
          <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 gap-2 rounded-lg transition-all duration-300">
            <CalendarCheck className="h-4 w-4" />
            <span>การจอง</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 gap-2 rounded-lg transition-all duration-300">
            <Clock className="h-4 w-4" />
            <span>ตารางเวลา</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 gap-2 rounded-lg transition-all duration-300">
            <ConciergeBell className="h-4 w-4" />
            <span>บริการ</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 gap-2 rounded-lg transition-all duration-300">
            <Star className="h-4 w-4" />
            <span>รีวิว</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 gap-2 rounded-lg transition-all duration-300">
            <SettingsIcon className="h-4 w-4" />
            <span>ตั้งค่า</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings">
          <BookingsTab storeId={parseInt(storeId)} bookings={bookings} />
        </TabsContent>
        
        <TabsContent value="schedule">
          <BookingSchedule storeId={parseInt(storeId)} />
        </TabsContent>
        
        <TabsContent value="services">
          <ServicesTab storeId={parseInt(storeId)} services={services} categories={categories} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab storeId={parseInt(storeId)} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab store={{
            id: store.id,
            name: store.name,
            description: store.description,
            location: (store as any).location as string | null,
            profileImageUrl: (store as any).profileImageUrl as string | null,
            coverImageUrl: (store as any).coverImageUrl as string | null,
            images: (store as any).images || []
          }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
