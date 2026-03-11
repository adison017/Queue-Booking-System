import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params
  
  try {
    const reviews = await (db as any).review.findMany({
      where: {
        storeId: parseInt(storeId)
      },
      include: {
        user: {
          select: {
            name: true,
            profileImageUrl: true
          }
        },
        images: true,
        reply: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Get reviews error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนรีวิว" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const rating = parseInt(formData.get("rating") as string)
    const comment = formData.get("comment") as string
    const bookingId = formData.get("bookingId") ? parseInt(formData.get("bookingId") as string) : null
    const reviewImages = formData.getAll("images") as File[]

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "กรุณาให้คะแนน 1-5 ดาว" }, { status: 400 })
    }

    // Verify if user can review (has a completed booking)
    if (bookingId) {
      const booking = await db.booking.findFirst({
        where: {
          id: bookingId,
          userId: session.id,
          storeId: parseInt(storeId),
          status: 'COMPLETED'
        },
        include: {
          review: true
        } as any
      })

      if (!booking) {
        return NextResponse.json({ error: "ไม่พบการจองที่เสร็จสิ้นของคุณ" }, { status: 400 })
      }

      if ((booking as any).review) {
        return NextResponse.json({ error: "คุณเคยรีวิวการจองนี้ไปแล้ว" }, { status: 400 })
      }
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = []
    for (const image of reviewImages) {
      if (image.size > 0) {
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`
        const url = await uploadImage(base64Image, 'reviews')
        imageUrls.push(url)
      }
    }

    // Create review
    const review = await (db as any).review.create({
      data: {
        storeId: parseInt(storeId),
        userId: session.id,
        bookingId,
        rating,
        comment,
        images: {
          create: imageUrls.map(url => ({ url }))
        }
      },
      include: {
        images: true,
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error("Post review error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกรีวิว" }, { status: 500 })
  }
}
