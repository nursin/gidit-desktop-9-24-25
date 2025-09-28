import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { URL } from 'node:url'
import { Readable } from 'node:stream'

const DEFAULT_PORT = Number(process.env.GIDIT_PROXY_PORT ?? '3790')
const HOST = '127.0.0.1'

const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

const STRIP_RESPONSE_HEADERS = new Set([
  'content-security-policy',
  'x-frame-options',
  'cross-origin-embedder-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
])

let server: ReturnType<typeof createServer> | null = null

function validateTarget(target: string | null): URL | null {
  if (!target) return null
  try {
    const url = new URL(target)
    if (!/^https?:$/i.test(url.protocol)) return null
    return url
  } catch {
    return null
  }
}

function collectRequestBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req
      .on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })
      .on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      .on('error', (error) => reject(error))
  })
}

function filterRequestHeaders(req: IncomingMessage, upstream: URL): Record<string, string> {
  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue
    const lower = key.toLowerCase()
    if (HOP_BY_HOP_REQUEST_HEADERS.has(lower)) continue
    headers[key] = Array.isArray(value) ? value.join(',') : value
  }

  headers['accept-encoding'] = 'identity'
  headers['host'] = upstream.host
  if (headers.origin) headers.origin = upstream.origin
  if (headers.referer) headers.referer = upstream.origin

  return headers
}

function writePreflight(res: ServerResponse) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  })
  res.end()
}

function sanitizeResponseHeaders(upstream: Response): Record<string, string> {
  const headers: Record<string, string> = {}
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (HOP_BY_HOP_REQUEST_HEADERS.has(lower) || STRIP_RESPONSE_HEADERS.has(lower)) return
    headers[key] = value
  })

  headers['access-control-allow-origin'] = '*'
  headers['cache-control'] = 'no-store'

  return headers
}

async function handleProxy(req: IncomingMessage, res: ServerResponse, origin: string) {
  if (req.method === 'OPTIONS') {
    writePreflight(res)
    return
  }

  const requestUrl = new URL(req.url ?? '/', origin)
  if (requestUrl.pathname !== '/proxy') {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
    return
  }

  const upstreamUrl = validateTarget(requestUrl.searchParams.get('url'))
  if (!upstreamUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end('Invalid url parameter')
    return
  }

  try {
    const body = await collectRequestBody(req)
    const useBody = body.length > 0 && req.method && !['GET', 'HEAD'].includes(req.method)

    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      redirect: 'manual',
      headers: filterRequestHeaders(req, upstreamUrl),
      body: useBody ? body : undefined,
    })

    const headers = sanitizeResponseHeaders(upstreamResponse)
    const contentType = upstreamResponse.headers.get('content-type') ?? ''
    if (contentType.includes('text/html')) {
      const text = await upstreamResponse.text()
      headers['content-length'] = Buffer.byteLength(text).toString()
      res.writeHead(upstreamResponse.status, headers)
      res.end(text)
      return
    }

    if (upstreamResponse.body) {
      const nodeStream = Readable.fromWeb(upstreamResponse.body as unknown as ReadableStream)
      res.writeHead(upstreamResponse.status, headers)
      nodeStream.pipe(res)
      return
    }

    const buffer = Buffer.from(await upstreamResponse.arrayBuffer())
    headers['content-length'] = buffer.length.toString()
    res.writeHead(upstreamResponse.status, headers)
    res.end(buffer)
  } catch (error) {
    console.error('[proxy] upstream request failed', error)
    res.writeHead(502, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    })
    res.end('Proxy request failed')
  }
}

export async function startProxyServer(port = DEFAULT_PORT) {
  if (server) return { port }

  const origin = `http://${HOST}:${port}`

  server = createServer((req, res) => {
    void handleProxy(req, res, origin)
  })

  await new Promise<void>((resolve, reject) => {
    server?.once('error', reject)
    server?.listen(port, HOST, () => {
      server?.off('error', reject)
      console.log(`[proxy] running at ${origin}`)
      resolve()
    })
  })

  server.on('error', (error) => {
    console.error('[proxy] server error', error)
  })

  return { port }
}

export async function stopProxyServer() {
  if (!server) return
  await new Promise<void>((resolve, reject) => {
    server?.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
  server = null
}
