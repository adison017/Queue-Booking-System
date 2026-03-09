"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserRole } from "./actions"

interface RoleSelectProps {
  userId: number
  currentRole: "CUSTOMER" | "OWNER" | "ADMIN"
}

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (newRole: "CUSTOMER" | "OWNER" | "ADMIN") => {
    if (newRole === currentRole) return

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("อัปเดตสิทธิ์สำเร็จ")
      }
    })
  }

  return (
    <div className="w-32">
      <Select 
        defaultValue={currentRole} 
        onValueChange={handleRoleChange}
        disabled={isPending}
      >
        <SelectTrigger className="h-8 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CUSTOMER">ลูกค้า (CUSTOMER)</SelectItem>
          <SelectItem value="OWNER">เจ้าของร้าน (OWNER)</SelectItem>
          <SelectItem value="ADMIN">แอดมิน (ADMIN)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
