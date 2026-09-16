import { defineConfig } from '@tanstack/start/config'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

function nodeBuiltinsBrowserShim(): Plugin {
  return {
    name: 'node-builtins-browser-shim',
    enforce: 'pre',
    resolveId(id, _importer, options) {
      if (!options?.ssr) {
        if (id === 'node:stream') return '\0node-stream-shim'
        if (id === 'node:stream/web') return '\0node-stream-web-shim'
        if (id === 'node:async_hooks') return '\0node-async-hooks-shim'
      }
    },
    load(id) {
      if (id === '\0node-stream-shim') {
        return [
          'export class Readable { static fromWeb(s) { return s } static toWeb(s) { return s } }',
          'export class Writable {}',
          'export class Transform {}',
          'export class PassThrough {}',
          'export default { Readable, Writable, Transform, PassThrough }',
        ].join('\n')
      }
      if (id === '\0node-stream-web-shim') {
        return [
          'export const ReadableStream = globalThis.ReadableStream',
          'export const WritableStream = globalThis.WritableStream',
          'export const TransformStream = globalThis.TransformStream',
          'export default { ReadableStream, WritableStream, TransformStream }',
        ].join('\n')
      }
      if (id === '\0node-async-hooks-shim') {
        return [
          'export class AsyncLocalStorage { run(store, fn, ...args) { return fn(...args) } getStore() { return undefined } }',
          'export class AsyncResource {}',
          'export default { AsyncLocalStorage, AsyncResource }',
        ].join('\n')
      }
    },
  }
}

export default defineConfig({
  server: {
    preset: 'netlify',
    experimental: {
      asyncContext: true,
    },
  },
  vite: {
    plugins: [tailwindcss(), nodeBuiltinsBrowserShim()],
    resolve: {
      alias: {
        '~': new URL('./app', import.meta.url).pathname,
      },
    },
    define: {
      // Enables nitro's AsyncLocalStorage context wrapping so useSession()
      // can be called without an explicit H3Event argument.
      'import.meta._asyncContext': 'true',
    },
  },
})
