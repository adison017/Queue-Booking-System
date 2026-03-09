'use client'

import React from 'react'
import Link from 'next/link'
import { Store, Users, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StoreCardProps {
  store: {
    id: number
    name: string
    description: string | null
    owner: { name: string }
    _count: { services: number }
  }
}

export function StoreCard({ store }: StoreCardProps) {
  // Mock image for demonstration based on the premium look
  const imageUrl = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800&h=1000`

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-muted shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={store.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary" className="bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/30 truncate">
            {store._count.services} บริการ
          </Badge>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-medium border border-white/10">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>4.8</span>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-2 tracking-tight">{store.name}</h3>
        
        <p className="text-sm text-zinc-300 line-clamp-2 mb-4 leading-relaxed font-light">
          {store.description || "สัมผัสประสบการณ์การบริการระดับพรีเมียมที่รังสรรค์มาเพื่อคุณโดยเฉพาะ"}
        </p>

        <div className="flex items-center gap-2 mb-6 text-xs text-zinc-400">
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Users className="h-3 w-3 text-primary" />
          </div>
          <span>โดย {store.owner.name}</span>
        </div>

        <Link href={`/stores/${store.id}`} className="block w-full">
          <Button className="w-full bg-white text-black hover:bg-zinc-200 rounded-full h-12 font-bold group/btn transition-all active:scale-95 shadow-lg">
            จองเลย
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
