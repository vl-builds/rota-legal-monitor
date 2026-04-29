import { log } from '@/lib/log'

const UA = 'Rota-Legal-Monitor/0.1 (+https://github.com/USER/rota-legal-monitor)'
const FETCH_TIMEOUT_MS = 30_000
const RATE_LIMIT_MS = 2_000

const lastFetchByHost = new Map<string, number>()

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function enforceRateLimit(url: string): Promise<void> {
  const host = new URL(url).hostname
  const last = lastFetchByHost.get(host) ?? 0
  const elapsed = Date.now() - last
  if (elapsed < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - elapsed)
  }
  lastFetchByHost.set(host, Date.now())
}

const CONTENT_LANG_RE = /^(en|pt|de|es|nl|fr|it)/

function detectLanguage(response: Response): string {
  const cl = response.headers.get('content-language') ?? ''
  const match = cl.split(',')[0]?.trim().toLowerCase().match(CONTENT_LANG_RE)
  return match?.[0] ?? 'en'
}

function looksEmpty(html: string): boolean {
  // Remove script e style antes de contar texto para nao confundir JS bundle com conteudo real
  const withoutCode = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
  const textLength = withoutCode.replace(/<[^>]+>/g, '').trim().length
  const hasNoscript = html.includes('<noscript>')
  return textLength < 200 || (hasNoscript && textLength < 1_000)
}

export interface FetchResult {
  html: string
  fetchedAt: string
  contentLanguage: string
  usedPlaywright: boolean
}

async function fetchNative(
  url: string,
  ignoreSSL = false,
): Promise<{ html: string; lang: string } | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
      },
      // @ts-ignore — extensao do Bun: ignora CA propria de dominios governamentais
      ...(ignoreSSL ? { tls: { rejectUnauthorized: false } } : {}),
    })
    if (!res.ok) {
      log.warn('fetch retornou status nao-ok', { url, status: res.status })
      return null
    }
    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('application/pdf')) {
      // PDF handling is not implemented for this phase
      log.warn('resposta e PDF, nao suportado nesta fase', { url })
      return null
    }
    const lang = detectLanguage(res)
    const html = await res.text()
    return { html, lang }
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') {
      log.warn('fetch timeout', { url, timeoutMs: FETCH_TIMEOUT_MS })
    } else {
      log.warn('fetch nativo falhou', { url, error: String(err) })
    }
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function fetchPlaywright(url: string): Promise<string | null> {
  log.info('usando Playwright como fallback', { url })
  try {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({
      headless: true,
      timeout: FETCH_TIMEOUT_MS,
      args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
    })
    try {
      const page = await browser.newPage()
      await page.setExtraHTTPHeaders({ 'User-Agent': UA })
      await page.goto(url, { timeout: FETCH_TIMEOUT_MS, waitUntil: 'load' })
      // Aguarda SPA renderizar conteudo apos carregamento inicial
      await page.waitForTimeout(3_000)
      return await page.content()
    } finally {
      await browser.close()
    }
  } catch (err) {
    log.warn('Playwright falhou', { url, error: String(err) })
    return null
  }
}

export async function fetchPage(url: string, ignoreSSL = false): Promise<FetchResult> {
  await enforceRateLimit(url)

  const fetchedAt = new Date().toISOString()

  const native = await fetchNative(url, ignoreSSL)

  if (native !== null && !looksEmpty(native.html)) {
    return { html: native.html, fetchedAt, contentLanguage: native.lang, usedPlaywright: false }
  }

  const playwrightHtml = await fetchPlaywright(url)
  if (playwrightHtml !== null) {
    return {
      html: playwrightHtml,
      fetchedAt,
      contentLanguage: native?.lang ?? 'en',
      usedPlaywright: true,
    }
  }

  throw new Error(`Nao foi possivel obter conteudo de ${url}`)
}
