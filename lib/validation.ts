export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
  return null
}

export function validatePhone(phone: string): boolean {
  const re = /^[0-9]{10}$/
  return re.test(phone.replace(/[^\d]/g, ''))
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateStoreName(name: string): string | null {
  if (!name.trim()) return 'กรุณากรอกชื่อร้าน'
  if (name.length < 2) return 'ชื่อร้านต้องมีอย่างน้อย 2 ตัวอักษร'
  if (name.length > 100) return 'ชื่อร้านต้องไม่เกิน 100 ตัวอักษร'
  return null
}

export function validateServiceName(name: string): string | null {
  if (!name.trim()) return 'กรุณากรอกชื่อบริการ'
  if (name.length < 2) return 'ชื่อบริการต้องมีอย่างน้อย 2 ตัวอักษร'
  if (name.length > 100) return 'ชื่อบริการต้องไม่เกิน 100 ตัวอักษร'
  return null
}

export function validateDuration(duration: number): string | null {
  if (!duration) return 'กรุณากำหนดระยะเวลา'
  if (duration < 5) return 'ระยะเวลาต้องมีอย่างน้อย 5 นาที'
  if (duration > 480) return 'ระยะเวลาต้องไม่เกิน 8 ชั่วโมง'
  return null
}

export function validateCapacity(capacity: number): string | null {
  if (!capacity) return 'กรุณากำหนดจำนวนคิว'
  if (capacity < 1) return 'จำนวนคิวต้องมีอย่างน้อย 1'
  if (capacity > 100) return 'จำนวนคิวต้องไม่เกิน 100'
  return null
}
