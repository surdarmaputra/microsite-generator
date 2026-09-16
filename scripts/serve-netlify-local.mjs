#!/usr/bin/env node
// Wraps the netlify Lambda handler in a local HTTP server for CI e2e testing.
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

const { handler } = await import('../.netlify/functions-internal/server/server.mjs')

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

  // Fall through to the lambda handler
  const bodyBuf = await readBody(req)
  const contentType = req.headers['content-type'] || ''
  const isText = contentType.startsWith('application/json') || contentType.startsWith('text/')
  const bodyStr = bodyBuf.length
    ? (isText ? bodyBuf.toString('utf-8') : bodyBuf.toString('base64'))
    : undefined

  const event = {
    path: pathname,
    httpMethod: req.method,
    headers: req.headers,
    multiValueHeaders: {},
    queryStringParameters: Object.fromEntries(url.searchParams),
    multiValueQueryStringParameters: {},
    body: bodyStr || null,
    isBase64Encoded: bodyBuf.length > 0 && !isText,
  }

  log(`REQ ${req.method} ${pathname} content-type=${contentType} body-len=${bodyBuf.length} isBase64=${event.isBase64Encoded}`)
  if (bodyBuf.length > 0 && isText) {
    log(`REQ BODY ${bodyStr?.slice(0, 500)}`)
  }

  try {
    const result = await handler(event, {})
    const headers = { ...result.headers }
    if (result.multiValueHeaders) {
      for (const [k, v] of Object.entries(result.multiValueHeaders)) {
        headers[k] = v
      }
    }
    log(`RES ${result.statusCode || 200} set-cookie=${headers['set-cookie'] || headers['Set-Cookie'] || 'none'} content-type=${headers['content-type'] || 'none'}`)
    if (result.body && !result.isBase64Encoded && pathname.startsWith('/_server')) {
      log(`RES BODY ${result.body.slice(0, 500)}`)
    }
    res.writeHead(result.statusCode || 200, headers)
    if (result.isBase64Encoded && result.body) {
      res.end(Buffer.from(result.body, 'base64'))
    } else {
      res.end(result.body || '')
    }
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
