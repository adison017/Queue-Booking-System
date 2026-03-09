"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
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
