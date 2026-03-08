export function StoreSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-4 animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-muted rounded flex-1"></div>
      </div>
    </div>
  )
}

export function StoreListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <StoreSkeleton key={i} />
      ))}
    </div>
  )
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-4 animate-pulse">
      <div className="h-5 bg-muted rounded w-2/3 mb-3"></div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-muted rounded w-4/5"></div>
        <div className="h-4 bg-muted rounded w-3/5"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-muted rounded flex-1"></div>
        <div className="h-8 bg-muted rounded flex-1"></div>
      </div>
    </div>
  )
}

export function BookingListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  )
}
