import { redirect } from "next/navigation"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { CalendarDays, Store } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { CancelBookingButton } from "./cancel-booking-button"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

async function getMyBookings(userId: number) {
  const bookings = await db.booking.findMany({
    where: {
      userId
    },
    include: {
      store: {
        select: {
          id: true,
          name: true
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
  
  return bookings.map(booking => ({
    id: booking.id,
    status: booking.status,
    created_at: booking.createdAt.toISOString(),
    store_id: booking.store.id,
    store_name: booking.store.name,
    service_name: booking.service.name,
    price: Number(booking.service.price),
    booking_date: booking.bookingDate,
    start_time: booking.startTime,
    end_time: booking.endTime
  }))
}

export default async function MyBookingsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const bookings = await getMyBookings(session.id)

  return (
    <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">การจองของฉัน</h1>
          <p className="text-muted-foreground">ดูและจัดการการจองคิวทั้งหมดของคุณ</p>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CalendarDays className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">ยังไม่มีการจอง</h2>
            <p className="text-muted-foreground mt-1 mb-6">ไปเลือกร้านและจองคิวได้เลย</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b: {
              id: number
              status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
              created_at: string
              store_id: number
              store_name: string
              service_name: string
              price: number
              booking_date: string
              start_time: string
              end_time: string
            }) => (
              <Card key={b.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{b.store_name}</p>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{b.service_name} · ฿{Number(b.price).toLocaleString()}</p>
                        <p className="text-sm font-medium mt-1 text-primary">
                          {format(new Date(b.booking_date), "EEEE d MMM yyyy", { locale: th })} · {b.start_time} - {b.end_time} น.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          จองเมื่อ {format(new Date(b.created_at), "d MMM yyyy", { locale: th })}
                        </p>
                      </div>
                    </div>
                    {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                      <CancelBookingButton bookingId={b.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </>
  )
}
