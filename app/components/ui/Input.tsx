'use client'
import * as React from 'react'
import { cn } from './cn'

const controlClass =
  'w-full rounded-control border border-hairline bg-surface-card px-3 py-2 text-caption ' +
  'text-ink-primary transition-colors placeholder:text-ink-secondary ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, className, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-caption font-medium text-ink-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          className={cn(controlClass, error ? 'border-danger' : '', className)}
          {...props}
        />
        {error && <p className="text-micro text-danger">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
