import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateStoreName,
  validateServiceName,
  validateDuration,
  validateCapacity,
} from '@/lib/validation'

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should accept passwords with 6+ characters', () => {
      expect(validatePassword('password123')).toBeNull()
    })

    it('should reject passwords shorter than 6 characters', () => {
      const error = validatePassword('pass')
      expect(error).not.toBeNull()
      expect(error).toContain('อย่างน้อย 6')
    })
  })

  describe('validatePhone', () => {
    it('should validate Thai phone numbers', () => {
      expect(validatePhone('0812345678')).toBe(true)
      expect(validatePhone('081-234-5678')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc1234567')).toBe(false)
    })
  })

  describe('validateStoreName', () => {
    it('should accept valid store names', () => {
      expect(validateStoreName('ร้านตัดผม')).toBeNull()
      expect(validateStoreName('My Store')).toBeNull()
    })

    it('should reject empty store names', () => {
      expect(validateStoreName('')).not.toBeNull()
    })

    it('should reject too short names', () => {
      expect(validateStoreName('a')).not.toBeNull()
    })
  })

  describe('validateDuration', () => {
    it('should accept valid durations', () => {
      expect(validateDuration(30)).toBeNull()
      expect(validateDuration(60)).toBeNull()
    })

    it('should reject durations less than 5 minutes', () => {
      expect(validateDuration(3)).not.toBeNull()
    })

    it('should reject durations over 8 hours', () => {
      expect(validateDuration(500)).not.toBeNull()
    })
  })

  describe('validateCapacity', () => {
    it('should accept valid capacities', () => {
      expect(validateCapacity(5)).toBeNull()
      expect(validateCapacity(50)).toBeNull()
    })

    it('should reject capacities less than 1', () => {
      expect(validateCapacity(0)).not.toBeNull()
    })

    it('should reject capacities over 100', () => {
      expect(validateCapacity(150)).not.toBeNull()
    })
  })
})
