import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params
    const searchParams = req.nextUrl.searchParams
    const monthStr = searchParams.get('month') // e.g., "2026-03"
    
    let startDate: Date
    let endDate: Date
    
    if (monthStr) {
      const [year, month] = monthStr.split('-').map(Number)
      const baseDate = new Date(year, month - 1, 1)
      startDate = startOfMonth(baseDate)
      endDate = endOfMonth(baseDate)
    } else {
      const now = new Date()
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
    }

    const bookings = await db.booking.findMany({
      where: {
        storeId: parseInt(storeId),
        bookingDate: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'COMPLETED']
        }
      },
      select: {
        bookingDate: true
      }
    })

    // Count bookings per day
    const dayCounts: Record<string, number> = {}
    bookings.forEach(booking => {
      const dateKey = booking.bookingDate.toISOString().split('T')[0]
      dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1
    })

    return NextResponse.json({ dayCounts })
  } catch (error) {
    console.error('[PUBLIC_BOOKINGS_API]', error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
