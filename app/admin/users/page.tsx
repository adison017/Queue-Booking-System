import { format } from "date-fns"
import { th } from "date-fns/locale"
import { ShieldAlert, Users } from "lucide-react"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleSelect } from "./role-select"

async function getUsers() {
  return await db.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export default async function ManageUsersPage() {
  const users = await getUsers()

  return (
    <div>
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">จัดการผู้ใช้งาน</h1>
          <p className="text-muted-foreground mt-1">ดูและจัดการสิทธิ์ของบัญชีทั้งหมดในระบบ</p>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-muted/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            รายชื่อผู้ใช้งานระบบ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">ชื่อ</th>
                  <th className="px-6 py-4 font-medium">อีเมล</th>
                  <th className="px-6 py-4 font-medium">สิทธิ์การใช้งาน (Role)</th>
                  <th className="px-6 py-4 font-medium">วันที่สมัคร</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      {/* Only admins should be able to change roles.
                          We pass the component their id and current role. */}
                      <RoleSelect userId={user.id} currentRole={user.role as any} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(user.createdAt), "d MMM yyyy", { locale: th })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
