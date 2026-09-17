'use client'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './cn'
import * as React from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-micro font-medium',
  {
    variants: {
      variant: {
        draft: 'bg-surface-hover text-ink-secondary',
        published: 'bg-success/10 text-success',
        'unpublished-changes': 'bg-warning/10 text-warning',
        default: 'bg-surface-hover text-ink-secondary',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
