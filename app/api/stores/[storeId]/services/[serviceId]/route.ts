import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ storeId: string; serviceId: string }> }) {
  const session = await getSession()
  const { storeId, serviceId } = await params
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

  const body = await req.json()
  const service = await db.service.update({
    where: {
      id: parseInt(serviceId),
      storeId: parseInt(storeId)
    },
    data: {
      name: body.name,
      durationDays: body.duration_days || 0,
      durationMinutes: body.duration_minutes,
      price: body.price,
      categoryId: body.categoryId ? parseInt(body.categoryId) : null,
    },
    select: {
      id: true,
      name: true,
      durationDays: true,
      durationMinutes: true,
      price: true,
      categoryId: true,
    },
  })

    return NextResponse.json({
      id: service.id,
      name: service.name,
      duration_days: service.durationDays,
      duration_minutes: service.durationMinutes,
      price: Number(service.price),
      categoryId: service.categoryId,
    })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ storeId: string; serviceId: string }> }) {
  const session = await getSession()
  const { storeId, serviceId } = await params
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

  await db.service.delete({
    where: {
      id: parseInt(serviceId),
      storeId: parseInt(storeId)
    }
  })
  
  return NextResponse.json({ success: true })
}
