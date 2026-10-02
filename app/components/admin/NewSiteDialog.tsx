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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/Select'
import { ThemePreview } from '~/components/theme-preview/ThemePreview'
import { listThemes } from '~/components/themes'
import { createSiteFn } from '~/server/fns/sites'
import { resolveTheme } from '~/lib/doc'
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

  const themes = listThemes()

  return (
    <NewSiteDialogCtx.Provider value={{ open }}>
      {children}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
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
                <label className="text-caption font-medium text-ink-primary">Theme</label>
                <Select value={theme} onValueChange={(v) => setTheme(resolveTheme(v))}>
                  <SelectTrigger aria-label="Theme" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((t) => (
                      <SelectItem key={t.id} value={resolveTheme(t.id)}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative h-64 overflow-hidden rounded-card border border-hairline">
                <ThemePreview theme={theme} />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-card to-transparent" />
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
