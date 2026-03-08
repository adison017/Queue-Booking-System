import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const services = await db.service.findMany({
    where: {
      storeId: parseInt(storeId)
    },
    orderBy: {
      id: 'asc'
    }
  })
  
  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name,
    duration_minutes: service.durationMinutes,
    price: Number(service.price)
  }))
  
  return NextResponse.json({ services: formattedServices })
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

  const { name, duration_minutes, price } = await req.json()
  if (!name || !duration_minutes || price === undefined) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 })
  }

  const service = await db.service.create({
    data: {
      storeId: parseInt(storeId),
      name,
      durationMinutes: duration_minutes,
      price
    },
    select: {
      id: true,
      name: true,
      durationMinutes: true,
      price: true
    }
  })
  
  const formattedService = {
    id: service.id,
    name: service.name,
    duration_minutes: service.durationMinutes,
    price: Number(service.price)
  }
  
  return NextResponse.json({ service: formattedService })
}
