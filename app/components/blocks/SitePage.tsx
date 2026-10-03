import type { ElementType, ReactNode, Ref } from 'react'
import { getTheme } from '~/components/themes'
import type { Doc, Theme } from '~/lib/doc'
import { cn } from '~/components/ui/cn'
import { BlockRenderer } from './BlockRenderer'

/**
 * The page chrome every render surface shares: the public site, the admin
 * preview route, the editor preview and theme previews.
 *
 * `.site-shell` is the `site` size container. Themes style against its width
 * (`@container site …`), never the viewport, so a scaled preview at 1280px
 * renders exactly like a 1280px browser window. Mobile-layout themes get a
 * rounded, shadowed frame on wide containers (global.css).
 */
export function SiteShell({
  theme,
  as: Page = 'div',
  pageRef,
  className,
  children,
}: {
  theme: Theme
  as?: ElementType | undefined
  pageRef?: Ref<HTMLElement> | undefined
  className?: string
  children: ReactNode
}) {
  return (
    <div className="site-shell" data-theme={theme} data-layout={getTheme(theme).layout}>
      <Page ref={pageRef} className={cn('public-page', className)}>
        {children}
      </Page>
    </div>
  )
}

export function SitePage({
  doc,
  theme,
  as,
  pageRef,
  isPreview = false,
}: {
  doc: Doc
  theme: Theme
  as?: ElementType | undefined
  pageRef?: Ref<HTMLElement> | undefined
  isPreview?: boolean
}) {
  return (
    <SiteShell theme={theme} as={as} pageRef={pageRef}>
      {doc.blocks.map(block => (
        <BlockRenderer key={block.id} block={block} theme={theme} isPreview={isPreview} />
      ))}
    </SiteShell>
  )
}
