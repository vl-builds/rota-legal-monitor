#!/usr/bin/env bun
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { generateCountryPage } from './country-page'
import type { CountryPageConfig } from './country-page'
import { generateVisaPage, visaPageSlug, visaPageUrlSlug } from './visa-page'
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
        html = html.replace(
          /<link[\s\S]*?href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*display=swap"[\s\S]*?\/>/,
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
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)

  const urlTags: string[] = []

  for (const { path, priority, changefreq } of STATIC_PAGES) {
    urlTags.push(
      `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    )
  }

  for (const { code, data } of allData) {
    const lastmod = data.meta.lastUpdated.slice(0, 10)
    urlTags.push(
      `  <url>\n    <loc>${SITE_URL}/pais-${code}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    )
    for (const visa of data.visaTypes) {
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

## Países monitorados

${countryLines}

## Ferramentas

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
      const html = generateVisaPage(visa, data, { code, ...cfg }, related)
      const slug = visaPageSlug(code, visa.id)
      await writeFile(join(VISTOS_DIR, slug), html, 'utf-8')
      visaCount++
    }
    console.log(`[vistos] ${code} — ${data.visaTypes.length} páginas geradas`)
  }

  console.log(`\nTotal: ${allData.length} países + ${visaCount} páginas de visto.`)

  await generateSitemap(allData)
  console.log('[ok] sitemap.xml gerado')

  await generateLlmsTxt(allData)
  console.log('[ok] llms.txt gerado')

  await patchOpenGraph()
  console.log('[ok] open graph atualizado nas páginas estáticas')

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
