import { join } from 'node:path'

const DATA_DIR = join(import.meta.dir, '..', '..', 'data', 'current')
const PREVIEWS_DIR = join(import.meta.dir, '..', '..', 'previews')
const PORT = 4173

const MIME: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  css:  'text/css; charset=utf-8',
  js:   'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  png:  'image/png',
  ico:  'image/x-icon',
}

function mime(path: string): string {
  const ext = path.split('.').pop() ?? ''
  return MIME[ext] ?? 'text/plain'
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    let path = decodeURIComponent(url.pathname)

    // CORS para desenvolvimento local
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain',
    }

    // /data/* → data/current/
    if (path.startsWith('/data/')) {
      const filename = path.slice('/data/'.length)
      if (!filename || filename.includes('..')) {
        return new Response('Not found', { status: 404 })
      }
      const file = Bun.file(join(DATA_DIR, filename))
      if (!(await file.exists())) {
        return new Response('Not found', { status: 404 })
      }
      return new Response(file, {
        headers: { ...headers, 'Content-Type': mime(filename) },
      })
    }

    // / → app.html
    if (path === '/') path = '/app.html'

    // Arquivos estáticos de previews/
    const filename = path.slice(1)
    if (filename.includes('..')) {
      return new Response('Not found', { status: 404 })
    }
    const file = Bun.file(join(PREVIEWS_DIR, filename))
    if (!(await file.exists())) {
      return new Response('Not found', { status: 404 })
    }
    return new Response(file, {
      headers: { ...headers, 'Content-Type': mime(filename) },
    })
  },
})

console.log(`Servidor rodando em http://localhost:${server.port}`)
console.log(`Dados em http://localhost:${server.port}/data/index.json`)
