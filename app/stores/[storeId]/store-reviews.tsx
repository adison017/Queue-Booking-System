"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"
import { Star, MessageSquare, User, Image as ImageIcon, Send, Loader2, Plus, X, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ReviewImage {
  id: number
  url: string
}

interface ReviewReply {
  id: number
  comment: string
  createdAt: string
}

interface Review {
  id: number
  rating: number
  comment: string | null
  createdAt: string
  user: {
    name: string
    profileImageUrl: string | null
  }
  images: ReviewImage[]
  reply: ReviewReply | null
}

interface Booking {
  id: number
  service_name: string
  booking_date: string | Date
}

interface Props {
  storeId: number
}

export function StoreReviews({ storeId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [canReviewBookings, setCanReviewBookings] = useState<Booking[]>([])
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  
  // Form state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [reviewsRes, eligibilityRes] = await Promise.all([
        fetch(`/api/stores/${storeId}/reviews`),
        fetch(`/api/stores/${storeId}/reviews/eligibility`)
      ])
      
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json()
        setReviews(reviewsData)
      }
      
      if (eligibilityRes.ok) {
        const eligibilityData = await eligibilityRes.json()
        setCanReviewBookings(eligibilityData)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [storeId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      toast.error("อัปโหลดรูปภาพได้สูงสุด 5 รูป")
      return
    }

    setImages(prev => [...prev, ...files])
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...urls])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!rating) return
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("rating", rating.toString())
      formData.append("comment", comment)
      if (selectedBooking) {
        formData.append("bookingId", selectedBooking.id.toString())
      }
      images.forEach(image => {
        formData.append("images", image)
      })

      const res = await fetch(`/api/stores/${storeId}/reviews`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to submit review")
      }

      toast.success("ขอบคุณสำหรับรีวิวของคุณ!")
      setIsReviewDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setRating(5)
    setComment("")
    setImages([])
    setPreviewUrls([])
    setSelectedBooking(null)
  }

  const renderStars = (count: number, interactive = false) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          interactive ? "h-6 w-6 cursor-pointer hover:scale-110 transition-transform" : "h-4 w-4",
          i < count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
        )}
        onClick={() => interactive && setRating(i + 1)}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Review Summary & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-background/50 backdrop-blur-sm p-8 rounded-3xl border-2 border-white/10 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <h3 className="text-5xl font-black text-primary">
              {reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : "0.0"}
            </h3>
            <div className="flex items-center justify-center gap-1 mt-2">
              {renderStars(Math.round(reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-bold">{reviews.length} รีวิวทั้งหมด</p>
          </div>
          <div className="h-16 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              ความคิดเห็นของคุณมีความหมายต่อเรา <br />ช่วยแบ่งปันประสบการณ์เพื่อปรับปรุงบริการของเรา
            </p>
          </div>
        </div>

        {canReviewBookings.length > 0 && (
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-2xl gap-2 font-bold px-8 shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" />
                เขียนรีวิว
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  เขียนรีวิวของคุณ
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Booking Selection if multiple */}
                {canReviewBookings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold">เลือกการจองที่ต้องการรีวิว</p>
                    <div className="flex flex-col gap-2">
                      {canReviewBookings.map((b) => (
                        <div 
                          key={b.id}
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between",
                            selectedBooking?.id === b.id ? "border-primary bg-primary/5 shadow-md" : "border-white/10 hover:border-primary/30"
                          )}
                          onClick={() => setSelectedBooking(b)}
                        >
                          <div>
                            <p className="text-sm font-bold">{b.service_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(b.booking_date), "d MMM yyyy", { locale: th })}
                            </p>
                          </div>
                          {selectedBooking?.id === b.id && <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center"><Check className="h-3 w-3 text-white" /></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-center">
                  <p className="text-sm font-bold">คะแนนความพึงพอใจ</p>
                  <div className="flex justify-center gap-2">
                    {renderStars(rating, true)}
                  </div>
                  <p className="text-xs text-primary font-bold mt-1">
                    {rating === 5 ? "ดีเยี่ยม" : rating === 4 ? "ดีมาก" : rating === 3 ? "ดี" : rating === 2 ? "พอใช้" : "ควรปรับปรุง"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold">บอกเล่าประสบการณ์ของคุณ</p>
                  <Textarea
                    placeholder="บริการเป็นอย่างไรบ้าง? คุณประทับใจส่วนไหน?"
                    className="min-h-[120px] rounded-2xl bg-muted/50 border-none resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold">แนบรูปภาพ (สูงสุด 5 รูป)</p>
                  <div className="flex flex-wrap gap-2">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-primary/20 group">
                        <img src={url} alt="Preview" className="h-full w-full object-cover" />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {previewUrls.length < 5 && (
                      <label className="h-20 w-20 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
                        <Camera className="h-6 w-6" />
                        <span className="text-[10px] mt-1 font-bold">เพิ่มรูป</span>
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  className="w-full rounded-2xl font-bold h-12"
                  disabled={isSubmitting || (canReviewBookings.length > 0 && !selectedBooking)}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                  ส่งรีวิว
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Reviews List */}
      <div className="grid gap-6">
        {reviews.length === 0 ? (
          <div className="py-20 text-center bg-background/30 rounded-3xl border-2 border-dashed border-white/5">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">ยังไม่มีรีวิวสำหรับร้านนี้ เป็นคนแรกที่รีวิวสิ!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="animate-in fade-in slide-in-from-bottom-5 duration-500">
              <Card className="border-2 border-white/5 bg-background/50 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                        {review.user.profileImageUrl ? (
                          <img src={review.user.profileImageUrl} alt={review.user.name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-lg">{review.user.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {renderStars(review.rating)}
                          <span className="text-[10px] font-bold text-muted-foreground/60 ml-2 uppercase tracking-tighter">
                            {format(new Date(review.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <div className="mt-6 text-foreground/80 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                      {review.comment}
                    </div>
                  )}

                  {review.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-6">
                      {review.images.map((img) => (
                        <Dialog key={img.id}>
                          <DialogTrigger asChild>
                            <div className="relative group cursor-pointer h-24 w-24 rounded-2xl overflow-hidden border-2 border-white/10 hover:border-primary/50 transition-all shadow-md">
                              <img src={img.url} alt="Review" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 rounded-none border-none">
                             <DialogHeader className="sr-only"><DialogTitle>รูปภาพ</DialogTitle></DialogHeader>
                             <div className="flex items-center justify-center h-[90vh]">
                               <img src={img.url} alt="Full view" className="max-h-full max-w-full object-contain" />
                             </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  )}

                  {/* Reply */}
                  {review.reply && (
                    <div className="mt-8 bg-primary/5 border-l-4 border-primary p-6 rounded-2xl rounded-tl-none relative animate-in zoom-in-95 duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                           <MessageSquare className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-black text-primary uppercase tracking-wider">เจ้าของร้านตอบกลับ</span>
                        <span className="text-[10px] text-muted-foreground ml-auto font-bold opacity-50">
                          {format(new Date(review.reply.createdAt), "d MMM yyyy", { locale: th })}
                        </span>
                      </div>
                      <p className="text-foreground/70 italic leading-relaxed text-sm">
                        "{review.reply.comment}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
