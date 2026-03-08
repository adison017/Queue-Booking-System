import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"

const statusConfig: Record<Status, { label: string; className: string }> = {
  PENDING:   { label: "รอยืนยัน",  className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "ยืนยันแล้ว", className: "bg-blue-100 text-blue-800 border-blue-200" },
  CANCELLED: { label: "ยกเลิกแล้ว", className: "bg-red-100 text-red-800 border-red-200" },
  COMPLETED: { label: "เสร็จสิ้น",  className: "bg-green-100 text-green-800 border-green-200" },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? { label: status, className: "" }
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
