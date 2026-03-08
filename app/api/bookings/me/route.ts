import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })

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
      slot: {
        select: {
          slotTime: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  const formattedBookings = bookings.map(booking => ({
    id: booking.id,
    status: booking.status,
    created_at: booking.createdAt,
    store_name: booking.store.name,
    service_name: booking.service.name,
    price: Number(booking.service.price),
    slot_time: booking.slot.slotTime
  }))
  
  return NextResponse.json({ bookings: formattedBookings })
}
