#!/usr/bin/env bun
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { generateCountryPage } from './country-page'
import type { CountryPageConfig } from './country-page'
import { generateVisaPage, visaPageSlug } from './visa-page'
import type { CountryData, PolicyChange } from '@/extractors/schema'
import { sources } from '@/sources'

const ROOT = join(import.meta.dir, '..', '..')
const DATA_DIR = join(ROOT, 'data', 'current')
const PREVIEWS_DIR = join(ROOT, 'previews')

const COUNTRY_CONFIG: Record<string, Omit<CountryPageConfig, 'code'>> = {
  nl: { displayName: 'Países Baixos', flagClass: 'flag-nl', workingHoliday: false },
  pt: { displayName: 'Portugal',      flagClass: 'flag-pt', workingHoliday: false },
  de: { displayName: 'Alemanha',      flagClass: 'flag-de', workingHoliday: false },
  ie: { displayName: 'Irlanda',       flagClass: 'flag-ie', workingHoliday: false },
  es: { displayName: 'Espanha',       flagClass: 'flag-es', workingHoliday: false },
  fr: { displayName: 'França',        flagClass: 'flag-fr', workingHoliday: false },
  it: { displayName: 'Itália',        flagClass: 'flag-it', workingHoliday: false },
  be: { displayName: 'Bélgica',       flagClass: 'flag-be', workingHoliday: false },
  at: { displayName: 'Áustria',       flagClass: 'flag-at', workingHoliday: false },
  au: { displayName: 'Austrália',     flagClass: 'flag-au', workingHoliday: true  },
}

function monthLabel(iso: string): string {
  const d = new Date(iso)
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${months[d.getUTCMonth()]}/${d.getUTCFullYear()}`
}

// Extract the full <div class="tab-panel" id="PANELID">...</div> block using balanced div counting
function extractTabPanel(html: string, panelId: string): string | null {
  const openTag = `<div class="tab-panel" id="${panelId}">`
  const start = html.indexOf(openTag)
  if (start === -1) return null

  let depth = 1
  let pos = start + openTag.length
  let closeIdx = -1

  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', pos)
    const nextClose = html.indexOf('</div>', pos)
    if (nextClose === -1) break
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++
      pos = nextOpen + 4
    } else {
      depth--
      if (depth === 0) { closeIdx = nextClose + 6; break }
      pos = nextClose + 6
    }
  }

  if (closeIdx === -1) return null
  return html.slice(start, closeIdx)
}

// Replace a full <div class="tab-panel" id="PANELID">...</div> block
function replaceTabPanel(html: string, panelId: string, replacement: string): string {
  const openTag = `<div class="tab-panel" id="${panelId}">`
  const start = html.indexOf(openTag)
  if (start === -1) return html

  let depth = 1
  let pos = start + openTag.length
  let closeIdx = -1

  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', pos)
    const nextClose = html.indexOf('</div>', pos)
    if (nextClose === -1) break
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++
      pos = nextOpen + 4
    } else {
      depth--
      if (depth === 0) { closeIdx = nextClose + 6; break }
      pos = nextClose + 6
    }
  }

  if (closeIdx === -1) return html
  return html.slice(0, start) + replacement + html.slice(closeIdx)
}

// Replace the inner content of <div class="changes-body"> using balanced div counting
function replaceChangesBody(html: string, newContent: string): string {
  const openTag = '<div class="changes-body">'
  const start = html.indexOf(openTag)
  if (start === -1) return html

  const contentStart = start + openTag.length
  let depth = 1
  let pos = contentStart
  let closeIdx = -1

  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', pos)
    const nextClose = html.indexOf('</div>', pos)
    if (nextClose === -1) break
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++
      pos = nextOpen + 4
    } else {
      depth--
      if (depth === 0) { closeIdx = nextClose; break }
      pos = nextClose + 6
    }
  }

  if (closeIdx === -1) return html
  return html.slice(0, contentStart) + '\n' + newContent + '\n      ' + html.slice(closeIdx)
}

async function patchPaises(
  allData: Array<{ code: string; data: CountryData }>,
): Promise<void> {
  const path = join(PREVIEWS_DIR, 'paises.html')
  let html = await readFile(path, 'utf-8')

  for (const { code, data } of allData) {
    const marker = `<!-- ${code.toUpperCase()} -->`
    const startIdx = html.indexOf(marker)
    if (startIdx === -1) continue

    // Section runs until next <!-- XX --> or end of grid
    const nextMarker = html.indexOf('<!-- ', startIdx + marker.length)
    const section = nextMarker === -1 ? html.slice(startIdx) : html.slice(startIdx, nextMarker)

    const newSection = section
      // Update first cc-stat-val that is followed by "tipos de visto"
      .replace(
        /(<span class="cc-stat-val">)\d+(<\/span>\s*<span class="cc-stat-lbl">tipos de visto<\/span>)/,
        `$1${data.visaTypes.length}$2`,
      )
      // Update updated date
      .replace(
        /<span class="cc-updated">[^<]+<\/span>/,
        `<span class="cc-updated">${monthLabel(data.meta.lastUpdated)}</span>`,
      )
      // Update confidence dot class (alta/media/baixa)
      .replace(
        /class="confidence-dot \w+"/,
        `class="confidence-dot ${data.reliability.extractionConfidence === 'high' ? 'alta' : data.reliability.extractionConfidence === 'medium' ? 'media' : 'baixa'}"`,
      )

    html =
      html.slice(0, startIdx) +
      newSection +
      (nextMarker === -1 ? '' : html.slice(nextMarker))
  }

  await writeFile(path, html, 'utf-8')
}

async function patchHome(
  allData: Array<{ code: string; data: CountryData }>,
): Promise<void> {
  const path = join(PREVIEWS_DIR, 'home.html')
  let html = await readFile(path, 'utf-8')

  // Collect and sort all recentChanges across countries
  const all: Array<{ code: string; change: PolicyChange }> = []
  for (const { code, data } of allData) {
    for (const ch of data.recentChanges) {
      all.push({ code, change: ch })
    }
  }
  all.sort((a, b) => b.change.date.localeCompare(a.change.date))
  const top = all.slice(0, 5)

  const changesHtml =
    top.length === 0
      ? `        <div style="padding:var(--s-xl);text-align:center;color:var(--muted);">Nenhuma mudança detectada neste ciclo.</div>`
      : top
          .map(
            ({ code, change }) => `        <div class="change-row">
          <div class="change-country">
            <span class="change-flag flag-${code}"></span>
            <span class="change-cc">${code.toUpperCase()}</span>
          </div>
          <div>
            <span class="change-text">${change.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
            <div class="${change.severity === 'major' ? 'severity-high' : 'severity-medium'}" style="margin-top:2px;">${change.severity === 'major' ? 'Alta relevância' : 'Relevância média'}</div>
          </div>
          <span class="change-date">${change.date}</span>
        </div>`,
          )
          .join('\n')

  html = replaceChangesBody(html, changesHtml)

  // Update cycle label (eyebrow text before changes section)
  const latestIso = allData.reduce((best, { data }) => {
    return data.meta.lastUpdated > best ? data.meta.lastUpdated : best
  }, '')
  if (latestIso) {
    const label = monthLabel(latestIso)
    html = html.replace(
      /<div class="eyebrow">Ciclo de [^<]+<\/div>/,
      `<div class="eyebrow">Ciclo de ${label}</div>`,
    )
    html = html.replace(
      /<span class="badge up"><span class="pulse"><\/span>Verificado em [^<]+<\/span>/,
      `<span class="badge up"><span class="pulse"></span>Verificado em ${label}</span>`,
    )
  }

  await writeFile(path, html, 'utf-8')
}

async function main(): Promise<void> {
  const files = await readdir(DATA_DIR)
  const codes = files
    .filter(f => f.endsWith('.json') && f !== 'example.json' && f !== 'index.json')
    .map(f => f.replace('.json', ''))

  const allData: Array<{ code: string; data: CountryData }> = []

  for (const code of codes) {
    const cfg = COUNTRY_CONFIG[code]
    if (!cfg) {
      console.log(`[skip] sem config para "${code}"`)
      continue
    }
    const raw = await readFile(join(DATA_DIR, `${code}.json`), 'utf-8')
    const data = JSON.parse(raw) as CountryData

    const src = sources[code]
    let html = generateCountryPage(data, {
      code,
      ...cfg,
      ...(src?.verificationUrls ? { verificationUrls: src.verificationUrls } : {}),
    })

    const out = join(PREVIEWS_DIR, `pais-${code}.html`)
    await writeFile(out, html, 'utf-8')
    console.log(`[ok] pais-${code}.html — ${data.visaTypes.length} vistos, confiança: ${data.reliability.extractionConfidence}`)

    allData.push({ code, data })
  }

  await patchPaises(allData)
  console.log('[ok] paises.html atualizado')

  await patchHome(allData)
  console.log('[ok] home.html atualizado')

  // Generate individual visa pages
  const VISTOS_DIR = join(PREVIEWS_DIR, 'vistos')
  await mkdir(VISTOS_DIR, { recursive: true })
  let visaCount = 0
  for (const { code, data } of allData) {
    const cfg = COUNTRY_CONFIG[code]!
    for (const visa of data.visaTypes) {
      const html = generateVisaPage(visa, data, { code, ...cfg })
      const slug = visaPageSlug(code, visa.id)
      await writeFile(join(VISTOS_DIR, slug), html, 'utf-8')
      visaCount++
    }
    console.log(`[vistos] ${code} — ${data.visaTypes.length} páginas geradas`)
  }

  console.log(`\nTotal: ${allData.length} países + ${visaCount} páginas de visto.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
