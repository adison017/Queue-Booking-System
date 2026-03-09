import Link from "next/link"
import { Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { StoreCard } from "@/components/store-card"

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
    <>
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </>
  )
}
