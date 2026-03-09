import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('categoryId')

  const serviceLists = await db.serviceList.findMany({
    where: categoryId ? {
      categoryId: parseInt(categoryId)
    } : undefined,
    orderBy: {
      name: 'asc'
    }
  })

  const formattedServiceLists = serviceLists.map(serviceList => ({
    id: serviceList.id,
    name: serviceList.name,
    duration_days: serviceList.durationDays,
    duration_minutes: serviceList.durationMinutes,
    price: Number(serviceList.price),
    categoryId: serviceList.categoryId
  }))

  return NextResponse.json({ serviceLists: formattedServiceLists })
}
