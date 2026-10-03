// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest'
import { fireEvent, render, within } from '@testing-library/react'

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

import { SitePreview } from '~/components/theme-preview/SitePreview'
import { sampleDoc } from '~/components/theme-preview/sampleDoc'

function renderedWidth(container: HTMLElement) {
  const shell = container.querySelector('.site-shell')!
  return (shell.parentElement as HTMLElement).style.width
}

describe('SitePreview', () => {
  it('renders one [data-block-type] per block inside the themed shell', () => {
    const { container } = render(<SitePreview doc={sampleDoc} theme="modern" />)
    const shell = container.querySelector('.site-shell[data-theme="modern"]')
    expect(shell).toBeTruthy()
    expect(shell!.querySelectorAll('[data-block-type]').length).toBe(sampleDoc.blocks.length)
  })

  it('marks the shell with the theme layout so mobile themes get the desktop frame', () => {
    const { container } = render(<SitePreview doc={sampleDoc} theme="basic" thumbnail />)
    expect(container.querySelector('.site-shell')!.getAttribute('data-layout')).toBe('mobile')
  })

  it('hides non-interactive previews from assistive tech and focus', () => {
    const { container } = render(<SitePreview doc={sampleDoc} theme="modern" thumbnail />)
    const content = container.querySelector('.site-shell')!.parentElement!
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(content.hasAttribute('inert')).toBe(true)
  })

  it('switches between mobile and desktop widths', () => {
    const { container } = render(<SitePreview doc={sampleDoc} theme="basic" interactive />)
    const screen = within(container)
    const mobile = screen.getByRole('button', { name: 'Mobile' })
    const desktop = screen.getByRole('button', { name: 'Desktop' })

    expect(mobile.getAttribute('aria-pressed')).toBe('true')
    expect(renderedWidth(container)).toBe('390px')

    fireEvent.click(desktop)
    expect(desktop.getAttribute('aria-pressed')).toBe('true')
    expect(mobile.getAttribute('aria-pressed')).toBe('false')
    expect(renderedWidth(container)).toBe('1280px')
  })

  it('opens on the requested default device', () => {
    const { container } = render(<SitePreview doc={sampleDoc} theme="creator" defaultDevice="desktop" />)
    const screen = within(container)
    expect(screen.getByRole('button', { name: 'Desktop' }).getAttribute('aria-pressed')).toBe('true')
    expect(renderedWidth(container)).toBe('1280px')
  })
})
