"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, Store } from "lucide-react"

interface ScheduleSlot {
  id?: number
  start_time: string
  end_time: string
}

interface Schedule {
  id?: number
  day_of_week: number
  is_closed: boolean
  slots: ScheduleSlot[]
}

interface ScheduleTabProps {
  storeId: number
  schedules: Schedule[]
}

const DAYS_OF_WEEK = [
  "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"
]

export function ScheduleTab({ storeId, schedules }: ScheduleTabProps) {
  const [loading, setLoading] = useState(false)

  // Initialize all days
  const allDaysSchedules = Array.from({ length: 7 }, (_, i) => {
    const existing = schedules.find(s => s.day_of_week === i)
    return existing || { day_of_week: i, is_closed: true, slots: [] }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            เวลาทำการ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allDaysSchedules.map((schedule) => (
              <Card key={schedule.day_of_week} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{DAYS_OF_WEEK[schedule.day_of_week]}</h3>
                      <Badge variant={schedule.is_closed ? "destructive" : "default"}>
                        {schedule.is_closed ? "ปิด" : "เปิด"}
                      </Badge>
                    </div>
                  </div>

                  {schedule.is_closed ? (
                    <p className="text-muted-foreground text-sm">ร้านปิดในวันนี้</p>
                  ) : schedule.slots.length === 0 ? (
                    <p className="text-muted-foreground text-sm">ไม่มีกำหนดเวลาทำการ</p>
                  ) : (
                    <div className="space-y-2">
                      {schedule.slots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{slot.start_time} - {slot.end_time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">หมายเหตุ</h4>
              <p className="text-sm text-muted-foreground">
                เวลาทำการแสดงถึงช่วงเวลาที่ร้านเปิดให้บริการ ลูกค้าสามารถจองคิวได้เฉพาะในช่วงเวลาที่ร้านเปิดเท่านั้น
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
