import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params
  const session = await getSession()

  if (!session) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    // Find completed bookings for this user at this store that don't have a review yet
    const bookings = await (db as any).booking.findMany({
      where: {
        userId: session.id,
        storeId: parseInt(storeId),
        status: 'COMPLETED',
        review: null
      },
      select: {
        id: true,
        bookingDate: true,
        service: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(bookings.map((b: any) => ({
      id: b.id,
      booking_date: b.bookingDate,
      service_name: (b as any).service.name
    })))
  } catch (error) {
    console.error("Eligibility check error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" }, { status: 500 })
  }
}
