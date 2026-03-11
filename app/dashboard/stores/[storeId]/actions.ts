"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"
import type { ScheduleType } from "./schedule-tab"

export async function saveStoreSchedule(storeId: number, schedules: ScheduleType[]) {
  const session = await getSession()

  if (!session || session.role !== "OWNER") {
    return { error: "ไม่มีสิทธิ์ดำเนินการ" }
  }

  // Verify ownership
  const store = await db.store.findFirst({
    where: { id: storeId, ownerId: session.id }
  })

  if (!store) {
    return { error: "ไม่พบข้อมูลร้านค้าหรือคุณไม่มีสิทธิ์" }
  }

  try {
    // We use a transaction to safely update all 7 days
    await db.$transaction(async (tx) => {
      for (const schedule of schedules) {
        
        // Find existing schedule for this day
        const existingSchedule = await tx.storeSchedule.findUnique({
          where: {
            storeId_dayOfWeek: {
              storeId,
              dayOfWeek: schedule.day_of_week
            }
          }
        });

        let scheduleId: number;

        if (existingSchedule) {
          // Update existing day
          await tx.storeSchedule.update({
            where: { id: existingSchedule.id },
            data: { isClosed: schedule.is_closed }
          });
          scheduleId = existingSchedule.id;

          // Delete old slots for this schedule to replace them
          await tx.scheduleSlot.deleteMany({
            where: { scheduleId }
          });
        } else {
          // Create new day schedule
          const newSchedule = await tx.storeSchedule.create({
            data: {
              storeId,
              dayOfWeek: schedule.day_of_week,
              isClosed: schedule.is_closed,
            }
          });
          scheduleId = newSchedule.id;
        }

        // Add the defined slots for this day (only if not closed)
        if (!schedule.is_closed && schedule.slots.length > 0) {
          const slotsData = schedule.slots.map(slot => ({
            scheduleId,
            startTime: slot.start_time,
            endTime: slot.end_time
          }));

          await tx.scheduleSlot.createMany({
            data: slotsData
          });
        }
      }
    });

    revalidatePath(`/dashboard/stores/${storeId}`);
    return { success: true }
  } catch (error) {
    console.error("Failed to save store schedule:", error)
    return { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง" }
  }
}

export async function updateStore(storeId: number, formData: FormData) {
  const session = await getSession()

  if (!session || session.role !== "OWNER") {
    return { error: "ไม่มีสิทธิ์ดำเนินการ" }
  }

  // Verify ownership
  const store = await db.store.findFirst({
    where: { id: storeId, ownerId: session.id }
  })

  if (!store) {
    return { error: "ไม่พบข้อมูลร้านค้าหรือคุณไม่มีสิทธิ์" }
  }

  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const profileImage = formData.get("profileImage") as File | null
    const coverImage = formData.get("coverImage") as File | null
    
    // Preview images: multiple files
    const previewImages = formData.getAll("previewImages") as File[]
    const removeImageIds = formData.getAll("removeImageIds").map(id => parseInt(id as string))

    // Track if we need to remove or update images
    const removeProfile = formData.get("removeProfile") === "true"
    const removeCover = formData.get("removeCover") === "true"

    let profileImageUrl = (store as any).profileImageUrl
    let coverImageUrl = (store as any).coverImageUrl

    if (removeProfile) {
      profileImageUrl = null
    } else if (profileImage && profileImage.size > 0) {
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${profileImage.type};base64,${buffer.toString('base64')}`
      profileImageUrl = await uploadImage(base64Image, 'profiles')
    }

    if (removeCover) {
      coverImageUrl = null
    } else if (coverImage && coverImage.size > 0) {
      const bytes = await coverImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${coverImage.type};base64,${buffer.toString('base64')}`
      coverImageUrl = await uploadImage(base64Image, 'covers')
    }

    // Process new preview images
    const newPreviewUrls: string[] = []
    for (const image of previewImages) {
      if (image.size > 0) {
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`
        const url = await uploadImage(base64Image, 'previews')
        newPreviewUrls.push(url)
      }
    }

    await db.$transaction(async (tx) => {
      // 1. Update basic store info
      await tx.store.update({
        where: { id: storeId },
        data: {
          name,
          description,
          profileImageUrl: profileImageUrl as any,
          coverImageUrl: coverImageUrl as any,
        }
      })

      // 2. Remove specified preview images
      if (removeImageIds.length > 0) {
        await tx.storeImage.deleteMany({
          where: {
            id: { in: removeImageIds },
            storeId
          }
        })
      }

      // 3. Add new preview images
      if (newPreviewUrls.length > 0) {
        await tx.storeImage.createMany({
          data: newPreviewUrls.map(url => ({
            storeId,
            url
          }))
        })
      }
    })

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/stores/${storeId}`)
    revalidatePath(`/stores/${storeId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update store:", error)
    return { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }
  }
}
