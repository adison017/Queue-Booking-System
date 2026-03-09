import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') // Format: YYYY-MM-DD
  
  if (!date) {
    return NextResponse.json({ error: "กรุณาระบุวันที่" }, { status: 400 })
  }

  // Get store schedule for the day (Timezone-safe)
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay()
  
  const storeSchedule = await db.storeSchedule.findFirst({
    where: {
      storeId: parseInt(storeId),
      dayOfWeek
    },
    include: {
      slots: {
        orderBy: { startTime: 'asc' }
      }
    }
  })

  if (!storeSchedule || storeSchedule.isClosed) {
    return NextResponse.json({ availableSlots: [], storeSchedule: { isClosed: true } })
  }

  // Get all bookings for the date
  // Using start and end of day to be safe with timezones
  const searchDate = new Date(year, month - 1, day)
  const nextDate = new Date(year, month - 1, day + 1)

  const bookings = await db.booking.findMany({
    where: {
      storeId: parseInt(storeId),
      bookingDate: {
        gte: searchDate,
        lt: nextDate
      },
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    include: {
      service: true
    }
  })

  // Generate available slots
  const availableSlots: Array<{
    time: string
    available: boolean
    bookingId?: number
    customerName?: string
    serviceName?: string
  }> = []

  for (const scheduleSlot of storeSchedule.slots) {
    const timeRange = `${scheduleSlot.startTime} - ${scheduleSlot.endTime}`
    
    // Check if this specific period is booked
    // We should check for ANY overlap with bookings on this date
    // A booking overlaps if: bookingStart < slotEnd AND bookingEnd > slotStart
    
    const [slotStartHour, slotStartMin] = scheduleSlot.startTime.split(':').map(Number)
    const [slotEndHour, slotEndMin] = scheduleSlot.endTime.split(':').map(Number)
    const slotStartTotal = slotStartHour * 60 + slotStartMin
    const slotEndTotal = slotEndHour * 60 + slotEndMin

    const booking = bookings.find(b => {
      const [bStartHour, bStartMin] = b.startTime.split(':').map(Number)
      const [bEndHour, bEndMin] = b.endTime.split(':').map(Number)
      
      const bStartTotal = bStartHour * 60 + bStartMin
      const bEndTotal = bEndHour * 60 + bEndMin
      
      return bStartTotal < slotEndTotal && bEndTotal > slotStartTotal
    })

    // Avoid adding duplicate times if slots overlap
    if (!availableSlots.find(s => s.time === timeRange)) {
      availableSlots.push({
        time: timeRange,
        available: !booking,
        bookingId: booking?.id,
        customerName: booking ? `ลูกค้า #${booking.id}` : undefined,
        serviceName: booking?.service?.name
      })
    }
  }

  return NextResponse.json({ 
    availableSlots,
    storeSchedule: {
      isClosed: storeSchedule.isClosed,
      slots: storeSchedule.slots
    }
  })
}
