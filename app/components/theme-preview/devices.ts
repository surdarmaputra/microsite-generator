import { Monitor, Smartphone, type LucideIcon } from 'lucide-react'

export type PreviewDevice = 'mobile' | 'desktop'

/** Logical screen widths previews render at before scaling to fit. */
export const PREVIEW_DEVICES: Record<PreviewDevice, { label: string; width: number; icon: LucideIcon }> = {
  mobile: { label: 'Mobile', width: 390, icon: Smartphone },
  desktop: { label: 'Desktop', width: 1280, icon: Monitor },
}
