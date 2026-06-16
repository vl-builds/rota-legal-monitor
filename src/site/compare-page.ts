import type { CountryData } from '@/extractors/schema'

export interface CompareCountry {
  code: string
  name: string        // nome de exibicao, ex: "Portugal"
  slug: string        // nome na URL, ex: "portugal"
  flagClass: string   // ex: "flag-pt"
  language: string    // ex: "Português"
  languageNote: string // ex: "mesmo idioma do Brasil"
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function monthLabel(iso: string): string {
  const d = new Date(iso)
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${months[d.getUTCMonth()]}/${d.getUTCFullYear()}`
}

function fmtMoney(m?: { amount?: number; currency?: string } | null): string {
  // Italia e Austria nao tem salario minimo nacional legal (vale acordo coletivo).
  if (!m || !m.amount) return 'Sem mínimo legal'
  const v = Math.round(m.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${m.currency || 'EUR'} ${v}`
}

function hasDigitalNomad(d: CountryData): boolean {
  return d.visaTypes.some(v => /nomad|digital|telework|teletrab/i.test(v.id) || /n[oô]made|digital|teletrab/i.test(v.name))
}

function fastestVisa(d: CountryData): string | null {
  // Heuristica: menor numero encontrado em estimatedDuration entre os vistos diretos
  let best: number | null = null
  let label: string | null = null
  for (const v of d.visaTypes) {
    const dur = v.process?.estimatedDuration
    if (!dur) continue
    const m = dur.match(/(\d+)/)
    if (!m || !m[1]) continue
    const n = parseInt(m[1], 10)
    if (best === null || n < best) { best = n; label = dur }
  }
  return label
}

function specialAgreement(d: CountryData): string | null {
  const ag = (d as any).forBrazilians?.specialAgreements
  if (Array.isArray(ag)) {
    const work = ag.find((a: any) => a.appliesToWork && a.name)
    if (work) return work.name
    if (ag[0]?.name) return ag[0].name
  }
  return null
}

interface Metrics {
  minWage: string
  visaCount: number
  fastest: string | null
  schengen: boolean
  nomad: boolean
  agreement: string | null
  updated: string
}

function metrics(d: CountryData): Metrics {
  return {
    minWage: fmtMoney(d.generalRequirements?.minimumWage),
    visaCount: d.visaTypes.length,
    fastest: fastestVisa(d),
    schengen: !!(d as any).forBrazilians?.schengenVisaFree,
    nomad: hasDigitalNomad(d),
    agreement: specialAgreement(d),
    updated: monthLabel(d.meta.lastUpdated),
  }
}

const PAGE_CSS = `
  .cmp-hero { padding: 88px 0 32px; }
  .cmp-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:16px; }
  .cmp-eyebrow .dot { width:6px; height:6px; border-radius:50%; background:var(--primary); }
  .cmp-h1 { font-size:clamp(30px,4.6vw,46px); font-weight:700; letter-spacing:-1px; line-height:1.12; color:var(--on-dark); margin:0 0 16px; max-width:900px; }
  .cmp-h1 .vs { color:var(--primary); }
  .cmp-lede { font-size:17px; line-height:1.6; color:var(--body); max-width:680px; margin:0; }
  .cmp-flags { display:flex; align-items:center; gap:14px; margin-bottom:18px; }
  .cmp-flags .cc-flag { width:44px; height:31px; border-radius:5px; display:block; }
  .cmp-flags .x { font-family:'JetBrains Mono',monospace; color:var(--muted); font-size:18px; }

  .cmp-body { max-width:880px; margin:0 auto; }
  .cmp-body h2 { font-size:clamp(22px,3.2vw,28px); font-weight:700; letter-spacing:-0.5px; color:var(--on-dark); margin:48px 0 16px; scroll-margin-top:90px; }
  .cmp-body p { font-size:16px; line-height:1.7; color:var(--body); margin:0 0 16px; }
  .cmp-body a { color:var(--primary); text-decoration:none; border-bottom:1px solid rgba(240,180,41,0.35); }
  .cmp-body a:hover { border-bottom-color:var(--primary); }
  .cmp-body strong { color:var(--on-dark); font-weight:600; }

  .cmp-table { width:100%; border-collapse:collapse; margin:8px 0 20px; font-size:15px; border:1px solid var(--hairline); border-radius:var(--r-lg); overflow:hidden; }
  .cmp-table th, .cmp-table td { padding:13px 16px; text-align:left; border-bottom:1px solid var(--hairline); }
  .cmp-table thead th { background:var(--surface-card); color:var(--muted); font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; }
  .cmp-table tbody tr:last-child td { border-bottom:none; }
  .cmp-table td:first-child { color:var(--muted); font-size:13px; width:34%; }
  .cmp-table td.val { color:var(--on-dark); font-weight:500; }
  .cmp-win { color:var(--primary); font-weight:700; }

  .cmp-cards { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:8px 0 20px; }
  @media (max-width:640px){ .cmp-cards { grid-template-columns:1fr; } }
  .cmp-card { background:var(--surface-card); border:1px solid var(--hairline); border-radius:var(--r-lg); padding:20px; }
  .cmp-card-h { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .cmp-card-h .cc-flag { width:30px; height:21px; border-radius:3px; }
  .cmp-card-h .nm { font-size:17px; font-weight:700; color:var(--on-dark); }
  .cmp-card ul { list-style:none; margin:0; padding:0; }
  .cmp-card li { font-size:14px; line-height:1.5; color:var(--body); padding-left:18px; position:relative; margin-bottom:8px; }
  .cmp-card li::before { content:""; position:absolute; left:4px; top:9px; width:5px; height:5px; border-radius:50%; background:var(--primary); }
  .cmp-card .more { font-size:13px; font-weight:600; color:var(--primary); }

  .cmp-ctaband { display:flex; flex-wrap:wrap; gap:12px; margin:24px 0 8px; }

  .cmp-faq-item { border-top:1px solid var(--hairline); padding:20px 0; }
  .cmp-faq-item:last-child { border-bottom:1px solid var(--hairline); }
  .cmp-faq-q { font-size:17px; font-weight:600; color:var(--on-dark); margin:0 0 8px; }
  .cmp-faq-a { font-size:15px; line-height:1.7; color:var(--body); margin:0; }
  .cmp-faq-a a { color:var(--primary); text-decoration:none; border-bottom:1px solid rgba(240,180,41,0.35); }

  .cmp-related { display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; }
  .cmp-related a { font-size:13px; padding:7px 13px; border:1px solid var(--hairline); border-radius:var(--r-pill); color:var(--body-strong); text-decoration:none; }
  .cmp-related a:hover { border-color:var(--primary); color:var(--primary); }
`

export function compareSlug(a: CompareCountry, b: CompareCountry): string {
  return `${a.slug}-vs-${b.slug}`
}

export function generateCompareHub(
  pairs: Array<{ a: CompareCountry; b: CompareCountry }>,
  updated: string,
): string {
  const year = new Date().getUTCFullYear() // placeholder, sobrescrito pelo build se preciso
  const cards = pairs.map(({ a, b }) => `
        <a class="cmp-hubcard" href="/comparar-paises/${compareSlug(a, b)}">
          <div class="cmp-hub-flags"><span class="cc-flag ${a.flagClass}"></span><span class="cc-flag ${b.flagClass}"></span></div>
          <span class="cmp-hub-name">${a.name} ou ${b.name}</span>
          <span class="cmp-hub-cue">Comparar →</span>
        </a>`).join('')
  const title = 'Comparar Países para Imigrar na Europa | Rota Legal'
  const desc = 'Comparações lado a lado de países europeus para brasileiros: salário mínimo, vistos de trabalho, idioma e requisitos. Dados oficiais atualizados todo mês.'
  const url = 'https://rotalegal.pro/comparar-paises'
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    url,
    name: 'Comparar países para imigrar na Europa',
    description: desc,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': 'https://rotalegal.pro/#website' },
    publisher: { '@id': 'https://rotalegal.pro/#organization' },
  }
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<link rel="icon" type="image/png" href="/favicon.png" />
<link rel="apple-touch-icon" href="/favicon.png" />
<link rel="canonical" href="${url}" />
<meta name="description" content="${desc}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Rota Legal" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="https://rotalegal.pro/assets/og-default.png" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" as="style" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
<noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" /></noscript>
<link rel="stylesheet" href="/assets/design-system.css" />
<style>
  .cmp-hub-hero { padding:88px 0 24px; }
  .cmp-hub-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; padding-bottom:64px; }
  .cmp-hubcard { display:flex; flex-direction:column; gap:10px; padding:18px; background:var(--surface-card); border:1px solid var(--hairline); border-radius:var(--r-lg); text-decoration:none; transition:border-color 160ms ease, transform 160ms ease; }
  .cmp-hubcard:hover { border-color:var(--primary); transform:translateY(-2px); }
  .cmp-hub-flags { display:flex; gap:6px; }
  .cmp-hub-flags .cc-flag { width:30px; height:21px; border-radius:3px; }
  .cmp-hub-name { font-size:16px; font-weight:600; color:var(--on-dark); }
  .cmp-hub-cue { font-size:13px; color:var(--primary); font-weight:600; }
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<div class="bg-orbs" aria-hidden="true"><div class="orb-3"></div></div>
<nav class="top-nav">
  <div class="container">
    <a class="logo" href="/"><img src="/assets/images/logonobg.png" alt="Rota Legal" style="height:26px;width:auto;display:block;"><span>Rota Legal</span></a>
    <div class="nav-links">
      <a class="nav-link" href="/paises">Países</a>
      <a class="nav-link" href="/comparar">Comparar</a>
      <a class="nav-link" href="/guia-pratico">Guia Prático</a>
      <a class="nav-link" href="/calculadora">Calculadora</a>
      <a class="nav-link" href="/historico">Histórico</a>
      <a class="nav-link" href="/sobre">Sobre</a>
    </div>
    <div class="nav-right"><a class="btn btn-primary" href="/qual-pais">Qual país é o meu?</a></div>
  </div>
</nav>
<main>
  <section class="cmp-hub-hero">
    <div class="container">
      <div class="eyebrow" style="margin-bottom:16px;"><span class="dot"></span>Comparações para brasileiros · ${updated}</div>
      <h1 class="display-md" style="max-width:760px;">Comparar países para imigrar na Europa</h1>
      <p class="lede" style="max-width:620px;">Escolher entre dois destinos fica mais fácil lado a lado. Cada comparação reúne salário mínimo, tipos de visto de trabalho, idioma e requisitos, com dados oficiais atualizados todo mês.</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container">
      <div class="cmp-hub-grid">${cards}</div>
      <p class="body-sm" style="color:var(--muted);">Quer uma recomendação por perfil? Faça o <a class="text-link" href="/qual-pais">questionário Qual país é o meu</a> ou veja <a class="text-link" href="/paises">todos os 10 países</a>.</p>
    </div>
  </section>
</main>
<footer>
  <div class="container">
    <div class="footer-bottom">
      <span>© ${year} Rota Legal · <a href="https://github.com/vl-builds" target="_blank" rel="noopener noreferrer">vl-builds</a> · MIT</span>
      <nav class="footer-legal" aria-label="Links legais"><a href="/politica-privacidade">Privacidade</a><a href="/politica-cookies">Cookies</a><a href="/termos-uso">Termos</a></nav>
      <span class="caption-up">Última extração: ${updated}</span>
    </div>
  </div>
</footer>
<script src="/assets/nav.js" defer></script>
</body>
</html>
`
}

function row(label: string, va: string, vb: string, winner: 0 | 1 | 2): string {
  const ca = winner === 1 ? ' cmp-win' : ''
  const cb = winner === 2 ? ' cmp-win' : ''
  return `<tr><td>${label}</td><td class="val${ca}">${va}</td><td class="val${cb}">${vb}</td></tr>`
}

export function generateComparePage(
  a: CompareCountry,
  b: CompareCountry,
  da: CountryData,
  db: CountryData,
  related: Array<{ slug: string; label: string }> = [],
): string {
  const ma = metrics(da)
  const mb = metrics(db)
  const year = new Date(da.meta.lastUpdated).getUTCFullYear()
  const slug = compareSlug(a, b)
  const url = `https://rotalegal.pro/comparar-paises/${slug}`

  const wageA = da.generalRequirements?.minimumWage?.amount || 0
  const wageB = db.generalRequirements?.minimumWage?.amount || 0
  const bothHaveWage = wageA > 0 && wageB > 0
  // Sem comparacao de "vencedor" quando um pais nao tem salario minimo legal.
  const wageWinner: 0 | 1 | 2 = !bothHaveWage ? 0 : wageA === wageB ? 0 : wageA > wageB ? 1 : 2
  const noWageCountry = wageA === 0 ? a.name : wageB === 0 ? b.name : null
  const visaWinner: 0 | 1 | 2 = ma.visaCount === mb.visaCount ? 0 : ma.visaCount > mb.visaCount ? 1 : 2

  const titleCore = `${a.name} ou ${b.name} para brasileiros (${year})`
  const title = titleCore.length + 13 <= 60 ? `${titleCore} | Rota Legal` : titleCore
  const desc = `${a.name} ou ${b.name}: compare salário mínimo, vistos de trabalho, prazos e idioma para brasileiros. Dados oficiais atualizados em ${ma.updated}.`

  // Texto interpretativo derivado dos dados (sem inventar)
  const verdicts: string[] = []
  if (wageWinner !== 0) verdicts.push(`<strong>${wageWinner === 1 ? a.name : b.name}</strong> tem o salário mínimo mais alto (${wageWinner === 1 ? ma.minWage : mb.minWage} contra ${wageWinner === 1 ? mb.minWage : ma.minWage}).`)
  else if (noWageCountry) verdicts.push(`<strong>${noWageCountry}</strong> não tem salário mínimo nacional fixado por lei: a remuneração segue os acordos coletivos do setor, o que pode significar pisos altos em áreas qualificadas.`)
  const ptLang = [a, b].find(c => c.code === 'pt')
  if (ptLang) verdicts.push(`<strong>Portugal</strong> não tem barreira de idioma para brasileiros, vantagem direta na contratação e na vida cotidiana.`)
  if (ma.agreement && a.code === 'pt') verdicts.push(`Portugal oferece o <strong>${ma.agreement}</strong>, que aproxima direitos de brasileiros residentes.`)
  if (mb.agreement && b.code === 'pt') verdicts.push(`Portugal oferece o <strong>${mb.agreement}</strong>, que aproxima direitos de brasileiros residentes.`)
  if (ma.nomad && !mb.nomad) verdicts.push(`Apenas <strong>${a.name}</strong> tem visto de nômade digital catalogado, opção para quem trabalha remoto.`)
  if (mb.nomad && !ma.nomad) verdicts.push(`Apenas <strong>${b.name}</strong> tem visto de nômade digital catalogado, opção para quem trabalha remoto.`)
  if (visaWinner !== 0) verdicts.push(`<strong>${visaWinner === 1 ? a.name : b.name}</strong> tem mais tipos de visto de trabalho catalogados (${visaWinner === 1 ? ma.visaCount : mb.visaCount} contra ${visaWinner === 1 ? mb.visaCount : ma.visaCount}), o que amplia os caminhos possíveis.`)
  const verdictHtml = verdicts.map(v => `<li>${v}</li>`).join('')

  // Perfil de cada pais, montado a partir dos dados extraidos (sem inventar).
  const profile = (c: CompareCountry, m: Metrics): string =>
    `<p><strong>${c.name}</strong> tem como idioma ${c.language.toLowerCase()} (${c.languageNote}) e ${m.visaCount} tipos de visto de trabalho catalogados pelo Rota Legal, com salário mínimo nacional de ${m.minWage} por mês.` +
    `${m.schengen ? ' Faz parte do espaço Schengen, o que facilita a entrada e a circulação pela maior parte da Europa.' : ' Tem regras de entrada próprias, fora do espaço Schengen.'}` +
    `${m.fastest ? ` O prazo de processamento mais curto entre os vistos monitorados é de ${esc(m.fastest)}.` : ''}` +
    `${m.nomad ? ' Oferece visto específico para quem trabalha de forma remota (nômade digital).' : ''}` +
    `${m.agreement ? ` Mantém com o Brasil o acordo ${esc(m.agreement)}, que pesa a favor de quem é brasileiro.` : ''}</p>`

  // top vistos por pais (ate 4 diretos)
  const topVisas = (d: CountryData, c: CompareCountry) =>
    d.visaTypes
      .filter(v => v.relevanceForDelivery === 'direct')
      .slice(0, 4)
      .map(v => `<li><a href="/vistos/${c.code}-${v.id}">${esc(v.name.length > 52 ? v.name.slice(0, 52) + '…' : v.name)}</a></li>`)
      .join('') || d.visaTypes.slice(0, 4).map(v => `<li><a href="/vistos/${c.code}-${v.id}">${esc(v.name.length > 52 ? v.name.slice(0, 52) + '…' : v.name)}</a></li>`).join('')

  const langCell = (c: CompareCountry) => `${c.language}<br><span style="color:var(--muted);font-size:12px;">${c.languageNote}</span>`

  const faqs: Array<{ q: string; a: string }> = [
    {
      q: `${a.name} ou ${b.name}: qual é mais fácil para brasileiros?`,
      a: `Depende do seu perfil. ${a.code === 'pt' || b.code === 'pt' ? 'Portugal costuma ser o mais acessível pelo idioma e pelos acordos com o Brasil. ' : ''}Cada país tem vistos com requisitos próprios, e o melhor depende da sua profissão e qualificação. Use o questionário Qual país é o meu para uma recomendação por perfil.`,
    },
    {
      q: `Qual paga mais, ${a.name} ou ${b.name}?`,
      a: noWageCountry
        ? `${noWageCountry} não tem salário mínimo nacional fixado por lei: a remuneração segue acordos coletivos por setor. Compare pelo salário real da sua profissão, que costuma ficar acima de qualquer piso.`
        : `Pelo salário mínimo nacional, ${wageWinner === 0 ? `os dois são semelhantes (${ma.minWage})` : `${wageWinner === 1 ? a.name : b.name} paga mais (${wageWinner === 1 ? ma.minWage : mb.minWage} contra ${wageWinner === 1 ? mb.minWage : ma.minWage})`}. O salário real da sua profissão pode variar bastante acima do mínimo.`,
    },
    {
      q: `Preciso saber o idioma para trabalhar em ${a.name} ou ${b.name}?`,
      a: `${a.name} usa ${a.language.toLowerCase()} (${a.languageNote}) e ${b.name} usa ${b.language.toLowerCase()} (${b.languageNote}). O peso do idioma depende do visto e da profissão, mas costuma influenciar a contratação e a integração.`,
    },
    {
      q: `Quantos tipos de visto de trabalho ${a.name} e ${b.name} oferecem?`,
      a: `O Rota Legal monitora ${ma.visaCount} tipos de visto em ${a.name} e ${mb.visaCount} em ${b.name}, atualizados em ${ma.updated}. Veja a lista completa em cada página de país.`,
    },
    {
      q: `Dá para entrar em ${a.name} ou ${b.name} como turista e depois trabalhar?`,
      a: `Não de forma legal. A entrada sem visto vale apenas para turismo. Para trabalhar é preciso o visto de trabalho ou a autorização de residência correta, na maioria dos casos solicitada antes de viajar. O passo a passo está no guia prático.`,
    },
    {
      q: `Quanto preciso guardar para emigrar para ${a.name} ou ${b.name}?`,
      a: `Além das taxas de visto, conte com apostila e tradução de documentos, seguro saúde, passagem e a reserva financeira que muitos vistos exigem como prova de subsistência. A calculadora de reserva estima o valor por país e estilo de vida.`,
    },
  ]
  const faqHtml = faqs.map(f => `
        <div class="cmp-faq-item">
          <p class="cmp-faq-q">${esc(f.q)}</p>
          <p class="cmp-faq-a">${f.a}</p>
        </div>`).join('')

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: `${a.name} ou ${b.name} para brasileiros: comparação`,
        description: desc,
        datePublished: da.meta.lastUpdated.slice(0, 10),
        dateModified: da.meta.lastUpdated.slice(0, 10),
        inLanguage: 'pt-BR',
        isPartOf: { '@id': 'https://rotalegal.pro/#website' },
        author: { '@id': 'https://rotalegal.pro/#organization' },
        publisher: { '@id': 'https://rotalegal.pro/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://rotalegal.pro/' },
          { '@type': 'ListItem', position: 2, name: 'Comparar países', item: 'https://rotalegal.pro/comparar-paises' },
          { '@type': 'ListItem', position: 3, name: `${a.name} vs ${b.name}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
        })),
      },
    ],
  }

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<link rel="icon" type="image/png" href="/favicon.png" />
<link rel="apple-touch-icon" href="/favicon.png" />
<link rel="canonical" href="${url}" />
<meta name="description" content="${esc(desc)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Rota Legal" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="https://rotalegal.pro/assets/og-default.png" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" as="style" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
<noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" /></noscript>
<link rel="stylesheet" href="/assets/design-system.css" />
<style>${PAGE_CSS}</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<div class="bg-orbs" aria-hidden="true"><div class="orb-3"></div></div>

<nav class="top-nav">
  <div class="container">
    <a class="logo" href="/">
      <img src="/assets/images/logonobg.png" alt="Rota Legal" style="height: 26px; width: auto; display: block;">
      <span>Rota Legal</span>
    </a>
    <div class="nav-links">
      <a class="nav-link" href="/paises">Países</a>
      <a class="nav-link" href="/comparar">Comparar</a>
      <a class="nav-link" href="/guia-pratico">Guia Prático</a>
      <a class="nav-link" href="/calculadora">Calculadora</a>
      <a class="nav-link" href="/historico">Histórico</a>
      <a class="nav-link" href="/sobre">Sobre</a>
    </div>
    <div class="nav-right">
      <a class="btn btn-primary" href="/qual-pais">Qual país é o meu?</a>
    </div>
  </div>
</nav>

<main>
  <section class="cmp-hero">
    <div class="container">
      <div class="cmp-body">
        <div class="cmp-eyebrow"><span class="dot"></span>Comparação para brasileiros · ${ma.updated}</div>
        <div class="cmp-flags">
          <span class="cc-flag ${a.flagClass}" aria-hidden="true"></span>
          <span class="x">vs</span>
          <span class="cc-flag ${b.flagClass}" aria-hidden="true"></span>
        </div>
        <h1 class="cmp-h1">${a.name} <span class="vs">ou</span> ${b.name} para brasileiros: vistos, salários e requisitos</h1>
        <p class="cmp-lede">Comparação lado a lado com dados oficiais de imigração. Veja salário mínimo, tipos de visto de trabalho, idioma e o que pesa na decisão para quem é do Brasil.</p>
      </div>
    </div>
  </section>

  <section style="padding-top:0;">
    <div class="container">
      <article class="cmp-body">
        <h2 id="rapido">Comparação rápida</h2>
        <table class="cmp-table">
          <thead><tr><th></th><th>${a.name}</th><th>${b.name}</th></tr></thead>
          <tbody>
            ${row('Salário mínimo (mês)', ma.minWage, mb.minWage, wageWinner)}
            ${row('Tipos de visto de trabalho', String(ma.visaCount), String(mb.visaCount), visaWinner)}
            ${row('Idioma', langCell(a), langCell(b), 0)}
            ${row('Entra sem visto (turismo)', ma.schengen ? 'Schengen, até 90 dias' : 'Verificar regras', mb.schengen ? 'Schengen, até 90 dias' : 'Verificar regras', 0)}
            ${row('Visto de nômade digital', ma.nomad ? 'Sim' : 'Não catalogado', mb.nomad ? 'Sim' : 'Não catalogado', 0)}
            ${row('Acordo especial com o Brasil', ma.agreement ? esc(ma.agreement) : 'Nenhum específico', mb.agreement ? esc(mb.agreement) : 'Nenhum específico', 0)}
          </tbody>
        </table>

        <h2 id="qual">Qual é melhor para brasileiros?</h2>
        <p>Não existe resposta única: o melhor país é o que combina com a sua profissão, qualificação e prioridades. Com base nos dados oficiais deste ciclo, estes são os pontos que diferenciam ${a.name} e ${b.name}:</p>
        <ul style="list-style:none;padding:0;margin:0 0 16px;">${verdictHtml || `<li style="padding-left:18px;position:relative;"><span style="position:absolute;left:4px;top:9px;width:5px;height:5px;border-radius:50%;background:var(--primary);display:block;"></span>Os dois países têm condições próximas: vale comparar pela sua profissão e pelo idioma.</li>`}</ul>
        <p>Para uma recomendação personalizada, responda ao <a href="/qual-pais">questionário Qual país é o meu</a> ou use a <a href="/comparar">ferramenta de comparação interativa</a>.</p>

        <h2 id="panorama">O panorama de cada país</h2>
        ${profile(a, ma)}
        ${profile(b, mb)}
        <p>Na prática, a escolha depende menos do país no abstrato e mais de três coisas: a sua profissão (e se ela está em falta no destino), o idioma que você já tem ou está disposto a aprender, e quanto tempo pretende ficar. Um país com salário maior pode render menos no fim do mês se o custo de vida for alto, e um visto rápido vale pouco se a sua área não tiver demanda local.</p>

        <h2 id="vistos">Vistos de trabalho em cada país</h2>
        <div class="cmp-cards">
          <div class="cmp-card">
            <div class="cmp-card-h"><span class="cc-flag ${a.flagClass}"></span><span class="nm">${a.name}</span></div>
            <ul>${topVisas(da, a)}</ul>
            <a class="more" href="/pais-${a.code}">Ver todos os ${ma.visaCount} vistos de ${a.name} →</a>
          </div>
          <div class="cmp-card">
            <div class="cmp-card-h"><span class="cc-flag ${b.flagClass}"></span><span class="nm">${b.name}</span></div>
            <ul>${topVisas(db, b)}</ul>
            <a class="more" href="/pais-${b.code}">Ver todos os ${mb.visaCount} vistos de ${b.name} →</a>
          </div>
        </div>

        <h2 id="custos">Salário e custo de vida</h2>
        <p>O salário mínimo é o piso legal, não o que você vai ganhar: a remuneração real da sua profissão costuma ficar acima. Em ${a.name} o mínimo é ${ma.minWage} por mês e em ${b.name}, ${mb.minWage}. A diferença entre os dois importa menos do que a relação entre salário e custo de vida local, porque é ela que define quanto sobra no fim do mês.</p>
        <p>Antes de viajar, vale dimensionar a reserva financeira: além das taxas de visto, há apostila e tradução de documentos, seguro saúde, passagem e, em muitos vistos, a comprovação de meios de subsistência. Para estimar o valor com base no país e no estilo de vida, use a <a href="/calculadora">calculadora de reserva</a>. Para acompanhar mudanças de salário mínimo, taxas e regras, o <a href="/historico">histórico de alterações</a> registra cada atualização mês a mês.</p>

        <div class="cmp-ctaband">
          <a class="btn btn-primary" href="/qual-pais">Descobrir o meu país</a>
          <a class="btn btn-secondary" href="/comparar">Comparar na ferramenta</a>
        </div>

        <h2 id="faq">Perguntas frequentes</h2>
        ${faqHtml}

        <h2 id="outras">Outras comparações</h2>
        <div class="cmp-related">${related.map(r => `<a href="/comparar-paises/${r.slug}">${esc(r.label)}</a>`).join('')}</div>
        <p style="margin-top:14px;"><a href="/comparar-paises">Ver todas as comparações entre países →</a></p>
      </article>
    </div>
  </section>
</main>

<footer>
  <div class="container">
    <div class="footer-bottom">
      <span>© ${year} Rota Legal · <a href="https://github.com/vl-builds" target="_blank" rel="noopener noreferrer">vl-builds</a> · MIT</span>
      <nav class="footer-legal" aria-label="Links legais"><a href="/politica-privacidade">Privacidade</a><a href="/politica-cookies">Cookies</a><a href="/termos-uso">Termos</a></nav>
      <span class="caption-up">Última extração: ${ma.updated}</span>
    </div>
  </div>
</footer>

<script src="/assets/nav.js" defer></script>
</body>
</html>
`
}
