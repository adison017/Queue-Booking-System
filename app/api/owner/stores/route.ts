import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
  }

  const stores = await db.store.findMany({
    where: {
      ownerId: session.id
    },
    include: {
      _count: {
        select: {
          services: true,
          timeSlots: true,
          bookings: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  const formattedStores = stores.map(store => ({
    id: store.id,
    name: store.name,
    description: store.description,
    created_at: store.createdAt,
    service_count: store._count.services,
    slot_count: store._count.timeSlots,
    booking_count: store._count.bookings
  }))
  
  return NextResponse.json({ stores: formattedStores })
}
