'use client'
import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Pencil, Copy, Globe, Trash2, EyeOff } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { Button } from '~/components/ui/Button'
import { Input } from '~/components/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '~/components/ui/Dialog'
import {
  createSiteFn,
  deleteSiteFn,
  duplicateSiteFn,
  unpublishFn,
} from '~/server/fns/sites'
import { deriveSiteStatus } from '~/lib/doc'

interface SiteRow {
  id: string
  name: string
  slug: string
  draftVersion: number
  draftUpdatedAt: Date | null
  publishedAt: Date | null
  firstPublishedAt: Date | null
  createdAt: Date
  isPublished: boolean
}

interface Props {
  sites: SiteRow[]
  onRefresh: () => void
}

export function SitesList({ sites, onRefresh }: Props) {
  const navigate = useNavigate()
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [dupOpen, setDupOpen] = useState(false)
  const [dupId, setDupId] = useState<string | null>(null)
  const [dupName, setDupName] = useState('')
  const [dupSlug, setDupSlug] = useState('')
  const [duping, setDuping] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleCreate = async () => {
    setCreateError(null)
    setCreating(true)
    try {
      const site = await createSiteFn({ data: { name: newName, slug: newSlug } })
      setNewOpen(false)
      setNewName('')
      setNewSlug('')
      await navigate({ to: '/admin/editor/$id', params: { id: site.id } })
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Error creating site')
    } finally {
      setCreating(false)
    }
  }

  const handleDuplicate = async () => {
    if (!dupId) return
    setDuping(true)
    try {
      await duplicateSiteFn({ data: { id: dupId, newName: dupName, newSlug: dupSlug } })
      setDupOpen(false)
      onRefresh()
    } catch {
      // ignore
    } finally {
      setDuping(false)
    }
  }

  const openDuplicate = (site: SiteRow) => {
    setDupId(site.id)
    setDupName(`${site.name} (copy)`)
    setDupSlug(`${site.slug}-copy`)
    setDupOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteSiteFn({ data: { id: deleteId } })
      setDeleteId(null)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  const handleUnpublish = async (id: string) => {
    await unpublishFn({ data: { id } })
    onRefresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-title tracking-[-0.022em] font-semibold text-ink-primary">
            Sites
          </h1>
          <p className="text-caption text-ink-secondary mt-0.5">
            {sites.length} {sites.length === 1 ? 'site' : 'sites'}
          </p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus size={15} /> New site
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-card border-hairline bg-surface-card shadow-card border p-12 text-center">
          <Globe size={32} className="text-ink-secondary mx-auto mb-3 opacity-40" />
          <p className="text-caption font-medium text-ink-primary">No sites yet</p>
          <p className="text-caption text-ink-secondary mt-1">Create your first microsite to get started.</p>
          <Button className="mt-4" onClick={() => setNewOpen(true)}>
            <Plus size={15} /> New site
          </Button>
        </div>
      ) : (
        <div className="rounded-card border-hairline bg-surface-card shadow-card overflow-hidden border">
          <table className="w-full">
            <thead>
              <tr className="border-hairline border-b">
                <th className="text-caption px-4 py-3 text-left font-medium text-ink-secondary">Name</th>
                <th className="text-caption px-4 py-3 text-left font-medium text-ink-secondary hidden sm:table-cell">Slug</th>
                <th className="text-caption px-4 py-3 text-left font-medium text-ink-secondary">Status</th>
                <th className="text-caption px-4 py-3 text-left font-medium text-ink-secondary hidden md:table-cell">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sites.map(site => {
                const status = deriveSiteStatus(
                  site.isPublished ? {} as import('~/lib/doc').Doc : null,
                  site.draftUpdatedAt,
                  site.publishedAt
                )
                return (
                  <tr
                    key={site.id}
                    className="border-hairline border-b last:border-0 transition-colors hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3">
                      <span className="text-caption font-medium text-ink-primary">{site.name}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-caption text-ink-secondary font-mono">{site.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-caption text-ink-secondary">
                        {site.draftUpdatedAt
                          ? new Date(site.draftUpdatedAt).toLocaleDateString()
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Edit"
                          onClick={() => navigate({ to: '/admin/editor/$id', params: { id: site.id } })}
                          className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-8 place-items-center transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Duplicate"
                          onClick={() => openDuplicate(site)}
                          className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-8 place-items-center transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                        {status !== 'draft' && (
                          <button
                            title="Unpublish"
                            onClick={() => handleUnpublish(site.id)}
                            className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-8 place-items-center transition-colors"
                          >
                            <EyeOff size={14} />
                          </button>
                        )}
                        <button
                          title="Delete"
                          onClick={() => setDeleteId(site.id)}
                          className="rounded-control text-ink-secondary hover:bg-danger/10 hover:text-danger grid size-8 place-items-center transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New site dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogBody>
            <DialogTitle className="font-display text-title-sm tracking-[-0.022em] font-semibold text-ink-primary mb-4">
              New site
            </DialogTitle>
            <div className="flex flex-col gap-3">
              <Input
                label="Name"
                value={newName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                placeholder="My Campaign"
              />
              <Input
                label="Slug"
                value={newSlug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }
                placeholder="my-campaign"
              />
              {createError && <p className="text-caption text-danger">{createError}</p>}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={creating || !newName || !newSlug} onClick={handleCreate}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate dialog */}
      <Dialog open={dupOpen} onOpenChange={setDupOpen}>
        <DialogContent>
          <DialogBody>
            <DialogTitle className="font-display text-title-sm tracking-[-0.022em] font-semibold text-ink-primary mb-4">
              Duplicate site
            </DialogTitle>
            <div className="flex flex-col gap-3">
              <Input
                label="New name"
                value={dupName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDupName(e.target.value)}
              />
              <Input
                label="New slug"
                value={dupSlug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDupOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={duping || !dupName || !dupSlug} onClick={handleDuplicate}>
              {duping ? 'Duplicating…' : 'Duplicate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null) }}>
        <DialogContent>
          <DialogBody>
            <DialogTitle className="font-display text-title-sm tracking-[-0.022em] font-semibold text-ink-primary">
              Delete site
            </DialogTitle>
            <DialogDescription className="text-caption text-ink-secondary mt-2">
              This action cannot be undone. The site and all its content will be permanently deleted.
            </DialogDescription>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
