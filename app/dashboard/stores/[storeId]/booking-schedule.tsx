"use client"

import { useState, useEffect } from "react"
import { BookingScheduleTable } from "@/components/booking-schedule-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react"

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

interface BookingScheduleProps {
  storeId: number
}

export function BookingSchedule({ storeId }: BookingScheduleProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stores/${storeId}/bookings`)
      const data = await response.json()
      
      if (data.bookings) {
        setBookings(data.bookings.map((booking: any) => ({
          id: booking.id,
          bookingDate: new Date(booking.booking_date),
          startTime: booking.start_time,
          endTime: booking.end_time,
          status: booking.status,
          serviceName: booking.service_name,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          price: booking.price
        })))
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [storeId])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              ตารางการจองบริการ
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchBookings}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              รีเฟรช
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 && !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีการจองในร้านนี้</p>
            </div>
          ) : (
            <BookingScheduleTable 
              storeId={storeId} 
              bookings={bookings} 
              onRefresh={fetchBookings}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
