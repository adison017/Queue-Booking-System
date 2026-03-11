import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params
  const session = await getSession()
  
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const profileImage = formData.get("profileImage") as File | null
    const coverImage = formData.get("coverImage") as File | null
    const previewImages = formData.getAll("previewImages") as File[]
    const removeImageIds = formData.getAll("removeImageIds").map(id => parseInt(id as string))
    const removeProfile = formData.get("removeProfile") === "true"
    const removeCover = formData.get("removeCover") === "true"

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

    let profileImageUrl = (store as any).profileImageUrl
    let coverImageUrl = (store as any).coverImageUrl

    if (removeProfile) profileImageUrl = null
    if (removeCover) coverImageUrl = null

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

    await db.$transaction(async (tx) => {
      // Update basic info
      await tx.store.update({
        where: { id: parseInt(storeId) },
        data: {
          name,
          description,
          location,
          profileImageUrl: profileImageUrl as any,
          coverImageUrl: coverImageUrl as any,
        } as any
      })

      // Remove images
      if (removeImageIds.length > 0) {
        await (tx as any).storeImage.deleteMany({
          where: {
            id: { in: removeImageIds },
            storeId: parseInt(storeId)
          }
        })
      }

      // Add new images
      if (previewUrls.length > 0) {
        await (tx as any).storeImage.createMany({
          data: previewUrls.map(url => ({
            url,
            storeId: parseInt(storeId)
          }))
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update store error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 })
  }
}
