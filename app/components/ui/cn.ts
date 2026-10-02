import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Custom `--text-*` scale from global.css. Without registering it, twMerge
// classifies e.g. `text-caption` as a text colour and drops it next to
// `text-ink-primary`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['micro', 'caption', 'body', 'subheading', 'title-sm', 'title'] }],
    },
  },
})

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs))
}
