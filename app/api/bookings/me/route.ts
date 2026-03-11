import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

function formatTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })

  try {
    // Auto-update past bookings for this user
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nowTime = formatTime(new Date())

    const pastBookings = await db.booking.findMany({
      where: {
        userId: session.id,
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

    const bookings = await db.booking.findMany({
      where: {
        userId: session.id
      },
      include: {
        store: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true,
            price: true
          }
        },
        review: true
      } as any,
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    const formattedBookings = bookings.map((booking: any) => ({
      id: booking.id,
      status: booking.status,
      created_at: booking.createdAt,
      store_name: booking.store.name,
      service_name: booking.service.name,
      price: Number(booking.service.price),
      booking_date: booking.bookingDate,
      start_time: booking.startTime,
      end_time: booking.endTime,
      has_review: !!booking.review
    }))
    
    return NextResponse.json({ bookings: formattedBookings })
  } catch (error) {
    console.error("Get my bookings error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}
