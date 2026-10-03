/**
 * Unified theme token contract (loosely modelled on daisyUI's theme variables).
 *
 * Every theme's `theme.css` declares exactly these custom properties in its root
 * `[data-theme='<id>'] { … }` block, and its rules style blocks only through them
 * (derived values such as `color-mix(…)` of tokens are fine). Because every theme
 * shares the same names, a theme can be cloned by copying its directory and
 * re-valuing the root block, and any token can be overridden on the
 * `[data-theme]` element to customise a theme without touching its rules.
 *
 * Colour roles:
 * - `base-100`     brightest surface: cards, buttons, controls
 * - `base-200`     softer surface: hover fills, tinted canvases
 * - `base-300`     deepest base shade: borders, dividers
 * - `base-content` text drawn on base surfaces
 * - `primary`      main brand colour (filled CTAs, focus rings)
 * - `primary-content` text drawn on `primary`
 * - `secondary`, `accent` supporting brand colours (gradients, highlights)
 *
 * Each theme decides which base level is its page canvas.
 */

export interface PaletteSwatch {
  token: string
  label: string
}

/** Colours shown as palette swatches, brand roles first, then base shades. */
export const THEME_PALETTE: readonly PaletteSwatch[] = [
  { token: '--theme-primary', label: 'Primary' },
  { token: '--theme-secondary', label: 'Secondary' },
  { token: '--theme-accent', label: 'Accent' },
  { token: '--theme-base-content', label: 'Text' },
  { token: '--theme-base-300', label: 'Base 300' },
  { token: '--theme-base-200', label: 'Base 200' },
  { token: '--theme-base-100', label: 'Base 100' },
]

/** The complete set of custom properties every theme must declare. */
export const THEME_TOKENS: readonly string[] = [
  '--theme-base-100',
  '--theme-base-200',
  '--theme-base-300',
  '--theme-base-content',
  '--theme-primary',
  '--theme-primary-content',
  '--theme-secondary',
  '--theme-accent',
  /** Body copy font stack. */
  '--theme-font-body',
  /** Heading font stack. */
  '--theme-font-heading',
  /** Radius of boxes: cards. */
  '--theme-radius-box',
  /** Radius of fields: buttons, toggles. */
  '--theme-radius-field',
  /** Border width of outlined surfaces. */
  '--theme-border',
  /** Shadow of raised surfaces. */
  '--theme-shadow',
]
