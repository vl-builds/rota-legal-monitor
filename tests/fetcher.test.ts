import { describe, it, expect } from 'bun:test'
import { looksEmpty, detectLanguage } from '@/extractors/fetcher'

// ---- looksEmpty --------------------------------------------------------------

describe('looksEmpty', () => {
  it('HTML com texto suficiente retorna false', () => {
    const body = 'a'.repeat(300)
    expect(looksEmpty(`<html><body>${body}</body></html>`)).toBe(false)
  })

  it('HTML com menos de 200 chars de texto retorna true', () => {
    expect(looksEmpty('<html><body><p>Conteudo curto</p></body></html>')).toBe(true)
  })

  it('HTML vazio retorna true', () => {
    expect(looksEmpty('')).toBe(true)
  })

  it('HTML com script grande mas pouco texto retorna true (SPA vazia)', () => {
    const script = `<script>${'x'.repeat(10_000)}</script>`
    const html = `<html><head>${script}</head><body><p>ok</p></body></html>`
    expect(looksEmpty(html)).toBe(true)
  })

  it('HTML com script grande e texto suficiente retorna false', () => {
    const script = `<script>${'x'.repeat(10_000)}</script>`
    const body = 'b'.repeat(400)
    const html = `<html><head>${script}</head><body>${body}</body></html>`
    expect(looksEmpty(html)).toBe(false)
  })

  it('HTML com <noscript> e texto entre 200 e 999 chars retorna true', () => {
    const body = 'c'.repeat(500)
    const html = `<html><body><noscript>Habilite JS</noscript>${body}</body></html>`
    expect(looksEmpty(html)).toBe(true)
  })

  it('HTML com <noscript> e mais de 1000 chars de texto retorna false', () => {
    const body = 'd'.repeat(1_500)
    const html = `<html><body><noscript>Habilite JS</noscript>${body}</body></html>`
    expect(looksEmpty(html)).toBe(false)
  })

  it('HTML so com tags style e sem texto retorna true', () => {
    const style = `<style>${'a'.repeat(5_000)}</style>`
    const html = `<html><head>${style}</head><body></body></html>`
    expect(looksEmpty(html)).toBe(true)
  })
})

// ---- detectLanguage ----------------------------------------------------------

describe('detectLanguage', () => {
  function makeResponse(contentLanguage: string): Response {
    return new Response('', { headers: { 'content-language': contentLanguage } })
  }

  it('retorna en quando header e en-US', () => {
    expect(detectLanguage(makeResponse('en-US'))).toBe('en')
  })

  it('retorna pt quando header e pt-BR', () => {
    expect(detectLanguage(makeResponse('pt-BR'))).toBe('pt')
  })

  it('retorna de quando header e de-DE,en;q=0.5', () => {
    expect(detectLanguage(makeResponse('de-DE,en;q=0.5'))).toBe('de')
  })

  it('retorna nl quando header e nl', () => {
    expect(detectLanguage(makeResponse('nl'))).toBe('nl')
  })

  it('retorna en como fallback quando header esta ausente', () => {
    const res = new Response('')
    expect(detectLanguage(res)).toBe('en')
  })

  it('retorna en quando idioma nao esta na lista suportada', () => {
    expect(detectLanguage(makeResponse('ja-JP'))).toBe('en')
  })
})
