"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { deleteStore } from "./actions"

interface DeleteStoreButtonProps {
  storeId: number
  storeName: string
}

export function DeleteStoreButton({ storeId, storeName }: DeleteStoreButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteStore(storeId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("ลบร้านค้าสำเร็จ")
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" disabled={isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบร้านค้า?</AlertDialogTitle>
          <AlertDialogDescription>
            การดำเนินการนี้ไม่สามารถย้อนกลับได้ ร้านค้า <b>{storeName}</b> รวมถึงบริการ, ช่วงเวลาว่าง และข้อมูลการจองทั้งหมดจะถูกลบออกจากระบบทันที
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "กำลังลบ..." : "ยืนยันการลบ"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
