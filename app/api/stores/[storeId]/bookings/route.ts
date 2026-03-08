import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

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
          slotTime: 'asc'
        }
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
      slot_time: booking.slot.slotTime
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

    const { service_id, slot_id } = await req.json()
    if (!service_id || !slot_id) {
      return NextResponse.json({ error: "กรุณาเลือกบริการและเวลา" }, { status: 400 })
    }

    // Check slot availability
    const slot = await db.timeSlot.findFirst({
      where: {
        id: parseInt(slot_id),
        storeId: parseInt(storeId)
      }
    })
    
    if (!slot) return NextResponse.json({ error: "ไม่พบช่วงเวลา" }, { status: 404 })
    if (!slot.isAvailable) return NextResponse.json({ error: "ช่วงเวลานี้ถูกจองแล้ว" }, { status: 409 })

    // Create booking and mark slot as unavailable atomically
    const booking = await db.booking.create({
      data: {
        storeId: parseInt(storeId),
        userId: session.id,
        serviceId: parseInt(service_id),
        slotId: parseInt(slot_id)
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    })
    
    await db.timeSlot.update({
      where: {
        id: parseInt(slot_id)
      },
      data: {
        isAvailable: false
      }
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('[v0] Booking creation error:', error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการจอง" }, { status: 500 })
  }
}
