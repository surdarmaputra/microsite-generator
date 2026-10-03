import { THEME_PALETTE } from '~/components/themes'
import type { Theme } from '~/lib/doc'
import { cn } from '~/components/ui/cn'

/**
 * Row of colour swatches for a theme. Each swatch paints a unified theme token,
 * resolved by the theme's own CSS through the `data-theme` scope, so theme.css
 * stays the single source of truth for colour values.
 */
export function ThemePalette({
  theme,
  label,
  size = 'md',
  className,
}: {
  theme: Theme
  label: string
  size?: 'md' | 'sm'
  className?: string
}) {
  return (
    <ul
      data-theme={theme}
      aria-label={`${label} colour palette`}
      className={cn('flex flex-wrap items-center gap-1.5', className)}
    >
      {THEME_PALETTE.map(({ token, label: swatchLabel }) => (
        <li
          key={token}
          title={swatchLabel}
          aria-label={swatchLabel}
          className={cn(
            'rounded-full ring-1 ring-inset ring-ink-primary/15',
            size === 'sm' ? 'size-4' : 'size-5',
          )}
          style={{ background: `var(${token})` }}
        />
      ))}
    </ul>
  )
}
