import { defineConfig } from '@tanstack/start/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    preset: 'netlify',
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': new URL('./app', import.meta.url).pathname,
      },
    },
  },
})
