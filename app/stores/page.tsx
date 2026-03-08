import Link from "next/link"
import { ArrowRight, Store, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { db } from "@/lib/db"

async function getStores() {
  return await db.store.findMany({
    include: {
      owner: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          services: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export default async function StoresPage() {
  const stores = await getStores()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">ร้านค้าทั้งหมด</h1>
          <p className="text-muted-foreground">เลือกร้านที่ต้องการจองคิว</p>
        </div>

        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Store className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">ยังไม่มีร้านค้าในระบบ</h2>
            <p className="text-muted-foreground mt-1">ลองมาทีหลัง หรือเปิดร้านค้าของคุณเอง</p>
            <Link href="/register?role=OWNER" className="mt-4">
              <Button>เปิดร้านค้า</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Card key={store.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {store._count.services} บริการ
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{store.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {store.description || "ไม่มีคำอธิบาย"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>โดย {store.owner.name}</span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto pt-3 border-t border-border">
                  <Link href={`/stores/${store.id}`} className="w-full">
                    <Button className="w-full gap-2">
                      ดูรายละเอียด
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
