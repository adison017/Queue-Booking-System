"use client"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Camera, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { updateStore } from "./actions"

interface SettingsTabProps {
  store: {
    id: number
    name: string
    description: string | null
    location: string | null
    profileImageUrl: string | null
    coverImageUrl: string | null
    images: { id: number; url: string }[]
  }
}

export function SettingsTab({ store }: SettingsTabProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [form, setForm] = useState({
    name: store.name,
    description: store.description || "",
    location: store.location || "",
  })

  // Previews (can be Cloudinary URLs or Blob URLs)
  const [profilePreview, setProfilePreview] = useState<string | null>(store.profileImageUrl)
  const [coverPreview, setCoverPreview] = useState<string | null>(store.coverImageUrl)

  // Actual File objects to be uploaded
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  // Tracking removals
  const [removeProfile, setRemoveProfile] = useState(false)
  const [removeCover, setRemoveCover] = useState(false)

  // Multiple Preview Images
  const [existingImages, setExistingImages] = useState(store.images)
  const [newImagePreviews, setNewImagePreviews] = useState<{file: File, preview: string}[]>([])
  const [removeImageIds, setRemoveImageIds] = useState<number[]>([])

  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const previewsInputRef = useRef<HTMLInputElement>(null)

  const MAX_IMAGES = 10
  const totalImagesCount = existingImages.length + newImagePreviews.length

  // Cleanup blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (profilePreview?.startsWith('blob:')) URL.revokeObjectURL(profilePreview)
      if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
      newImagePreviews.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [profilePreview, coverPreview, newImagePreviews])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    if (type === 'profile') {
      if (profilePreview?.startsWith('blob:')) URL.revokeObjectURL(profilePreview)
      setProfilePreview(previewUrl)
      setProfileFile(file)
      setRemoveProfile(false)
    } else {
      if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
      setCoverPreview(previewUrl)
      setCoverFile(file)
      setRemoveCover(false)
    }
  }

  const handleRemoveImage = (type: 'profile' | 'cover') => {
    if (type === 'profile') {
      if (profilePreview?.startsWith('blob:')) URL.revokeObjectURL(profilePreview)
      setProfilePreview(null)
      setProfileFile(null)
      setRemoveProfile(true)
      if (profileInputRef.current) profileInputRef.current.value = ''
    } else {
      if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
      setCoverPreview(null)
      setCoverFile(null)
      setRemoveCover(true)
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

  const handleRemoveExistingImage = (id: number) => {
    setExistingImages(prev => prev.filter(img => img.id !== id))
    setRemoveImageIds(prev => [...prev, id])
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
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("description", form.description)
      formData.append("location", form.location)

      if (profileFile) {
        formData.append("profileImage", profileFile)
      }
      if (coverFile) {
        formData.append("coverImage", coverFile)
      }

      newImagePreviews.forEach(img => {
        formData.append("previewImages", img.file)
      })

      removeImageIds.forEach(id => {
        formData.append("removeImageIds", String(id))
      })

      formData.append("removeProfile", String(removeProfile))
      formData.append("removeCover", String(removeCover))

      const xhr = new XMLHttpRequest()
      xhr.open("PATCH", `/api/stores/${store.id}`, true)

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
            toast.success("บันทึกการตั้งค่าสำเร็จ")
            router.refresh()
            // Reset file states as they are now saved
            setProfileFile(null)
            setCoverFile(null)
            setNewImagePreviews([])
            setRemoveImageIds([])
          } else {
            toast.error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล")
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

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลร้านค้า</CardTitle>
          <CardDescription>จัดการข้อมูลพื้นฐานและรูปภาพของร้านค้าคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">ชื่อร้าน</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="location">ที่ตั้งร้าน</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="ที่ตั้งร้าน หรือลิงก์ Google Maps"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  * หากใส่ลิงก์ Google Maps ระบบจะเปลี่ยนเป็นปุ่มให้ลูกค้ากดดูแผนที่ได้ทันที
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              <div className="space-y-2">
                <Label>รูปโปรไฟล์ร้าน</Label>
                <div className="relative group overflow-hidden rounded-xl aspect-square bg-muted flex items-center justify-center border-2 border-dashed border-border">
                  {profilePreview ? (
                    <>
                      <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage('profile')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                  <label className={cn(
                    "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-sm font-medium",
                    profilePreview && "bg-black/20"
                  )}>
                    {profilePreview ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
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

              <div className="space-y-2">
                <Label>รูปปกร้าน</Label>
                <div className="relative group overflow-hidden rounded-xl aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-border">
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage('cover')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                  <label className={cn(
                    "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-sm font-medium",
                    coverPreview && "bg-black/20"
                  )}>
                    {coverPreview ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
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

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">รูปพรีวิวร้านค้า ({totalImagesCount}/{MAX_IMAGES})</Label>
                {totalImagesCount < MAX_IMAGES && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => previewsInputRef.current?.click()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มรูปพรีวิว
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

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Existing Images */}
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                    <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveExistingImage(img.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {/* New Image Previews */}
                {newImagePreviews.map((img, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border-2 border-primary/30 shadow-sm">
                    <img src={img.preview} alt="New Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[8px] px-1 rounded font-bold uppercase tracking-wider">New</div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {/* Empty Slots */}
                {totalImagesCount === 0 && (
                  <div className="col-span-full py-8 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl text-muted-foreground bg-muted/30">
                    <Camera className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">ยังไม่มีรูปพรีวิวร้านค้า</p>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground italic">* คุณสามารถเพิ่มรูปบรรยากาศร้านค้าได้สูงสุด 10 รูป เพื่อให้ลูกค้าตัดสินใจง่ายขึ้น</p>
            </div>

            {loading && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  <span>กำลังอัปโหลดข้อมูล...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึกการเปลี่ยนแปลง
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
