import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

function formatTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const session = await getSession()
    const { storeId } = await params
    if (!session) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })

    const store = await db.store.findUnique({
      where: {
        id: parseInt(storeId)
      },
      select: {
        ownerId: true
      }
    })
    
    if (!store || store.ownerId !== session.id) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
    }

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
    
    const formattedBookings = bookings.map(booking => ({
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
    
    return NextResponse.json({ bookings: formattedBookings })
  } catch (error) {
    console.error('[v0] Get bookings error:', error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const session = await getSession()
    const { storeId } = await params
    if (!session) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })

    const { service_id, booking_date, start_time, end_time } = await req.json()
    if (!service_id || !booking_date || !start_time || !end_time) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    // Get service details to validate duration
    const service = await db.service.findUnique({
      where: { id: parseInt(service_id) },
      select: { durationMinutes: true, durationDays: true }
    })

    if (!service) {
      return NextResponse.json({ error: "ไม่พบบริการ" }, { status: 404 })
    }

    // Validate time duration matches service duration
    const [startHour, startMin] = start_time.split(':').map(Number)
    const [endHour, endMin] = end_time.split(':').map(Number)
    
    const startTotalMinutes = startHour * 60 + startMin
    const endTotalMinutes = endHour * 60 + endMin
    
    const serviceDurationMinutes = service.durationDays * 24 * 60 + service.durationMinutes
    const bookingDurationMinutes = endTotalMinutes - startTotalMinutes

    if (bookingDurationMinutes < serviceDurationMinutes) {
      return NextResponse.json({ 
        error: `ระยะเวลาที่เลือกสั้นเกินไปสำหรับบริการนี้ (ขั้นต่ำ ${service.durationDays > 0 ? service.durationDays + ' วัน ' : ''}${service.durationMinutes} นาที)` 
      }, { status: 400 })
    }

    // Check if slot is already booked
    const existingBooking = await db.booking.findFirst({
      where: {
        storeId: parseInt(storeId),
        bookingDate: new Date(booking_date),
        startTime: start_time,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    })

    if (existingBooking) {
      return NextResponse.json({ error: "ช่วงเวลานี้ถูกจองไปแล้ว" }, { status: 409 })
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        storeId: parseInt(storeId),
        userId: session.id,
        serviceId: parseInt(service_id),
        bookingDate: new Date(booking_date),
        startTime: start_time,
        endTime: end_time,
        status: 'PENDING'
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('[v0] Booking creation error:', error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการจอง" }, { status: 500 })
  }
}
