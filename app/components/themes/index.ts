// Public entry point for themes. Importing a theme module registers it, so
// consumers must import from here (not `./registry`) to get a populated
// registry. Import order is the order themes appear in the editor selector.
import './basic'
import './modern'

export { getTheme, listThemes } from './registry'
export type { ThemeManifest } from './registry'
export { THEME_PALETTE, THEME_TOKENS } from './tokens'
