'use client'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'
import { ExternalLink, PencilLine } from 'lucide-react'
import { getSiteFn, saveDraftFn, publishFn } from '~/server/fns/sites'
import { BlockStack } from '~/components/editor/BlockStack'
import { BlockRenderer } from '~/components/blocks/BlockRenderer'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { ThemeSelector } from '~/components/theme-preview/ThemeSelector'
import { DeviceFrame } from '~/components/theme-preview/DeviceFrame'
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
import { deriveSiteStatus, emptyDoc, resolveTheme } from '~/lib/doc'
import type { Doc, Block, Meta } from '~/lib/doc'

export const Route = createFileRoute('/admin/editor/$id')({
  loader: ({ params }) => getSiteFn({ data: { id: params.id } }),
  headers: () => ({ 'Cache-Control': 'private, no-store' }),
  staleTime: 0,
  gcTime: 0,
  pendingComponent: EditorPending,
  component: EditorPage,
})

function EditorPending() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-surface-page">
      {/* Header skeleton */}
      <div className="border-hairline flex flex-col md:flex-row md:items-center gap-x-3 gap-y-2 border-b bg-surface-card px-4 py-3">
        {/* Mobile: row 1 — title + badge */}
        <div className="flex items-center gap-2 md:contents">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="animate-pulse bg-surface-hover rounded-control h-5 w-40" />
            <div className="animate-pulse bg-surface-hover rounded-control h-5 w-16" />
          </div>
        </div>
        {/* Mobile: row 2 — theme selector; Desktop: order-2 shrink-0 */}
        <div className="animate-pulse bg-surface-hover rounded-control h-8 w-full md:w-36 md:shrink-0" />
        {/* Mobile: row 3 — Save + Publish grid; Desktop: two buttons */}
        <div className="grid grid-cols-2 gap-2 md:contents">
          <div className="animate-pulse bg-surface-hover rounded-control h-8 md:w-20" />
          <div className="animate-pulse bg-surface-hover rounded-control h-8 md:w-20" />
        </div>
      </div>
      {/* Body skeleton */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left pane — desktop only */}
        <div className="hidden md:flex md:w-3/5 flex-col gap-4 overflow-y-auto p-6">
          <div className="animate-pulse bg-surface-hover rounded-control h-9 w-full" />
          <div className="animate-pulse bg-surface-hover rounded-control h-20 w-full" />
          <div className="animate-pulse bg-surface-hover rounded-card h-24 w-full" />
          <div className="animate-pulse bg-surface-hover rounded-card h-24 w-full" />
          <div className="animate-pulse bg-surface-hover rounded-card h-24 w-full" />
        </div>
        {/* Preview pane — full width on mobile, 2/5 on desktop */}
        <div className="border-hairline bg-surface-sidebar flex flex-1 md:w-2/5 flex-col items-center border-l p-4 md:p-6 min-h-0 pb-6 md:pb-8">
          {/* Device-frame skeleton */}
          <div className="p-1 rounded-[1.75rem] bg-surface-hover w-full max-w-[390px] flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 bg-white rounded-[1.5rem] overflow-hidden flex flex-col gap-2 p-0">
              <div className="animate-pulse bg-surface-hover h-32 w-full" />
              <div className="animate-pulse bg-surface-hover rounded-card h-20 mx-4 -mt-6" />
              <div className="animate-pulse bg-surface-hover rounded-control h-3 mx-4 w-3/4 mt-2" />
              <div className="animate-pulse bg-surface-hover rounded-control h-3 mx-4 w-1/2" />
              <div className="animate-pulse bg-surface-hover rounded-control h-3 mx-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function EditorPage() {
  const site = Route.useLoaderData()
  const { id } = Route.useParams()
  const router = useRouter()

  const draftDoc = (site.draftDoc as Doc | null) ?? emptyDoc()
  const initialDoc: Doc = { ...draftDoc, theme: resolveTheme(draftDoc.theme) }

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

  const handleThemeChange = (theme: string) => {
    handleDocChange({ ...doc, theme: resolveTheme(theme) })
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
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-surface-page" style={{ maxWidth: 'none' }}>
      {conflictBanner && (
        <div className="bg-warning/10 border-b border-warning/20 px-6 py-2 text-caption text-warning">
          Edited in another tab — please reload.
        </div>
      )}

      {/* Header */}
      <div className="border-hairline flex flex-col md:flex-row md:items-center gap-x-3 gap-y-2 border-b bg-surface-card px-4 py-3">
        {/* Mobile: row 1 (flex-row with title, save-state, view-site)
            Desktop: dissolves via display:contents so children participate in the outer flex-row */}
        <div className="flex items-center gap-2 md:contents">
          <div className="flex items-center gap-2 min-w-0 flex-1 md:order-1">
            <span className="text-caption font-medium text-ink-primary truncate">{site.name}</span>
            <StatusBadge status={status} />
          </div>
          {saveLabel && (
            <span className={`text-micro shrink-0 md:order-3 ${saveState === 'error' ? 'text-danger' : 'text-ink-secondary'}`}>
              {saveLabel}
            </span>
          )}
          {!!site.publishedAt && (
            <a
              href={`/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View site"
              className="ml-auto md:ml-0 md:order-5 cursor-pointer inline-flex items-center gap-1.5 text-caption text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View site</span>
            </a>
          )}
        </div>
        {/* Mobile: row 2 (full-width theme selector)
            Desktop: order-2 between title and save-state */}
        <ThemeSelector
          value={doc.theme}
          onChange={handleThemeChange}
          className="w-full justify-start md:w-auto md:order-2 md:shrink-0"
        />
        {/* Mobile: row 3 (equal-width save + publish grid)
            Desktop: dissolves via display:contents so Save and Publish participate in the outer flex-row */}
        <div className="grid grid-cols-2 gap-2 md:contents">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className="w-full md:w-auto md:order-4"
          >
            Save
          </Button>
          <Button
            size="sm"
            onClick={() => setPublishOpen(true)}
            className="w-full md:w-auto md:order-6"
          >
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
        <div className="border-hairline bg-surface-sidebar flex flex-1 md:w-2/5 flex-col items-center border-l p-4 md:p-6 min-h-0 pb-6 md:pb-8">
          <div className="text-micro text-ink-secondary mb-3">Preview (390px)</div>
          <DeviceFrame className="min-h-0 flex-1">
            <div className="public-page w-full" data-theme={doc.theme}>
              {doc.blocks.map(block => (
                <BlockRenderer key={block.id} block={block} theme={doc.theme} isPreview />
              ))}
            </div>
          </DeviceFrame>
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
