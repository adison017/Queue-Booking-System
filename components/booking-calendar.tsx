"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, addMonths, subMonths, isSameMonth, isSameDay, setHours, setMinutes } from "date-fns"
import { th } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Check, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AvailableSlot {
  time: string
  available: boolean
  bookingId?: number
  customerName?: string
}

interface BookingCalendarProps {
  storeId: number
  selectedTime?: string | null
  onDateSelect?: (date: Date) => void
  onTimeSelect?: (date: Date, time: string) => void
}

export function BookingCalendar({ storeId, selectedTime, onDateSelect, onTimeSelect }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [storeSchedule, setStoreSchedule] = useState<any>(null)

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const fetchAvailableSlots = async (date: Date) => {
    setLoading(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/stores/${storeId}/available-slots?date=${dateStr}`)
      const data = await response.json()
      setAvailableSlots(data.availableSlots || [])
      setStoreSchedule(data.storeSchedule)
    } catch (error) {
      console.error('Failed to fetch available slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    onDateSelect?.(day)
  }

  const handleTimeClick = (time: string) => {
    if (selectedDate && availableSlots.find(slot => slot.time === time)?.available) {
      onTimeSelect?.(selectedDate, time)
    }
  }

  const renderDays = () => {
    const start = startOfWeek(currentMonth, { weekStartsOn: 1 }) // Monday
    const end = addDays(start, 42) // 6 weeks
    const days = []

    for (let day = start; day < end; day = addDays(day, 1)) {
      const isCurrentMonth = isSameMonth(day, currentMonth)
      const isSelected = selectedDate && isSameDay(day, selectedDate)
      const isToday = isSameDay(day, new Date())
      const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))

      days.push(
        <Button
          key={day.toISOString()}
          variant={isSelected ? "default" : "ghost"}
          className={cn(
            "h-10 w-10 p-0 rounded-xl transition-all duration-300 relative group",
            !isCurrentMonth && "opacity-20",
            isPast && "opacity-5 cursor-not-allowed grayscale",
            isSelected && "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110 -translate-y-1",
            !isSelected && !isPast && "hover:bg-primary/10 hover:text-primary hover:scale-105"
          )}
          disabled={isPast}
          onClick={() => !isPast && handleDateClick(day)}
        >
          <span className={cn("z-10 font-bold", isSelected ? "text-primary-foreground" : "text-foreground")}>
             {format(day, "d")}
          </span>
          {isToday && !isSelected && (
            <div className="absolute bottom-1.5 h-1 w-1 bg-primary rounded-full" />
          )}
          {isSelected && (
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl pointer-events-none" />
          )}
        </Button>
      )
    }

    return days
  }

  const weekDays = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"]

  return (
    <div className="space-y-10">
      {/* Calendar - Glassmorphism 3D Style */}
      <Card className="border-2 border-white/10 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-primary/5 border-b border-white/5 pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
              <div className="p-2 bg-primary/10 rounded-xl">
                 <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              {format(currentMonth, "MMMM yyyy", { locale: th })}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrevMonth}
                className="rounded-xl border-white/10 hover:bg-primary/20 hover:text-primary transition-all active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNextMonth}
                className="rounded-xl border-white/10 hover:bg-primary/20 hover:text-primary transition-all active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-4 md:px-8">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-xs font-black text-primary/50 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderDays()}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots - Floating 3D Cards */}
      {selectedDate && (
        <Card className="border-2 border-white/10 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem] animate-in fade-in slide-in-from-bottom-6 duration-500">
          <CardHeader className="bg-primary/5 border-b border-white/5 pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
              <div className="p-2 bg-primary/10 rounded-xl">
                 <Clock className="h-6 w-6 text-primary" />
              </div>
              รอบเวลาว่าง
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground">
               นัดหมายสำหรับวันที่ {format(selectedDate, "d MMMM yyyy", { locale: th })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 px-6 md:px-10">
            {storeSchedule?.isClosed ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="p-4 bg-destructive/10 rounded-full">
                    <Clock className="h-8 w-8 text-destructive opacity-50" />
                 </div>
                 <p className="text-muted-foreground font-black text-xl tracking-tighter">ขออภัย ร้านปิดในวันนี้</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12 gap-3">
                 <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                 <p className="text-muted-foreground font-bold italic">กำลังตรวจสอบเวลาว่าง...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="p-4 bg-muted rounded-full">
                    <Sparkles className="h-8 w-8 text-muted-foreground opacity-30" />
                 </div>
                 <p className="text-muted-foreground font-black text-xl tracking-tighter">ไม่มีช่วงเวลาว่างในขณะนี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time
                  return (
                    <Button
                      key={slot.time}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "h-14 md:h-16 relative overflow-hidden transition-all duration-300 border-2 rounded-2xl group active:scale-95",
                        isSelected 
                          ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/30 -translate-y-1 font-black" 
                          : slot.available 
                            ? "border-white/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:-translate-y-1 bg-background/50 backdrop-blur-sm" 
                            : "opacity-30 grayscale cursor-not-allowed border-muted"
                      )}
                      disabled={!slot.available}
                      onClick={() => handleTimeClick(slot.time)}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                         <span className={cn(
                           "text-base md:text-lg font-bold tracking-tighter transition-transform duration-300",
                           isSelected ? "scale-105" : "group-hover:scale-105"
                         )}>
                           {slot.time}
                         </span>
                         {slot.available && !isSelected && (
                           <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              กดเพื่อจอง
                           </span>
                         )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-0 right-0 p-1">
                           <div className="bg-white/20 rounded-full p-0.5">
                              <Check className="h-3 w-3 stroke-[4px]" />
                           </div>
                        </div>
                      )}
                      
                      {!slot.available && slot.bookingId && (
                        <div className="absolute inset-0 bg-muted/60 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[10px] font-black uppercase bg-background px-2 py-0.5 rounded-full shadow-sm">จองแล้ว</span>
                        </div>
                      )}
                    </Button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
