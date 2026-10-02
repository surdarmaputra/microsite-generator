import { createFileRoute } from '@tanstack/react-router'
import { listThemes } from '~/components/themes'
import { ThemeCard } from '~/components/theme-preview/ThemeCard'

export const Route = createFileRoute('/admin/themes')({
  component: ThemesPage,
})

function ThemesPage() {
  const themes = listThemes()

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
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} />
        ))}
      </div>
    </div>
  )
}
