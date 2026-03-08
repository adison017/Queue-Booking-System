import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ storeId: string; slotId: string }> }) {
  const session = await getSession()
  const { storeId, slotId } = await params
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

  await db.timeSlot.delete({
    where: {
      id: parseInt(slotId),
      storeId: parseInt(storeId)
    }
  })
  
  return NextResponse.json({ success: true })
}
