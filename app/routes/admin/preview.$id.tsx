import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSiteFn } from '~/server/fns/sites'
import { SitePage } from '~/components/blocks/SitePage'
import type { Doc } from '~/lib/doc'
import { emptyDoc, resolveTheme } from '~/lib/doc'

export const Route = createFileRoute('/admin/preview/$id')({
  loader: ({ params }) => getSiteFn({ data: { id: params.id } }),
  headers: () => ({ 'Cache-Control': 'private, no-store' }),
  component: PreviewPage,
})

function PreviewPage() {
  const site = Route.useLoaderData()
  const [doc, setDoc] = useState<Doc>((site.draftDoc as Doc) ?? emptyDoc())

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'doc-update' && event.data.doc) {
        setDoc(event.data.doc as Doc)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Full-page draft preview: renders exactly like the public page at the
  // browser's real width (framed on desktop for mobile-layout themes).
  return <SitePage doc={doc} theme={resolveTheme(doc.theme)} isPreview />
}
