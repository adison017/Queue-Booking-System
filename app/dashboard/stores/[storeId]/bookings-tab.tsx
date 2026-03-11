"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"
import { CalendarDays, User, Calendar as CalendarIcon, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"

type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"

interface Booking {
  id: number
  status: Status
  created_at: Date
  customer_name: string
  customer_email: string
  service_name: string
  price: number
  booking_date: Date
  start_time: string
  end_time: string
}

interface Props {
  storeId: number
  bookings: Booking[]
}

export function BookingsTab({ storeId, bookings }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL")

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter
    
    if (!selectedDate) return matchesStatus
    
    const bDate = new Date(b.booking_date)
    const isSameDay = 
      bDate.getDate() === selectedDate.getDate() &&
      bDate.getMonth() === selectedDate.getMonth() &&
      bDate.getFullYear() === selectedDate.getFullYear()
      
    return matchesStatus && isSameDay
  })

  const updateStatus = async (bookingId: number, status: Status) => {
    setLoadingId(bookingId)
    try {
      const res = await fetch(`/api/stores/${storeId}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) { toast.error((await res.json()).error); return }
      toast.success("อัปเดตสถานะแล้ว")
      router.refresh()
    } finally { setLoadingId(null) }
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-xl text-center">
        <CalendarDays className="h-14 w-14 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">ยังไม่มีการจอง</p>
        <p className="text-muted-foreground text-sm mt-1">เมื่อลูกค้าจองคิวจะแสดงที่นี่</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              การจอง ({filteredBookings.length})
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: th }) : <span>แสดงวันที่ทั้งหมด</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={th}
                  />
                </PopoverContent>
              </Popover>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทุกสถานะ</SelectItem>
                  <SelectItem value="PENDING">รอยืนยัน</SelectItem>
                  <SelectItem value="CONFIRMED">ยืนยันแล้ว</SelectItem>
                  <SelectItem value="COMPLETED">เสร็จสิ้น</SelectItem>
                  <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>

              {(selectedDate || statusFilter !== "ALL") && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setSelectedDate(undefined)
                    setStatusFilter("ALL")
                  }}
                  title="ล้างการกรอง"
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-3">
        {filteredBookings.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{b.customer_name}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{b.customer_email}</p>
                    <p className="text-sm mt-1">{b.service_name} · <span className="text-primary font-medium">฿{Number(b.price).toLocaleString()}</span></p>
                    <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {format(b.booking_date, "d MMM yyyy", { locale: th })} · {b.start_time} - {b.end_time} น.
                    </p>
                  </div>
                </div>

                {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                  <Select
                    value={b.status}
                    onValueChange={(v) => updateStatus(b.id, v as Status)}
                    disabled={loadingId === b.id}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">รอยืนยัน</SelectItem>
                      <SelectItem value="CONFIRMED">ยืนยันแล้ว</SelectItem>
                      <SelectItem value="COMPLETED">เสร็จสิ้น</SelectItem>
                      <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground text-sm">ไม่พบรายการจองตามที่ระบุ</p>
          </div>
        )}
      </div>
    </div>
  )
}
