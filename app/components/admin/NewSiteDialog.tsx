'use client'
import React, { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '~/components/ui/Dialog'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { ThemeSelector } from '~/components/theme-preview/ThemeSelector'
import { createSiteFn } from '~/server/fns/sites'
import type { Theme } from '~/lib/doc'

interface NewSiteDialogContextValue {
  open: (opts?: { theme?: Theme }) => void
}

const NewSiteDialogCtx = createContext<NewSiteDialogContextValue | null>(null)

export function useNewSiteDialog(): NewSiteDialogContextValue {
  const ctx = useContext(NewSiteDialogCtx)
  if (!ctx) throw new Error('useNewSiteDialog must be used within NewSiteDialogProvider')
  return ctx
}

export function NewSiteDialogProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [theme, setTheme] = useState<Theme>('basic')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const open = (opts?: { theme?: Theme }) => {
    setName('')
    setSlug('')
    setCreateError(null)
    setTheme(opts?.theme ?? 'basic')
    setDialogOpen(true)
  }

  const handleCreate = async () => {
    setCreateError(null)
    setCreating(true)
    try {
      const site = await createSiteFn({ data: { name, slug, theme } })
      setDialogOpen(false)
      await navigate({ to: '/admin/editor/$id', params: { id: site.id } })
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Error creating site')
    } finally {
      setCreating(false)
    }
  }


  return (
    <NewSiteDialogCtx.Provider value={{ open }}>
      {children}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogBody>
            <DialogTitle className="font-display text-title-sm tracking-[-0.022em] font-semibold text-ink-primary mb-4">
              New site
            </DialogTitle>
            <div className="flex flex-col gap-3">
              <Input
                label="Name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="My Campaign"
              />
              <Input
                label="Slug"
                value={slug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }
                placeholder="my-campaign"
              />
              <div className="flex flex-col gap-1">
                <span className="text-caption font-medium text-ink-primary">Theme</span>
                <ThemeSelector value={theme} onChange={setTheme} className="w-full justify-start" />
              </div>
              {createError && <p className="text-caption text-danger">{createError}</p>}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={creating || !name || !slug} onClick={handleCreate}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NewSiteDialogCtx.Provider>
  )
}
