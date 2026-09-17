import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSiteFn } from '~/server/fns/sites'
import { BlockRenderer } from '~/components/blocks/BlockRenderer'
import type { Doc } from '~/lib/doc'
import { emptyDoc } from '~/lib/doc'

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

  return (
    <div className="public-page" style={{ maxWidth: 390, margin: '0 auto' }}>
      {doc.blocks.map(block => (
        <BlockRenderer key={block.id} block={block} isPreview />
      ))}
    </div>
  )
}
