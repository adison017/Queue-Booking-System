'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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

const COLORS = ['#10b981', '#f59e0b', '#ef4444']

export function DashboardAnalytics() {
  const { user } = useAuth()
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
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !analytics || analytics.total_bookings === 0) {
    return null // Do not show charts if there is no data or an error
  }

  const statusData = [
    { name: 'สำเร็จ', value: analytics.completed_bookings, color: '#10b981' },
    { name: 'รอดำเนินการ', value: analytics.pending_bookings, color: '#f59e0b' },
    { name: 'ยกเลิก', value: analytics.cancelled_bookings, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Pie Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>สถานะการจอง</CardTitle>
            <CardDescription>การแจกแจงตามประเภทสถานะ</CardDescription>
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
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>รายได้ตามร้าน</CardTitle>
            <CardDescription>รายไดรวมจากแต่ละร้านค้าที่คุณดูแล</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.by_store}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => formatThaiCurrency(value as number)} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Booking Trend */}
      {analytics.by_date && analytics.by_date.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>แนวโน้มการจอง (7 วันที่ผ่านมา)</CardTitle>
            <CardDescription>จำนวนการจองและรายได้แบบรายวัน</CardDescription>
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
                  strokeWidth={3}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  name="รายได้"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
