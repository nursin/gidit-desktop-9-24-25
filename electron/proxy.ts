import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { URL } from 'node:url'

const DEFAULT_PROXY_PORT = Number(process.env.GIDIT_PROXY_PORT ?? '3790')
const HOST = '127.0.0.1'

const HOP_BY_HOP_HEADERS = new Set([
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

const ATTRIBUTE_REGEX = /(href|src|action|formaction|ping)=("[^"]*"|'[^']*')/gi
const SRCSET_REGEX = /(srcset)=("[^"]*"|'[^']*')/gi
const CSS_URL_REGEX = /url\(("[^"]*"|'[^']*'|[^)]+)\)/gi

let serverStarted = false

function proxifyUrl(value: string, baseUrl: URL, proxyOrigin: string) {
  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith('#')) return trimmed
  if (/^(javascript:|data:|mailto:|tel:)/i.test(trimmed)) return trimmed

  try {
    const resolved = new URL(trimmed, baseUrl)
    return `${proxyOrigin}/proxy?url=${encodeURIComponent(resolved.toString())}`
  } catch (error) {
    console.warn('[proxy] failed to rewrite', trimmed, 'base', baseUrl.toString(), error)
    return trimmed
  }
}

function rewriteHtml(html: string, baseUrl: URL, proxyOrigin: string) {
  let transformed = html.replace(ATTRIBUTE_REGEX, (match, attr, valueWithQuotes) => {
    const quote = valueWithQuotes.startsWith('"') ? '"' : "'"
    const raw = valueWithQuotes.slice(1, -1)
    const rewritten = proxifyUrl(raw, baseUrl, proxyOrigin)
    return `${attr}=${quote}${rewritten}${quote}`
  })

  transformed = transformed.replace(SRCSET_REGEX, (match, attr, valueWithQuotes) => {
    const quote = valueWithQuotes.startsWith('"') ? '"' : "'"
    const rewritten = valueWithQuotes
      .slice(1, -1)
      .split(',')
      .map((candidate) => {
        const [urlPart, descriptor] = candidate.trim().split(/\s+/)
        const proxied = proxifyUrl(urlPart, baseUrl, proxyOrigin)
        return descriptor ? `${proxied} ${descriptor}` : proxied
      })
      .join(', ')
    return `${attr}=${quote}${rewritten}${quote}`
  })

  transformed = transformed.replace(CSS_URL_REGEX, (match, valueWithQuotes) => {
    const hasQuotes = valueWithQuotes.startsWith('"') || valueWithQuotes.startsWith("'")
    const quote = valueWithQuotes.startsWith('"') ? '"' : valueWithQuotes.startsWith("'") ? "'" : ''
    const raw = hasQuotes ? valueWithQuotes.slice(1, -1) : valueWithQuotes
    const proxied = proxifyUrl(raw, baseUrl, proxyOrigin)
    return `url(${quote}${proxied}${quote})`
  })

  const hasBase = /<base\s/i.test(transformed)
  if (!hasBase) {
    const baseHref = `${proxyOrigin}/proxy?url=${encodeURIComponent(baseUrl.toString())}`
    transformed = transformed.replace(
      /<head(\s[^>]*)?>/i,
      (match) => `${match}\n<base href="${baseHref}">`,
    )
  }

  return transformed
}

function filterRequestHeaders(req: IncomingMessage, upstream: URL): Record<string, string> {
  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue
    const lower = key.toLowerCase()
    if (HOP_BY_HOP_HEADERS.has(lower)) continue
    if (Array.isArray(value)) {
      headers[key] = value.join(',')
    } else {
      headers[key] = value
    }
  }

  headers['accept-encoding'] = 'identity'
  headers['host'] = upstream.host

  if (headers.origin) {
    headers.origin = upstream.origin
  }

  if (headers.referer) {
    try {
      const refererUrl = new URL(headers.referer)
      if (refererUrl.origin !== upstream.origin) {
        headers.referer = upstream.origin + '/'
      }
    } catch {
      headers.referer = upstream.origin + '/'
    }
  }

  return headers
}

function rewriteResponseHeaders(upstreamResponse: Response, proxyOrigin: string, upstreamUrl: URL) {
  const headers: Record<string, string> = {}

  upstreamResponse.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (HOP_BY_HOP_HEADERS.has(lower) || STRIP_RESPONSE_HEADERS.has(lower)) {
      return
    }

    if (lower === 'location') {
      try {
        const redirectUrl = new URL(value, upstreamUrl)
        headers[key] = `${proxyOrigin}/proxy?url=${encodeURIComponent(redirectUrl.toString())}`
        return
      } catch {
        // fall-through
      }
    }

    headers[key] = value
  })

  headers['access-control-allow-origin'] = '*'
  headers['cache-control'] = 'no-store'

  return headers
}

async function handleProxyRequest(req: IncomingMessage, res: ServerResponse, proxyOrigin: string) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    })
    res.end()
    return
  }

  const requestUrl = new URL(req.url ?? '/', proxyOrigin)
  if (requestUrl.pathname !== '/proxy') {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Proxy endpoint not found')
    return
  }

  const targetParam = requestUrl.searchParams.get('url')
  if (!targetParam) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end('Missing url parameter')
    return
  }

  let upstreamUrl: URL
  try {
    upstreamUrl = new URL(targetParam)
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end('Invalid url parameter')
    return
  }

  if (!/^https?:/i.test(upstreamUrl.protocol)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end('Only http(s) protocols are supported')
    return
  }

  try {
    const bodyChunks: Buffer[] = []
    for await (const chunk of req) {
      if (!chunk) continue
      bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const requestBody = Buffer.concat(bodyChunks)
    const useBody = requestBody.length > 0 && req.method && !['GET', 'HEAD'].includes(req.method)

    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers: filterRequestHeaders(req, upstreamUrl),
      redirect: 'manual',
      body: useBody ? requestBody : undefined,
    })

    const headers = rewriteResponseHeaders(upstreamResponse, proxyOrigin, upstreamUrl)
    const contentType = upstreamResponse.headers.get('content-type') ?? ''

    if (contentType.includes('text/html')) {
      const text = await upstreamResponse.text()
      const rewritten = rewriteHtml(text, upstreamUrl, proxyOrigin)
      headers['content-length'] = Buffer.byteLength(rewritten).toString()
      res.writeHead(upstreamResponse.status, upstreamResponse.statusText, headers)
      res.end(rewritten)
      return
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    headers['content-length'] = buffer.length.toString()
    res.writeHead(upstreamResponse.status, upstreamResponse.statusText, headers)
    res.end(buffer)
  } catch (error) {
    console.error('[proxy] request failed', error)
    res.writeHead(502, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    })
    res.end('Proxy request failed')
  }
}

export function startProxyServer(port = DEFAULT_PROXY_PORT) {
  if (serverStarted) {
    return
  }

  const origin = `http://${HOST}:${port}`
  const server = createServer((req, res) => {
    void handleProxyRequest(req, res, origin)
  })

  server.on('error', (error) => {
    console.error('[proxy] server error', error)
  })

  server.listen(port, HOST, () => {
    serverStarted = true
    console.log(`[proxy] running at ${origin}`)
  })
}
