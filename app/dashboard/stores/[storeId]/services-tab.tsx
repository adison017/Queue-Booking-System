"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  id: number
  name: string
}

interface Service {
  id: number
  name: string
  duration_days: number
  duration_minutes: number
  price: number
  categoryId: number | null
  category_name?: string
}

interface ServiceList {
  id: number
  name: string
  duration_days: number
  duration_minutes: number
  price: number
  categoryId: number
}

interface Props {
  storeId: number
  services: Service[]
  categories: Category[]
}


function ServiceForm({ initial, categories, onSubmit, loading }: { initial: any; categories: Category[]; onSubmit: (data: any) => Promise<void>; loading: boolean }) {
  const [form, setForm] = useState(initial)
  const [serviceLists, setServiceLists] = useState<ServiceList[]>([])

  useEffect(() => {
    if (form.categoryId) {
      fetch(`/api/services/lists?categoryId=${form.categoryId}`)
        .then(res => res.json())
        .then(data => setServiceLists(data.serviceLists || []))
        .catch(err => console.error('Failed to fetch service lists:', err))
    } else {
      setServiceLists([])
    }
  }, [form.categoryId])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>หมวดหมู่</Label>
        <Select
          value={form.categoryId?.toString() || "0"}
          onValueChange={(val) => {
            const catId = val === "0" ? null : parseInt(val)
            setForm({ ...form, categoryId: catId, name: "", duration_days: 0, duration_minutes: 30, price: 0 })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกหมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">ทั่วไป (ไม่มีหมวดหมู่)</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>ชื่อบริการ</Label>
        <Select
          value={form.name}
          onValueChange={(val) => {
            const existingService = serviceLists.find(s => s.name === val)
            if (existingService) {
              setForm({ 
                ...form, 
                name: val, 
                duration_days: existingService.duration_days || 0,
                duration_minutes: existingService.duration_minutes, 
                price: existingService.price 
              })
            } else {
              setForm({ ...form, name: val })
            }
          }}
          disabled={!form.categoryId || serviceLists.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={!form.categoryId ? "กรุณาเลือกหมวดหมู่ก่อน" : "เลือกบริการ"} />
          </SelectTrigger>
          <SelectContent>
            {serviceLists.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>ระยะเวลา (วัน)</Label>
          <Input
            type="number"
            min={0}
            value={form.duration_days}
            onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>ระยะเวลา (นาที)</Label>
          <Input
            type="number"
            min={0}
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>ราคา (บาท)</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(form)} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          บันทึก
        </Button>
      </DialogFooter>
    </div>
  )
}

export function ServicesTab({ storeId, services, categories }: Props) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)

  const createService = async (data: { name: string; duration_days: number; duration_minutes: number; price: number; categoryId?: number | null }) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) { 
        try {
          const errorData = await res.json()
          toast.error(errorData.error || "เกิดข้อผิดพลาด")
        } catch {
          toast.error("เกิดข้อผิดพลาด")
        }
        return 
      }
      toast.success("เพิ่มบริการแล้ว")
      setCreateOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  const updateService = async (data: { name: string; duration_days: number; duration_minutes: number; price: number; categoryId?: number | null }) => {
    if (!editService) return
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/services/${editService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) { 
        try {
          const errorData = await res.json()
          toast.error(errorData.error || "เกิดข้อผิดพลาด")
        } catch {
          toast.error("เกิดข้อผิดพลาด")
        }
        return 
      }
      toast.success("อัปเดตบริการแล้ว")
      setEditService(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  const deleteService = async (serviceId: number) => {
    const res = await fetch(`/api/stores/${storeId}/services/${serviceId}`, { method: "DELETE" })
    if (!res.ok) { 
      try {
        const errorData = await res.json()
        toast.error(errorData.error || "เกิดข้อผิดพลาด")
      } catch {
        toast.error("เกิดข้อผิดพลาด")
      }
      return 
    }
    toast.success("ลบบริการแล้ว")
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">บริการทั้งหมด</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />เพิ่มบริการ</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>เพิ่มบริการใหม่</DialogTitle></DialogHeader>
            <ServiceForm
              initial={{ name: "", duration_days: 0, duration_minutes: 30, price: 0, categoryId: null }}
              categories={categories}
              onSubmit={createService}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl text-center">
          <p className="text-muted-foreground">ยังไม่มีบริการ กดปุ่มด้านบนเพื่อเพิ่ม</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((sv) => (
            <Card key={sv.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{sv.name}</p>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {sv.category_name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sv.duration_days > 0 ? `${sv.duration_days} วัน ` : ""}{sv.duration_minutes} นาที · ฿{Number(sv.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Dialog open={editService?.id === sv.id} onOpenChange={(o) => !o && setEditService(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditService(sv)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>แก้ไขบริการ</DialogTitle></DialogHeader>
                      <ServiceForm
                        initial={{
                          name: sv.name,
                          duration_days: sv.duration_days,
                          duration_minutes: sv.duration_minutes,
                          price: sv.price,
                          categoryId: sv.categoryId
                        }}
                        categories={categories}
                        onSubmit={updateService}
                        loading={loading}
                      />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/5">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ลบบริการ</AlertDialogTitle>
                        <AlertDialogDescription>ต้องการลบบริการ &quot;{sv.name}&quot; ใช่หรือไม่?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteService(sv.id)} className="bg-destructive text-white hover:bg-destructive/90">ลบ</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
