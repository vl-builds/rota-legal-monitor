// Guias editoriais oportunos (alta demanda de busca). Conteudo factual e geral,
// com fontes oficiais linkadas e avisos de verificacao: numeros e datas mudam,
// entao a fonte oficial e sempre a referencia final (nicho YMYL).

export interface GuideSection {
  h2: string
  html: string // paragrafos e listas ja em HTML (sem travessao, sem ponto-e-virgula)
}
export interface Guide {
  slug: string
  navLabel: string
  title: string        // <title>, <= 60 chars
  h1: string
  desc: string         // 120-155
  lead: string
  updatedNote: string  // aviso de verificacao / data
  sections: GuideSection[]
  faq: Array<{ q: string; a: string }>
  official: Array<{ label: string; url: string }>
  internal: Array<{ label: string; url: string }>
}

export const GUIDES: Guide[] = [
  {
    slug: 'chancenkarte-alemanha',
    navLabel: 'Chancenkarte (Alemanha)',
    title: 'Chancenkarte: o que é e como funciona | Rota Legal',
    h1: 'Chancenkarte: a Opportunity Card da Alemanha para brasileiros',
    desc: 'O que é a Chancenkarte da Alemanha, como funciona o sistema de pontos e quem pode usar para procurar emprego. Guia para brasileiros, com fontes oficiais.',
    lead: 'A Chancenkarte, ou Opportunity Card, é um visto por pontos criado pela Alemanha para profissionais qualificados de fora da União Europeia entrarem no país para procurar emprego, sem precisar de uma oferta de trabalho prévia. Para brasileiros qualificados, é um dos caminhos mais comentados desde que entrou em vigor.',
    updatedNote: 'Os critérios de pontos, valores e prazos da Chancenkarte podem mudar. Confirme sempre os requisitos atuais nas fontes oficiais linkadas no fim desta página antes de tomar decisões.',
    sections: [
      {
        h2: 'O que é a Chancenkarte',
        html: '<p>A Chancenkarte é uma autorização que permite morar na Alemanha por um período para <strong>procurar emprego</strong> qualificado, com a opção de trabalhar em tempo parcial ou em períodos de teste durante a busca. A grande diferença para os vistos de trabalho tradicionais é que você <strong>não precisa de um contrato assinado antes de viajar</strong>.</p><p>Ela faz parte da reforma da imigração de qualificados da Alemanha, que busca atrair mão de obra estrangeira para áreas em falta. No Rota Legal, ela aparece como um dos vistos catalogados da Alemanha.</p>',
      },
      {
        h2: 'Como funciona o sistema de pontos',
        html: '<p>O acesso à Chancenkarte segue duas vias. Na primeira, quem tem um diploma superior ou uma qualificação profissional totalmente reconhecida na Alemanha entra de forma mais direta. Na segunda, sem o reconhecimento completo, você acumula <strong>pontos</strong> por critérios como:</p><ul><li>Qualificação e formação</li><li>Experiência profissional</li><li>Conhecimento de alemão e de inglês</li><li>Idade</li><li>Ligação com a Alemanha (estadias anteriores, por exemplo)</li></ul><p>É preciso atingir uma pontuação mínima. A tabela exata de pontos e o limite mudam com a regulamentação, então confirme os números atuais na fonte oficial.</p>',
      },
      {
        h2: 'Quem pode usar e o que é exigido de brasileiros',
        html: '<p>A Chancenkarte é voltada a profissionais qualificados. Em geral pede um diploma ou qualificação profissional, comprovação de meios de subsistência para o período de busca e, conforme a via, idioma. Para brasileiros, valem as etapas comuns de qualquer visto alemão: documentos apostilados pela Convenção de Haia, tradução e, quando exigido, comprovação de idioma.</p><p>O caminho costuma combinar bem com profissões de alta demanda, como tecnologia, engenharia e saúde. Veja as profissões e os países que mais contratam na seção por profissão.</p>',
      },
      {
        h2: 'Chancenkarte na prática: por onde começar',
        html: '<p>O fluxo geral é: avaliar se você se qualifica (diploma reconhecido ou pontos suficientes), reunir e apostilar os documentos no Brasil, comprovar meios de subsistência e solicitar o visto no consulado alemão. Já na Alemanha, você usa o período para buscar emprego e, ao conseguir, migra para um visto ou autorização de trabalho adequada.</p><p>Para dimensionar quanto guardar antes de ir, use a calculadora de reserva. Para o passo a passo completo de documentação e chegada, veja o guia prático.</p>',
      },
    ],
    faq: [
      { q: 'A Chancenkarte é um visto de trabalho?', a: 'Não exatamente. Ela permite entrar na Alemanha para procurar emprego qualificado, com trabalho parcial permitido durante a busca. Ao conseguir um emprego, você migra para o visto ou autorização de trabalho correspondente.' },
      { q: 'Preciso falar alemão para a Chancenkarte?', a: 'Depende da via de acesso. O idioma conta pontos e, em muitas situações, o alemão ou o inglês são exigidos ou bastante valorizados. Confirme o requisito atual na fonte oficial.' },
      { q: 'Brasileiro pode pedir a Chancenkarte?', a: 'Sim. Brasileiros qualificados podem se candidatar, seguindo as etapas comuns de imigração alemã: reconhecimento de qualificação quando aplicável, documentos apostilados e comprovação de meios de subsistência.' },
      { q: 'Quanto tempo dura a Chancenkarte?', a: 'É concedida por um período para a busca de emprego, com possibilidade de transição para um visto de trabalho ao ser contratado. O prazo exato pode mudar, então verifique na fonte oficial.' },
    ],
    official: [
      { label: 'Make it in Germany (portal oficial do governo alemão)', url: 'https://www.make-it-in-germany.com/' },
      { label: 'Auswärtiges Amt (Ministério das Relações Exteriores da Alemanha)', url: 'https://www.auswaertiges-amt.de/' },
    ],
    internal: [
      { label: 'Vistos de trabalho da Alemanha', url: '/pais-de' },
      { label: 'Trabalhar como profissional de TI na Europa', url: '/profissoes/desenvolvedor-ti-europa' },
      { label: 'Guia prático: passo a passo', url: '/guia-pratico' },
    ],
  },
  {
    slug: 'etias-brasileiros',
    navLabel: 'ETIAS',
    title: 'ETIAS para Brasileiros: o que é e quando começa | Rota Legal',
    h1: 'ETIAS para brasileiros: o que é, para que serve e o que muda',
    desc: 'O que é o ETIAS, a autorização de viagem da Europa para brasileiros, para que serve e o que ele não cobre. Guia direto, com a fonte oficial da UE.',
    lead: 'O ETIAS é a futura autorização de viagem que brasileiros vão precisar para entrar na maior parte da Europa em viagens curtas. Ele gera muita dúvida, então vale separar o que é fato do que é confusão: o ETIAS é para turismo e visitas curtas, e não substitui o visto de quem quer trabalhar.',
    updatedNote: 'A data de início do ETIAS foi adiada várias vezes. Não confie em datas de terceiros: confirme a previsão oficial vigente no site da União Europeia linkado no fim desta página.',
    sections: [
      {
        h2: 'O que é o ETIAS',
        html: '<p>ETIAS é a sigla, em inglês, do Sistema Europeu de Informação e Autorização de Viagem. É uma <strong>autorização de viagem</strong>, não um visto, ligada ao seu passaporte, para cidadãos de países que entram na Europa sem visto, como o Brasil. Funciona de forma parecida com o ESTA dos Estados Unidos.</p><p>Com ele, o viajante pede a autorização pela internet antes de viajar, paga uma taxa baixa e recebe a aprovação eletrônica vinculada ao passaporte, válida por vários anos ou até o passaporte vencer.</p>',
      },
      {
        h2: 'Para que serve e para que NÃO serve',
        html: '<p>O ETIAS serve para <strong>viagens curtas</strong> ao espaço Schengen, em geral até 90 dias dentro de um período de 180, com finalidade de turismo, visita, negócios pontuais ou trânsito. É o que muitos brasileiros já fazem hoje sem visto, com a diferença de que passará a exigir a autorização prévia.</p><p>O ponto mais importante para quem pensa em emigrar: <strong>o ETIAS não autoriza trabalhar</strong> e não substitui um visto de trabalho ou uma autorização de residência. Quem vai trabalhar na Europa continua precisando do visto correto do país de destino, exatamente como antes.</p>',
      },
      {
        h2: 'O que muda para o brasileiro',
        html: '<p>Na prática, a viagem de turismo ganha um passo a mais: pedir o ETIAS pela internet antes de embarcar. A aprovação costuma ser rápida na maioria dos casos. Para quem viaja a trabalho de forma legal, com visto, o ETIAS não altera o processo de imigração em si, que segue as regras de cada país.</p><p>A Irlanda fica fora do espaço Schengen e tem regras próprias de entrada. Confira as condições de cada destino nas páginas de país.</p>',
      },
      {
        h2: 'ETIAS e o plano de trabalhar na Europa',
        html: '<p>Se o seu objetivo é trabalhar, o ETIAS é só o pano de fundo: você ainda precisa escolher o país, conseguir o visto de trabalho e regularizar a residência. Comece pelo guia Trabalhar na Europa, que reúne os 10 países, e pelo guia prático com o passo a passo. Para uma recomendação por perfil, faça o questionário Qual país é o meu.</p>',
      },
    ],
    faq: [
      { q: 'ETIAS é visto?', a: 'Não. É uma autorização de viagem eletrônica ligada ao passaporte, para entradas curtas sem visto no espaço Schengen. Não é um visto e não dá direito a trabalhar.' },
      { q: 'Brasileiro vai precisar de ETIAS?', a: 'Sim. Brasileiros entram na Europa sem visto para estadias curtas, e essa categoria de viajante passará a precisar da autorização ETIAS antes de viajar, quando o sistema entrar em vigor.' },
      { q: 'Posso trabalhar na Europa com ETIAS?', a: 'Não. O ETIAS vale para turismo e visitas curtas. Para trabalhar é preciso o visto de trabalho ou a autorização de residência do país de destino.' },
      { q: 'Quando o ETIAS entra em vigor?', a: 'A data foi adiada diversas vezes. Não confie em datas de sites de terceiros: verifique a previsão oficial vigente no portal da União Europeia.' },
    ],
    official: [
      { label: 'Portal oficial do ETIAS (União Europeia)', url: 'https://travel-europe.europa.eu/etias_en' },
    ],
    internal: [
      { label: 'Trabalhar na Europa: guia para brasileiros', url: '/trabalhar-na-europa' },
      { label: 'Guia prático: passo a passo', url: '/guia-pratico' },
      { label: 'Ver todos os 10 países', url: '/paises' },
    ],
  },
]

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const PAGE_CSS = `
  .gd-hero { padding:88px 0 24px; }
  .gd-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:16px; }
  .gd-eyebrow .dot { width:6px; height:6px; border-radius:50%; background:var(--primary); }
  .gd-body { max-width:760px; margin:0 auto; }
  .gd-h1 { font-size:clamp(28px,4.4vw,42px); font-weight:700; letter-spacing:-0.8px; line-height:1.15; color:var(--on-dark); margin:0 0 16px; }
  .gd-lede { font-size:17px; line-height:1.65; color:var(--body); margin:0; }
  .gd-body h2 { font-size:clamp(22px,3.2vw,28px); font-weight:700; letter-spacing:-0.5px; color:var(--on-dark); margin:44px 0 14px; scroll-margin-top:90px; }
  .gd-body p { font-size:16px; line-height:1.75; color:var(--body); margin:0 0 16px; }
  .gd-body ul { margin:0 0 16px; padding-left:0; list-style:none; }
  .gd-body ul li { font-size:16px; line-height:1.6; color:var(--body); padding-left:20px; position:relative; margin-bottom:8px; }
  .gd-body ul li::before { content:""; position:absolute; left:4px; top:10px; width:6px; height:6px; border-radius:50%; background:var(--primary); }
  .gd-body a { color:var(--primary); text-decoration:none; border-bottom:1px solid rgba(240,180,41,0.35); }
  .gd-body strong { color:var(--on-dark); font-weight:600; }
  .gd-callout { border-left:3px solid var(--primary); background:rgba(240,180,41,0.06); padding:14px 18px; border-radius:0 var(--r-md) var(--r-md) 0; margin:0 0 20px; }
  .gd-callout p { margin:0; font-size:15px; color:var(--body-strong); }
  .gd-faq-item { border-top:1px solid var(--hairline); padding:18px 0; }
  .gd-faq-item:last-child { border-bottom:1px solid var(--hairline); }
  .gd-faq-q { font-size:17px; font-weight:600; color:var(--on-dark); margin:0 0 8px; }
  .gd-faq-a { font-size:15px; line-height:1.7; color:var(--body); margin:0; }
  .gd-sources { background:var(--surface-card); border:1px solid var(--hairline); border-radius:var(--r-lg); padding:18px; margin:8px 0 14px; }
  .gd-sources .caption-up { display:block; margin-bottom:10px; color:var(--muted); }
  .gd-sources ul { list-style:none; margin:0; padding:0; }
  .gd-sources li { margin-bottom:8px; font-size:15px; }
  .gd-related { display:flex; flex-wrap:wrap; gap:10px; margin-top:8px; }
  .gd-related a { font-size:13px; padding:7px 13px; border:1px solid var(--hairline); border-radius:var(--r-pill); color:var(--body-strong); text-decoration:none; }
  .gd-related a:hover { border-color:var(--primary); color:var(--primary); }
  .gd-hub-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; padding-bottom:64px; }
  .gd-hubcard { display:flex; flex-direction:column; gap:8px; padding:18px; background:var(--surface-card); border:1px solid var(--hairline); border-radius:var(--r-lg); text-decoration:none; transition:border-color 160ms ease, transform 160ms ease; }
  .gd-hubcard:hover { border-color:var(--primary); transform:translateY(-2px); }
  .gd-hub-name { font-size:16px; font-weight:600; color:var(--on-dark); }
  .gd-hub-cue { font-size:13px; color:var(--primary); font-weight:600; }
`

function nav(): string {
  return `<nav class="top-nav">
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
</nav>`
}
function footer(year: number, updated: string): string {
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
function head(title: string, desc: string, url: string, ld: object): string {
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
</head>`
}

export function generateGuidePage(g: Guide, updated: string, year: number): string {
  const url = `https://rotalegal.pro/guias/${g.slug}`
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article', '@id': url, url,
        headline: g.h1.length > 110 ? g.h1.slice(0, 107) + '...' : g.h1,
        description: g.desc, inLanguage: 'pt-BR',
        datePublished: `${year}-01-01`, dateModified: `${year}-06-01`,
        isPartOf: { '@id': 'https://rotalegal.pro/#website' },
        author: { '@id': 'https://rotalegal.pro/#organization' },
        publisher: { '@id': 'https://rotalegal.pro/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://rotalegal.pro/' },
          { '@type': 'ListItem', position: 2, name: 'Guias', item: 'https://rotalegal.pro/guias' },
          { '@type': 'ListItem', position: 3, name: g.navLabel },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: g.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  }
  const sectionsHtml = g.sections.map(s => `\n        <h2>${esc(s.h2)}</h2>\n        ${s.html}`).join('')
  const faqHtml = g.faq.map(f => `\n        <div class="gd-faq-item"><p class="gd-faq-q">${esc(f.q)}</p><p class="gd-faq-a">${esc(f.a)}</p></div>`).join('')
  const sources = g.official.map(o => `<li><a href="${o.url}" target="_blank" rel="noopener noreferrer">${esc(o.label)}</a></li>`).join('')
  const related = g.internal.map(i => `<a href="${i.url}">${esc(i.label)}</a>`).join('')

  return `${head(g.title, g.desc, url, ld)}
<body>
<div class="bg-orbs" aria-hidden="true"><div class="orb-3"></div></div>
${nav()}
<main>
  <section class="gd-hero">
    <div class="container">
      <div class="gd-body">
        <div class="gd-eyebrow"><span class="dot"></span>Guia · ${updated}</div>
        <h1 class="gd-h1">${esc(g.h1)}</h1>
        <p class="gd-lede">${esc(g.lead)}</p>
      </div>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container">
      <article class="gd-body">
        <div class="gd-callout"><p>${esc(g.updatedNote)}</p></div>
${sectionsHtml}

        <h2 id="faq">Perguntas frequentes</h2>${faqHtml}

        <h2 id="fontes">Fontes oficiais</h2>
        <div class="gd-sources"><span class="caption-up">Confirme sempre na fonte oficial</span><ul>${sources}</ul></div>

        <h2 id="continuar">Continue no Rota Legal</h2>
        <div class="gd-related">${related}</div>
      </article>
    </div>
  </section>
</main>
${footer(year, updated)}
</body>
</html>
`
}

export function generateGuidesHub(guides: Guide[], updated: string, year: number): string {
  const url = 'https://rotalegal.pro/guias'
  const title = 'Guias de Imigração para a Europa | Rota Legal'
  const desc = 'Guias diretos sobre imigração e vistos para a Europa: Chancenkarte da Alemanha, ETIAS e mais, para brasileiros, com fontes oficiais.'
  const cards = guides.map(g => `
        <a class="gd-hubcard" href="/guias/${g.slug}">
          <span class="gd-hub-name">${esc(g.navLabel)}</span>
          <span class="gd-hub-cue">Ler guia →</span>
        </a>`).join('')
  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url,
    name: 'Guias de imigração para a Europa', description: desc, inLanguage: 'pt-BR',
    isPartOf: { '@id': 'https://rotalegal.pro/#website' }, publisher: { '@id': 'https://rotalegal.pro/#organization' },
  }
  return `${head(title, desc, url, ld)}
<body>
<div class="bg-orbs" aria-hidden="true"><div class="orb-3"></div></div>
${nav()}
<main>
  <section class="gd-hero">
    <div class="container">
      <div class="eyebrow" style="margin-bottom:16px;"><span class="dot"></span>Guias · ${updated}</div>
      <h1 class="display-md" style="max-width:720px;">Guias de imigração para a Europa</h1>
      <p class="lede" style="max-width:600px;">Explicações diretas sobre temas que geram dúvida na hora de emigrar, sempre com a fonte oficial à mão.</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container">
      <div class="gd-hub-grid">${cards}</div>
      <p class="body-sm" style="color:var(--muted);">Procurando o passo a passo completo? Veja o <a class="text-link" href="/guia-pratico">guia prático</a> ou o hub <a class="text-link" href="/trabalhar-na-europa">Trabalhar na Europa</a>.</p>
    </div>
  </section>
</main>
${footer(year, updated)}
</body>
</html>
`
}
