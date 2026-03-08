"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"
import { CalendarClock, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface Slot {
  id: number
  slot_time: string
  is_available: boolean
}

interface Props {
  storeId: number
  slots: Slot[]
}

export function SlotsTab({ storeId, slots }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slotTime, setSlotTime] = useState("")

  const createSlot = async () => {
    if (!slotTime) { toast.error("กรุณาเลือกเวลา"); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_time: new Date(slotTime).toISOString() }),
      })
      if (!res.ok) { toast.error((await res.json()).error); return }
      toast.success("เพิ่มช่วงเวลาแล้ว")
      setOpen(false)
      setSlotTime("")
      router.refresh()
    } finally { setLoading(false) }
  }

  const deleteSlot = async (slotId: number) => {
    const res = await fetch(`/api/stores/${storeId}/slots/${slotId}`, { method: "DELETE" })
    if (!res.ok) { toast.error("เกิดข้อผิดพลาด"); return }
    toast.success("ลบช่วงเวลาแล้ว")
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">ช่วงเวลาให้บริการ</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />เพิ่มช่วงเวลา</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>เพิ่มช่วงเวลาให้บริการ</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>วันและเวลา</Label>
                <Input
                  type="datetime-local"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <DialogFooter>
                <Button onClick={createSlot} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  เพิ่มช่วงเวลา
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl text-center">
          <CalendarClock className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">ยังไม่มีช่วงเวลา กดปุ่มด้านบนเพื่อเพิ่ม</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {slots.map((slot) => (
            <Card key={slot.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CalendarClock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">
                      {format(new Date(slot.slot_time), "EEEE", { locale: th })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(slot.slot_time), "d MMM yyyy · HH:mm น.", { locale: th })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={slot.is_available
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {slot.is_available ? "ว่าง" : "ถูกจอง"}
                  </Badge>
                  {slot.is_available && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/5">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ลบช่วงเวลา</AlertDialogTitle>
                          <AlertDialogDescription>ต้องการลบช่วงเวลานี้ใช่หรือไม่?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSlot(slot.id)} className="bg-destructive text-white hover:bg-destructive/90">ลบ</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
