import { notFound, redirect } from "next/navigation"
import { Store, ArrowLeft, Calendar as CalendarIcon, MapPin, User, Star, Clock, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ServicesTab } from "./services-tab"
import { ScheduleTab } from "./schedule-tab"
import { BookingsTab } from "./bookings-tab"
import { BookingCalendarPage } from "./booking-calendar"
import { CustomerBookings } from "./customer-bookings"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
    owner_name: store.owner.name,
    ownerId: store.ownerId
  }
}

async function getServices(storeId: string) {
  const services = await db.service.findMany({
    where: {
      storeId: parseInt(storeId)
    },
    include: {
      category: true
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
    category_name: service.category?.name
  }))
}

async function getSchedules(storeId: string) {
  const schedules = await db.storeSchedule.findMany({
    where: {
      storeId: parseInt(storeId),
      isClosed: false
    },
    include: {
      slots: {
        orderBy: {
          startTime: 'asc'
        }
      }
    }
  })
  
  return schedules.map(schedule => ({
    id: schedule.id,
    day_of_week: schedule.dayOfWeek,
    is_closed: schedule.isClosed,
    slots: schedule.slots.map(slot => ({
      id: slot.id,
      start_time: slot.startTime,
      end_time: slot.endTime
    }))
  }))
}

async function getBookings(storeId: string) {
  const bookings = await db.booking.findMany({
    where: {
      storeId: parseInt(storeId)
    },
    include: {
      user: true,
      service: true
    },
    orderBy: {
      createdAt: 'desc'
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
    booking_date: booking.bookingDate,
    start_time: booking.startTime,
    end_time: booking.endTime
  }))
}

async function getCategories() {
  const categories = await db.category.findMany()
  
  return categories.map(category => ({
    id: category.id,
    name: category.name
  }))
}

export default async function StorePage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const session = await getSession()
  
  if (!session) redirect("/login")

  const store = await getStore(storeId)
  if (!store) notFound()

  const [services, slots, bookings, categories] = await Promise.all([
    getServices(storeId),
    getSchedules(storeId),
    getBookings(storeId),
    getCategories()
  ])

  const isOwner = session.id === store.ownerId

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary-rgb),0.1),transparent)] pointer-events-none" />
        <div className="absolute top-4 md:top-6 left-4 md:left-6 z-50">
          <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-md border-white/10 hover:bg-background/80 transition-all rounded-full shadow-lg" asChild>
            <Link href="/stores">
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </Link>
          </Button>
        </div>
        
        <div className="container mx-auto h-full flex flex-col justify-end p-6 pb-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
             <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-background/80 backdrop-blur-xl border-2 border-white/20 shadow-2xl flex items-center justify-center p-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
               <Store className="h-full w-full text-primary" />
             </div>
             <div className="space-y-2 mb-2">
               <Badge className="bg-primary/20 text-primary border-none mb-1">ยินดีต้อนรับ</Badge>
               <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground drop-shadow-sm">
                 {store.name}
               </h1>
               <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                 <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-primary" /> {store.owner_name}</span>
                 <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 4.9 (24 รีวิว)</span>
                 <span className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full"><Clock className="h-3.5 w-3.5" /> เปิดให้บริการ</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-8 relative z-20">
        {isOwner ? (
          <Tabs defaultValue="bookings" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-background/80 backdrop-blur-xl p-1 border-2 border-white/10 shadow-2xl rounded-2xl h-auto">
                <TabsTrigger value="bookings" className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  การจอง
                </TabsTrigger>
                <TabsTrigger value="services" className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  บริการ
                </TabsTrigger>
                <TabsTrigger value="schedule" className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  เวลาทำการ
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="bookings" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
              <BookingsTab storeId={parseInt(storeId)} bookings={bookings} />
            </TabsContent>
            
            <TabsContent value="services" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
              <ServicesTab storeId={parseInt(storeId)} services={services} />
            </TabsContent>
            
            <TabsContent value="schedule" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
              <ScheduleTab storeId={parseInt(storeId)} schedules={slots} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar info */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-2 border-white/10 bg-background/50 backdrop-blur-xl shadow-xl overflow-hidden group">
                <div className="h-2 bg-primary w-full" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <Info className="h-5 w-5" />
                    เกี่ยวกับร้าน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {store.description || "สัมผัสประสบการณ์การบริการระดับพรีเมียมได้ที่นี่ เราพร้อมมอบสิ่งที่ดีที่สุดให้กับคุณเสมอ"}
                  </p>
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-bold">ที่ตั้งร้าน</p>
                        <p className="text-sm text-muted-foreground mt-0.5">กรุงเทพมหานคร, ประเทศไทย (ข้อมูลจำลอง)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Main Content */}
            <div className="lg:col-span-8">
              <Tabs defaultValue="booking" className="space-y-8">
                <TabsList className="bg-background/80 backdrop-blur-xl p-1 border-2 border-white/10 shadow-2xl rounded-2xl h-auto w-full grid grid-cols-3">
                  <TabsTrigger value="booking" className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                    จองคิว
                  </TabsTrigger>
                  <TabsTrigger value="queue" className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                    ตารางคิว
                  </TabsTrigger>
                  <TabsTrigger value="services" className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                    บริการ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="booking" className="animate-in fade-in slide-in-from-right-5 duration-500">
                  <BookingCalendarPage 
                    storeId={parseInt(storeId)} 
                    storeName={store.name} 
                    services={services} 
                  />
                </TabsContent>

                <TabsContent value="queue" className="animate-in fade-in slide-in-from-right-5 duration-500">
                  <CustomerBookings storeId={parseInt(storeId)} />
                </TabsContent>

                <TabsContent value="services" className="animate-in fade-in slide-in-from-right-5 duration-500">
                  <div className="grid gap-6 md:grid-cols-2">
                    {services.map((service) => (
                      <Card key={service.id} className="group border-2 border-white/5 hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 bg-background/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                          <Badge variant="secondary" className="w-fit mb-2">{service.category_name || "ทั่วไป"}</Badge>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">{service.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                              <Clock className="h-4 w-4" />
                              {service.duration_days > 0 ? `${service.duration_days} วัน ` : ""}
                              {service.duration_minutes} นาที
                            </div>
                            <p className="text-2xl font-black text-primary">฿{service.price.toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
