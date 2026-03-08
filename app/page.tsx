import Link from "next/link"
import { CalendarCheck, Clock, Shield, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { db } from "@/lib/db"

async function getStoreCount() {
  const count = await db.store.count()
  return count
}

export default async function HomePage() {
  const storeCount = await getStoreCount()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 py-24 text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium">
            <Store className="h-4 w-4" />
            {storeCount} ร้านค้าในระบบ
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-balance md:text-6xl">
            จองคิวง่าย ๆ<br />ที่ QueueNow
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-primary-foreground/80 text-balance md:text-xl">
            ระบบจองคิวออนไลน์ที่รองรับหลายร้าน ไม่ต้องรอคิวหน้าร้าน<br />
            เลือกเวลาที่สะดวก จองได้ทุกที่ทุกเวลา
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/stores">
              <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold">
                <Store className="h-5 w-5" />
                ดูร้านค้าทั้งหมด
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="gap-2 text-base font-semibold border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                สมัครสมาชิกฟรี
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-background">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-3xl font-bold text-balance">ทำไมต้องใช้ QueueNow?</h2>
          <p className="mb-12 text-center text-muted-foreground text-balance">ระบบจองคิวที่ออกแบบมาเพื่อทั้งลูกค้าและเจ้าของร้าน</p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: CalendarCheck,
                title: "จองง่าย รวดเร็ว",
                desc: "เลือกร้าน เลือกบริการ เลือกเวลา จบใน 3 ขั้นตอน ไม่ต้องรอคิวหน้าร้าน",
              },
              {
                icon: Clock,
                title: "จัดการเวลาได้",
                desc: "ดูตารางนัดหมายของตัวเอง ยกเลิกหรือแก้ไขได้ทุกเวลาผ่านระบบออนไลน์",
              },
              {
                icon: Shield,
                title: "ปลอดภัย น่าเชื่อถือ",
                desc: "ข้อมูลของคุณได้รับการปกป้องด้วยระบบเข้ารหัสมาตรฐานสากล",
              },
            ].map((f) => (
              <Card key={f.title} className="border-border">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for store owners */}
      <section className="border-t border-border bg-secondary/50 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Store className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-3 text-3xl font-bold text-balance">เปิดร้านกับเราวันนี้</h2>
          <p className="mb-8 text-muted-foreground leading-relaxed text-balance">
            สมัครเป็นเจ้าของร้าน สร้างร้าน เพิ่มบริการ และจัดการตารางนัดหมายได้ทันที
          </p>
          <Link href="/register?role=OWNER">
            <Button size="lg" className="gap-2 text-base font-semibold">
              <Store className="h-5 w-5" />
              เริ่มต้นเป็นเจ้าของร้าน
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
        © 2024 QueueNow — ระบบจองคิวออนไลน์
      </footer>
    </div>
  )
}
