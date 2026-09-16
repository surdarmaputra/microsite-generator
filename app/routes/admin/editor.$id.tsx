'use client'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getSiteFn, saveDraftFn, publishFn } from '~/server/fns/sites'
import { BlockStack } from '~/components/editor/BlockStack'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/Dialog'
import { StatusBadge } from '~/components/admin/StatusBadge'
import { deriveSiteStatus } from '~/lib/doc'
import type { Doc, Block, Meta } from '~/lib/doc'
import { emptyDoc } from '~/lib/doc'

export const Route = createFileRoute('/admin/editor/$id')({
  loader: ({ params }) => getSiteFn({ data: { id: params.id } }),
  headers: () => ({ 'Cache-Control': 'private, no-store' }),
  component: EditorPage,
})

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function EditorPage() {
  const site = Route.useLoaderData()
  const { id } = Route.useParams()

  const initialDoc: Doc = (site.draftDoc as Doc) ?? emptyDoc()

  const [doc, setDoc] = useState<Doc>(initialDoc)
  const [version, setVersion] = useState(site.draftVersion)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [conflictBanner, setConflictBanner] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const versionRef = useRef(version)
  versionRef.current = version

  const handleDocChange = useCallback((next: Doc) => {
    setDoc(next)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaveState('saving')
      try {
        const result = await saveDraftFn({ data: { id, doc: next, version: versionRef.current } })
        setVersion(result.version)
        versionRef.current = result.version
        setSaveState('saved')
      } catch (e) {
        const msg = e instanceof Error ? e.message : ''
        if (msg.includes('409')) {
          setConflictBanner(true)
        }
        setSaveState('error')
      }
    }, 2000)
  }, [id])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const send = () => {
      iframe.contentWindow?.postMessage({ type: 'doc-update', doc }, '*')
    }
    if (iframe.contentDocument?.readyState === 'complete') {
      send()
    } else {
      iframe.addEventListener('load', send, { once: true })
    }
  }, [doc])

  const handleBlocksChange = (blocks: Block[]) => {
    handleDocChange({ ...doc, blocks })
  }

  const handleMetaChange = (meta: Meta) => {
    handleDocChange({ ...doc, meta })
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await publishFn({ data: { id } })
      setPublishOpen(false)
    } finally {
      setPublishing(false)
    }
  }

  const status = deriveSiteStatus(
    site.liveDoc as Doc | null,
    site.draftUpdatedAt,
    site.publishedAt
  )

  const saveLabel =
    saveState === 'saving' ? 'Saving…'
    : saveState === 'saved' ? 'Saved'
    : saveState === 'error' ? 'Error saving'
    : ''

  return (
    <div className="flex h-screen flex-col" style={{ maxWidth: 'none' }}>
      {conflictBanner && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 text-sm text-yellow-800">
          Edited in another tab — please reload.
        </div>
      )}

      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-3">
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900">← Sites</a>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">{site.name}</span>
        <StatusBadge status={status} />
        {saveLabel && (
          <span className={`ml-auto text-xs ${saveState === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
            {saveLabel}
          </span>
        )}
        <Button
          size="sm"
          className={saveLabel ? '' : 'ml-auto'}
          onClick={() => setPublishOpen(true)}
        >
          Publish
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-3/5 flex-col gap-4 overflow-y-auto p-6">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Meta</h3>
            <Input
              label="Title"
              value={doc.meta.title}
              onChange={e => handleMetaChange({ ...doc.meta, title: e.target.value })}
              placeholder="Page title"
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={doc.meta.description}
                onChange={e => handleMetaChange({ ...doc.meta, description: e.target.value })}
                placeholder="Page description"
                rows={2}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <BlockStack blocks={doc.blocks} onChange={handleBlocksChange} />
        </div>

        <div className="flex w-2/5 flex-col items-center border-l border-gray-200 bg-gray-100 p-6">
          <div className="text-xs text-gray-400 mb-3">Preview (390px)</div>
          <div
            className="overflow-hidden rounded-2xl shadow-xl"
            style={{ width: 390, height: '80vh' }}
          >
            <iframe
              ref={iframeRef}
              src={`/admin/preview/${id}`}
              style={{ width: 390, height: '100%', border: 'none' }}
              title="Preview"
            />
          </div>
        </div>
      </div>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogTitle>Publish site</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-gray-600">
            Are you sure you want to publish? This will make the site publicly visible.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPublishOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={publishing} onClick={handlePublish}>
              {publishing ? 'Publishing…' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
