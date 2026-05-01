import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import { log } from '@/lib/log'

export function extractMainContent(html: string, sourceUrl: string): string {
  try {
    const dom = new JSDOM(html, { url: sourceUrl })
    const reader = new Readability(dom.window.document as unknown as Document)
    const article = reader.parse()
    if (article?.textContent) {
      return article.textContent.trim().substring(0, 20_000)
    }
    log.debug('readability nao extraiu conteudo, usando fallback', { url: sourceUrl })
  } catch (err) {
    log.debug('readability lancou excecao, usando fallback', { url: sourceUrl, error: String(err) })
  }
  return stripTags(html).substring(0, 50_000)
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
