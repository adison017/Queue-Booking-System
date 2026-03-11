'use client'

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Calendar as CalendarIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Booking {
  id: number
  startTime: string
  endTime: string
  serviceName: string
  status: string
}

interface CustomerBookingsProps {
  storeId: number
}

export function CustomerBookings({ storeId }: CustomerBookingsProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dayCounts, setDayCounts] = useState<Record<string, number>>({})

  // Fetch monthly booking counts for the calendar
  useEffect(() => {
    async function fetchMonthCounts() {
      try {
        const monthStr = format(selectedDate, 'yyyy-MM')
        const response = await fetch(`/api/stores/${storeId}/public-bookings?month=${monthStr}`)
        if (response.ok) {
          const data = await response.json()
          setDayCounts(data.dayCounts)
        }
      } catch (error) {
        console.error("Failed to fetch month counts:", error)
      }
    }
    fetchMonthCounts()
  }, [storeId, selectedDate.getMonth(), selectedDate.getFullYear()])

  useEffect(() => {
    async function fetchBookings() {
      setIsLoading(true)
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const response = await fetch(`/api/stores/${storeId}/available-slots?date=${dateStr}`)
        const data = await response.json()
        
        // Filter only booked slots and map to simplified booking objects
        const bookedSlots = data.availableSlots
          .filter((slot: any) => !slot.available)
          .map((slot: any) => {
            const [start, end] = slot.time.split(' - ')
            return {
              id: slot.bookingId,
              startTime: start,
              endTime: end || '',
              serviceName: slot.serviceName || "จองแล้ว",
              status: "CONFIRMED"
            }
          })
          
        setBookings(bookedSlots)
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [storeId, selectedDate])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="w-full">
        <Card className="border-2 border-white/10 bg-background/50 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-white/5 pb-4">
            <CardTitle className="text-xl font-black tracking-tighter flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              เลือกวันที่ดูคิว
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={th}
              className="rounded-2xl border-white/10 flex justify-center w-full"
              modifiers={{
                hasBookings: (date) => {
                  const dateKey = format(date, 'yyyy-MM-dd')
                  return !!dayCounts[dateKey]
                }
              }}
              modifiersStyles={{
                hasBookings: { 
                  fontWeight: 'black', 
                  color: 'hsl(var(--primary))',
                  position: 'relative'
                }
              }}
            />
            <div className="mt-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50"></div>
                <span>มีคิว</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full border-2 border-muted"></div>
                <span>ว่าง</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full">
        <Card className="border-2 border-white/10 bg-background/50 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-white/5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black tracking-tighter">ตารางคิวรายวัน</CardTitle>
                <CardDescription className="font-bold text-primary">
                   {format(selectedDate, 'd MMMM yyyy', { locale: th })}
                </CardDescription>
              </div>
              <Badge className="bg-primary/20 text-primary border-none font-black px-4 py-1 rounded-full w-fit">
                {bookings.length} คิวทั้งหมด
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-bold italic text-muted-foreground">กำลังดึงข้อมูลคิว...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest px-6 h-12">เวลา</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest px-6 h-12">บริการ</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest px-6 h-12">สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking, idx) => (
                      <TableRow key={booking.id} className="border-white/5 hover:bg-primary/5 transition-colors group">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3 font-black text-sm tracking-tight">
                            <div className="p-1.5 bg-muted rounded-lg group-hover:bg-primary/20 transition-colors">
                               <Clock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <span className="whitespace-nowrap">{booking.startTime} - {booking.endTime}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="font-bold text-sm leading-tight block min-w-[120px]">{booking.serviceName}</span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant="secondary" className="bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary border-none font-black text-[10px] px-3 py-0.5 flex items-center gap-1.5 w-fit">
                            <User className="h-3 w-3" />
                            จองแล้ว
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-20 px-6 space-y-4">
                <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white/5 shadow-inner">
                   <Clock className="h-10 w-10 text-muted-foreground opacity-30" />
                </div>
                <div className="space-y-1">
                   <p className="font-black text-xl tracking-tighter">ยังไม่มีการจองในวันนี้</p>
                   <p className="text-sm text-muted-foreground font-medium">คุณสามารถเลือกวันที่อื่นหรือเริ่มจองคิวใหม่ได้ทันที</p>
                </div>
              </div>
            )}
          </CardContent>
          <div className="bg-muted/10 p-4 border-t border-white/5">
             <p className="text-[9px] text-center font-black uppercase tracking-[0.2em] text-muted-foreground/50 italic">
                - ข้อมูลคิวจะถูกปกปิดความเป็นส่วนตัวตามมาตรฐานสากล -
             </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
