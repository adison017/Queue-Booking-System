"use client"

import { useState } from "react"
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

interface Service {
  id: number
  name: string
  duration_minutes: number
  price: number
}

interface Props {
  storeId: number
  services: Service[]
}

function ServiceForm({
  initial,
  onSubmit,
  loading,
}: {
  initial: { name: string; duration_minutes: number; price: number }
  onSubmit: (data: { name: string; duration_minutes: number; price: number }) => void
  loading: boolean
}) {
  const [form, setForm] = useState(initial)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>ชื่อบริการ</Label>
        <Input
          placeholder="เช่น ตัดผม"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>ระยะเวลา (นาที)</Label>
          <Input
            type="number"
            min={1}
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
          />
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

export function ServicesTab({ storeId, services }: Props) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)

  const createService = async (data: { name: string; duration_minutes: number; price: number }) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error); return }
      toast.success("เพิ่มบริการแล้ว")
      setCreateOpen(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  const updateService = async (data: { name: string; duration_minutes: number; price: number }) => {
    if (!editService) return
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/services/${editService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) { toast.error((await res.json()).error); return }
      toast.success("อัปเดตบริการแล้ว")
      setEditService(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  const deleteService = async (serviceId: number) => {
    const res = await fetch(`/api/stores/${storeId}/services/${serviceId}`, { method: "DELETE" })
    if (!res.ok) { toast.error("เกิดข้อผิดพลาด"); return }
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
            <ServiceForm initial={{ name: "", duration_minutes: 30, price: 0 }} onSubmit={createService} loading={loading} />
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
                <div>
                  <p className="font-medium">{sv.name}</p>
                  <p className="text-sm text-muted-foreground">{sv.duration_minutes} นาที · ฿{Number(sv.price).toLocaleString()}</p>
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
                        initial={{ name: sv.name, duration_minutes: sv.duration_minutes, price: sv.price }}
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
