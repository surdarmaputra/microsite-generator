import { createFileRoute } from '@tanstack/react-router'
import { listThemes } from '~/components/themes'
import { ThemeCard } from '~/components/theme-preview/ThemeCard'
import { Button } from '~/components/ui/Button'
import { resolveTheme } from '~/lib/doc'
import { useNewSiteDialog } from '~/components/admin/NewSiteDialog'

export const Route = createFileRoute('/admin/themes')({
  component: ThemesPage,
})

function ThemesPage() {
  const themes = listThemes()
  const { open } = useNewSiteDialog()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-title tracking-[-0.022em] font-semibold text-ink-primary">
          Themes
        </h1>
        <p className="text-caption text-ink-secondary mt-0.5">
          {themes.length} {themes.length === 1 ? 'theme' : 'themes'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            footer={
              <Button size="sm" className="w-full" onClick={() => open({ theme: resolveTheme(theme.id) })}>
                Create website
              </Button>
            }
          />
        ))}
      </div>
    </div>
  )
}
