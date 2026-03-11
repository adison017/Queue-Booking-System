"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"
import { Star, MessageSquare, Reply, User, Image as ImageIcon, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

interface Props {
  storeId: number
}

export function ReviewsTab({ storeId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/stores/${storeId}/reviews`)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch: ${res.status}`)
      }
      const data = await res.json()
      setReviews(data)
    } catch (error: any) {
      console.error("Fetch reviews error:", error)
      toast.error(error.message || "ไม่สามารถโหลดรีวิวได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [storeId])

  const handleReply = async (reviewId: number) => {
    if (!replyText.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: replyText }),
      })

      if (!res.ok) throw new Error("Failed to reply")
      
      toast.success("ส่งการตอบกลับเรียบร้อยแล้ว")
      setReplyText("")
      setReplyingTo(null)
      fetchReviews()
    } catch (error) {
      console.error(error)
      toast.error("ไม่สามารถส่งการตอบกลับได้")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
        )}
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

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-xl text-center">
        <MessageSquare className="h-14 w-14 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">ยังไม่มีรีวิว</p>
        <p className="text-muted-foreground text-sm mt-1">รีวิวจากลูกค้าจะแสดงที่นี่</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            รีวิวจากลูกค้า ({reviews.length})
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                    {review.user.profileImageUrl ? (
                      <img src={review.user.profileImageUrl} alt={review.user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{review.user.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground ml-2">
                        {format(new Date(review.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm mt-3 text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    )}

                    {review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {review.images.map((img) => (
                          <Dialog key={img.id}>
                            <DialogTrigger asChild>
                              <div className="relative group cursor-pointer">
                                <img
                                  src={img.url}
                                  alt="Review image"
                                  className="h-20 w-20 rounded-lg object-cover border hover:opacity-90 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                  <ImageIcon className="h-4 w-4 text-white" />
                                </div>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/95">
                              <DialogHeader className="sr-only">
                                <DialogTitle>รูปภาพรีวิว</DialogTitle>
                              </DialogHeader>
                              <div className="flex items-center justify-center h-[80vh]">
                                <img src={img.url} alt="Review full" className="max-h-full max-w-full object-contain" />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    )}

                    {/* Owner Reply */}
                    {review.reply ? (
                      <div className="mt-4 p-4 rounded-xl bg-muted/50 border-l-4 border-primary/40">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="h-4 w-4 text-primary" />
                          <span className="text-xs font-bold text-primary">การตอบกลับจากร้านค้า</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {format(new Date(review.reply.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/70 italic">"{review.reply.comment}"</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-[10px] text-muted-foreground mt-2 hover:text-primary"
                          onClick={() => {
                            setReplyingTo(review.id)
                            setReplyText(review.reply?.comment || "")
                          }}
                        >
                          แก้ไขคําตอบ
                        </Button>
                      </div>
                    ) : (
                      replyingTo !== review.id && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4 h-8 gap-2"
                          onClick={() => setReplyingTo(review.id)}
                        >
                          <Reply className="h-3.5 w-3.5" />
                          ตอบกลับ
                        </Button>
                      )
                    )}

                    {/* Reply Input */}
                    {replyingTo === review.id && (
                      <div className="mt-4 space-y-3 p-4 rounded-xl border-2 border-primary/10 bg-primary/5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary flex items-center gap-1">
                            <Reply className="h-3 w-3" />
                            ตอบกลับคุณ {review.user.name}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[10px]"
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyText("")
                            }}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                        <Textarea
                          placeholder="พิมพ์ข้อความตอบกลับของคุณ..."
                          className="min-h-[100px] text-sm bg-background"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleReply(review.id)}
                            disabled={isSubmitting || !replyText.trim()}
                          >
                            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            ส่งการตอบกลับ
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
