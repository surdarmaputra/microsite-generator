import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { listThemes, THEME_PALETTE, THEME_TOKENS } from '~/components/themes'

const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i

function readThemeCss(id: string) {
  const path = resolve(__dirname, '../../app/components/themes', id, 'theme.css')
  return readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
}

/** Splits a theme stylesheet into its root token block and everything else. */
function parseTheme(id: string) {
  const css = readThemeCss(id)
  const root = new RegExp(`^\\[data-theme=['"]${id}['"]\\]\\s*\\{([^}]*)\\}`, 'm').exec(css)
  if (!root) throw new Error(`theme "${id}" has no root [data-theme='${id}'] token block`)
  const declared = [...root[1]!.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]!)
  const rules = css.slice(0, root.index) + css.slice(root.index + root[0].length)
  const animationProps = [...rules.matchAll(/@property\s+(--[\w-]+)/g)].map((m) => m[1]!)
  return { declared, rules, animationProps }
}

describe.each(listThemes().map((t) => t.id))('theme "%s" token contract', (id) => {
  const { declared, rules, animationProps } = parseTheme(id)

  it('declares exactly the unified token set', () => {
    expect([...declared].sort()).toEqual([...THEME_TOKENS].sort())
  })

  it('styles only through unified tokens or its own @property animation drivers', () => {
    const allowed = new Set([...THEME_TOKENS, ...animationProps])
    const used = [...rules.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]!)
    expect(used.filter((name) => !allowed.has(name))).toEqual([])
  })

  it('has no raw colour literals outside the token block', () => {
    expect(rules.match(COLOR_LITERAL)).toBeNull()
  })
})

describe('THEME_PALETTE', () => {
  it('only shows tokens from the contract', () => {
    for (const { token } of THEME_PALETTE) expect(THEME_TOKENS).toContain(token)
  })
})
