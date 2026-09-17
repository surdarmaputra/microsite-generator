'use client'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { getSiteFn, saveDraftFn, publishFn } from '~/server/fns/sites'
import { BlockStack } from '~/components/editor/BlockStack'
import { BlockRenderer } from '~/components/blocks/BlockRenderer'
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
  const router = useRouter()

  const initialDoc: Doc = (site.draftDoc as Doc) ?? emptyDoc()

  const [doc, setDoc] = useState<Doc>(initialDoc)
  const [version, setVersion] = useState(site.draftVersion)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [conflictBanner, setConflictBanner] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)

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
      await router.invalidate()
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
    <div className="flex h-screen flex-col bg-surface-page" style={{ maxWidth: 'none' }}>
      {conflictBanner && (
        <div className="bg-warning/10 border-b border-warning/20 px-6 py-2 text-caption text-warning">
          Edited in another tab — please reload.
        </div>
      )}

      <div className="border-hairline flex items-center gap-3 border-b bg-surface-card px-6 py-3">
        <a href="/admin" className="text-caption text-ink-secondary hover:text-ink-primary transition-colors">← Sites</a>
        <span className="text-ink-secondary opacity-40">/</span>
        <span className="text-caption font-medium text-ink-primary">{site.name}</span>
        <StatusBadge status={status} />
        {saveLabel && (
          <span className={`ml-auto text-micro ${saveState === 'error' ? 'text-danger' : 'text-ink-secondary'}`}>
            {saveLabel}
          </span>
        )}
        {!!site.publishedAt && (
          <a
            href={`/${site.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`cursor-pointer inline-flex items-center gap-1.5 text-caption text-ink-secondary hover:text-ink-primary transition-colors ${saveLabel ? '' : 'ml-auto'}`}
          >
            <ExternalLink size={13} /> View site
          </a>
        )}
        <Button
          size="sm"
          className={saveLabel || !!site.publishedAt ? '' : 'ml-auto'}
          onClick={() => setPublishOpen(true)}
        >
          Publish
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-3/5 flex-col gap-4 overflow-y-auto p-6">
          <div className="rounded-card border-hairline bg-surface-card flex flex-col gap-3 border p-4">
            <h3 className="text-micro font-semibold uppercase tracking-widest text-ink-secondary">Meta</h3>
            <Input
              label="Title"
              value={doc.meta.title}
              onChange={e => handleMetaChange({ ...doc.meta, title: e.target.value })}
              placeholder="Page title"
            />
            <div className="flex flex-col gap-1">
              <label className="text-caption font-medium text-ink-primary">Description</label>
              <textarea
                value={doc.meta.description}
                onChange={e => handleMetaChange({ ...doc.meta, description: e.target.value })}
                placeholder="Page description"
                rows={2}
                className="rounded-control border-hairline bg-surface-card text-caption text-ink-primary placeholder:text-ink-secondary w-full border px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
          </div>

          <BlockStack blocks={doc.blocks} onChange={handleBlocksChange} />
        </div>

        <div className="border-hairline bg-surface-sidebar flex w-2/5 flex-col items-center border-l p-6">
          <div className="text-micro text-ink-secondary mb-3">Preview (390px)</div>
          <div
            className="rounded-card overflow-hidden shadow-raised"
            style={{ width: 390, height: '80vh' }}
          >
            <div
              className="public-page overflow-y-auto"
              style={{ width: 390, height: '100%', background: 'white' }}
            >
              {doc.blocks.map(block => (
                <BlockRenderer key={block.id} block={block} isPreview />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogTitle className="font-display text-title-sm tracking-[-0.022em] font-semibold text-ink-primary">
            Publish site
          </DialogTitle>
          <DialogDescription className="text-caption text-ink-secondary mt-2">
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
