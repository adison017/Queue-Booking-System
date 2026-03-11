'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useTransition } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

export function StoresSearch({ 
  defaultValue, 
  placeholder = "ค้นหาชื่อร้านค้า หรือบริการ..." 
}: { 
  defaultValue?: string
  placeholder?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(defaultValue || '')
  const debouncedValue = useDebounce(value, 400)

  useEffect(() => {
    const currentQ = searchParams.get('q') || ''
    if (debouncedValue === currentQ) return

    const params = new URLSearchParams(searchParams.toString())
    if (debouncedValue) {
      params.set('q', debouncedValue)
    } else {
      params.delete('q')
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [debouncedValue, pathname, router, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto group flex gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          {isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="pl-12 pr-12 h-14 text-lg rounded-2xl border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-xl shadow-lg transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <button 
        type="submit" 
        className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
      >
        ค้นหา
      </button>
    </form>
  )
}
