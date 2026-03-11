import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { setSession } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    const existing = await db.user.findUnique({
      where: { email }
    })
    if (existing) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const userRole = role === "OWNER" ? "OWNER" : "CUSTOMER"

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: userRole
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImageUrl: true,
      }
    })

    await setSession({ id: user.id, name: user.name, email: user.email, role: user.role, profileImageUrl: user.profileImageUrl })

    return NextResponse.json({ user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
