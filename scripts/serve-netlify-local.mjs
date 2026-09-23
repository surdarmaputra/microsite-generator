#!/usr/bin/env node
// Wraps the Netlify Functions v2 handler in a local HTTP server for CI e2e testing.
// Usage: node scripts/serve-netlify-local.mjs
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync, appendFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const LOG_FILE = process.env.SERVE_LOG || '/tmp/serve-debug.log'

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`
  process.stderr.write(line)
  try { appendFileSync(LOG_FILE, line) } catch {}
}

const { default: handler } = await import('../.netlify/functions-internal/server/server.mjs')

const PORT = process.env.PORT || 3000
const STATIC_DIR = resolve('dist')

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function extOf(path) {
  const i = path.lastIndexOf('.')
  return i === -1 ? '' : path.slice(i)
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname

  // Serve static files from .output/public
  const staticPath = join(STATIC_DIR, pathname)
  if (existsSync(staticPath) && statSync(staticPath).isFile()) {
    const ext = extOf(staticPath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    createReadStream(staticPath).pipe(res)
    return
  }

  // Fall through to the Netlify Functions v2 handler: (Request) => Response
  const bodyBuf = await readBody(req)
  const contentType = req.headers['content-type'] || ''
  log(`REQ ${req.method} ${pathname} content-type=${contentType} body-len=${bodyBuf.length}`)

  const reqHeaders = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach(x => reqHeaders.append(k, x))
    else if (v !== undefined) reqHeaders.set(k, v)
  }

  try {
    const response = await handler(new Request(url, {
      method: req.method,
      headers: reqHeaders,
      body: bodyBuf.length && req.method !== 'GET' && req.method !== 'HEAD' ? bodyBuf : undefined,
    }))
    const headers = {}
    response.headers.forEach((v, k) => { if (k !== 'set-cookie') headers[k] = v })
    const cookies = response.headers.getSetCookie()
    if (cookies.length) headers['set-cookie'] = cookies
    log(`RES ${response.status} set-cookie=${cookies.length ? cookies.join(';') : 'none'} content-type=${headers['content-type'] || 'none'}`)
    const body = Buffer.from(await response.arrayBuffer())
    if (pathname.startsWith('/_server')) log(`RES BODY ${body.toString('utf-8').slice(0, 500)}`)
    res.writeHead(response.status, headers)
    res.end(body)
  } catch (err) {
    log(`ERR ${err.message}\n${err.stack}`)
    console.error('Handler error:', err)
    res.writeHead(500)
    res.end('Internal Server Error')
  }
})

server.listen(PORT, () => {
  console.log(`Local netlify server listening on http://localhost:${PORT}`)
})
