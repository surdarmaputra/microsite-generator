import { describe, it, expect } from 'vitest'
import { cn } from '~/components/ui/cn'

describe('cn', () => {
  it.each(['micro', 'caption', 'body', 'subheading', 'title-sm', 'title'])(
    'keeps custom size text-%s alongside a text colour',
    size => {
      expect(cn(`text-${size} text-ink-primary`)).toBe(`text-${size} text-ink-primary`)
    },
  )

  it('lets a later custom size override an earlier one', () => {
    expect(cn('text-caption text-micro')).toBe('text-micro')
  })
})
