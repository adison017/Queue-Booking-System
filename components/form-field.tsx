'use client'

import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface FormFieldProps {
  label?: string
  error?: string | null
  children: ReactNode
  required?: boolean
  helpText?: string
}

export function FormField({
  label,
  error,
  children,
  required,
  helpText,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  )
}

interface SimpleFormFieldProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string | null
  required?: boolean
  disabled?: boolean
  min?: number | string
  max?: number | string
}

export function SimpleFormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  min,
  max,
}: SimpleFormFieldProps) {
  return (
    <FormField label={label} error={error} required={required}>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        required={required}
      />
    </FormField>
  )
}
