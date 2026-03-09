"use client"

import { useState } from "react"
import { Plus, Trash2, Clock, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { saveStoreSchedule } from "./actions" // We need to create this server action

// Generate time options from 00:00 to 23:30
const generateTimeOptions = () => {
  const times = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      times.push(time)
    }
  }
  return times
}

const TIME_OPTIONS = generateTimeOptions()

export type ScheduleSlotType = {
  id?: number
  start_time: string
  end_time: string
}

export type ScheduleType = {
  id?: number
  day_of_week: number
  is_closed: boolean
  slots: ScheduleSlotType[]
}

interface ScheduleTabProps {
  storeId: number
  schedules: ScheduleType[]
}

const DAYS_OF_WEEK = [
  "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"
]

// Helper to initialize missing days
const initializeSchedules = (existing: ScheduleType[]): ScheduleType[] => {
  return Array.from({ length: 7 }).map((_, i) => {
    const existingDay = existing.find(s => s.day_of_week === i)
    return existingDay || { day_of_week: i, is_closed: true, slots: [] }
  })
}

export function ScheduleTab({ storeId, schedules: initialSchedules }: ScheduleTabProps) {
  const [schedules, setSchedules] = useState<ScheduleType[]>(initializeSchedules(initialSchedules))
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleClosed = (dayIndex: number, checked: boolean) => {
    const newSchedules = [...schedules]
    newSchedules[dayIndex].is_closed = checked
    // If opening the store and no slots exist, add a default one
    if (!checked && newSchedules[dayIndex].slots.length === 0) {
      newSchedules[dayIndex].slots.push({ start_time: "09:00", end_time: "17:00" })
    }
    setSchedules(newSchedules)
  }

  const handleAddSlot = (dayIndex: number) => {
    const newSchedules = [...schedules]
    newSchedules[dayIndex].slots.push({ start_time: "09:00", end_time: "10:00" })
    setSchedules(newSchedules)
  }

  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedules = [...schedules]
    newSchedules[dayIndex].slots.splice(slotIndex, 1)
    setSchedules(newSchedules)
  }

  const handleSlotChange = (dayIndex: number, slotIndex: number, field: "start_time" | "end_time", value: string) => {
    const newSchedules = [...schedules]
    newSchedules[dayIndex].slots[slotIndex][field] = value
    setSchedules(newSchedules)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await saveStoreSchedule(storeId, schedules)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("บันทึกเวลาทำการสำเร็จ")
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            เวลาเปิด-ปิดร้าน
          </CardTitle>
          <CardDescription>
            กำหนดวันที่ร้านเปิดให้บริการและช่วงเวลาที่เปิดรับจองในแต่ละวัน
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {schedules.map((schedule, dayIndex) => (
            <div key={dayIndex} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card">
              {/* Day Toggle Column */}
              <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 w-full sm:w-40 shrink-0">
                <Label className="font-semibold text-base">{DAYS_OF_WEEK[dayIndex]}</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`day-${dayIndex}`} 
                    checked={!schedule.is_closed}
                    onCheckedChange={(checked) => handleToggleClosed(dayIndex, !checked)}
                  />
                  <Label htmlFor={`day-${dayIndex}`} className={schedule.is_closed ? "text-muted-foreground" : "text-primary font-medium"}>
                    {schedule.is_closed ? "ปิดทำการ" : "เปิดทำการ"}
                  </Label>
                </div>
              </div>

              {/* Slots Column */}
              <div className="flex-1 flex flex-col gap-3">
                {!schedule.is_closed ? (
                  <>
                    {schedule.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Select
                          value={slot.start_time}
                          onValueChange={(value) => handleSlotChange(dayIndex, slotIndex, "start_time", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">ถึง</span>
                        <Select
                          value={slot.end_time}
                          onValueChange={(value) => handleSlotChange(dayIndex, slotIndex, "end_time", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddSlot(dayIndex)}
                      className="w-fit mt-1 text-xs gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      เพิ่มช่วงเวลา
                    </Button>
                  </>
                ) : (
                  <div className="h-full flex items-center text-sm text-muted-foreground italic">
                    ร้านปิดทำการในวันนี้
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
