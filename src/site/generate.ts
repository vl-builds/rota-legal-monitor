#!/usr/bin/env bun
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { generateCountryPage } from './country-page'
import type { CountryPageConfig } from './country-page'
import { generateVisaPage, visaPageSlug, visaPageUrlSlug } from './visa-page'
import { generateComparePage, generateCompareHub, compareSlug } from './compare-page'
import type { CompareCountry } from './compare-page'
import { generateProfessionPage, generateProfessionHub, PROFESSIONS } from './profession-page'
import type { ProfCountryInfo } from './profession-page'
import { generateEuropaHub } from './europa-hub'
import type { EuropaCountry } from './europa-hub'
import { generateGuidePage, generateGuidesHub, GUIDES } from './guides-page'
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

// Vistos duplicados: a mesma realidade extraida em dois ids. Chave = id duplicado
// (cc/id), valor = id canonico no mesmo pais. A pagina duplicada continua existindo
// (nao quebra URLs), mas aponta canonical/og:url/@id para a canonica e sai do
// sitemap, consolidando o sinal de SEO em uma unica URL.
const VISA_DUPLICATES: Record<string, string> = {
  'au/work-holiday-462': 'au/working-holiday-462',
  'nl/researcher-permit': 'nl/researcher',
}
// Metadados de comparacao por pais: slug na URL e idioma (dados que nao estao
// no JSON extraido). Combina com COUNTRY_CONFIG para montar a CompareCountry.
const COMPARE_META: Record<string, { slug: string; language: string; languageNote: string }> = {
  pt: { slug: 'portugal',      language: 'Português',          languageNote: 'mesmo idioma do Brasil' },
  es: { slug: 'espanha',       language: 'Espanhol',           languageNote: 'alta semelhança com o português' },
  de: { slug: 'alemanha',      language: 'Alemão',             languageNote: 'exigido na maioria dos vistos' },
  ie: { slug: 'irlanda',       language: 'Inglês',             languageNote: 'mercado forte em inglês' },
  nl: { slug: 'paises-baixos', language: 'Holandês e inglês',  languageNote: 'inglês resolve em muitas áreas' },
  fr: { slug: 'franca',        language: 'Francês',            languageNote: 'exigido na maioria dos casos' },
  it: { slug: 'italia',        language: 'Italiano',           languageNote: 'próximo do português' },
  be: { slug: 'belgica',       language: 'Francês e holandês', languageNote: 'varia por região' },
  at: { slug: 'austria',       language: 'Alemão',             languageNote: 'exigido na maioria dos vistos' },
  au: { slug: 'australia',     language: 'Inglês',             languageNote: 'exigido (destino fora da Europa)' },
}

// Pares de comparacao priorizados (validados por pesquisa de SERP). Cada par
// gera uma pagina /comparar-paises/{a}-vs-{b}.
const COMPARE_PAIRS: Array<[string, string]> = [
  ['pt', 'es'], ['pt', 'ie'], ['de', 'ie'], ['pt', 'de'], ['ie', 'au'],
  ['nl', 'de'], ['es', 'ie'], ['fr', 'de'], ['it', 'pt'], ['at', 'de'],
  ['be', 'nl'], ['au', 'de'],
]

function compareCountry(cc: string): CompareCountry {
  const cfg = COUNTRY_CONFIG[cc]!
  const meta = COMPARE_META[cc]!
  return {
    code: cc,
    name: cfg.displayName,
    slug: meta.slug,
    flagClass: cfg.flagClass,
    language: meta.language,
    languageNote: meta.languageNote,
  }
}

function visaCanonicalUrl(code: string, visaId: string): string | undefined {
  const target = VISA_DUPLICATES[`${code}/${visaId}`]
  if (!target) return undefined
  const slash = target.indexOf('/')
  const tcc = target.slice(0, slash)
  const tid = target.slice(slash + 1)
  return `https://rotalegal.pro/vistos/${visaPageUrlSlug(tcc, tid)}`
}

const VISA_FAMILIES: Array<{ label: string; members: Array<{ cc: string; id: string }> }> = [
  { label: 'EU Blue Card', members: [
    { cc: 'be', id: 'eu-blue-card' },
    { cc: 'de', id: 'eu-blue-card' },
    { cc: 'it', id: 'eu-blue-card' },
    { cc: 'nl', id: 'european-blue-card' },
    { cc: 'fr', id: 'talent-carte-bleue-europeia' },
  ]},
  { label: 'Nômade Digital', members: [
    { cc: 'es', id: 'telework-nomad-visa' },
    { cc: 'pt', id: 'nomada-digital' },
    { cc: 'pt', id: 'work-digital-nomad' },
  ]},
  { label: 'Transferência Intraempresarial', members: [
    { cc: 'es', id: 'intra-company-transfer-visa' },
    { cc: 'nl', id: 'intra-corporate-transferee' },
    { cc: 'ie', id: 'intra-company-transfer-employment-permit' },
    { cc: 'pt', id: 'work-intra-company-transfer' },
    { cc: 'pt', id: 'work-intra-company-mobility' },
  ]},
  { label: 'Profissional Altamente Qualificado', members: [
    { cc: 'at', id: 'very-highly-qualified-workers' },
    { cc: 'at', id: 'red-white-red-card-highly-qualified' },
    { cc: 'es', id: 'highly-qualified-worker-visa' },
    { cc: 'nl', id: 'highly-skilled-migrant' },
    { cc: 'pt', id: 'work-highly-qualified' },
    { cc: 'pt', id: 'pt-highly-qualified-activity' },
    { cc: 'ie', id: 'critical-skills-employment-permit' },
  ]},
  { label: 'Procura de Emprego', members: [
    { cc: 'at', id: 'job-seeker-visa' },
    { cc: 'pt', id: 'work-job-search' },
    { cc: 'de', id: 'opportunity-card-chancenkarte' },
  ]},
  { label: 'Trabalho Sazonal', members: [
    { cc: 'nl', id: 'seasonal-work' },
    { cc: 'ie', id: 'seasonal-employment-permit' },
  ]},
  { label: 'Working Holiday', members: [
    { cc: 'au', id: 'work-holiday-462' },
    { cc: 'au', id: 'working-holiday-462' },
    { cc: 'fr', id: 'working-holiday-brasil' },
  ]},
  { label: 'Empreendedor / Startup', members: [
    { cc: 'at', id: 'startup-founders' },
    { cc: 'nl', id: 'start-up-founder' },
  ]},
]

export type RelatedVisa = { cc: string; id: string; name: string; displayName: string }

function buildRelatedMap(
  allData: Array<{ code: string; data: CountryData }>,
): Map<string, RelatedVisa[]> {
  const nameMap = new Map<string, string>()
  for (const { code, data } of allData) {
    for (const visa of data.visaTypes) {
      nameMap.set(`${code}/${visa.id}`, visa.name)
    }
  }
  const result = new Map<string, RelatedVisa[]>()
  for (const family of VISA_FAMILIES) {
    for (const member of family.members) {
      const key = `${member.cc}/${member.id}`
      const others = family.members
        .filter(m => m.cc !== member.cc || m.id !== member.id)
        .map(m => ({
          cc: m.cc,
          id: m.id,
          name: nameMap.get(`${m.cc}/${m.id}`) ?? '',
          displayName: COUNTRY_CONFIG[m.cc]?.displayName ?? m.cc.toUpperCase(),
        }))
        .filter(m => m.name)
      if (others.length > 0) result.set(key, others)
    }
  }
  return result
}

function monthLabel(iso: string): string {
  const d = new Date(iso)
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${months[d.getUTCMonth()]}/${d.getUTCFullYear()}`
}

function monthLabelLong(iso: string): string {
  const d = new Date(iso)
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  return `${months[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
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

  const latestIso = allData.reduce(
    (best, { data }) => (data.meta.lastUpdated > best ? data.meta.lastUpdated : best),
    '',
  )
  if (latestIso) {
    html = html.replace(
      /Atualizado em (?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro) de \d{4}/g,
      `Atualizado em ${monthLabelLong(latestIso)}`,
    )
  }

  for (const { code, data } of allData) {
    const marker = `<!-- ${code.toUpperCase()} -->`
    const startIdx = html.indexOf(marker)
    if (startIdx === -1) continue

    // Section runs until next <!-- XX --> or end of grid
    const nextMarker = html.indexOf('<!-- ', startIdx + marker.length)
    const section = nextMarker === -1 ? html.slice(startIdx) : html.slice(startIdx, nextMarker)

    let newSection = section
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

    // Update minimum wage value and normalize label
    const mw = data.generalRequirements.minimumWage
    if (mw && mw.amount) {
      const formatted = Math.round(mw.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      const salaryVal = `${mw.currency} ${formatted}`
      newSection = newSection
        .replace(
          /(<span class="cc-stat-val">)[^<]+(<\/span>\s*<span class="cc-stat-lbl">(?:salário mínimo|renda mínima) \/(?:mês|hora)<\/span>)/,
          `$1${salaryVal}$2`,
        )
        .replace(
          /(<span class="cc-stat-lbl">)(?:salário mínimo|renda mínima) \/(?:mês|hora)(<\/span>)/,
          `$1salário mínimo /mês$2`,
        )
    }

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
  const path = join(PREVIEWS_DIR, 'index.html')
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
    const labelLong = monthLabelLong(latestIso)
    html = html.replace(
      /<div class="eyebrow">Ciclo de [^<]+<\/div>/,
      `<div class="eyebrow">Ciclo de ${label}</div>`,
    )
    html = html.replace(
      /<span class="badge up"><span class="pulse"><\/span>Verificado em [^<]+<\/span>/,
      `<span class="badge up"><span class="pulse"></span>Verificado em ${label}</span>`,
    )
    html = html.replace(
      /Atualizado em (?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro) de \d{4}/g,
      `Atualizado em ${labelLong}`,
    )
    // Eyebrow "Análise de <mês>" da seção de sugestão rápida.
    html = html.replace(
      /Análise de (?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro) de \d{4}/g,
      `Análise de ${labelLong}`,
    )
  }

  // Links de descoberta no rodape (idempotentes): hub Trabalhar na Europa e Guias.
  if (!html.includes('href="/trabalhar-na-europa"')) {
    html = html.replace(
      '<li><a href="/comparar">Comparar países</a></li>',
      '<li><a href="/trabalhar-na-europa">Trabalhar na Europa</a></li>\n          <li><a href="/comparar">Comparar países</a></li>',
    )
  }
  if (!html.includes('href="/guias"')) {
    html = html.replace(
      '<li><a href="/sobre#contribuir">Contribuir</a></li>',
      '<li><a href="/guias">Guias</a></li>\n          <li><a href="/sobre#contribuir">Contribuir</a></li>',
    )
  }

  // Organization + WebSite JSON-LD. Autoritativo: reescreve o bloco existente
  // (sem SearchAction nao-funcional; logo como ImageObject; sameAs; inLanguage).
  const orgLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://rotalegal.pro/#organization',
        name: 'Rota Legal',
        url: 'https://rotalegal.pro',
        logo: {
          '@type': 'ImageObject',
          url: 'https://rotalegal.pro/assets/images/logonobg.png',
        },
        description: 'Monitor mensal de condições de imigração legal para brasileiros que querem trabalhar na Europa.',
        sameAs: [
          'https://github.com/vl-builds/rota-legal-monitor',
          'https://github.com/vl-builds',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://rotalegal.pro/#website',
        url: 'https://rotalegal.pro',
        name: 'Rota Legal',
        inLanguage: 'pt-BR',
        description: 'Monitore requisitos de visto de trabalho em 10 países europeus. Dados atualizados mensalmente com fontes oficiais.',
        publisher: { '@id': 'https://rotalegal.pro/#organization' },
      },
      {
        '@type': 'Dataset',
        '@id': 'https://rotalegal.pro/#dataset',
        name: 'Condições de imigração e vistos de trabalho de 10 países',
        description: 'Dados mensais de vistos de trabalho, salário mínimo, prazos de processamento, taxas e requisitos de imigração de 10 países (Portugal, Espanha, Alemanha, Irlanda, Países Baixos, França, Itália, Bélgica, Áustria e Austrália), em português, extraídos de fontes oficiais.',
        url: 'https://rotalegal.pro',
        inLanguage: 'pt-BR',
        isAccessibleForFree: true,
        license: 'https://opensource.org/licenses/MIT',
        creator: { '@id': 'https://rotalegal.pro/#organization' },
        publisher: { '@id': 'https://rotalegal.pro/#organization' },
        keywords: ['vistos de trabalho', 'imigração', 'salário mínimo', 'Europa', 'brasileiros'],
        distribution: [{
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: 'https://github.com/vl-builds/rota-legal-monitor/tree/master/data/current',
        }],
      },
    ],
  })
  const orgScript = `<script type="application/ld+json">${orgLd}</script>`
  const ldRe = /<script type="application\/ld\+json">[\s\S]*?"@type":\s*"Organization"[\s\S]*?<\/script>/
  if (ldRe.test(html)) {
    html = html.replace(ldRe, orgScript)
  } else {
    html = html.replace('</head>', `${orgScript}\n</head>`)
  }

  await writeFile(path, html, 'utf-8')
}

async function patchFooters(latestIso: string): Promise<void> {
  const label = monthLabel(latestIso)
  const files = [
    'index.html',
    'paises.html',
    'comparar.html',
    'qual-pais.html',
    'calculadora.html',
    'historico.html',
    'sobre.html',
    'parceiros.html',
    'guia-pratico.html',
    'dev.html',
  ]

  const footerRe =
    /(Última extração:\s*)(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\/\d{4}/g

  // Chrome global injetado de forma idempotente nas paginas estaticas publicas:
  // links legais no rodape e o script site-extras.js (aviso de cookies + mini-form de lead).
  const legalNav =
    '<nav class="footer-legal" aria-label="Links legais">' +
    '<a href="/politica-privacidade">Privacidade</a>' +
    '<a href="/politica-cookies">Cookies</a>' +
    '<a href="/termos-uso">Termos</a>' +
    '</nav>'

  for (const name of files) {
    const path = join(PREVIEWS_DIR, name)
    try {
      const html = await readFile(path, 'utf-8')
      let updated = html.replace(footerRe, `$1${label}`)

      // Links legais: inserir antes do "Última extração" do footer-bottom, se ainda nao existirem.
      if (!updated.includes('footer-legal')) {
        updated = updated.replace(
          /(\n?\s*)(<span class="caption-up">Última extração)/,
          `$1${legalNav}$1$2`,
        )
      }

      // Script global: inserir antes de </body>, se ainda nao referenciado.
      if (!updated.includes('assets/site-extras.js')) {
        updated = updated.replace(
          /<\/body>/,
          '<script src="assets/site-extras.js" defer></script>\n</body>',
        )
      }

      if (updated !== html) {
        await writeFile(path, updated, 'utf-8')
        console.log(`[ok] ${name} — rodapé/chrome atualizado`)
      }
    } catch {
      // file may not exist; skip silently
    }
  }
}

const SITE_URL = 'https://rotalegal.pro'

function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

const STATIC_OG: Array<{ file: string; title: string; description: string }> = [
  {
    file: 'index.html',
    title: 'Trabalhar na Europa 2026: vistos e salários | Rota Legal',
    description: 'Monitore requisitos de visto de trabalho em 10 países europeus, com salário mínimo, prazos e taxas. Fontes oficiais, atualizado todo mês.',
  },
  {
    file: 'paises.html',
    title: 'Vistos de Trabalho na Europa 2026: 10 países | Rota Legal',
    description: 'Compare requisitos de imigração em 10 países europeus: Portugal, Alemanha, Países Baixos, Irlanda e mais. Salários e prazos atualizados todo mês.',
  },
  {
    file: 'comparar.html',
    title: 'Comparar Países para Imigrar na Europa | Rota Legal',
    description: 'Compare vistos de trabalho entre países europeus lado a lado: salários, requisitos, prazos e taxas, com dados oficiais atualizados todo mês.',
  },
  {
    file: 'qual-pais.html',
    title: 'Qual País Europeu é o Seu? Teste rápido | Rota Legal',
    description: 'Descubra qual país europeu combina com seu perfil profissional. Responda 6 perguntas e receba uma recomendação com justificativa e um plano B.',
  },
  {
    file: 'calculadora.html',
    title: 'Calculadora: Quanto Guardar para Emigrar | Rota Legal',
    description: 'Calcule quanto guardar para emigrar para a Europa: reserva mínima por país, duração e estilo de vida, com base em custos reais atualizados.',
  },
  {
    file: 'historico.html',
    title: 'Histórico de Mudanças em Vistos Europeus | Rota Legal',
    description: 'Acompanhe o histórico de mudanças nas regras de imigração europeia: alterações mensais em vistos, salários mínimos, taxas e prazos, mês a mês.',
  },
  {
    file: 'guia-pratico.html',
    title: 'Guia Prático para Emigrar para a Europa | Rota Legal',
    description: 'Guia prático para emigrar para a Europa: escolha do país, visto, documentação, custos e chegada, passo a passo para brasileiros. Atualizado todo mês.',
  },
  {
    file: 'sobre.html',
    title: 'Sobre o Rota Legal: metodologia e fontes | Rota Legal',
    description: 'Conheça a metodologia, as fontes oficiais e as limitações do Rota Legal. Dados de imigração para 10 países europeus, atualizados todo mês.',
  },
  {
    file: 'parceiros.html',
    title: 'Parceiros Rota Legal: serviços para o exterior | Rota Legal',
    description: 'Serviços parceiros para quem vai trabalhar no exterior: contabilidade, seguro, câmbio, remessas e mais, selecionados para brasileiros na Europa.',
  },
  {
    file: 'politica-privacidade.html',
    title: 'Política de Privacidade | Rota Legal',
    description: 'Como o Rota Legal trata os seus dados: o que coletamos, por que e quais são os seus direitos no monitor de imigração para a Europa.',
  },
  {
    file: 'politica-cookies.html',
    title: 'Política de Cookies | Rota Legal',
    description: 'Como o Rota Legal usa cookies: quais são essenciais, para que servem e como você controla as preferências no seu navegador.',
  },
  {
    file: 'termos-uso.html',
    title: 'Termos de Uso | Rota Legal',
    description: 'Termos de uso do Rota Legal: condições, limitações de responsabilidade e como usar os dados de imigração. Leia antes de utilizar o site.',
  },
]

async function patchOpenGraph(): Promise<void> {
  for (const { file, title, description } of STATIC_OG) {
    const path = join(PREVIEWS_DIR, file)
    try {
      let html = await readFile(path, 'utf-8')
      // URL limpa (sem .html) para canonical/og:url: casa com a forma que o
      // Cloudflare Pages serve com 200 e com as entradas do sitemap.
      const cleanPath = file === 'index.html' ? '' : file.replace(/\.html$/, '')
      const url = `${SITE_URL}/${cleanPath}`
      const ogBlock = [
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="Rota Legal" />`,
        `<meta property="og:title" content="${escAttr(title)}" />`,
        `<meta property="og:description" content="${escAttr(description)}" />`,
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:image" content="${SITE_URL}/assets/og-default.png" />`,
      ].join('\n')

      // atualiza <title>
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${escAttr(title)}</title>`)

      if (html.includes('property="og:title"')) {
        html = html
          .replace(/(<meta property="og:title" content=")[^"]*(")/,   `$1${escAttr(title)}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${escAttr(description)}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/,      `$1${url}$2`)
      } else {
        html = html.replace('</title>', `</title>\n${ogBlock}`)
      }

      // meta description: autoritativa. Reescreve a existente (mantem o STATIC_OG
      // como fonte de verdade) ou injeta se faltar.
      if (html.includes('name="description"')) {
        html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escAttr(description)}$2`)
      } else {
        html = html.replace('</title>', `</title>\n<meta name="description" content="${escAttr(description)}" />`)
      }

      // canonical: autoritativo. Se ja existe (possivelmente apontando para
      // a variante .html de um build anterior), reescreve para a URL limpa.
      if (html.includes('rel="canonical"')) {
        html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
      } else {
        html = html.replace('</title>', `</title>\n<link rel="canonical" href="${url}" />`)
      }

      // twitter card
      if (!html.includes('twitter:card')) {
        html = html.replace('</title>', `</title>\n<meta name="twitter:card" content="summary_large_image" />`)
      }

      // favicon
      if (!html.includes('rel="icon"')) {
        html = html.replace('</title>', `</title>\n<link rel="icon" type="image/png" href="favicon.png" />\n<link rel="apple-touch-icon" href="apple-touch-icon.png" />`)
      }

      // fontes não-bloqueantes
      const fontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
      if (html.includes(fontUrl) && !html.includes('media="print"')) {
        // aceita tanto <link href="..." rel="stylesheet" /> (uma linha) quanto multi-linha
        // [^>] (em vez de [\s\S]) impede que o match atravesse outras tags <link>
        // ja injetadas (canonical, favicon), mantendo-se dentro do proprio <link> da fonte.
        html = html.replace(
          /<link[^>]*?href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*display=swap"[^>]*?\/>/,
          `<link rel="preload" href="${fontUrl}" as="style" />\n<link href="${fontUrl}" rel="stylesheet" media="print" onload="this.media='all'" />\n<noscript><link href="${fontUrl}" rel="stylesheet" /></noscript>`,
        )
      }

      await writeFile(path, html, 'utf-8')
    } catch {
      // arquivo pode nao existir; ignorar
    }
  }
}

// Caminhos publicos sem .html: o Cloudflare Pages redireciona .html (308) para esta forma,
// entao o sitemap aponta direto para a URL que retorna 200.
const STATIC_PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/',                       priority: '1.0', changefreq: 'monthly' },
  { path: '/trabalhar-na-europa',    priority: '0.9', changefreq: 'monthly' },
  { path: '/paises',                 priority: '0.9', changefreq: 'monthly' },
  { path: '/comparar',               priority: '0.8', changefreq: 'monthly' },
  { path: '/qual-pais',              priority: '0.8', changefreq: 'monthly' },
  { path: '/calculadora',            priority: '0.7', changefreq: 'monthly' },
  { path: '/historico',              priority: '0.7', changefreq: 'monthly' },
  { path: '/guia-pratico',           priority: '0.6', changefreq: 'monthly' },
  { path: '/sobre',                  priority: '0.5', changefreq: 'monthly' },
  { path: '/parceiros',              priority: '0.4', changefreq: 'monthly' },
  { path: '/politica-privacidade',   priority: '0.3', changefreq: 'yearly' },
  { path: '/politica-cookies',       priority: '0.3', changefreq: 'yearly' },
  { path: '/termos-uso',             priority: '0.3', changefreq: 'yearly' },
]

async function generateSitemap(
  allData: Array<{ code: string; data: CountryData }>,
  comparePairs: Array<{ a: CompareCountry; b: CompareCountry }> = [],
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)

  const urlTags: string[] = []

  for (const { path, priority, changefreq } of STATIC_PAGES) {
    urlTags.push(
      `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    )
  }

  // Hub e paginas de comparacao pais x pais
  if (comparePairs.length) {
    urlTags.push(
      `  <url>\n    <loc>${SITE_URL}/comparar-paises</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    )
    for (const { a, b } of comparePairs) {
      urlTags.push(
        `  <url>\n    <loc>${SITE_URL}/comparar-paises/${compareSlug(a, b)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
      )
    }
  }

  // Hub e paginas por profissao
  if (PROFESSIONS.length) {
    urlTags.push(
      `  <url>\n    <loc>${SITE_URL}/profissoes</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    )
    for (const p of PROFESSIONS) {
      urlTags.push(
        `  <url>\n    <loc>${SITE_URL}/profissoes/${p.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
      )
    }
  }

  // Hub e guias editoriais
  if (GUIDES.length) {
    urlTags.push(
      `  <url>\n    <loc>${SITE_URL}/guias</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
    )
    for (const g of GUIDES) {
      urlTags.push(
        `  <url>\n    <loc>${SITE_URL}/guias/${g.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
      )
    }
  }

  for (const { code, data } of allData) {
    const lastmod = data.meta.lastUpdated.slice(0, 10)
    urlTags.push(
      `  <url>\n    <loc>${SITE_URL}/pais-${code}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    )
    for (const visa of data.visaTypes) {
      // Vistos duplicados nao entram no sitemap: o sinal vai para a URL canonica.
      if (visaCanonicalUrl(code, visa.id)) continue
      const slug = visaPageUrlSlug(code, visa.id)
      urlTags.push(
        `  <url>\n    <loc>${SITE_URL}/vistos/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
      )
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlTags.join('\n')}\n</urlset>\n`

  await writeFile(join(PREVIEWS_DIR, 'sitemap.xml'), xml, 'utf-8')
}

// llms.txt: índice curado para assistentes de IA autorizados (busca/retrieval).
// Mantido em sincronia com os dados a cada build.
async function generateLlmsTxt(
  allData: Array<{ code: string; data: CountryData }>,
): Promise<void> {
  const latestIso = allData.reduce(
    (best, { data }) => (data.meta.lastUpdated > best ? data.meta.lastUpdated : best),
    '',
  )
  const cycle = latestIso ? monthLabelLong(latestIso) : ''

  const countryLines = allData
    .map(({ code, data }) => {
      const name = COUNTRY_CONFIG[code]?.displayName ?? code.toUpperCase()
      const n = data.visaTypes.length
      return `- [${name}](${SITE_URL}/pais-${code}): ${n} tipos de visto de trabalho monitorados, com requisitos, salário mínimo, taxas e prazos.`
    })
    .join('\n')

  const txt = `# Rota Legal

> Monitor mensal de condições de imigração legal para brasileiros que querem trabalhar na Europa. Dados de fontes oficiais de 10 países, em português, atualizados todo mês${cycle ? ` (ciclo atual: ${cycle})` : ''}.

Conteúdo factual e citável: nomes oficiais de vistos, salário mínimo exigido, prazos de processamento, documentação e direitos. Cada página de país lista seus vistos; cada visto tem página própria em ${SITE_URL}/vistos/.

Ponto de partida: [Trabalhar na Europa: guia para brasileiros](${SITE_URL}/trabalhar-na-europa) reúne os 10 países, salário, vistos e por onde começar.

## Países monitorados

${countryLines}

## Ferramentas

- [Comparações país a país](${SITE_URL}/comparar-paises): páginas editoriais comparando dois países (salário, vistos, idioma) para brasileiros.
- [Trabalhar por profissão](${SITE_URL}/profissoes): guias por profissão (enfermeiro, TI, motorista e mais) com países que contratam, visto e diploma.
- [Guias de imigração](${SITE_URL}/guias): explicações diretas (Chancenkarte da Alemanha, ETIAS) com fontes oficiais.
- [Comparar países](${SITE_URL}/comparar): vistos, salários e requisitos lado a lado.
- [Qual país é o meu](${SITE_URL}/qual-pais): recomendação por perfil em 6 perguntas.
- [Calculadora de reserva](${SITE_URL}/calculadora): quanto guardar para emigrar.
- [Histórico de mudanças](${SITE_URL}/historico): alterações mensais em vistos, salários e taxas.
- [Guia prático](${SITE_URL}/guia-pratico): passo a passo para brasileiros.

## Metodologia e dados

- [Sobre, metodologia e fontes](${SITE_URL}/sobre)
- [Dados abertos em JSON (GitHub)](https://github.com/vl-builds/rota-legal-monitor/tree/master/data/current)
- [Código-fonte (MIT)](https://github.com/vl-builds/rota-legal-monitor)
`

  await writeFile(join(PREVIEWS_DIR, 'llms.txt'), txt, 'utf-8')
}

// Correcoes de acessibilidade aplicadas a todas as paginas (idempotente):
// 1. envolve o conteudo em <main> (landmark) quando ausente;
// 2. converte os <h4> de coluna de rodape em <h3> para nao pular nivel de heading
//    (h4 so e usado nos rodapes; estilo coberto por .footer-grid h3 no CSS).
async function patchA11y(): Promise<void> {
  const entries = await readdir(PREVIEWS_DIR, { recursive: true }) as string[]
  let mainCount = 0
  let headCount = 0
  for (const rel of entries) {
    if (!rel.endsWith('.html')) continue
    const path = join(PREVIEWS_DIR, rel)
    let html = await readFile(path, 'utf-8')
    const orig = html

    if (/<h4(\s|>)/.test(html)) {
      html = html.replace(/<h4(\s[^>]*)?>/g, '<h3$1>').replace(/<\/h4>/g, '</h3>')
      headCount++
    }

    if (!/<main(\s|>)/.test(html)) {
      const secIdx = html.indexOf('<section')
      const footIdx = html.indexOf('<footer')
      if (secIdx !== -1 && footIdx !== -1 && secIdx < footIdx) {
        html = html.slice(0, footIdx) + '</main>\n' + html.slice(footIdx)
        html = html.slice(0, secIdx) + '<main>\n' + html.slice(secIdx)
        mainCount++
      }
    }

    if (html !== orig) await writeFile(path, html, 'utf-8')
  }
  console.log(`[ok] a11y: <main> adicionado em ${mainCount} páginas, headings de rodapé corrigidos em ${headCount}`)
}

async function main(): Promise<void> {
  const files = await readdir(DATA_DIR)
  const codes = files
    .filter(f => f.endsWith('.json') && f !== 'example.json' && f !== 'index.json')
    .map(f => f.replace('.json', ''))

  const allData: Array<{ code: string; data: CountryData }> = []

  // Pares de comparacao e links por pais (para "Comparar com outros paises").
  const comparePairs = COMPARE_PAIRS
    .filter(([x, y]) => COUNTRY_CONFIG[x] && COUNTRY_CONFIG[y])
    .map(([x, y]) => ({ a: compareCountry(x), b: compareCountry(y) }))
  const comparisonsByCode = new Map<string, Array<{ slug: string; label: string }>>()
  for (const { a, b } of comparePairs) {
    const slug = compareSlug(a, b)
    for (const [self, other] of [[a, b], [b, a]] as const) {
      const list = comparisonsByCode.get(self.code) ?? []
      list.push({ slug, label: `${self.name} ou ${other.name}` })
      comparisonsByCode.set(self.code, list)
    }
  }

  // Profissoes relevantes por pais (para "Profissoes em alta" na pagina de pais).
  const professionsByCode = new Map<string, Array<{ slug: string; label: string }>>()
  for (const p of PROFESSIONS) {
    for (const cc of p.countries) {
      const list = professionsByCode.get(cc) ?? []
      list.push({ slug: p.slug, label: p.titleNoun })
      professionsByCode.set(cc, list)
    }
  }

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
      comparisons: comparisonsByCode.get(code) ?? [],
      professions: (professionsByCode.get(code) ?? []).slice(0, 6),
    })

    const out = join(PREVIEWS_DIR, `pais-${code}.html`)
    await writeFile(out, html, 'utf-8')
    console.log(`[ok] pais-${code}.html — ${data.visaTypes.length} vistos, confiança: ${data.reliability.extractionConfidence}`)

    allData.push({ code, data })
  }

  await patchPaises(allData)
  console.log('[ok] paises.html atualizado')

  await patchHome(allData)
  console.log('[ok] index.html atualizado')

  const latestIso = allData.reduce(
    (best, { data }) => (data.meta.lastUpdated > best ? data.meta.lastUpdated : best),
    '',
  )
  if (latestIso) {
    await patchFooters(latestIso)
  }

  // Generate individual visa pages
  const VISTOS_DIR = join(PREVIEWS_DIR, 'vistos')
  await mkdir(VISTOS_DIR, { recursive: true })
  const relatedMap = buildRelatedMap(allData)
  let visaCount = 0
  for (const { code, data } of allData) {
    const cfg = COUNTRY_CONFIG[code]!
    for (const visa of data.visaTypes) {
      const related = relatedMap.get(`${code}/${visa.id}`) ?? []
      const html = generateVisaPage(visa, data, { code, ...cfg }, related, visaCanonicalUrl(code, visa.id))
      const slug = visaPageSlug(code, visa.id)
      await writeFile(join(VISTOS_DIR, slug), html, 'utf-8')
      visaCount++
    }
    console.log(`[vistos] ${code} — ${data.visaTypes.length} páginas geradas`)
  }

  console.log(`\nTotal: ${allData.length} países + ${visaCount} páginas de visto.`)

  // Paginas de comparacao pais x pais + hub
  const COMPARE_DIR = join(PREVIEWS_DIR, 'comparar-paises')
  await mkdir(COMPARE_DIR, { recursive: true })
  const dataByCode = new Map(allData.map(x => [x.code, x.data]))
  const cycleShort = latestIso ? monthLabel(latestIso) : ''
  let compareCount = 0
  for (const { a, b } of comparePairs) {
    const da = dataByCode.get(a.code)
    const db = dataByCode.get(b.code)
    if (!da || !db) continue
    const slug = compareSlug(a, b)
    const related = comparePairs
      .filter(p => p.a !== a || p.b !== b)
      .filter(p => p.a.code === a.code || p.b.code === a.code || p.a.code === b.code || p.b.code === b.code)
      .slice(0, 6)
      .map(p => ({ slug: compareSlug(p.a, p.b), label: `${p.a.name} ou ${p.b.name}` }))
    await writeFile(join(COMPARE_DIR, `${slug}.html`), generateComparePage(a, b, da, db, related), 'utf-8')
    compareCount++
  }
  await writeFile(join(PREVIEWS_DIR, 'comparar-paises.html'), generateCompareHub(comparePairs, cycleShort), 'utf-8')
  console.log(`[ok] ${compareCount} páginas de comparação + hub gerados`)

  // Paginas por profissao + hub
  const PROF_DIR = join(PREVIEWS_DIR, 'profissoes')
  await mkdir(PROF_DIR, { recursive: true })
  const profInfo = new Map<string, ProfCountryInfo>()
  for (const { code, data } of allData) {
    const cfg = COUNTRY_CONFIG[code]!
    profInfo.set(code, {
      code,
      name: cfg.displayName,
      flagClass: cfg.flagClass,
      language: COMPARE_META[code]?.language ?? '',
      data,
    })
  }
  const profYear = latestIso ? new Date(latestIso).getUTCFullYear() : new Date().getUTCFullYear()
  for (const p of PROFESSIONS) {
    const related = PROFESSIONS.filter(q => q.slug !== p.slug).slice(0, 6).map(q => ({ slug: q.slug, titleNoun: q.titleNoun }))
    await writeFile(join(PROF_DIR, `${p.slug}.html`), generateProfessionPage(p, profInfo, related), 'utf-8')
  }
  await writeFile(join(PREVIEWS_DIR, 'profissoes.html'), generateProfessionHub(PROFESSIONS, cycleShort, profYear), 'utf-8')
  console.log(`[ok] ${PROFESSIONS.length} páginas de profissão + hub gerados`)

  // Hub editorial de topo de funil: /trabalhar-na-europa
  const europaCountries: EuropaCountry[] = allData.map(({ code, data }) => ({
    code,
    name: COUNTRY_CONFIG[code]!.displayName,
    flagClass: COUNTRY_CONFIG[code]!.flagClass,
    language: COMPARE_META[code]?.language ?? '',
    data,
  }))
  await writeFile(
    join(PREVIEWS_DIR, 'trabalhar-na-europa.html'),
    generateEuropaHub(europaCountries, comparePairs, PROFESSIONS, cycleShort, profYear),
    'utf-8',
  )
  console.log('[ok] hub /trabalhar-na-europa gerado')

  // Guias editoriais + hub /guias
  const GUIAS_DIR = join(PREVIEWS_DIR, 'guias')
  await mkdir(GUIAS_DIR, { recursive: true })
  for (const g of GUIDES) {
    await writeFile(join(GUIAS_DIR, `${g.slug}.html`), generateGuidePage(g, cycleShort, profYear), 'utf-8')
  }
  await writeFile(join(PREVIEWS_DIR, 'guias.html'), generateGuidesHub(GUIDES, cycleShort, profYear), 'utf-8')
  console.log(`[ok] ${GUIDES.length} guias + hub gerados`)

  await generateSitemap(allData, comparePairs)
  console.log('[ok] sitemap.xml gerado')

  await generateLlmsTxt(allData)
  console.log('[ok] llms.txt gerado')

  await patchOpenGraph()
  console.log('[ok] open graph atualizado nas páginas estáticas')

  await patchA11y()

  await generateHistoricoJson(allData)
  console.log('[ok] historico.json gerado')
}

async function generateHistoricoJson(allData: Array<{ code: string; data: CountryData }>) {
  const HISTORY_DIR = join(ROOT, 'data', 'history')
  const seen = new Set<string>()
  const changes: Array<ReturnType<typeof normalizeChange>> = []

  function normalizeChange(ch: CountryData['recentChanges'][number], cc: string) {
    return { ...ch, country: cc }
  }

  for (const { code, data } of allData) {
    for (const ch of data.recentChanges ?? []) {
      const key = `${code}:${ch.date}:${ch.title}`
      if (!seen.has(key)) { seen.add(key); changes.push(normalizeChange(ch, code)) }
    }
  }

  for (const { code } of allData) {
    const dir = join(HISTORY_DIR, code)
    try {
      const files = (await readdir(dir)).filter(f => f.endsWith('.json'))
      for (const file of files) {
        const raw = await readFile(join(dir, file), 'utf-8')
        const snap = JSON.parse(raw) as CountryData
        for (const ch of snap.recentChanges ?? []) {
          const key = `${code}:${ch.date}:${ch.title}`
          if (!seen.has(key)) { seen.add(key); changes.push(normalizeChange(ch, code)) }
        }
      }
    } catch { /* pasta inexistente */ }
  }

  changes.sort((a, b) => b.date.localeCompare(a.date))

  await writeFile(
    join(ROOT, 'data', 'historico.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), total: changes.length, changes }, null, 2),
    'utf-8',
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
