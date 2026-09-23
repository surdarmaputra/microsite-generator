'use client'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'
import { ExternalLink, PencilLine } from 'lucide-react'
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
  DialogBody,
  DialogFooter,
} from '~/components/ui/Dialog'
import { Drawer, DrawerContent, DrawerCloseButton } from '~/components/ui/Drawer'
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
  const [drawerOpen, setDrawerOpen] = useState(false)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const versionRef = useRef(version)
  versionRef.current = version
  const docRef = useRef(doc)
  docRef.current = doc

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

  const handleSave = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveState('saving')
    try {
      const result = await saveDraftFn({ data: { id, doc: docRef.current, version: versionRef.current } })
      setVersion(result.version)
      versionRef.current = result.version
      setSaveState('saved')
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('409')) setConflictBanner(true)
      setSaveState('error')
    }
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

      {/* Header */}
      <div className="border-hairline flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-surface-card px-4 py-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <a href="/admin" className="text-caption text-ink-secondary hover:text-ink-primary transition-colors shrink-0">← Sites</a>
          <span className="text-ink-secondary opacity-40 shrink-0">/</span>
          <span className="text-caption font-medium text-ink-primary truncate">{site.name}</span>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saveLabel && (
            <span className={`text-micro ${saveState === 'error' ? 'text-danger' : 'text-ink-secondary'}`}>
              {saveLabel}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={saveState === 'saving'}
          >
            Save
          </Button>
          {!!site.publishedAt && (
            <a
              href={`/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer inline-flex items-center gap-1.5 text-caption text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View site</span>
            </a>
          )}
          <Button size="sm" onClick={() => setPublishOpen(true)}>
            Publish
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel — desktop only */}
        <div className="hidden md:flex md:w-3/5 flex-col gap-4 overflow-y-auto p-6">
          <EditorPanelContent
            doc={doc}
            onMetaChange={handleMetaChange}
            onBlocksChange={handleBlocksChange}
          />
        </div>

        {/* Preview panel — full width on mobile, 2/5 on desktop */}
        <div className="border-hairline bg-surface-sidebar flex flex-1 md:w-2/5 flex-col items-center border-l p-4 md:p-6">
          <div className="text-micro text-ink-secondary mb-3">Preview (390px)</div>
          <div
            className="rounded-card shadow-raised w-full max-w-[390px] overflow-y-auto"
            style={{ height: '80vh', background: 'white' }}
          >
            <div className="public-page w-full">
              {doc.blocks.map(block => (
                <BlockRenderer key={block.id} block={block} isPreview />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating edit button — mobile only */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 md:hidden flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-caption font-medium text-white shadow-raised"
      >
        <PencilLine size={16} />
        Edit
      </button>

      {/* Editor drawer — mobile only */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <div className="border-hairline flex items-center justify-between border-b px-4 py-3">
            <span className="text-caption font-semibold text-ink-primary">Edit blocks</span>
            <DrawerCloseButton onClose={() => setDrawerOpen(false)} />
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto p-4">
            <EditorPanelContent
              doc={doc}
              onMetaChange={handleMetaChange}
              onBlocksChange={handleBlocksChange}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogBody>
            <DialogTitle className="font-display text-title-sm tracking-[-0.022em] font-semibold text-ink-primary">
              Publish site
            </DialogTitle>
            <DialogDescription className="text-caption text-ink-secondary mt-2">
              Are you sure you want to publish? This will make the site publicly visible.
            </DialogDescription>
          </DialogBody>
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

function EditorPanelContent({
  doc,
  onMetaChange,
  onBlocksChange,
}: {
  doc: Doc
  onMetaChange: (meta: Meta) => void
  onBlocksChange: (blocks: Block[]) => void
}) {
  return (
    <>
      <div className="rounded-card border-hairline bg-surface-card flex flex-col gap-3 border p-4">
        <h3 className="text-micro font-semibold uppercase tracking-widest text-ink-secondary">Meta</h3>
        <Input
          label="Title"
          value={doc.meta.title}
          onChange={e => onMetaChange({ ...doc.meta, title: e.target.value })}
          placeholder="Page title"
        />
        <div className="flex flex-col gap-1">
          <label className="text-caption font-medium text-ink-primary">Description</label>
          <textarea
            value={doc.meta.description}
            onChange={e => onMetaChange({ ...doc.meta, description: e.target.value })}
            placeholder="Page description"
            rows={2}
            className="rounded-control border-hairline bg-surface-card text-caption text-ink-primary placeholder:text-ink-secondary w-full border px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
      </div>
      <BlockStack blocks={doc.blocks} onChange={onBlocksChange} />
    </>
  )
}
