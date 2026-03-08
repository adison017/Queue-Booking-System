'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'CUSTOMER' | 'OWNER'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-10 w-10 mx-auto mb-4" />
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>ต้องเข้าสู่ระบบ</CardTitle>
            </div>
            <CardDescription>
              กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className="block">
              <Button className="w-full">เข้าสู่ระบบ</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>ไม่มีสิทธิ์เข้าถึง</CardTitle>
            </div>
            <CardDescription>
              คุณไม่มีสิทธิ์เข้าถึงหน้านี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="block">
              <Button className="w-full" variant="outline">กลับไปหน้าหลัก</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
