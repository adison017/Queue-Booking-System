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
interface Slot {
  id: number
  slot_time: string
  is_available: boolean
}

interface Props {
  storeId: number
  services: Service[]
  slots: Slot[]
  isLoggedIn: boolean
}

export function BookingSection({ storeId, services, slots, isLoggedIn }: Props) {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const availableSlots = slots.filter((s) => s.is_available)

  const handleBook = async () => {
    if (!selectedService || !selectedSlot) {
      toast.error("กรุณาเลือกบริการและช่วงเวลา")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: selectedService, slot_id: selectedSlot }),
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

        {/* Step 2: Select time slot */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">2. เลือกช่วงเวลา</Label>
          {availableSlots.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center border border-dashed border-border rounded-lg">
              ไม่มีช่วงเวลาว่าง
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 max-h-64 overflow-y-auto pr-1">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`relative rounded-lg border p-3 text-left transition-all ${
                    selectedSlot === slot.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  {selectedSlot === slot.id && (
                    <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />
                  )}
                  <p className="font-medium text-sm pr-5">
                    {format(new Date(slot.slot_time), "EEEE", { locale: th })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(slot.slot_time), "d MMM yyyy · HH:mm น.", { locale: th })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {selectedService && selectedSlot && (() => {
          const sv = services.find((s) => s.id === selectedService)!
          const sl = availableSlots.find((s) => s.id === selectedSlot)!
          return (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm font-semibold text-primary mb-2">สรุปการจอง</p>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">บริการ</span>
                  <span className="font-medium">{sv.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เวลา</span>
                  <span className="font-medium">{format(new Date(sl.slot_time), "d MMM yyyy HH:mm น.", { locale: th })}</span>
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
          disabled={!selectedService || !selectedSlot || loading}
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
