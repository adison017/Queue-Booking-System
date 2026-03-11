import { notFound, redirect } from "next/navigation"
import { Store, ArrowLeft, Calendar as CalendarIcon, MapPin, User, Star, Clock, Info, Camera, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ServicesTab } from "./services-tab"
import { ScheduleTab } from "./schedule-tab"
import { BookingsTab } from "./bookings-tab"
import { BookingCalendarPage } from "./booking-calendar"
import { CustomerBookings } from "./customer-bookings"
import { ImageGallery } from "./image-gallery"
import { StoreReviews } from "./store-reviews"
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
      },
      images: {
        orderBy: {
          id: 'asc'
        }
      },
      reviews: {
        select: {
          rating: true
        }
      }
    } as any
  })
  
  if (!store) return null
  
  return {
    id: store.id,
    name: store.name,
    description: store.description,
    location: (store as any).location as string | null,
    profileImageUrl: (store as any).profileImageUrl as string | null,
    coverImageUrl: (store as any).coverImageUrl as string | null,
    owner_name: (store as any).owner?.name || "ไม่ทราบชื่อ",
    ownerId: store.ownerId,
    images: (store as any).images || [],
    avgRating: (store as any).reviews?.length 
      ? (store as any).reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / (store as any).reviews.length 
      : 0,
    reviewCount: (store as any).reviews?.length || 0
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

function formatTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
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

  // Auto-update past bookings to COMPLETED
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nowTime = formatTime(new Date())

  const pastBookings = await db.booking.findMany({
    where: {
      storeId: parseInt(storeId),
      status: 'CONFIRMED',
      OR: [
        {
          bookingDate: { lt: today }
        },
        {
          bookingDate: today,
          endTime: { lt: nowTime }
        }
      ]
    }
  })

  if (pastBookings.length > 0) {
    await db.booking.updateMany({
      where: {
        id: { in: pastBookings.map(b => b.id) }
      },
      data: {
        status: 'COMPLETED'
      }
    })
  }
  
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
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-muted">
        {store.coverImageUrl ? (
          <img src={store.coverImageUrl} alt={store.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
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
             <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-background/80 backdrop-blur-xl border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-500">
               {store.profileImageUrl ? (
                 <img src={store.profileImageUrl} alt={store.name} className="h-full w-full object-cover" />
               ) : (
                 <Store className="h-12 w-12 text-primary" />
               )}
             </div>
             <div className="space-y-2 mb-2">
               <Badge className="bg-primary/20 text-primary border-none mb-1">ยินดีต้อนรับ</Badge>
               <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground drop-shadow-sm">
                 {store.name}
               </h1>
               <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                 <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-primary" /> {store.owner_name}</span>
                 <span className="flex items-center gap-1.5">
                   <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 
                   {store.avgRating > 0 ? store.avgRating.toFixed(1) : "ไม่มีรีวิว"} 
                   {store.reviewCount > 0 && `(${store.reviewCount} รีวิว)`}
                 </span>
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
          <div className="flex flex-col xl:flex-row gap-8 lg:items-start relative">
            {/* Left Column - Main Content */}
            <div className="w-full xl:w-[40%] shrink-0 flex flex-col gap-10">
              
              {/* Store Intro */}
              <div className="space-y-6">
                <Card className="border-2 border-white/10 bg-background/50 backdrop-blur-xl shadow-xl overflow-hidden group">
                  <div className="h-2 bg-primary w-full" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                      <Info className="h-5 w-5" />
                      เกี่ยวกับร้าน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {store.description || "สัมผัสประสบการณ์การบริการระดับพรีเมียมได้ที่นี่ เราพร้อมมอบสิ่งที่ดีที่สุดให้กับคุณเสมอ"}
                    </p>
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold">ที่ตั้งร้าน</p>
                          {store.location && (store.location.includes("http://") || store.location.includes("https://")) ? (
                            <a 
                              href={store.location} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5 group/link break-all"
                            >
                              ดูบน Google Maps
                              <ExternalLink className="h-3 w-3 shrink-0 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-0.5">{store.location || "ไม่ได้ระบุที่ตั้ง"}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Image Gallery */}
              {store.images && store.images.length > 0 && (
                <div className="space-y-4" id="gallery">
                  <ImageGallery images={(store as any).images} />
                </div>
              )}

              {/* Services Section */}
              <div className="space-y-4" id="services">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1.5 bg-primary rounded-full" />
                  <h2 className="text-2xl font-black tracking-tight">บริการของเรา</h2>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map((service) => (
                    <Card key={service.id} className="group border-2 border-white/5 hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 bg-background/50 backdrop-blur-sm">
                      <CardHeader className="pb-2">
                        <Badge variant="secondary" className="w-fit mb-2 bg-primary/10 text-primary border-none">{service.category_name || "ทั่วไป"}</Badge>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="flex items-end justify-between mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              {service.duration_days > 0 ? `${service.duration_days} วัน ` : ""}
                              {service.duration_minutes} นาที
                            </div>
                            <p className="text-xl font-black text-primary">฿{service.price.toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {services.length === 0 && (
                       <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl bg-background/30">
                          ไม่มีบริการแสดงในขณะนี้
                       </div>
                    )}
                  </div>
                </div>

                {/* Queue Display Section */}
                <div className="space-y-4 pt-6 mt-2 border-t border-border/50" id="queue">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-1.5 bg-primary rounded-full" />
                    <h2 className="text-2xl font-black tracking-tight">ตารางคิวสด</h2>
                  </div>
                  <div className="bg-background/40 backdrop-blur-md rounded-3xl p-1 shadow-sm border border-border/50">
                     <CustomerBookings storeId={parseInt(storeId)} />
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="space-y-4 pt-6 mt-2 border-t border-border/50" id="reviews">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-1.5 bg-primary rounded-full" />
                    <h2 className="text-2xl font-black tracking-tight">รีวิวจากลูกค้า</h2>
                  </div>
                  <div className="bg-background/40 backdrop-blur-md rounded-3xl p-1 shadow-sm border border-border/50">
                    <StoreReviews storeId={parseInt(storeId)} />
                  </div>
                </div>

              </div>

              {/* Right Column - Sticky Booking Widget */}
              <div className="w-full xl:w-[60%] lg:sticky xl:top-24 mt-8 lg:mt-0 z-30 transition-all duration-500 ease-in-out">
                 <div className="bg-background/80 backdrop-blur-2xl border-[3px] border-primary/40 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(var(--primary-rgb),0.5)] overflow-hidden relative group transform-gpu transition-all hover:-translate-y-1">
                    <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-primary via-primary/80 to-primary animate-pulse" />
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 blur" />
                    
                    <div className="relative p-6 pt-8 pb-5 border-b-2 border-primary/10 bg-gradient-to-b from-primary/10 to-transparent">
                       <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-primary drop-shadow-sm">
                          <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-lg">
                             <CalendarIcon className="h-6 w-6" />
                          </div>
                          จองคิวออนไลน์
                       </h3>
                       <p className="text-sm font-medium text-foreground/80 mt-2 ml-[3.25rem]">เลือกบริการและเวลาที่คุณสะดวก</p>
                    </div>
                    
                    <div className="p-4 bg-background/50 relative">
                       <BookingCalendarPage 
                          storeId={parseInt(storeId)} 
                          storeName={store.name} 
                          services={services} 
                       />
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
