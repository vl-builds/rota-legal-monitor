import type { CountryData } from '@/extractors/schema'
import type { CompareCountry } from './compare-page'
import { compareSlug } from './compare-page'
import type { Profession } from './profession-page'

export interface EuropaCountry {
  code: string
  name: string
  flagClass: string
  language: string
  data: CountryData
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function fmtMoney(m?: { amount?: number; currency?: string } | null): string {
  if (!m || !m.amount) return 'Sem mínimo legal'
  const v = Math.round(m.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${m.currency || 'EUR'} ${v}`
}

const PAGE_CSS = `
  .eu-hero { padding:88px 0 28px; }
  .eu-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:16px; }
  .eu-eyebrow .dot { width:6px; height:6px; border-radius:50%; background:var(--primary); }
  .eu-body { max-width:880px; margin:0 auto; }
  .eu-h1 { font-size:clamp(30px,4.8vw,48px); font-weight:700; letter-spacing:-1px; line-height:1.1; color:var(--on-dark); margin:0 0 16px; max-width:820px; }
  .eu-lede { font-size:17px; line-height:1.6; color:var(--body); max-width:700px; margin:0; }
  .eu-body h2 { font-size:clamp(22px,3.2vw,28px); font-weight:700; letter-spacing:-0.5px; color:var(--on-dark); margin:48px 0 16px; scroll-margin-top:90px; }
  .eu-body p { font-size:16px; line-height:1.7; color:var(--body); margin:0 0 16px; }
  .eu-body a { color:var(--primary); text-decoration:none; border-bottom:1px solid rgba(240,180,41,0.35); }
  .eu-body strong { color:var(--on-dark); font-weight:600; }
  .eu-table { width:100%; border-collapse:collapse; margin:8px 0 14px; font-size:15px; border:1px solid var(--hairline); border-radius:var(--r-lg); overflow:hidden; }
  .eu-table th, .eu-table td { padding:12px 14px; text-align:left; border-bottom:1px solid var(--hairline); }
  .eu-table thead th { background:var(--surface-card); color:var(--muted); font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; }
  .eu-table tbody tr:last-child td { border-bottom:none; }
  .eu-table .ct { display:flex; align-items:center; gap:9px; }
  .eu-table .ct .cc-flag { width:26px; height:18px; border-radius:3px; }
  .eu-table .ct a { color:var(--on-dark); font-weight:600; border:none; }
  .eu-note { font-size:13px; color:var(--muted); margin:0 0 18px; }
  .eu-chips { display:flex; flex-wrap:wrap; gap:10px; margin:6px 0 16px; }
  .eu-chips a { font-size:13px; padding:8px 14px; border:1px solid var(--hairline); border-radius:var(--r-pill); color:var(--body-strong); text-decoration:none; }
  .eu-chips a:hover { border-color:var(--primary); color:var(--primary); }
  .eu-cta { display:flex; flex-wrap:wrap; gap:12px; margin:22px 0 8px; }
  .eu-faq-item { border-top:1px solid var(--hairline); padding:18px 0; }
  .eu-faq-item:last-child { border-bottom:1px solid var(--hairline); }
  .eu-faq-q { font-size:17px; font-weight:600; color:var(--on-dark); margin:0 0 8px; }
  .eu-faq-a { font-size:15px; line-height:1.7; color:var(--body); margin:0; }
  .eu-faq-a a { color:var(--primary); text-decoration:none; border-bottom:1px solid rgba(240,180,41,0.35); }
`

export function generateEuropaHub(
  countries: EuropaCountry[],
  pairs: Array<{ a: CompareCountry; b: CompareCountry }>,
  professions: Profession[],
  updated: string,
  year: number,
): string {
  const url = 'https://rotalegal.pro/trabalhar-na-europa'
  const title = 'Trabalhar na Europa sendo Brasileiro: guia 2026 | Rota Legal'.length <= 60
    ? 'Trabalhar na Europa: guia para brasileiros | Rota Legal'
    : 'Trabalhar na Europa: guia para brasileiros'
  const desc = `Como trabalhar na Europa sendo brasileiro: os 10 países, salário mínimo, vistos, idioma e por onde começar. Dados oficiais, atualizado em ${updated}.`

  const rows = countries.map(c => `
            <tr>
              <td><span class="ct"><span class="cc-flag ${c.flagClass}"></span><a href="/pais-${c.code}">${esc(c.name)}</a></span></td>
              <td>${esc(c.language)}</td>
              <td>${fmtMoney(c.data.generalRequirements?.minimumWage)}</td>
              <td>${c.data.visaTypes.length}</td>
            </tr>`).join('')

  const profChips = professions.slice(0, 8).map(p => `<a href="/profissoes/${p.slug}">${esc(p.titleNoun.split(' e ')[0] ?? p.titleNoun)}</a>`).join('')
  const pairChips = pairs.slice(0, 8).map(p => `<a href="/comparar-paises/${compareSlug(p.a, p.b)}">${esc(p.a.name)} ou ${esc(p.b.name)}</a>`).join('')

  const faqs: Array<{ q: string; a: string }> = [
    {
      q: 'Brasileiro precisa de visto para trabalhar na Europa?',
      a: 'Sim. A entrada sem visto por até 90 dias vale apenas para turismo. Para trabalhar de forma legal é preciso um visto de trabalho ou uma autorização de residência específica, na maioria dos casos solicitada antes de viajar.',
    },
    {
      q: 'Qual país europeu é mais fácil para brasileiros?',
      a: 'Portugal costuma ser o mais acessível pelo idioma e pelos acordos com o Brasil. Espanha tem alta semelhança de idioma, e Irlanda e Países Baixos têm mercados fortes em inglês. O melhor país depende da sua profissão e qualificação.',
    },
    {
      q: 'Quanto ganha um brasileiro trabalhando na Europa?',
      a: 'Varia muito por país e profissão. O salário mínimo nacional é o piso legal e a remuneração real costuma ficar acima. Veja o salário mínimo de cada país na tabela acima e use a calculadora para estimar custos.',
    },
    {
      q: 'Preciso de uma oferta de emprego antes de ir?',
      a: 'Na maioria dos vistos de trabalho, sim. Alguns países oferecem vistos de procura de emprego, como a Opportunity Card da Alemanha, o Job Seeker da Áustria e o visto de procura de trabalho de Portugal.',
    },
    {
      q: 'Quanto tempo leva para conseguir o visto de trabalho?',
      a: 'Em geral de 1 a 6 meses, somando a documentação no Brasil, a oferta de emprego, a análise consular e a regularização após a chegada. Cada página de país traz o prazo médio de processamento atualizado.',
    },
  ]
  const faqHtml = faqs.map(f => `
        <div class="eu-faq-item">
          <p class="eu-faq-q">${esc(f.q)}</p>
          <p class="eu-faq-a">${f.a}</p>
        </div>`).join('')

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': url, url,
        name: 'Trabalhar na Europa sendo brasileiro: guia completo',
        description: desc, inLanguage: 'pt-BR',
        isPartOf: { '@id': 'https://rotalegal.pro/#website' },
        author: { '@id': 'https://rotalegal.pro/#organization' },
        publisher: { '@id': 'https://rotalegal.pro/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://rotalegal.pro/' },
          { '@type': 'ListItem', position: 2, name: 'Trabalhar na Europa' },
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
  <section class="eu-hero">
    <div class="container">
      <div class="eu-body">
        <div class="eu-eyebrow"><span class="dot"></span>Guia completo · ${updated}</div>
        <h1 class="eu-h1">Trabalhar na Europa sendo brasileiro</h1>
        <p class="eu-lede">A Europa precisa de mão de obra e há caminhos legais para brasileiros em dezenas de profissões. Este guia reúne os 10 países monitorados, com salário mínimo, vistos de trabalho e idioma, e mostra por onde começar, com dados oficiais atualizados todo mês.</p>
      </div>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container">
      <article class="eu-body">
        <h2 id="paises">Os 10 países monitorados</h2>
        <p>Cada país tem regras, prazos e tipos de visto próprios. A tabela abaixo resume o essencial para comparar de relance. Clique no país para ver todos os vistos, requisitos e o passo a passo de legalização.</p>
        <table class="eu-table">
          <thead><tr><th>País</th><th>Idioma</th><th>Salário mínimo</th><th>Vistos</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="eu-note">Salário mínimo nacional por mês, quando existe. Itália e Áustria não fixam salário mínimo legal: a remuneração segue acordos coletivos por setor. Valores e prazos são atualizados a cada ciclo mensal.</p>

        <h2 id="comecar">Por onde começar</h2>
        <p>O caminho legal tem etapas previsíveis. Primeiro, escolher o país que combina com a sua profissão, idioma e prioridades. Depois, reunir e apostilar a documentação no Brasil, conseguir a oferta de emprego (ou usar um visto de procura, quando existe) e dar entrada no visto. Por fim, já no destino, regularizar a residência, o número fiscal e a conta bancária.</p>
        <p>O <a href="/guia-pratico">guia prático</a> detalha cada uma dessas fases, com checklist de documentos e os erros mais comuns. Para uma recomendação por perfil, responda ao <a href="/qual-pais">questionário Qual país é o meu</a>.</p>

        <h2 id="profissao">Escolha pela sua profissão</h2>
        <p>A sua área define os melhores destinos e os vistos mais rápidos. Veja os guias por profissão, com os países que mais contratam e o que é exigido de diploma:</p>
        <div class="eu-chips">${profChips}<a href="/profissoes">Todas as profissões →</a></div>

        <h2 id="comparar">Compare dois países lado a lado</h2>
        <p>Em dúvida entre dois destinos? As comparações reúnem salário, vistos e idioma lado a lado para ajudar na decisão:</p>
        <div class="eu-chips">${pairChips}<a href="/comparar-paises">Todas as comparações →</a></div>

        <h2 id="custos">Quanto custa e quanto guardar</h2>
        <p>Além das taxas de visto, conte com apostila e tradução de documentos, seguro saúde, passagem e a reserva financeira que muitos vistos exigem como prova de subsistência. Para estimar o valor com base no país e no estilo de vida, use a <a href="/calculadora">calculadora de reserva</a>. Para acompanhar mudanças de regras, salários e taxas, o <a href="/historico">histórico</a> registra cada atualização mês a mês.</p>
        <div class="eu-cta">
          <a class="btn btn-primary" href="/qual-pais">Descobrir o meu país</a>
          <a class="btn btn-secondary" href="/paises">Ver todos os países</a>
        </div>

        <h2 id="faq">Perguntas frequentes</h2>
        ${faqHtml}
      </article>
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
