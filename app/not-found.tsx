'use client'

import Link from 'next/link'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'

export default function NotFound() {
  const handleBack = () => {
    window.history.back()
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-4xl font-bold">404</CardTitle>
            <CardDescription>ไม่พบหน้าที่คุณค้นหา</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ขออภัย หน้านี้ไม่มีอยู่ในระบบ อาจจะถูกลบหรือย้ายไปแล้ว
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/">
                <Button className="w-full gap-2" variant="default">
                  <Home className="h-4 w-4" />
                  กลับไปหน้าหลัก
                </Button>
              </Link>
              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                ย้อนกลับ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
