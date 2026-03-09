import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Store, Users } from "lucide-react"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteStoreButton } from "./delete-store-button"

async function getAdminStores() {
  return await db.store.findMany({
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        }
      },
      _count: {
        select: {
          services: true,
          bookings: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export default async function ManageStoresPage() {
  const stores = await getAdminStores()

  return (
    <div>
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">จัดการร้านค้า</h1>
          <p className="text-muted-foreground mt-1">ตรวจสอบและลบร้านค้าบนแพลตฟอร์ม</p>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-muted/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            รายชื่อร้านค้าทั้งหมด
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">ชื่อร้านค้า</th>
                  <th className="px-6 py-4 font-medium">เจ้าของร้าน</th>
                  <th className="px-6 py-4 font-medium text-center">จำนวนบริการ</th>
                  <th className="px-6 py-4 font-medium text-center">ยอดจองรวม</th>
                  <th className="px-6 py-4 font-medium">วันที่สร้าง</th>
                  <th className="px-6 py-4 font-medium text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stores.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      ไม่มีร้านค้าในระบบ
                    </td>
                  </tr>
                )}
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{store.name}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div>{store.owner.name}</div>
                        <div className="text-xs text-muted-foreground">{store.owner.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">{store._count.services}</td>
                    <td className="px-6 py-4 text-center">{store._count.bookings}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(store.createdAt), "d MMM yyyy", { locale: th })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DeleteStoreButton storeId={store.id} storeName={store.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
