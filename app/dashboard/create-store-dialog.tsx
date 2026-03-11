"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus, Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function CreateStoreDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [form, setForm] = useState({ name: "", description: "", location: "" })
  
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [newImagePreviews, setNewImagePreviews] = useState<{file: File, preview: string}[]>([])

  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const previewsInputRef = useRef<HTMLInputElement>(null)

  const MAX_IMAGES = 10
  const totalImagesCount = newImagePreviews.length

  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [profilePreview, coverPreview])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    if (type === 'profile') {
      if (profilePreview) URL.revokeObjectURL(profilePreview)
      setProfilePreview(previewUrl)
      setProfileFile(file)
    } else {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      setCoverPreview(previewUrl)
      setCoverFile(file)
    }
  }

  const handleRemoveImage = (type: 'profile' | 'cover') => {
    if (type === 'profile') {
      if (profilePreview) URL.revokeObjectURL(profilePreview)
      setProfilePreview(null)
      setProfileFile(null)
      if (profileInputRef.current) profileInputRef.current.value = ''
    } else {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      setCoverPreview(null)
      setCoverFile(null)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  const handleMultipleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = MAX_IMAGES - totalImagesCount
    if (remainingSlots <= 0) {
      toast.error(`คุณสามารถเพิ่มรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`)
      return
    }

    const filesToAdd = files.slice(0, remainingSlots)
    const newPreviews = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setNewImagePreviews(prev => [...prev, ...newPreviews])
    if (files.length > remainingSlots) {
      toast.warning(`เพิ่มได้เพียง ${remainingSlots} รูป เนื่องจากจำกัดที่ ${MAX_IMAGES} รูป`)
    }
  }

  const handleRemoveNewImage = (index: number) => {
    setNewImagePreviews(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("กรุณากรอกชื่อร้าน")
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("description", form.description)
      formData.append("location", form.location)
      if (profileFile) formData.append("profileImage", profileFile)
      if (coverFile) formData.append("coverImage", coverFile)
      newImagePreviews.forEach(img => {
        formData.append("previewImages", img.file)
      })

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/stores", true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percent)
        }
      }

      xhr.onload = () => {
        setLoading(false)
        setUploadProgress(0)
        
        try {
          const data = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            toast.success("สร้างร้านค้าสำเร็จ!")
            setOpen(false)
            resetForm()
            router.refresh()
          } else {
            toast.error(data.error || "เกิดข้อผิดพลาดในการสร้างร้านค้า")
          }
        } catch (e) {
          toast.error("เกิดข้อผิดพลาดในการประมวลผลข้อมูล")
        }
      }

      xhr.onerror = () => {
        setLoading(false)
        setUploadProgress(0)
        toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
      }

      xhr.send(formData)
    } catch (error) {
      setLoading(false)
      setUploadProgress(0)
      toast.error("เกิดข้อผิดพลาดในการเตรียมข้อมูล")
    }
  }

  const resetForm = () => {
    setForm({ name: "", description: "", location: "" })
    if (profilePreview) URL.revokeObjectURL(profilePreview)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setProfilePreview(null)
    setCoverPreview(null)
    setProfileFile(null)
    setCoverFile(null)
    newImagePreviews.forEach(img => URL.revokeObjectURL(img.preview))
    setNewImagePreviews([])
    if (profileInputRef.current) profileInputRef.current.value = ''
    if (coverInputRef.current) coverInputRef.current.value = ''
    if (previewsInputRef.current) previewsInputRef.current.value = ''
    setUploadProgress(0)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          สร้างร้านค้า
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้างร้านค้าใหม่</DialogTitle>
          <DialogDescription>กรอกข้อมูลร้านค้าของคุณ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-name">ชื่อร้าน *</Label>
            <Input
              id="store-name"
              placeholder="เช่น Bangkok Barber"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-desc">คำอธิบายร้าน</Label>
            <Textarea
              id="store-desc"
              placeholder="อธิบายบริการของร้านคุณ..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-location">ที่ตั้งร้าน</Label>
            <Input
              id="store-location"
              placeholder="ที่ตั้งร้าน หรือลิงก์ Google Maps"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pb-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">รูปโปรไฟล์ร้าน</Label>
              <div className="relative group overflow-hidden rounded-xl aspect-square bg-muted flex items-center justify-center border-2 border-dashed border-border">
                {profilePreview ? (
                  <>
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage('profile')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-medium">
                  เลือกรูป
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, 'profile')}
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">รูปปกร้าน</Label>
              <div className="relative group overflow-hidden rounded-xl aspect-square bg-muted flex items-center justify-center border-2 border-dashed border-border">
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage('cover')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-medium">
                  เลือกรูป
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, 'cover')}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">รูปบรรยากาศร้าน ({totalImagesCount}/{MAX_IMAGES})</Label>
              {totalImagesCount < MAX_IMAGES && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] px-2"
                  onClick={() => previewsInputRef.current?.click()}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  เพิ่มรูป
                </Button>
              )}
              <input
                ref={previewsInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleMultipleImageChange}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {newImagePreviews.map((img, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border/50">
                  <img src={img.preview} alt="New Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full scale-75"
                    onClick={() => handleRemoveNewImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {totalImagesCount === 0 && (
                <div className="col-span-4 py-4 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-lg text-muted-foreground bg-muted/20">
                  <p className="text-[10px]">ยังไม่มีรูปพรีวิว</p>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-300">
              <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <span>กำลังอัปโหลดข้อมูล...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5" />
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              สร้างร้าน
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
