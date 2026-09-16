'use client'
import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { StatusBadge } from './StatusBadge'
import { Button } from '~/components/ui/Button'
import { Input } from '~/components/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Sites</h2>
        <Button size="sm" onClick={() => setNewOpen(true)}>New site</Button>
      </div>

      {sites.length === 0 ? (
        <p className="text-sm text-gray-500">No sites yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Slug</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Updated</th>
                <th className="px-4 py-2.5">Actions</th>
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
                  <tr key={site.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{site.name}</td>
                    <td className="px-4 py-3 text-gray-500">{site.slug}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {site.draftUpdatedAt
                        ? new Date(site.draftUpdatedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate({ to: '/admin/editor/$id', params: { id: site.id } })}
                        >
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDuplicate(site)}>
                          Duplicate
                        </Button>
                        {status !== 'draft' && (
                          <Button variant="ghost" size="sm" onClick={() => handleUnpublish(site.id)}>
                            Unpublish
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteId(site.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogTitle>New site</DialogTitle>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="Name"
              value={newName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
              placeholder="My Campaign"
            />
            <Input
              label="Slug"
              value={newSlug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="my-campaign"
            />
            {createError && <p className="text-sm text-red-600">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={creating || !newName || !newSlug} onClick={handleCreate}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dupOpen} onOpenChange={setDupOpen}>
        <DialogContent>
          <DialogTitle>Duplicate site</DialogTitle>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="New name"
              value={dupName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDupName(e.target.value)}
            />
            <Input
              label="New slug"
              value={dupSlug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDupOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={duping || !dupName || !dupSlug} onClick={handleDuplicate}>
              {duping ? 'Duplicating…' : 'Duplicate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(open: boolean) => { if (!open) setDeleteId(null) }}>
        <DialogContent>
          <DialogTitle>Delete site</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-gray-600">
            This action cannot be undone. The site and all its content will be permanently deleted.
          </DialogDescription>
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
