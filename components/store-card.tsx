'use client'

import React from 'react'
import Link from 'next/link'
import { Store, Users, Star, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StoreCardProps {
  store: {
    id: number
    name: string
    description: string | null
    profileImageUrl: string | null
    coverImageUrl: string | null
    owner: { name: string }
    _count: { services: number }
    services?: { id: number; name: string; price: number }[]
    rating: string
    reviewCount: number
  }
}

export function StoreCard({ store }: StoreCardProps) {
  const backdropUrl = store.coverImageUrl || store.profileImageUrl || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800&h=1000`

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-card border border-border/50 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(245,197,24,0.1)]">
      {/* Background/Header Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={backdropUrl}
          alt={store.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge variant="secondary" className="bg-black/40 backdrop-blur-md border-white/10 text-white px-3 py-1 text-xs font-semibold shadow-sm">
            {store._count.services} บริการ
          </Badge>
        </div>

        <div className="absolute -bottom-6 left-6">
          <div className="h-20 w-20 rounded-2xl bg-background border-4 border-background overflow-hidden shadow-2xl">
            {store.profileImageUrl ? (
              <img src={store.profileImageUrl} alt={store.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10">
                <Store className="h-10 w-10 text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-6 pt-8">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground truncate max-w-[80%]">
              {store.name}
            </h3>
            <div className="flex items-center gap-1.5 text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-lg text-sm">
              <Star className="h-4 w-4 fill-primary" />
              <span>{store.rating === "0.0" ? "ใหม่" : store.rating}</span>
              {store.reviewCount > 0 && (
                <span className="text-[10px] text-primary/60 font-medium ml-0.5">({store.reviewCount})</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            <Users className="h-3.5 w-3.5" />
            <span>โดย {store.owner.name}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
          {store.description || "สัมผัสประสบการณ์การบริการระดับพรีเมียมที่รังสรรค์มาเพื่อคุณโดยเฉพาะ"}
        </p>

        {/* Services Showcase */}
        {store.services && store.services.length > 0 && (
          <div className="mb-8 space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">บริการแนะนำ</p>
            <div className="flex flex-wrap gap-2">
              {store.services.slice(0, 3).map((service) => (
                <div key={service.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/50 text-sm font-medium text-foreground hover:bg-primary/5 hover:border-primary/20 transition-all">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {service.name}
                </div>
              ))}
              {store.services.length > 3 && (
                <div className="flex items-center px-3 py-1.5 rounded-xl bg-muted/20 border border-dashed border-border text-xs font-medium text-muted-foreground">
                  ... และอีก {store.services.length - 3} บริการ
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          <Link href={`/stores/${store.id}`} className="block w-full">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 text-lg font-bold group/btn transition-all active:scale-95 shadow-[0_4px_24px_rgba(245,197,24,0.3)] border border-primary/30 hover:shadow-[0_4px_32px_rgba(245,197,24,0.5)]">
               ดูรายละเอียด & จองคิว
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
