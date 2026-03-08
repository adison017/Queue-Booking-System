'use client'

import { ReactNode } from 'react'
import { Spinner } from '@/components/ui/spinner'

interface LoadingWrapperProps {
  isLoading: boolean
  children: ReactNode
  fallback?: ReactNode
}

export function LoadingWrapper({ isLoading, children, fallback }: LoadingWrapperProps) {
  if (isLoading) {
    return fallback || (
      <div className="flex justify-center items-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }
  return <>{children}</>
}
