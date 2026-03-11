import Link from "next/link"
import { Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { StoreCard } from "@/components/store-card"
import { Badge } from "@/components/ui/badge"
import { StoresSearch } from "@/components/stores-search"

async function getStores(search?: string, category?: string) {
  const where: any = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } }
    ]
  }

  const stores = await db.store.findMany({
    where,
    include: {
      owner: {
        select: {
          name: true
        }
      },
      services: {
        take: 3,
        select: {
          id: true,
          name: true,
          price: true
        }
      },
      reviews: {
        select: {
          rating: true
        }
      },
      _count: {
        select: {
          services: true,
          reviews: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  return stores.map(store => {
    const totalRating = store.reviews.reduce((acc, rev) => acc + rev.rating, 0)
    const averageRating = store.reviews.length > 0 ? (totalRating / store.reviews.length).toFixed(1) : "0.0"
    
    return {
      ...store,
      profileImageUrl: (store as any).profileImageUrl as string | null,
      coverImageUrl: (store as any).coverImageUrl as string | null,
      rating: averageRating,
      reviewCount: store._count.reviews,
      services: store.services.map(s => ({
        ...s,
        price: Number(s.price)
      }))
    }
  })
}

async function getCategories() {
  return await db.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })
}

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams
  const [stores, categories] = await Promise.all([
    getStores(q, category),
    getCategories()
  ])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground tracking-tight">
          ค้นหา<span className="text-primary">ร้านค้าและบริการ</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          ค้นหาร้านค้าที่ต้องการและจองคิวออนไลน์ได้ทันที เข้าถึงบริการที่หลากหลายจากร้านค้าชั้นนำ
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="mb-12 space-y-6">
        <StoresSearch defaultValue={q} />

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/stores">
            <Badge 
              variant={!category ? "default" : "outline"}
              className={`px-4 py-2 cursor-pointer text-sm rounded-full transition-all ${!category ? 'bg-primary text-primary-foreground' : 'hover:border-primary/50'}`}
            >
              ทั้งหมด
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/stores?category=${cat.id}${q ? `&q=${q}` : ''}`}>
              <Badge 
                variant={category === String(cat.id) ? "default" : "outline"}
                className={`px-4 py-2 cursor-pointer text-sm rounded-full transition-all ${category === String(cat.id) ? 'bg-primary text-primary-foreground' : 'hover:border-primary/50'}`}
              >
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-primary/20 rounded-[3rem] bg-primary/5">
          <div className="h-20 w-20 text-primary/30 mb-6 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-3xl">
            ?
          </div>
          <h2 className="text-2xl font-bold text-foreground">ไม่พบร้านค้าที่คุณค้นหา</h2>
          <p className="text-muted-foreground mt-2 mb-8 text-lg">ลองค้นหาด้วยคำอื่นๆ หรือเลือกหมวดหมู่อื่น</p>
          <Link href="/stores">
            <Button variant="outline" className="rounded-xl px-8 h-12 font-bold border-primary/20 hover:bg-primary/5 text-primary">
              แสดงร้านค้าทั้งหมด
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store as any} />
          ))}
        </div>
      )}
    </div>
  )
}
