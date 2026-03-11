import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession, setSession } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const formData = await req.formData()
    const name = formData.get("name") as string
    const profileImage = formData.get("profileImage") as File | null

    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อ" }, { status: 400 })
    }

    let profileImageUrl = undefined
    if (profileImage && profileImage.size > 0) {
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${profileImage.type};base64,${buffer.toString('base64')}`
      profileImageUrl = await uploadImage(base64Image, 'profiles')
    }

    // Update user in database
    const updatedUser = await (db as any).user.update({
      where: { id: session.id },
      data: {
        name,
        ...(profileImageUrl && { profileImageUrl })
      }
    })

    await setSession({
      ...session,
      name: updatedUser.name,
      profileImageUrl: updatedUser.profileImageUrl
    } as any)

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImageUrl: updatedUser.profileImageUrl
      }
    })
  } catch (error: any) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const user = await (db as any).user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        profileImageUrl: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}
