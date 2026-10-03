'use client'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { SitePage } from '~/components/blocks/SitePage'
import { resolveTheme, type Doc, type Theme } from '~/lib/doc'
import { cn } from '~/components/ui/cn'
import { DeviceFrame } from './DeviceFrame'
import { PREVIEW_DEVICES, type PreviewDevice } from './devices'

/**
 * The one preview used wherever a site or theme is shown in the admin: the
 * editor, the theme dialog and theme cards.
 *
 * The site renders at the device's real logical width (390px / 1280px) and is
 * scaled down to fit, so container-query driven theme layouts look exactly as
 * they will on that screen. The preview fills its parent, which must give it
 * a definite height.
 *
 * `thumbnail` drops the device switcher and chrome (theme cards).
 */
export function SitePreview({
  doc,
  theme = resolveTheme(doc.theme),
  defaultDevice = 'mobile',
  interactive = false,
  thumbnail = false,
  className,
}: {
  doc: Doc
  theme?: Theme
  defaultDevice?: PreviewDevice
  interactive?: boolean
  thumbnail?: boolean
  className?: string
}) {
  const [device, setDevice] = useState<PreviewDevice>(defaultDevice)
  const site = <SitePage doc={doc} theme={theme} isPreview />

  if (thumbnail) {
    return (
      <ScaledViewport width={PREVIEW_DEVICES[device].width} interactive={interactive} className={cn('h-full w-full', className)}>
        {site}
      </ScaledViewport>
    )
  }

  return (
    <section aria-label="Site preview" className={cn('flex min-h-0 w-full flex-col items-center gap-3', className)}>
      <DeviceSwitcher value={device} onChange={setDevice} />
      <DeviceFrame device={device} className="min-h-0 flex-1">
        <ScaledViewport width={PREVIEW_DEVICES[device].width} interactive={interactive} className="min-h-0 flex-1">
          {site}
        </ScaledViewport>
      </DeviceFrame>
    </section>
  )
}

function DeviceSwitcher({ value, onChange }: { value: PreviewDevice; onChange: (d: PreviewDevice) => void }) {
  return (
    <div
      role="group"
      aria-label="Preview device"
      className="border-hairline inline-flex shrink-0 gap-0.5 rounded-control border bg-surface-card p-0.5"
    >
      {(Object.keys(PREVIEW_DEVICES) as PreviewDevice[]).map(id => {
        const { label, width, icon: Icon } = PREVIEW_DEVICES[id]
        const active = id === value
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            title={`${label} (${width}px wide)`}
            onClick={() => onChange(id)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-micro font-medium transition-colors',
              active ? 'bg-surface-hover text-ink-primary' : 'text-ink-secondary hover:text-ink-primary',
            )}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

interface Measurement {
  scale: number
  /** Simulated screen height in unscaled px. */
  screenHeight: number
  contentHeight: number
  /** The device width this measurement was taken for. Used to detect stale data on device switch. */
  forWidth: number
}

/** Lays children out at `width` px and scales them down to the available width. */
function ScaledViewport({
  width,
  interactive,
  className,
  children,
}: {
  width: number
  interactive: boolean
  className?: string
  children: ReactNode
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [m, setM] = useState<Measurement | null>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return

    function measure() {
      if (!viewport || !content) return
      // Skip measurement until the viewport has been laid out to avoid division-by-zero
      if (viewport.clientWidth === 0 || viewport.clientHeight === 0) return
      const scale = Math.min(1, viewport.clientWidth / width)
      setM({ scale, screenHeight: viewport.clientHeight / scale, contentHeight: content.offsetHeight, forWidth: width })
    }

    const ro = new ResizeObserver(measure)
    ro.observe(viewport)
    ro.observe(content)
    measure()
    return () => ro.disconnect()
  }, [width])

  // Treat measurement as invalid if it was taken for a different device width.
  // Prevents the stale mobile scale being applied to desktop width (or vice-versa)
  // during the one render between a device switch and the ResizeObserver firing.
  const validM = m?.forWidth === width ? m : null
  // Use scale 0 when there is no valid measurement: the wrapper collapses to 0 × 0
  // and cannot overflow its container even if the device width is very large.
  const scale = validM?.scale ?? 0
  const contentStyle = {
    width,
    transformOrigin: 'top left',
    transform: `scale(${scale})`,
    visibility: validM ? 'visible' : 'hidden',
    '--site-viewport-height': validM ? `${validM.screenHeight}px` : undefined,
  } as CSSProperties

  return (
    <div
      ref={viewportRef}
      className={cn(interactive ? 'overflow-y-auto' : 'overflow-hidden', '[scrollbar-width:none]', className)}
    >
      <div
        className="mx-auto overflow-hidden"
        style={{ width: width * scale, height: validM ? validM.contentHeight * scale : 0 }}
      >
        <div
          ref={contentRef}
          className={cn(!interactive && 'pointer-events-none')}
          style={contentStyle}
          inert={!interactive || undefined}
          aria-hidden={interactive ? undefined : 'true'}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
