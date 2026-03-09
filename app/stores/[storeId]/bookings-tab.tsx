"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, User, DollarSign, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Booking {
  id: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  created_at: Date
  customer_name: string
  customer_email: string
  service_name: string
  price: number
  booking_date: Date
  start_time: string
  end_time: string
}

interface BookingsTabProps {
  storeId: number
  bookings: Booking[]
}

export function BookingsTab({ storeId, bookings }: BookingsTabProps) {
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all')

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      default: return null
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

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter.toUpperCase()
    
    if (!selectedDate) return matchesFilter
    
    const bDate = new Date(booking.booking_date)
    const isSameDay = 
      bDate.getDate() === selectedDate.getDate() &&
      bDate.getMonth() === selectedDate.getMonth() &&
      bDate.getFullYear() === selectedDate.getFullYear()
      
    return matchesFilter && isSameDay
  })

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/stores/${storeId}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' })
      })
      
      if (response.ok) {
        // Refresh bookings list
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to confirm booking:', error)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/stores/${storeId}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      
      if (response.ok) {
        // Refresh bookings list
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs & Date Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              การจอง ({filteredBookings.length})
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'ทั้งหมด' },
              { value: 'pending', label: 'รอยืนยัน' },
              { value: 'confirmed', label: 'ยืนยันแล้ว' },
              { value: 'cancelled', label: 'ยกเลิก' },
              { value: 'completed', label: 'เสร็จสิ้น' }
            ].map((filterOption) => (
              <Button
                key={filterOption.value}
                variant={filter === filterOption.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption.value as any)}
              >
                {filterOption.label}
              </Button>
            ))}
            {selectedDate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedDate(undefined)}
                className="text-muted-foreground ml-auto"
              >
                ล้างวันที่
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {filter === 'all' ? 'ยังไม่มีการจองในร้านนี้' : `ไม่มีการจอง${getStatusText(filter as any)}`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {getStatusText(booking.status)}
                        </div>
                      </Badge>
                      <span className="font-medium">{booking.service_name}</span>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{booking.customer_email}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(booking.booking_date).toLocaleDateString('th-TH')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.start_time} - {booking.end_time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">฿{booking.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {booking.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmBooking(booking.id)}
                          disabled={loading}
                        >
                          ยืนยัน
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={loading}
                        >
                          ยกเลิก
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost">
                      ดูรายละเอียด
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
