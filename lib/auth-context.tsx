'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'OWNER' | 'ADMIN'
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string, role: 'CUSTOMER' | 'OWNER' | 'ADMIN') => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('[v0] Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await res.json()
    setUser(data.user)
    return data.user
  }

  const register = async (name: string, email: string, password: string, role: 'CUSTOMER' | 'OWNER' | 'ADMIN') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Registration failed')
    }

    const data = await res.json()
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
