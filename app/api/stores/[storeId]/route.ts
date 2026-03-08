import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const store = await db.store.findUnique({
    where: {
      id: parseInt(storeId)
    },
    include: {
      owner: {
        select: {
          name: true
        }
      }
    }
  })
  
  if (!store) return NextResponse.json({ error: "ไม่พบร้าน" }, { status: 404 })
  
  const formattedStore = {
    id: store.id,
    name: store.name,
    description: store.description,
    created_at: store.createdAt,
    owner_name: store.owner.name
  }
  
  return NextResponse.json({ store: formattedStore })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
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

  const { name, description } = await req.json()
  const updated = await db.store.update({
    where: {
      id: parseInt(storeId)
    },
    data: {
      name,
      description
    },
    select: {
      id: true,
      name: true,
      description: true
    }
  })
  
  return NextResponse.json({ store: updated })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
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

  await db.store.delete({
    where: {
      id: parseInt(storeId)
    }
  })
  
  return NextResponse.json({ success: true })
}
