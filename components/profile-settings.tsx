"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { User, Camera, Loader2, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function ProfileSettings() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileImageUrl || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync state when user data is loaded
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name)
      if (!previewUrl) setPreviewUrl(user.profileImageUrl || null)
    }
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("รูปภาพต้องมีขนาดไม่เกิน 2MB")
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("กรุณาระบุชื่อ")
      return
    }

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append("name", name)
      if (selectedFile) {
        formData.append("profileImage", selectedFile)
      }

      setUploadProgress(30)
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        body: formData,
      })

      setUploadProgress(70)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update profile")
      }

      setUploadProgress(100)
      toast.success("อัปเดตโปรไฟล์เรียบร้อยแล้ว")
      setTimeout(() => window.location.reload(), 1000) // Reload to refresh session
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "เกิดข้อผิดพลาดในการอัปเดต")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto border-2">
      <CardHeader>
        <CardTitle className="text-2xl">ตั้งค่าโปรไฟล์</CardTitle>
        <CardDescription>จัดการข้อมูลส่วนตัวและรูปโปรไฟล์ของคุณ</CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateProfile}>
        <CardContent className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full border-4 border-muted overflow-hidden bg-muted flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground/40" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white"
              >
                <Camera className="h-6 w-6" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">แนะนำเป็นรูปจัตุรัส ขนาดไม่เกิน 2MB</p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ชื่อที่แสดง</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ระบุชื่อของคุณ"
                className="font-medium"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">อีเมล (ไม่สามารถเปลี่ยนได้)</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted text-muted-foreground border-dashed"
              />
            </div>
          </div>

          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>กำลังอัปโหลด...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end pt-2 border-t bg-muted/30">
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px] gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            บันทึกการเปลี่ยนแปลง
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
