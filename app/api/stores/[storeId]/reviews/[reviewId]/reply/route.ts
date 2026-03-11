import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string, reviewId: string }> }
) {
  const { storeId, reviewId } = await params
  const session = await getSession()

  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
  }

  try {
    const contentType = req.headers.get("content-type")
    console.log("[Debug] Reply API - Content-Type:", contentType)
    
    const text = await req.text()
    console.log("[Debug] Reply API - Raw Body:", text)
    
    if (!text) {
       return NextResponse.json({ error: "Request body is empty" }, { status: 400 })
    }

    const { comment } = JSON.parse(text)

    if (!comment) {
      return NextResponse.json({ error: "กรุณากรอกข้อความตอบกลับ" }, { status: 400 })
    }

    // Verify ownership
    const store = await db.store.findFirst({
      where: {
        id: parseInt(storeId),
        ownerId: session.id
      }
    })

    if (!store) {
      return NextResponse.json({ error: "ไม่พบร้านค้าหรือคุณไม่ใช่เจ้าของ" }, { status: 404 })
    }

    // Verify review belongs to this store
    const review = await (db as any).review.findFirst({
      where: {
        id: parseInt(reviewId),
        storeId: parseInt(storeId)
      }
    })

    if (!review) {
      return NextResponse.json({ error: "ไม่พบรีวิวนี้" }, { status: 404 })
    }

    // Create or update reply
    const reply = await (db as any).reviewReply.upsert({
      where: {
        reviewId: parseInt(reviewId)
      },
      update: {
        comment
      },
      create: {
        reviewId: parseInt(reviewId),
        comment
      }
    })

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    console.error("Post reply error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกการตอบกลับ" }, { status: 500 })
  }
}
