import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const slots = await db.timeSlot.findMany({
    where: {
      storeId: parseInt(storeId),
      slotTime: {
        gt: new Date()
      }
    },
    orderBy: {
      slotTime: 'asc'
    }
  })
  
  const formattedSlots = slots.map(slot => ({
    id: slot.id,
    slot_time: slot.slotTime,
    is_available: slot.isAvailable
  }))
  
  return NextResponse.json({ slots: formattedSlots })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
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

  const { slot_time } = await req.json()
  if (!slot_time) return NextResponse.json({ error: "กรุณาระบุเวลา" }, { status: 400 })

  const slot = await db.timeSlot.create({
    data: {
      storeId: parseInt(storeId),
      slotTime: new Date(slot_time)
    },
    select: {
      id: true,
      slotTime: true,
      isAvailable: true
    }
  })
  
  const formattedSlot = {
    id: slot.id,
    slot_time: slot.slotTime,
    is_available: slot.isAvailable
  }
  
  return NextResponse.json({ slot: formattedSlot })
}
