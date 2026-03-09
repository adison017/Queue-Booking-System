"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"
import { CalendarClock, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface Service {
  id: number
  name: string
  duration_minutes: number
  price: number
}

interface ScheduleSlot {
  id: number
  start_time: string
  end_time: string
}

interface Schedule {
  id: number
  day_of_week: number
  is_closed: boolean
  slots: ScheduleSlot[]
}

interface Props {
  storeId: number
  services: Service[]
  schedules: Schedule[]
  isLoggedIn: boolean
}

export function BookingSection({ storeId, services, schedules, isLoggedIn }: Props) {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Determine day of week (0-6)
  const dayOfWeek = selectedDate.getDay()
  const daySchedule = schedules.find(s => s.day_of_week === dayOfWeek)
  const availableSlots = daySchedule?.slots || []

  // Generate next 7 days for picking
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + i)
    return d
  })

  const handleBook = async () => {
    if (!selectedService || !selectedSlotId) {
      toast.error("กรุณาเลือกบริการและช่วงเวลา")
      return
    }

    const slot = availableSlots.find(s => s.id === selectedSlotId)
    if (!slot) return

    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          service_id: selectedService, 
          booking_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: slot.start_time,
          end_time: slot.end_time
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error)
        return
      }
      toast.success("จองคิวสำเร็จ!")
      router.push("/my-bookings")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <CalendarClock className="h-12 w-12 text-primary/40" />
          <div>
            <h3 className="font-semibold text-lg">กรุณาเข้าสู่ระบบก่อนจองคิว</h3>
            <p className="text-muted-foreground text-sm mt-1">สมัครสมาชิกฟรีหรือเข้าสู่ระบบเพื่อจองคิว</p>
          </div>
          <div className="flex gap-3">
            <Link href="/login"><Button variant="outline">เข้าสู่ระบบ</Button></Link>
            <Link href="/register"><Button>สมัครสมาชิก</Button></Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarClock className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">ร้านนี้ยังไม่มีบริการ</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          จองคิว
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Step 1: Select service */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">1. เลือกบริการ</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((sv) => (
              <button
                key={sv.id}
                type="button"
                onClick={() => setSelectedService(sv.id)}
                className={`relative rounded-lg border p-3 text-left transition-all ${
                  selectedService === sv.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                {selectedService === sv.id && (
                  <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />
                )}
                <p className="font-medium text-sm pr-5">{sv.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sv.duration_minutes} นาที · ฿{Number(sv.price).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Date */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">2. เลือกวันที่</Label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {next7Days.map((date) => {
              const isActive = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedSlotId(null) // Reset slot when date changes
                    const dow = date.getDay()
                    const hasSlots = schedules.find(s => s.day_of_week === dow)?.slots.length ?? 0
                    if (hasSlots === 0) {
                      toast.info(`วันที่ ${format(date, "d MMM", { locale: th })} ร้านปิดทำการ`)
                    }
                  }}
                  className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-xl border transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold opacity-60">
                    {format(date, "EEE", { locale: th })}
                  </span>
                  <span className="text-lg font-bold">
                    {format(date, "d")}
                  </span>
                  <span className="text-[10px] opacity-60">
                    {format(date, "MMM", { locale: th })}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 3: Select time slot */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">3. เลือกช่วงเวลา</Label>
          {availableSlots.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center border border-dashed border-border rounded-lg">
              {daySchedule?.is_closed ? "ร้านปิดทำการในวันเสาร์" : "ไม่มีบริการในวันนี้"}
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 max-h-64 overflow-y-auto pr-1">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`relative rounded-lg border p-3 text-left transition-all ${
                    selectedSlotId === slot.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  {selectedSlotId === slot.id && (
                    <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />
                  )}
                  <p className="font-medium text-sm pr-5">
                    {slot.start_time} - {slot.end_time} น.
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ใช้เวลาประมาณ {selectedService ? services.find(s => s.id === selectedService)?.duration_minutes : "?"} นาที
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {selectedService && selectedSlotId && (() => {
          const sv = services.find((s) => s.id === selectedService)!
          const sl = availableSlots.find((s) => s.id === selectedSlotId)!
          return (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm font-semibold text-primary mb-2">สรุปการจอง</p>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">บริการ</span>
                  <span className="font-medium">{sv.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">วันที่</span>
                  <span className="font-medium">{format(selectedDate, "d MMM yyyy", { locale: th })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เวลา</span>
                  <span className="font-medium">{sl.start_time} - {sl.end_time} น.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ราคา</span>
                  <span className="font-medium text-primary">฿{Number(sv.price).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )
        })()}

        <Button
          onClick={handleBook}
          disabled={!selectedService || !selectedSlotId || loading}
          className="w-full"
          size="lg"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          ยืนยันการจอง
        </Button>
      </CardContent>
    </Card>
  )
}
