"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function deleteStore(storeId: number) {
  const session = await getSession()

  // Ensure only admins can execute this action
  if (!session || session.role !== "ADMIN") {
    return { error: "ไม่มีสิทธิ์ในการจัดการร้านค้า" }
  }

  try {
    await db.store.delete({
      where: { id: storeId }
    })

    revalidatePath("/admin/stores")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete store:", error)
    return { error: "ไม่สามารถลบร้านค้าได้ ลบข้อมูลที่เกี่ยวข้องแล้วลองอีกครั้ง" }
  }
}
