export const APP_NAME = 'QueueNow'
export const APP_DESCRIPTION = 'ระบบจองคิวออนไลน์สำหรับหลายร้าน'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  STORES: '/stores',
  MY_BOOKINGS: '/my-bookings',
  DASHBOARD: '/dashboard',
  SUCCESS: '/success',
} as const

export const ROLE = {
  CUSTOMER: 'CUSTOMER',
  OWNER: 'OWNER',
} as const

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอการยืนยัน',
  COMPLETED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิกแล้ว',
} as const

export const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: 'ลูกค้า',
  OWNER: 'เจ้าของร้าน',
} as const

export const PAGINATION = {
  STORES_PER_PAGE: 12,
  BOOKINGS_PER_PAGE: 10,
  SERVICES_PER_PAGE: 20,
} as const

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_STORE_NAME_LENGTH: 2,
  MAX_STORE_NAME_LENGTH: 100,
  MIN_SERVICE_NAME_LENGTH: 2,
  MAX_SERVICE_NAME_LENGTH: 100,
  MIN_DURATION: 5,
  MAX_DURATION: 480,
  MIN_CAPACITY: 1,
  MAX_CAPACITY: 100,
} as const

export const TIME_RANGES = {
  OPENING_HOUR: 6,
  CLOSING_HOUR: 22,
  MIN_ADVANCE_BOOKING_DAYS: 0,
  MAX_ADVANCE_BOOKING_DAYS: 60,
} as const

export const MESSAGES = {
  SUCCESS: {
    BOOKING_CREATED: 'จองคิวสำเร็จแล้ว',
    BOOKING_CANCELLED: 'ยกเลิกการจองสำเร็จแล้ว',
    STORE_CREATED: 'สร้างร้านสำเร็จแล้ว',
    STORE_UPDATED: 'อัปเดตร้านสำเร็จแล้ว',
    SERVICE_CREATED: 'เพิ่มบริการสำเร็จแล้ว',
    SERVICE_DELETED: 'ลบบริการสำเร็จแล้ว',
    SLOT_CREATED: 'เพิ่มช่วงเวลาสำเร็จแล้ว',
    SLOT_DELETED: 'ลบช่วงเวลาสำเร็จแล้ว',
    LOGIN_SUCCESS: 'เข้าสู่ระบบสำเร็จ',
    LOGOUT_SUCCESS: 'ออกจากระบบแล้ว',
  },
  ERROR: {
    INVALID_EMAIL: 'รูปแบบอีเมลไม่ถูกต้อง',
    EMAIL_EXISTS: 'อีเมลนี้ถูกใช้งานแล้ว',
    WEAK_PASSWORD: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    INVALID_CREDENTIALS: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    UNAUTHORIZED: 'ไม่มีสิทธิ์เข้าถึง',
    NOT_FOUND: 'ไม่พบข้อมูล',
    SERVER_ERROR: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์',
    SLOT_FULL: 'ช่วงเวลานี้เต็มแล้ว',
    INVALID_SLOT: 'ช่วงเวลาไม่ถูกต้อง',
  },
} as const
