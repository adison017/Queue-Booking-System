import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string, bookingId: string }> }
) {
  const { storeId, bookingId } = await params
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
  }

  try {
    const { status } = await req.json()

    // Verify ownership or if it's the user's own booking
    const booking = await db.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { store: true }
    })

    if (!booking) {
      return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 })
    }

    const isOwner = booking.store.ownerId === session.id
    const isCustomer = booking.userId === session.id

    if (!isOwner && !isCustomer) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 })
    }

    // Update booking
    const updatedBooking = await db.booking.update({
      where: { id: parseInt(bookingId) },
      data: { status }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 })
  }
}
