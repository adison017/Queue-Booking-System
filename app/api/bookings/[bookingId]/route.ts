import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const session = await getSession()
  const { bookingId } = await params
  if (!session) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })

  const { status } = await req.json()
  const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 })
  }

  const booking = await db.booking.findUnique({
    where: {
      id: parseInt(bookingId)
    },
    include: {
      store: {
        select: {
          ownerId: true
        }
      }
    }
  })
  
  if (!booking) return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 })

  const isOwner = booking.store.ownerId === session.id
  const isCustomer = booking.userId === session.id

  if (!isOwner && !isCustomer) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
  }

  // Only owner can confirm/complete; customer can only cancel
  if (isCustomer && !isOwner && status !== "CANCELLED") {
    return NextResponse.json({ error: "ลูกค้าสามารถยกเลิกเท่านั้น" }, { status: 403 })
  }

  const updated = await db.booking.update({
    where: {
      id: parseInt(bookingId)
    },
    data: {
      status
    },
    select: {
      id: true,
      status: true
    }
  })

  // Re-open slot if cancelled
  if (status === "CANCELLED") {
    await db.timeSlot.update({
      where: {
        id: booking.slotId
      },
      data: {
        isAvailable: true
      }
    })
  }

  return NextResponse.json({ booking: updated })
}
