import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  const stores = await db.store.findMany({
    include: {
      owner: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          services: true
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
    owner_name: store.owner.name,
    service_count: store._count.services
  }))
  
  return NextResponse.json({ stores: formattedStores })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
  }

  const { name, description } = await req.json()
  if (!name) {
    return NextResponse.json({ error: "กรุณากรอกชื่อร้าน" }, { status: 400 })
  }

  const store = await db.store.create({
    data: {
      name,
      description,
      ownerId: session.id
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true
    }
  })
  
  const formattedStore = {
    id: store.id,
    name: store.name,
    description: store.description,
    created_at: store.createdAt
  }
  
  return NextResponse.json({ store: formattedStore })
}
