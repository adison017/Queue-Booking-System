import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getSession } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get store list for this owner
    const stores = await sql`
      SELECT id FROM stores WHERE owner_id = ${session.id}
    `

    if (stores.length === 0) {
      return NextResponse.json({
        total_bookings: 0,
        completed_bookings: 0,
        cancelled_bookings: 0,
        pending_bookings: 0,
        total_revenue: 0,
        by_store: [],
        by_date: [],
      })
    }

    const storeIds = stores.map((s: any) => s.id)

    // Get booking summary
    const summary = await sql`
      SELECT
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_bookings,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN services.price ELSE 0 END), 0) as total_revenue
      FROM bookings
      JOIN services ON bookings.service_id = services.id
      WHERE bookings.store_id = ANY(${storeIds})
    `

    // Get bookings by store
    const byStore = await sql`
      SELECT
        stores.id,
        stores.name,
        COUNT(bookings.id) as total_bookings,
        SUM(CASE WHEN bookings.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_bookings,
        COALESCE(SUM(CASE WHEN bookings.status = 'COMPLETED' THEN services.price ELSE 0 END), 0) as revenue
      FROM stores
      LEFT JOIN bookings ON stores.id = bookings.store_id
      LEFT JOIN services ON bookings.service_id = services.id
      WHERE stores.owner_id = ${session.id}
      GROUP BY stores.id, stores.name
      ORDER BY total_bookings DESC
    `

    // Get bookings by date (last 7 days)
    const byDate = await sql`
      SELECT
        DATE(bookings.created_at) as date,
        COUNT(*) as total_bookings,
        SUM(CASE WHEN bookings.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_bookings,
        COALESCE(SUM(CASE WHEN bookings.status = 'COMPLETED' THEN services.price ELSE 0 END), 0) as revenue
      FROM bookings
      JOIN services ON bookings.service_id = services.id
      WHERE bookings.store_id = ANY(${storeIds})
        AND bookings.created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(bookings.created_at)
      ORDER BY date DESC
    `

    return NextResponse.json({
      total_bookings: summary[0]?.total_bookings || 0,
      completed_bookings: summary[0]?.completed_bookings || 0,
      cancelled_bookings: summary[0]?.cancelled_bookings || 0,
      pending_bookings: summary[0]?.pending_bookings || 0,
      total_revenue: summary[0]?.total_revenue || 0,
      by_store: byStore,
      by_date: byDate,
    })
  } catch (error) {
    console.error('[v0] Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
