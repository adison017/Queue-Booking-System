import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code2, Database, Lock, Server } from 'lucide-react'

export default function ApiDocsPage() {
  const endpoints = [
    {
      category: 'Authentication',
      icon: Lock,
      endpoints: [
        { method: 'POST', path: '/api/auth/register', desc: 'สมัครสมาชิก' },
        { method: 'POST', path: '/api/auth/login', desc: 'เข้าสู่ระบบ' },
        { method: 'POST', path: '/api/auth/logout', desc: 'ออกจากระบบ' },
        { method: 'GET', path: '/api/auth/me', desc: 'ดูข้อมูลผู้ใช้ปัจจุบัน' },
      ],
    },
    {
      category: 'Stores',
      icon: Database,
      endpoints: [
        { method: 'GET', path: '/api/stores', desc: 'ดูร้านค้าทั้งหมด' },
        { method: 'GET', path: '/api/stores/[id]', desc: 'ดูรายละเอียดร้าน' },
        { method: 'POST', path: '/api/stores', desc: 'สร้างร้านใหม่ (OWNER)' },
        { method: 'PUT', path: '/api/stores/[id]', desc: 'แก้ไขร้าน (OWNER)' },
      ],
    },
    {
      category: 'Services',
      icon: Server,
      endpoints: [
        { method: 'GET', path: '/api/stores/[id]/services', desc: 'ดูบริการของร้าน' },
        { method: 'POST', path: '/api/stores/[id]/services', desc: 'เพิ่มบริการ (OWNER)' },
        { method: 'DELETE', path: '/api/stores/[id]/services/[sid]', desc: 'ลบบริการ (OWNER)' },
      ],
    },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Code2 className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">API Documentation</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              ดูเอกสารประกอบการใช้ API ของ QueueNow
            </p>
          </div>

          <div className="space-y-8">
            {endpoints.map((section) => {
              const IconComponent = section.icon
              return (
                <Card key={section.category}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-2xl">{section.category}</CardTitle>
                        <CardDescription>
                          Endpoints สำหรับจัดการ {section.category.toLowerCase()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.endpoints.map((endpoint, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                                    endpoint.method === 'GET'
                                      ? 'bg-blue-600'
                                      : endpoint.method === 'POST'
                                      ? 'bg-green-600'
                                      : endpoint.method === 'PUT'
                                      ? 'bg-yellow-600'
                                      : 'bg-red-600'
                                  }`}
                                >
                                  {endpoint.method}
                                </span>
                                <code className="font-mono text-sm font-medium">
                                  {endpoint.path}
                                </code>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {endpoint.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  วิธีการขอ authenticated requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">JWT Token</p>
                    <p className="text-sm text-muted-foreground">
                      Token ถูกเก็บใน HTTP-only cookie หลังการ login
                      ระบบจะส่งไปอัตโนมัติในทุก request ที่ต้องการ authentication
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Role-based Access</p>
                    <p className="text-sm text-muted-foreground">
                      CUSTOMER: สามารถจองคิว ดูประวัติการจอง
                      <br />
                      OWNER: สามารถจัดการร้าน บริการ และการจองได้
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 p-6 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground">
              <strong>หมายเหตุ:</strong> สำหรับรายละเอียดเพิ่มเติม โปรดดู{' '}
              <code className="bg-background px-2 py-1 rounded text-xs">README.md</code> ในโปรเจค
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
