import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

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
    profileImageUrl: (store as any).profileImageUrl,
    coverImageUrl: (store as any).coverImageUrl,
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

  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const profileImage = formData.get("profileImage") as File | null
    const coverImage = formData.get("coverImage") as File | null
    const previewImages = formData.getAll("previewImages") as File[]

    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อร้าน" }, { status: 400 })
    }

    // Check store limit (max 5 stores per owner)
    const existingStores = await db.store.count({
      where: {
        ownerId: session.id
      }
    })

    if (existingStores >= 5) {
      return NextResponse.json({ error: "คุณสามารถสร้างร้านได้สูงสุด 5 ร้านเท่านั้น" }, { status: 400 })
    }

    let profileImageUrl = null
    let coverImageUrl = null

    if (profileImage && profileImage.size > 0) {
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${profileImage.type};base64,${buffer.toString('base64')}`
      profileImageUrl = await uploadImage(base64Image, 'profiles')
    }

    if (coverImage && coverImage.size > 0) {
      const bytes = await coverImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${coverImage.type};base64,${buffer.toString('base64')}`
      coverImageUrl = await uploadImage(base64Image, 'covers')
    }

    // Process preview images
    const previewUrls: string[] = []
    for (const image of previewImages) {
      if (image.size > 0) {
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`
        const url = await uploadImage(base64Image, 'previews')
        previewUrls.push(url)
      }
    }

    const store = await db.store.create({
      data: {
        name,
        description,
        location,
        profileImageUrl: profileImageUrl as any,
        coverImageUrl: coverImageUrl as any,
        ownerId: session.id,
        images: {
          create: previewUrls.map(url => ({ url }))
        }
      } as any
    })
    
    return NextResponse.json({ 
      store: {
        id: store.id,
        name: store.name,
        description: store.description,
        profileImageUrl: (store as any).profileImageUrl,
        coverImageUrl: (store as any).coverImageUrl,
        created_at: store.createdAt
      }
    })
  } catch (error) {
    console.error("Store creation error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างร้านค้า" }, { status: 500 })
  }
}
