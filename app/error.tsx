'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>เกิดข้อผิดพลาด</CardTitle>
          </div>
          <CardDescription>
            {error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            ลองใหม่
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
