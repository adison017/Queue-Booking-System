"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function updateUserRole(userId: number, selectRole: "CUSTOMER" | "OWNER" | "ADMIN") {
  const session = await getSession()

  // Ensure only admins can execute this action
  if (!session || session.role !== "ADMIN") {
    return { error: "ไม่มีสิทธิ์ในการจัดการผู้ใช้งาน" }
  }

  // Prevent an admin from demoting themselves to avoid lockouts
  if (session.id === userId && selectRole !== "ADMIN") {
    return { error: "คุณไม่สามารถลดระดับสิทธิ์ของตัวเองได้" }
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { role: selectRole }
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Failed to update user role:", error)
    return { error: "ไม่สามารถอัปเดตสิทธิ์ได้ กรุณาลองใหม่อีกครั้ง" }
  }
}
