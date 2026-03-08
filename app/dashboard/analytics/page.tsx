'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DollarSign, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import { BookingListSkeleton } from '@/components/loading-skeleton'
import { formatThaiDate, formatThaiCurrency } from '@/lib/date-utils'

interface BookingSummary {
  total_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  pending_bookings: number
  total_revenue: number
  by_store: any[]
  by_date: any[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const [analytics, setAnalytics] = useState<BookingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/bookings-summary')
        if (!response.ok) throw new Error('Failed to fetch analytics')
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [user])

  if (loading || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BookingListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            ไม่มีข้อมูลการวิเคราะห์
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusData = [
    { name: 'สำเร็จ', value: analytics.completed_bookings, color: '#10b981' },
    { name: 'รอดำเนินการ', value: analytics.pending_bookings, color: '#f59e0b' },
    { name: 'ยกเลิก', value: analytics.cancelled_bookings, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">การวิเคราะห์ข้อมูล</h1>
        <p className="text-muted-foreground mt-2">ดูสรุปการจองและรายได้ของคุณ</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              รวมการจอง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_bookings}</div>
            <p className="text-xs text-muted-foreground mt-1">จำนวนการจองทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              สำเร็จ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completed_bookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.total_bookings > 0
                ? `${((analytics.completed_bookings / analytics.total_bookings) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              รอดำเนินการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pending_bookings}</div>
            <p className="text-xs text-muted-foreground mt-1">รอการยืนยัน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              รายได้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatThaiCurrency(analytics.total_revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">จากการจองที่สำเร็จ</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะการจอง</CardTitle>
            <CardDescription>การแจกแจงตามสถานะ</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Store */}
        <Card>
          <CardHeader>
            <CardTitle>รายได้ตามร้าน</CardTitle>
            <CardDescription>รายได้จากแต่ละร้านค้า</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.by_store}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => formatThaiCurrency(value as number)} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Booking Trend */}
      {analytics.by_date && analytics.by_date.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มการจอง (7 วันที่ผ่านมา)</CardTitle>
            <CardDescription>จำนวนการจองและรายได้รายวัน</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.by_date}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatThaiDate(new Date(value), true)}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(value) => formatThaiDate(new Date(value))}
                  formatter={(value) => value}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="total_bookings" 
                  stroke="#3b82f6" 
                  name="จำนวนการจอง"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  name="รายได้"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
