// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest'
import { render } from '@testing-library/react'

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

import { ThemePreview } from '~/components/theme-preview/ThemePreview'
import { sampleDoc } from '~/components/theme-preview/sampleDoc'

describe('ThemePreview', () => {
  it('renders one [data-block-type] per sampleDoc block inside [data-theme="modern"]', () => {
    const { container } = render(<ThemePreview theme="modern" />)
    const themeWrapper = container.querySelector('[data-theme="modern"]')
    expect(themeWrapper).toBeTruthy()
    const blocks = themeWrapper!.querySelectorAll('[data-block-type]')
    expect(blocks.length).toBe(sampleDoc.blocks.length)
  })

  it('default (non-interactive) wrapper has aria-hidden="true"', () => {
    const { container } = render(<ThemePreview theme="modern" />)
    const themeWrapper = container.querySelector('[data-theme="modern"]')
    expect(themeWrapper).toBeTruthy()
    expect(themeWrapper!.getAttribute('aria-hidden')).toBe('true')
  })
})
