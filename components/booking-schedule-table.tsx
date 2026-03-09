"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, isSameDay, isWithinInterval } from "date-fns"
import { th } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, CalendarDays, RefreshCw } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Booking {
  id: number
  bookingDate: Date
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  serviceName: string
  customerName: string
  customerEmail: string
  price: number
}

interface BookingScheduleTableProps {
  storeId: number
  bookings: Booking[]
  onRefresh?: () => void
}

export function BookingScheduleTable({ storeId, bookings, onRefresh }: BookingScheduleTableProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING': return 'รอการยืนยัน'
      case 'CONFIRMED': return 'ยืนยันแล้ว'
      case 'CANCELLED': return 'ยกเลิก'
      case 'COMPLETED': return 'เสร็จสิ้น'
      default: return status
    }
  }

  // Group bookings by date and time slot
  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.bookingDate), date)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  // Generate time slots from 08:00 to 20:00
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2)
    const minute = i % 2 === 0 ? '00' : '30'
    return `${hour.toString().padStart(2, '0')}:${minute}`
  })

  const handlePrevWeek = () => setCurrentWeek(prev => addDays(prev, -7))
  const handleNextWeek = () => setCurrentWeek(prev => addDays(prev, 7))

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              ตารางการจอง - สัปดาห์ {format(weekStart, "w", { locale: th })} ปี {format(weekStart, "yyyy", { locale: th })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>ไปที่วันที่</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={currentWeek}
                    onSelect={(date) => date && setCurrentWeek(date)}
                    initialFocus
                    locale={th}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
                วันนี้
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Days Header */}
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="text-sm font-medium text-muted-foreground">เวลา</div>
            {weekDays.map((day, index) => {
              const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์']
              const isToday = isSameDay(day, new Date())
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
              
              return (
                <div 
                  key={index} 
                  className={cn(
                    "text-center p-2 rounded-lg border",
                    isToday && "bg-primary/10 border-primary",
                    isPast && "opacity-50"
                  )}
                >
                  <div className="text-sm font-medium">{dayNames[index]}</div>
                  <div className={cn(
                    "text-xs",
                    isToday && "text-primary font-bold"
                  )}>
                    {format(day, "d/MM")}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 gap-2">
                {/* Time Column */}
                <div className="text-sm font-medium text-muted-foreground py-2 text-right pr-2">
                  {time}
                </div>
                
                {/* Days Columns */}
                {weekDays.map((day, dayIndex) => {
                  const dayBookings = getBookingsForDate(day)
                  const bookingAtTime = dayBookings.find(booking => 
                    booking.startTime === time || 
                    (booking.startTime < time && booking.endTime > time)
                  )

                  const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))

                  return (
                    <div 
                      key={dayIndex} 
                      className={cn(
                        "min-h-[60px] p-1 border rounded-md",
                        isPast && "opacity-50"
                      )}
                    >
                      {bookingAtTime ? (
                        <div className="space-y-1">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs w-full justify-start", getStatusColor(bookingAtTime.status))}
                          >
                            {getStatusText(bookingAtTime.status)}
                          </Badge>
                          <div className="text-xs">
                            <div className="font-medium truncate">{bookingAtTime.serviceName}</div>
                            <div className="text-muted-foreground truncate">
                              {bookingAtTime.customerName}
                            </div>
                            <div className="text-muted-foreground">
                              {bookingAtTime.startTime} - {bookingAtTime.endTime}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                          ว่าง
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              รายละเอียดการจอง - {format(selectedDate, "d MMMM yyyy", { locale: th })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getBookingsForDate(selectedDate).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        {getStatusText(booking.status)}
                      </Badge>
                      <span className="font-medium">{booking.serviceName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>ลูกค้า: {booking.customerName} ({booking.customerEmail})</div>
                      <div>เวลา: {booking.startTime} - {booking.endTime}</div>
                      <div>ราคา: ฿{booking.price.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'PENDING' && (
                      <Button size="sm" variant="outline">
                        ยืนยัน
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      ดูรายละเอียด
                    </Button>
                  </div>
                </div>
              ))}
              {getBookingsForDate(selectedDate).length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  ไม่มีการจองในวันนี้
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">สถานะการจอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const).map((status) => (
              <Badge key={status} variant="outline" className={getStatusColor(status)}>
                {getStatusText(status)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
