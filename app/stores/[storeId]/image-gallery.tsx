"use client"

import { useState } from "react"
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: { id: number; url: string }[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (!images || images.length === 0) return null

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev !== null ? (prev + 1) % images.length : null))
  }

  return (
    <>
      <Card className="border-2 border-white/10 bg-background/50 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            บรรยากาศในร้าน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {images.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer",
                  idx === 0 && images.length % 2 !== 0 && "col-span-2 aspect-video"
                )}
              >
                <img
                  src={img.url}
                  alt={`Atmosphere ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-background/20 backdrop-blur-md rounded-full p-2 scale-50 group-hover:scale-100 transition-transform">
                      <PlusIcon className="h-4 w-4 text-white" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={activeIndex !== null} onOpenChange={(open) => !open && setActiveIndex(null)}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 flex items-center justify-center overflow-hidden"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>รูปบรรยากาศร้าน</DialogTitle>
            <DialogDescription>แสดงรูปภาพบรรยากาศภายในร้านค้า</DialogDescription>
          </DialogHeader>
          {activeIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center group">
              <img
                src={images[activeIndex].url}
                alt="Store Atmosphere"
                className="max-w-full max-h-[90vh] object-contain transition-all duration-500 animate-in zoom-in-95"
              />
              
              <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 rounded-full bg-black/40 backdrop-blur-md">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      activeIndex === i ? "w-6 bg-primary" : "w-1.5 bg-white/30"
                    )}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md"
                onClick={() => setActiveIndex(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
