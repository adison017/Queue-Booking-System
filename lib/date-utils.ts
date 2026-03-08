export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatThaiDate(date: Date | string, isShort = false): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isShort) {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  }
  
  return formatDate(d)
}

export function formatThaiCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatTime(time: string): string {
  if (time.includes(':')) {
    return time.substring(0, 5)
  }
  return time
}

export function formatDateTime(date: string | Date, time?: string): string {
  const d = new Date(date)
  const dateStr = d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  
  if (time) {
    return `${dateStr} เวลา ${formatTime(time)}`
  }
  return dateStr
}

export function getThaiDate(date: string | Date): string {
  const d = new Date(date)
  const formatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return formatter.format(d)
}

export function getThaiWeekday(date: string | Date): string {
  const d = new Date(date)
  const formatter = new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
  })
  return formatter.format(d)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} นาที`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} ชั่วโมง`
  }
  return `${hours} ชั่วโมง ${mins} นาที`
}

export function getAvailableSlots(totalSlots: number, bookedSlots: number): number {
  return Math.max(0, totalSlots - bookedSlots)
}

export function isSlotAvailable(bookedCount: number, capacity: number): boolean {
  return bookedCount < capacity
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function isDateInPast(date: string | Date): boolean {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}
