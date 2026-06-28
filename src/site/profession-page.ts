import type { CountryData } from '@/extractors/schema'

export interface ProfCountryInfo {
  code: string
  name: string
  flagClass: string
  language: string
  data: CountryData
}

export interface Profession {
  slug: string          // URL: /profissoes/{slug}
  noun: string          // "enfermeiro", para frases
  titleNoun: string     // "Enfermeiro", titulo
  countries: string[]   // cc em ordem de prioridade
  needsDegree: boolean  // exige diploma superior
  lead: string          // paragrafo de abertura (factual, geral)
  demand: string        // paragrafo sobre demanda (factual, geral)
  diploma: string       // paragrafo sobre validacao de diploma/credencial
  visaHint: string      // que tipo de visto buscar (geral)
}

// Profissoes curadas (validadas por pesquisa de SERP). A copy e factual e geral:
// nao traz numeros de salario por profissao (esses variam), apenas o salario
// minimo nacional vem dos dados. Cada pagina linka aos paises e vistos.
export const PROFESSIONS: Profession[] = [
  {
    slug: 'enfermeiro-europa', noun: 'enfermeiro', titleNoun: 'Enfermeiro',
    countries: ['de', 'pt', 'it', 'nl', 'ie'], needsDegree: true,
    lead: 'A enfermagem é uma das profissões com maior escassez de mão de obra na Europa, e vários países recrutam ativamente fora do bloco. Para brasileiros, isso significa caminhos de visto mais curtos e, em alguns casos, apoio do empregador na mudança.',
    demand: 'A Alemanha está entre os países que mais buscam enfermeiros estrangeiros, com programas que chegam a custear viagem e aulas de idioma. Portugal e Itália também têm demanda no setor de saúde, com a vantagem da proximidade do idioma para quem vem do Brasil.',
    diploma: 'O diploma de enfermagem precisa ser reconhecido pelo órgão competente de cada país (a ordem profissional ou a autoridade de saúde regional), o que costuma exigir documentação apostilada, tradução juramentada e, em vários casos, comprovação de idioma. Os requisitos exatos por país estão nas páginas de visto correspondentes.',
    visaHint: 'Busque os vistos de trabalho qualificado ou de profissional altamente qualificado de cada país, que costumam ser a porta de entrada para a área de saúde.',
  },
  {
    slug: 'desenvolvedor-ti-europa', noun: 'profissional de TI', titleNoun: 'Desenvolvedor e Profissional de TI',
    countries: ['ie', 'de', 'nl'], needsDegree: false,
    lead: 'Tecnologia é a área em que brasileiros têm um dos caminhos mais rápidos para a Europa. O mercado opera em inglês em boa parte dos polos, a demanda é alta e os vistos para qualificados costumam ter critérios transparentes.',
    demand: 'A Irlanda concentra sedes europeias de grandes empresas de tecnologia em Dublin, com forte demanda por desenvolvedores. Alemanha e Países Baixos têm rotas rápidas para profissionais qualificados, incluindo o EU Blue Card, e em alguns casos não exigem oferta de emprego prévia para áreas em falta.',
    diploma: 'Em TI, a experiência comprovada costuma pesar tanto quanto o diploma. Ainda assim, o EU Blue Card e vistos equivalentes podem pedir diploma superior ou tempo de experiência mínimo. Verifique o requisito de cada visto na página do país.',
    visaHint: 'O EU Blue Card e os vistos de profissional altamente qualificado são os mais usados por quem trabalha com tecnologia.',
  },
  {
    slug: 'motorista-profissional-europa', noun: 'motorista profissional', titleNoun: 'Motorista Profissional',
    countries: ['pt', 'ie', 'de'], needsDegree: false,
    lead: 'A Europa tem um déficit grande de motoristas profissionais de caminhão e ônibus, e o setor aceita candidatos sem diploma superior. É um dos caminhos mais acessíveis para brasileiros com experiência ao volante.',
    demand: 'Portugal, Irlanda e Alemanha estão entre os países com mais vagas abertas no transporte. A escassez é estrutural, o que mantém a demanda alta e, muitas vezes, com empresas dispostas a contratar do exterior.',
    diploma: 'A CNH brasileira não é convertida automaticamente. Em geral é preciso obter a habilitação profissional local e, em vários países, uma certificação de aptidão (como o CAM em Portugal), o que envolve curso e exames. Confirme o processo na página de cada país.',
    visaHint: 'Procure os vistos de trabalho que não exigem qualificação superior, voltados a ocupações em falta.',
  },
  {
    slug: 'cuidador-de-idosos-europa', noun: 'cuidador de idosos', titleNoun: 'Cuidador de Idosos',
    countries: ['at', 'de', 'pt'], needsDegree: false,
    lead: 'O envelhecimento da população europeia criou um déficit agudo de cuidadores de idosos, um dos poucos setores que aceita profissionais sem nível superior. Para muitos brasileiros, é a porta de entrada mais realista.',
    demand: 'Áustria e Alemanha têm programas e alta demanda no cuidado a idosos, incluindo funções de auxiliar que não exigem diploma. Portugal também tem rotatividade no setor de apoio domiciliar e de saúde.',
    diploma: 'Para funções de auxiliar, o requisito costuma ser experiência e, às vezes, um curso de qualificação básica reconhecido localmente. Para funções de enfermagem, vale o reconhecimento de diploma. Cada página de país detalha o que é exigido.',
    visaHint: 'Vistos de trabalho para ocupações em falta e de qualificação não-superior são os mais comuns nesse setor.',
  },
  {
    slug: 'cozinheiro-europa', noun: 'cozinheiro', titleNoun: 'Cozinheiro e Profissional de Gastronomia',
    countries: ['pt', 'es', 'ie'], needsDegree: false,
    lead: 'A hotelaria e a restauração contratam do Brasil com frequência, e a maioria das vagas valoriza experiência mais do que diploma. É uma das áreas mais acessíveis para quem não tem formação superior.',
    demand: 'Portugal e Espanha recrutam para hotéis e restaurantes, com a vantagem do idioma próximo. A Irlanda tem alta rotatividade no setor de alimentação e bebidas, o que mantém vagas abertas com frequência.',
    diploma: 'Não costuma haver exigência de diploma. O que conta é a experiência comprovada e, em alguns casos, referências. O idioma local ajuda na contratação, mesmo onde o inglês resolve.',
    visaHint: 'Vistos de trabalho para ocupações de serviços e em falta são a rota mais comum.',
  },
  {
    slug: 'engenheiro-europa', noun: 'engenheiro', titleNoun: 'Engenheiro',
    countries: ['de', 'nl', 'ie'], needsDegree: true,
    lead: 'Engenharia é uma área de qualificação alta com boa demanda na Europa, especialmente em mercados industriais e de tecnologia. Brasileiros com diploma e experiência têm acesso a vistos rápidos.',
    demand: 'Alemanha e Países Baixos têm forte demanda por engenheiros nas áreas civil, mecânica e elétrica, com o EU Blue Card como rota direta. A Irlanda também contrata para projetos de tecnologia e construção.',
    diploma: 'O diploma de engenharia costuma precisar de reconhecimento, e algumas funções pedem registro em ordem profissional. O EU Blue Card exige diploma superior compatível com a vaga. Veja o requisito na página de cada país.',
    visaHint: 'O EU Blue Card e os vistos de profissional altamente qualificado são os principais caminhos.',
  },
  {
    slug: 'dentista-europa', noun: 'dentista', titleNoun: 'Dentista',
    countries: ['pt', 'de', 'it'], needsDegree: true,
    lead: 'A odontologia tem demanda na Europa, e o caminho varia bastante de país para país, sobretudo pela exigência de reconhecimento do diploma e de idioma.',
    demand: 'Portugal costuma ter o processo mais direto para brasileiros, com reconhecimento de diploma e inscrição na ordem profissional. Alemanha tem demanda, porém com um processo de habilitação mais burocrático e exigência de idioma.',
    diploma: 'É obrigatório reconhecer o diploma e se inscrever na ordem profissional do país (como a OMD em Portugal). Em alguns países há exames de equivalência e prova de idioma. Os detalhes estão nas páginas de visto qualificado de cada país.',
    visaHint: 'Vistos de trabalho qualificado ou altamente qualificado são a base para a área de saúde.',
  },
  {
    slug: 'fisioterapeuta-europa', noun: 'fisioterapeuta', titleNoun: 'Fisioterapeuta',
    countries: ['de', 'pt'], needsDegree: true,
    lead: 'A fisioterapia é uma profissão de saúde com demanda crescente na Europa, em especial em países com população mais envelhecida.',
    demand: 'A Alemanha tem alta demanda por fisioterapeutas, com necessidade de reconhecimento profissional e idioma. Portugal oferece um caminho com a vantagem do idioma, mediante reconhecimento de diploma.',
    diploma: 'O reconhecimento do diploma é obrigatório e, na Alemanha, costuma vir acompanhado de exigência de proficiência no idioma. Confira o processo na página de cada país.',
    visaHint: 'Vistos de trabalho qualificado da área de saúde são o ponto de partida.',
  },
]

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function monthLabel(iso: string): string {
  const d = new Date(iso)
  const m = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${m[d.getUTCMonth()]}/${d.getUTCFullYear()}`
}
function fmtMoney(m?: { amount?: number; currency?: string } | null): string {
  // Italia e Austria nao tem salario minimo nacional legal (vale acordo coletivo).
  if (!m || !m.amount) return 'Sem mínimo legal'
  const v = Math.round(m.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${m.currency || 'EUR'} ${v}`
}

const PAGE_CSS = `
  .pf-hero { padding:88px 0 24px; }
  .pf-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:16px; }
  .pf-eyebrow .dot { width:6px; height:6px; border-radius:50%; background:var(--primary); }
  .pf-body { max-width:820px; margin:0 auto; }
  .pf-h1 { font-size:clamp(28px,4.4vw,44px); font-weight:700; letter-spacing:-1px; line-height:1.14; color:var(--on-dark); margin:0 0 16px; }
  .pf-lede { font-size:17px; line-height:1.6; color:var(--body); max-width:680px; margin:0; }
  .pf-body h2 { font-size:clamp(22px,3.2vw,28px); font-weight:700; letter-spacing:-0.5px; color:var(--on-dark); margin:46px 0 16px; scroll-margin-top:90px; }
  .pf-body p { font-size:16px; line-height:1.7; color:var(--body); margin:0 0 16px; }
  .pf-body a:not(.btn) { color:var(--primary); text-decoration:none; border-bottom:1px solid rgba(240,180,41,0.35); }
  .pf-body strong { color:var(--on-dark); font-weight:600; }
  .pf-table { width:100%; border-collapse:collapse; margin:8px 0 18px; font-size:15px; border:1px solid var(--hairline); border-radius:var(--r-lg); overflow:hidden; }
  .pf-table th, .pf-table td { padding:12px 15px; text-align:left; border-bottom:1px solid var(--hairline); }
  .pf-table thead th { background:var(--surface-card); color:var(--muted); font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; }
  .pf-table tbody tr:last-child td { border-bottom:none; }
  .pf-table .ct { display:flex; align-items:center; gap:9px; }
  .pf-table .ct .cc-flag { width:26px; height:18px; border-radius:3px; }
  .pf-table .ct a { color:var(--on-dark); font-weight:600; border:none; }
  .pf-note { font-size:13px; color:var(--muted); margin:0 0 18px; }
  .pf-cta { display:flex; flex-wrap:wrap; gap:12px; margin:22px 0 8px; }
  .pf-faq-item { border-top:1px solid var(--hairline); padding:18px 0; }
  .pf-faq-item:last-child { border-bottom:1px solid var(--hairline); }
  .pf-faq-q { font-size:17px; font-weight:600; color:var(--on-dark); margin:0 0 8px; }
  .pf-faq-a { font-size:15px; line-height:1.7; color:var(--body); margin:0; }
  .pf-related { display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; }
  .pf-related a { font-size:13px; padding:7px 13px; border:1px solid var(--hairline); border-radius:var(--r-pill); color:var(--body-strong); text-decoration:none; }
  .pf-related a:hover { border-color:var(--primary); color:var(--primary); }
`

function navHtml(): string {
  return `<nav class="top-nav">
  <div class="container">
    <a class="logo" href="/"><img src="/assets/images/logonobg.png" alt="Rota Legal" style="height:26px;width:auto;display:block;"><span>Rota Legal</span></a>
    <div class="nav-links">
      <a class="nav-link" href="/paises">Países</a>
      <a class="nav-link" href="/comparar">Comparar</a>
      <a class="nav-link" href="/guia-pratico">Guia Prático</a>
      <a class="nav-link" href="/profissoes">Profissões</a>
      <a class="nav-link" href="/guias">Guias</a>
      <a class="nav-link" href="/calculadora">Calculadora</a>
      <a class="nav-link" href="/historico">Histórico</a>
      <a class="nav-link" href="/sobre">Sobre</a>
    </div>
    <div class="nav-right"><a class="btn btn-primary" href="/qual-pais">Qual país é o meu?</a></div>
  </div>
</nav>`
}
function footerHtml(year: number, updated: string): string {
  return `<footer>
  <div class="container">
    <div class="footer-bottom">
      <span>© ${year} Rota Legal · <a href="https://github.com/vl-builds" target="_blank" rel="noopener noreferrer">vl-builds</a> · MIT</span>
      <nav class="footer-legal" aria-label="Links legais"><a href="/politica-privacidade">Privacidade</a><a href="/politica-cookies">Cookies</a><a href="/termos-uso">Termos</a></nav>
      <span class="caption-up">Última extração: ${updated}</span>
    </div>
  </div>
</footer>
<script src="/assets/nav.js" defer></script>`
}

export function generateProfessionPage(
  p: Profession,
  info: Map<string, ProfCountryInfo>,
  related: Array<{ slug: string; titleNoun: string }>,
): string {
  const countries = p.countries.map(cc => info.get(cc)).filter((x): x is ProfCountryInfo => !!x)
  const anyData = countries[0]?.data
  const updated = anyData ? monthLabel(anyData.meta.lastUpdated) : ''
  const year = anyData ? new Date(anyData.meta.lastUpdated).getUTCFullYear() : 2026
  const url = `https://rotalegal.pro/profissoes/${p.slug}`
  // Nome curto para o <title> (titleNoun pode ser longo, ex.: "... e Profissional de TI")
  const shortNoun = p.titleNoun.split(' e ')[0]
  const titleFull = `Trabalhar como ${shortNoun} na Europa | Rota Legal`
  const title = titleFull.length <= 60 ? titleFull : `${shortNoun} na Europa para brasileiros`
  const desc = `Trabalhar como ${p.noun} na Europa sendo brasileiro: países que mais contratam, qual visto usar e como reconhecer o diploma. Atualizado em ${updated}.`

  const rows = countries.map(c => `
            <tr>
              <td><span class="ct"><span class="cc-flag ${c.flagClass}"></span><a href="/pais-${c.code}">${esc(c.name)}</a></span></td>
              <td>${esc(c.language)}</td>
              <td>${fmtMoney(c.data.generalRequirements?.minimumWage)}</td>
              <td><a href="/pais-${c.code}#vistos">Ver vistos →</a></td>
            </tr>`).join('')

  const faqs: Array<{ q: string; a: string }> = [
    {
      q: `Qual país europeu mais contrata ${p.noun} brasileiro?`,
      a: `Entre os países monitorados, ${countries.map(c => c.name).slice(0, 3).join(', ')} aparecem com mais demanda para a área. A melhor escolha depende do seu idioma, da sua qualificação e de onde o reconhecimento profissional é mais simples.`,
    },
    {
      q: `Preciso de diploma para trabalhar como ${p.noun} na Europa?`,
      a: p.needsDegree
        ? `Sim. ${p.diploma}`
        : `Nem sempre. ${p.diploma}`,
    },
    {
      q: `Qual visto usar para trabalhar como ${p.noun}?`,
      a: `${p.visaHint} Cada página de país lista os vistos disponíveis com requisitos, prazos e taxas atualizados.`,
    },
    {
      q: `Brasileiro pode ir como turista e trabalhar como ${p.noun}?`,
      a: `Não de forma legal. A entrada sem visto vale só para turismo. Para trabalhar é preciso o visto de trabalho ou a autorização de residência adequada, na maioria dos casos solicitada antes de viajar. Veja o passo a passo no guia prático.`,
    },
    {
      q: `Preciso saber o idioma do país para trabalhar como ${p.noun}?`,
      a: `Depende do destino e do visto. Em mercados que operam em inglês ou em países de língua próxima do português, a barreira é menor. Já em funções de saúde e em vistos qualificados, a proficiência no idioma local costuma ser exigida ou contar muito na contratação.`,
    },
  ]
  const faqHtml = faqs.map(f => `
        <div class="pf-faq-item">
          <p class="pf-faq-q">${esc(f.q)}</p>
          <p class="pf-faq-a">${esc(f.a)}</p>
        </div>`).join('')

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url, url,
        name: `Trabalhar como ${p.titleNoun} na Europa`,
        description: desc,
        datePublished: '2026-06-17',
        dateModified: anyData?.meta.lastUpdated.slice(0, 10) ?? '2026-06-17',
        inLanguage: 'pt-BR',
        isPartOf: { '@id': 'https://rotalegal.pro/#website' },
        author: { '@id': 'https://rotalegal.pro/#organization' },
        publisher: { '@id': 'https://rotalegal.pro/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://rotalegal.pro/' },
          { '@type': 'ListItem', position: 2, name: 'Profissões', item: 'https://rotalegal.pro/profissoes' },
          { '@type': 'ListItem', position: 3, name: `${p.titleNoun} na Europa` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
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
<link rel="alternate" hreflang="pt-BR" href="${url}" />
<link rel="alternate" hreflang="x-default" href="${url}" />
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
${navHtml()}
<main>
  <section class="pf-hero">
    <div class="container">
      <div class="pf-body">
        <div class="pf-eyebrow"><span class="dot"></span>Profissão · ${updated}</div>
        <h1 class="pf-h1">Trabalhar como ${p.titleNoun.toLowerCase()} na Europa sendo brasileiro</h1>
        <p class="pf-lede">${esc(p.lead)}</p>
      </div>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container">
      <article class="pf-body">
        <h2 id="paises">Países que mais contratam ${p.noun} brasileiro</h2>
        <p>${esc(p.demand)}</p>
        <table class="pf-table">
          <thead><tr><th>País</th><th>Idioma</th><th>Salário mínimo</th><th>Vistos</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="pf-note">O salário mínimo nacional é o piso legal. A remuneração real de ${p.noun} costuma ficar acima dele e varia por região, experiência e empregador.</p>

        <h2 id="diploma">Reconhecimento de diploma e requisitos</h2>
        <p>${esc(p.diploma)}</p>

        <h2 id="visto">Qual visto usar</h2>
        <p>${esc(p.visaHint)} A regra geral vale para todos os destinos: a entrada sem visto serve só para turismo, e trabalhar exige o visto de trabalho ou a autorização de residência adequada, na maioria dos casos solicitada antes de viajar.</p>

        <h2 id="comecar">Por onde começar</h2>
        <p>O caminho costuma ter três etapas. Primeiro, reunir e apostilar os documentos no Brasil, incluindo, quando a profissão exige, o diploma e o histórico para o reconhecimento profissional. Depois, conseguir a oferta de emprego ou usar um visto de procura, quando o país oferece. Por fim, dar entrada no visto e, já no destino, regularizar a residência.</p>
        <p>Para ${p.noun}, o reconhecimento de credenciais e o idioma são as partes que mais pesam no prazo, então vale começar cedo. Use a <a href="/calculadora">calculadora de reserva</a> para estimar quanto guardar e o <a href="/guia-pratico">guia prático</a> para o passo a passo completo, da documentação à chegada. Para acompanhar mudanças de regras e taxas, o <a href="/historico">histórico</a> registra cada atualização mês a mês.</p>
        <div class="pf-cta">
          <a class="btn btn-primary" href="/qual-pais">Descobrir o meu país</a>
          <a class="btn btn-secondary" href="/comparar-paises">Comparar países</a>
        </div>

        <h2 id="faq">Perguntas frequentes</h2>
        ${faqHtml}

        <h2 id="outras">Outras profissões</h2>
        <div class="pf-related">${related.map(r => `<a href="/profissoes/${r.slug}">${esc(r.titleNoun)}</a>`).join('')}</div>
        <p style="margin-top:14px;"><a href="/profissoes">Ver todas as profissões →</a></p>
      </article>
    </div>
  </section>
</main>
${footerHtml(year, updated)}
</body>
</html>
`
}

export function generateProfessionHub(professions: Profession[], updated: string, year: number): string {
  const url = 'https://rotalegal.pro/profissoes'
  const title = 'Trabalhar na Europa por Profissão | Rota Legal'
  const desc = 'Guias por profissão para brasileiros trabalharem na Europa: enfermeiro, TI, motorista, engenheiro e mais. Países que contratam, visto e reconhecimento de diploma.'
  const cards = professions.map(p => `
        <a class="pf-hubcard" href="/profissoes/${p.slug}">
          <span class="pf-hub-name">${esc(p.titleNoun)}</span>
          <span class="pf-hub-cue">${p.needsDegree ? 'Exige diploma' : 'Sem diploma obrigatório'} · Ver guia →</span>
        </a>`).join('')
  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url,
    name: 'Trabalhar na Europa por profissão', description: desc, inLanguage: 'pt-BR',
    isPartOf: { '@id': 'https://rotalegal.pro/#website' }, publisher: { '@id': 'https://rotalegal.pro/#organization' },
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
<link rel="alternate" hreflang="pt-BR" href="${url}" />
<link rel="alternate" hreflang="x-default" href="${url}" />
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
  .pf-hub-hero { padding:88px 0 24px; }
  .pf-hub-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; padding-bottom:64px; }
  .pf-hubcard { display:flex; flex-direction:column; gap:8px; padding:18px; background:var(--surface-card); border:1px solid var(--hairline); border-radius:var(--r-lg); text-decoration:none; transition:border-color 160ms ease, transform 160ms ease; }
  .pf-hubcard:hover { border-color:var(--primary); transform:translateY(-2px); }
  .pf-hub-name { font-size:16px; font-weight:600; color:var(--on-dark); }
  .pf-hub-cue { font-size:12px; color:var(--primary); font-weight:600; }
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<div class="bg-orbs" aria-hidden="true"><div class="orb-3"></div></div>
${navHtml()}
<main>
  <section class="pf-hub-hero">
    <div class="container">
      <div class="eyebrow" style="margin-bottom:16px;"><span class="dot"></span>Por profissão · ${updated}</div>
      <h1 class="display-md" style="max-width:760px;">Trabalhar na Europa por profissão</h1>
      <p class="lede" style="max-width:620px;">A sua profissão define os melhores destinos e os vistos mais rápidos. Veja, por área, quais países contratam, o que é exigido de diploma e por onde começar.</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container">
      <div style="max-width:760px;margin:0 0 40px;">
        <p class="body-md" style="color:var(--body);line-height:1.7;">A Europa está com escassez de mão de obra em áreas que vão da saúde à tecnologia, e há caminhos legais abertos para brasileiros em dezenas de profissões. Mas cada área tem sua lógica própria: um enfermeiro precisa revalidar o diploma no país de destino e se registrar no conselho profissional local antes de assinar qualquer contrato. Um desenvolvedor de TI pode qualificar para o EU Blue Card com um salário acima do limiar exigido, sem precisar de reconhecimento de diploma. Um motorista profissional tem demanda alta em vários países, mas precisa converter a habilitação para a categoria europeia.</p>
        <p class="body-md" style="color:var(--body);line-height:1.7;margin-top:14px;">Os guias abaixo reúnem, por área, quais países mais contratam, se o diploma é obrigatório, quais vistos se aplicam e o que fazer antes de viajar. Cada guia traz os requisitos reais atualizados mensalmente com fontes oficiais. Para uma recomendação por perfil e situação, use o questionário <a class="text-link" href="/qual-pais">Qual país é o meu</a>.</p>
      </div>
      <div class="pf-hub-grid">${cards}</div>
      <p class="body-sm" style="color:var(--muted);">Não encontrou a sua área? Veja <a class="text-link" href="/paises">todos os 10 países</a> ou faça o <a class="text-link" href="/qual-pais">questionário Qual país é o meu</a>.</p>
    </div>
  </section>
</main>
${footerHtml(year, updated)}
</body>
</html>
`
}
