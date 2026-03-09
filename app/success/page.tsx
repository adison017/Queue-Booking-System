import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FloatingNav } from "@/components/floating-nav"
import { AppHeader } from "@/components/app-header"

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <FloatingNav />
      <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">สำเร็จ!</CardTitle>
            <CardDescription>การดำเนินการของคุณเสร็จสมบูรณ์แล้ว</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              ขอบคุณที่ใช้งาน QueueNow
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/stores">
                <Button className="w-full gap-2" variant="default">
                  ค้นหาร้านค้า
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full" variant="outline">
                  กลับไปหน้าหลัก
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
