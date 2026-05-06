import type { CountryData, VisaType } from '@/extractors/schema'
import type { CountryPageConfig } from './country-page'

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

function fmtMoney(amount: number, currency: string, period?: string | null): string {
  const formatted = `${currency} ${amount.toLocaleString('pt-BR')}`
  if (!period) return formatted
  const periods: Record<string, string> = { monthly: '/mês', yearly: '/ano', 'one-time': '' }
  return formatted + (periods[period] ?? '')
}

function tagLabel(visa: VisaType): string {
  if (/revogad|extinto|deprecat/i.test(visa.id)) return 'Revogado'
  if (/REVOGAD/.test(visa.description)) return 'Revogado'
  if (visa.notes && /revogad|extinto|deixou de existir/i.test(visa.notes)) return 'Revogado'
  if (visa.relevanceForDelivery === 'direct') return 'Principal'
  if (visa.relevanceForDelivery === 'low') return 'Baixa relevância'
  return visa.eligibility[0] ?? 'Outros'
}

const APP_LOC: Record<string, string> = {
  origem: 'No Brasil (antes de entrar)',
  destino: 'No país de destino',
  ambos: 'No Brasil ou no destino',
}

const PAGE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .vp-hero {
    padding: 96px 0 48px;
    border-bottom: 1px solid var(--hairline);
  }
  .vp-breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-family: 'JetBrains Mono', monospace;
    color: var(--muted); margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .vp-breadcrumb a { color: var(--muted); text-decoration: none; }
  .vp-breadcrumb a:hover { color: var(--on-dark); }
  .vp-breadcrumb-sep { opacity: 0.4; }

  .vp-hero-top {
    display: flex; align-items: flex-start; gap: 20px;
    margin-bottom: 20px;
  }
  .vp-hero-flag {
    width: 52px; height: 36px; flex-shrink: 0; border-radius: 4px;
    overflow: hidden; margin-top: 4px;
  }
  .vp-hero-tag { margin-bottom: 8px; }
  .vp-hero-title {
    font-size: clamp(28px, 4vw, 44px); font-weight: 700;
    letter-spacing: -1px; color: var(--on-dark);
    line-height: 1.15;
  }
  .vp-hero-original {
    font-size: 13px; font-family: 'JetBrains Mono', monospace;
    color: var(--muted); margin-top: 8px;
  }

  .vp-stats-strip {
    display: flex; flex-wrap: wrap; gap: 0;
    border: 1px solid var(--hairline); border-radius: var(--r-lg);
    overflow: hidden; margin-top: 32px;
  }
  .vp-stat {
    flex: 1 1 160px; padding: 16px 20px;
    border-right: 1px solid var(--hairline);
  }
  .vp-stat:last-child { border-right: none; }
  .vp-stat-label {
    font-size: 11px; font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 1px;
    color: var(--muted); margin-bottom: 6px;
  }
  .vp-stat-value {
    font-size: 15px; font-weight: 600; color: var(--on-dark);
  }
  .vp-stat-value.accent { color: var(--primary); }
  .vp-stat-value.yes { color: var(--accent-emerald); }
  .vp-stat-value.no { color: var(--muted); }

  .vp-body { padding: 64px 0 80px; }
  .vp-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 40px;
    align-items: start;
  }

  .vp-section { margin-bottom: 40px; }
  .vp-section-title {
    font-size: 11px; font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 1.5px;
    color: var(--muted); margin-bottom: 16px;
    padding-bottom: 10px; border-bottom: 1px solid var(--hairline);
  }

  /* Documents */
  .doc-list { display: flex; flex-direction: column; gap: 10px; }
  .doc-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; border-radius: var(--r-md);
    background: var(--surface-card); border: 1px solid var(--hairline);
  }
  .doc-item.critical { border-color: var(--primary); }
  .doc-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--muted); flex-shrink: 0; margin-top: 5px;
  }
  .doc-item.critical .doc-dot { background: var(--primary); }
  .doc-name { font-size: 14px; font-weight: 600; color: var(--on-dark); }
  .doc-desc { font-size: 13px; color: var(--body); margin-top: 2px; }

  /* Steps */
  .step-list { display: flex; flex-direction: column; gap: 0; }
  .step-item {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 16px 0; border-bottom: 1px solid var(--hairline);
  }
  .step-item:last-child { border-bottom: none; }
  .step-n {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--surface-card); border: 1px solid var(--hairline);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-family: 'JetBrains Mono', monospace;
    color: var(--primary); flex-shrink: 0; margin-top: 1px;
  }
  .step-text { font-size: 14px; color: var(--body); line-height: 1.55; }

  /* Fees */
  .fee-row {
    display: flex; align-items: baseline; gap: 10px;
    padding: 12px 0; border-bottom: 1px solid var(--hairline);
  }
  .fee-row:last-child { border-bottom: none; }
  .fee-amount {
    font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
    color: var(--primary);
  }
  .fee-note { font-size: 13px; color: var(--muted); }

  /* Rights */
  .right-item {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 0; border-bottom: 1px solid var(--hairline);
    font-size: 14px; color: var(--body);
  }
  .right-item:last-child { border-bottom: none; }
  .right-icon {
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; flex-shrink: 0;
  }
  .right-icon.yes { background: rgba(34,197,94,.12); color: var(--accent-emerald); }
  .right-icon.no  { background: rgba(136,136,136,.1); color: var(--muted); }

  /* Sidebar */
  .vp-sidebar { display: flex; flex-direction: column; gap: 16px; }
  .vp-card {
    background: var(--surface-card); border: 1px solid var(--hairline);
    border-radius: var(--r-lg); padding: 20px;
  }
  .vp-card-title {
    font-size: 11px; font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 1.5px;
    color: var(--muted); margin-bottom: 14px;
  }
  .vp-field { margin-bottom: 12px; }
  .vp-field:last-child { margin-bottom: 0; }
  .vp-field-label { font-size: 11px; color: var(--muted); margin-bottom: 3px; }
  .vp-field-value { font-size: 14px; color: var(--on-dark); font-weight: 500; }
  .vp-field-value.mono { font-family: 'JetBrains Mono', monospace; color: var(--primary); }

  .vp-notes {
    background: var(--surface-card); border: 1px solid var(--hairline);
    border-left: 3px solid var(--primary); border-radius: var(--r-md);
    padding: 16px 20px; font-size: 13px; color: var(--body); line-height: 1.6;
    margin-top: 40px;
  }
  .vp-notes-label {
    font-size: 11px; font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 1px;
    color: var(--primary); margin-bottom: 8px;
  }

  .vp-cta-row {
    display: flex; gap: 12px; flex-wrap: wrap; padding-top: 40px;
    border-top: 1px solid var(--hairline); margin-top: 40px;
  }
  .vp-cta-primary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0 20px; height: 40px; border-radius: var(--r-pill);
    background: var(--primary); color: var(--on-primary);
    font-size: 14px; font-weight: 600; text-decoration: none;
  }
  .vp-cta-secondary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0 20px; height: 40px; border-radius: var(--r-pill);
    background: transparent; color: var(--on-dark);
    border: 1px solid var(--hairline); font-size: 14px; text-decoration: none;
  }
  .vp-cta-secondary:hover { border-color: var(--primary); color: var(--primary); }

  .empty-note {
    font-size: 13px; color: var(--muted); padding: 12px 0;
    font-family: 'JetBrains Mono', monospace;
  }

  @media (max-width: 900px) {
    .vp-grid { grid-template-columns: 1fr; }
    .vp-stats-strip { flex-direction: column; }
    .vp-stat { border-right: none; border-bottom: 1px solid var(--hairline); }
    .vp-stat:last-child { border-bottom: none; }
  }
  @media (max-width: 640px) {
    .vp-hero { padding: 72px 0 32px; }
    .vp-body { padding: 40px 0 60px; }
  }
`

export function visaPageSlug(cc: string, visaId: string): string {
  return `${cc}-${visaId}.html`
}

export function generateVisaPage(
  visa: VisaType,
  data: CountryData,
  config: CountryPageConfig,
): string {
  const updated = monthLabel(data.meta.lastUpdated)
  const tag = tagLabel(visa)

  const tagClass =
    tag === 'Principal' ? 'badge up' :
    tag === 'Revogado' ? 'badge down' :
    tag === 'Baixa relevância' ? 'badge' : 'badge'

  // Stats strip
  const canWork = visa.rights.canWork
  const canFamily = visa.rights.canBringFamily
  const appLoc = APP_LOC[visa.process.applicationLocation] ?? visa.process.applicationLocation
  const duration = visa.process.estimatedDuration ?? 'A determinar'

  // Documents section
  const docsHtml = visa.requirements.documents.length > 0
    ? `<div class="doc-list">
        ${visa.requirements.documents.map(doc => `
        <div class="doc-item${doc.isCritical ? ' critical' : ''}">
          <div class="doc-dot"></div>
          <div>
            <div class="doc-name">${esc(doc.name)}</div>
            ${doc.description ? `<div class="doc-desc">${esc(doc.description)}</div>` : ''}
          </div>
        </div>`).join('')}
      </div>`
    : `<p class="empty-note">Documentos em levantamento. Consulte a aba Fontes na página do país.</p>`

  // Steps section
  const stepsHtml = visa.process.steps.length > 0
    ? `<div class="step-list">
        ${visa.process.steps.map(s => `
        <div class="step-item">
          <span class="step-n">${s.order}</span>
          <span class="step-text">${esc(s.description)}</span>
        </div>`).join('')}
      </div>`
    : `<p class="empty-note">Etapas em levantamento. Consulte as fontes oficiais.</p>`

  // Fees
  const feesHtml = visa.process.fees.length > 0
    ? visa.process.fees.map(f => `
      <div class="fee-row">
        <span class="fee-amount">${fmtMoney(f.amount, f.currency)}</span>
        ${f.notes ? `<span class="fee-note">${esc(f.notes)}</span>` : ''}
      </div>`).join('')
    : `<p class="empty-note">Taxa em levantamento.</p>`

  // Rights
  const rightsItems: { ok: boolean; label: string }[] = [
    { ok: visa.rights.canWork, label: 'Trabalhar legalmente' },
    { ok: visa.rights.canBringFamily, label: 'Trazer família' },
    { ok: visa.rights.canChangeEmployer, label: 'Mudar de empregador' },
    ...(visa.rights.pathToResidency
      ? [{ ok: true, label: `Residência permanente após ${visa.rights.pathToResidency.yearsRequired} anos` }]
      : []),
    ...(visa.rights.pathToCitizenship
      ? [{ ok: true, label: `Cidadania após ${visa.rights.pathToCitizenship.yearsRequired} anos` }]
      : []),
  ]
  const rightsHtml = rightsItems.map(r => `
    <div class="right-item">
      <span class="right-icon ${r.ok ? 'yes' : 'no'}">${r.ok ? '✓' : '✗'}</span>
      ${esc(r.label)}
    </div>`).join('')

  // Sidebar fields
  const incomeHtml = visa.requirements.incomeRequirement
    ? `<div class="vp-field">
        <div class="vp-field-label">Renda mínima</div>
        <div class="vp-field-value mono">${fmtMoney(
          visa.requirements.incomeRequirement.amount,
          visa.requirements.incomeRequirement.currency,
          visa.requirements.incomeRequirement.period,
        )}</div>
      </div>`
    : ''

  const langHtml = visa.requirements.languageRequired
    ? `<div class="vp-field">
        <div class="vp-field-label">Idioma exigido</div>
        <div class="vp-field-value">${esc(visa.requirements.languageRequired.language)}: ${esc(visa.requirements.languageRequired.level)}</div>
      </div>`
    : ''

  const qualsHtml = visa.requirements.qualificationsRequired.length > 0
    ? `<div class="vp-field">
        <div class="vp-field-label">Qualificação</div>
        <div class="vp-field-value">${visa.requirements.qualificationsRequired.map(esc).join('; ')}</div>
      </div>`
    : ''

  const hasSidebarReqs = incomeHtml || langHtml || qualsHtml

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(visa.name)} — ${esc(config.displayName)} — Rota Legal</title>
<meta name="description" content="${esc(visa.description.slice(0, 160))}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="../assets/design-system.css" />
<style>${PAGE_CSS}</style>
</head>
<body>
<div class="bg-orbs" aria-hidden="true"><div class="orb-3"></div></div>

<!-- NAV -->
<nav class="top-nav">
  <div class="container">
    <a class="logo" href="../home.html">
      <img src="../assets/images/logonobg.png" alt="Rota Legal" style="height:26px;width:auto;display:block;">
      <span>Rota Legal</span>
    </a>
    <div class="nav-links">
      <a class="nav-link" href="../paises.html">Países</a>
      <a class="nav-link" href="../comparar.html">Comparar</a>
      <a class="nav-link" href="../qual-pais.html">Qual país?</a>
      <a class="nav-link" href="../guia-pratico.html">Guia Prático</a>
      <a class="nav-link" href="../calculadora.html">Calculadora</a>
      <a class="nav-link" href="../historico.html">Histórico</a>
      <a class="nav-link" href="../sobre.html">Sobre</a>
    </div>
    <div class="nav-right">
      <a class="btn btn-secondary" href="../pais-${esc(config.code)}.html#vistos">← ${esc(config.displayName)}</a>
      <a class="btn btn-primary" href="../comparar.html">Comparar</a>
    </div>
    <button class="nav-hamburger" id="nav-hamburger-btn" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-drawer">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- MOBILE DRAWER -->
<div class="mobile-drawer" id="mobile-drawer" aria-hidden="true" aria-label="Menu de navegação">
  <div class="mobile-drawer-backdrop" data-close></div>
  <aside class="mobile-drawer-panel">
    <div class="mobile-drawer-header">
      <span class="caption-up">Menu</span>
      <button class="mobile-drawer-close" aria-label="Fechar menu" data-close>&times;</button>
    </div>
    <nav class="mobile-drawer-nav">
      <a href="../home.html">Início</a>
      <a href="../paises.html">Países</a>
      <a href="../comparar.html">Comparar</a>
      <a href="../qual-pais.html">Qual país é meu?</a>
      <a href="../guia-pratico.html">Guia Prático</a>
      <a href="../calculadora.html">Calculadora</a>
      <a href="../historico.html">Histórico</a>
      <a href="../sobre.html">Sobre</a>
    </nav>
    <div class="mobile-drawer-cta">
      <a class="btn btn-primary" href="../qual-pais.html">Qual país é meu?</a>
      <a class="btn btn-secondary" href="../pais-${esc(config.code)}.html#vistos">← ${esc(config.displayName)}</a>
    </div>
  </aside>
</div>

<!-- HERO -->
<section class="vp-hero">
  <div class="container">
    <nav class="vp-breadcrumb" aria-label="Navegação estrutural">
      <a href="../paises.html">Países</a>
      <span class="vp-breadcrumb-sep">/</span>
      <a href="../pais-${esc(config.code)}.html">${esc(config.displayName)}</a>
      <span class="vp-breadcrumb-sep">/</span>
      <a href="../pais-${esc(config.code)}.html#vistos">Vistos</a>
      <span class="vp-breadcrumb-sep">/</span>
      <span>${esc(visa.name)}</span>
    </nav>

    <div class="vp-hero-top">
      <span class="flag ${config.flagClass} vp-hero-flag" aria-hidden="true"></span>
      <div>
        <div class="vp-hero-tag"><span class="${tagClass}">${esc(tag)}</span></div>
        <h1 class="vp-hero-title">${esc(visa.name)}</h1>
        <p class="vp-hero-original">${esc(visa.nameOriginal)}</p>
      </div>
    </div>

    <div class="vp-stats-strip">
      <div class="vp-stat">
        <div class="vp-stat-label">Local do pedido</div>
        <div class="vp-stat-value">${esc(appLoc)}</div>
      </div>
      <div class="vp-stat">
        <div class="vp-stat-label">Tempo médio</div>
        <div class="vp-stat-value accent">${esc(duration)}</div>
      </div>
      <div class="vp-stat">
        <div class="vp-stat-label">Pode trabalhar</div>
        <div class="vp-stat-value ${canWork ? 'yes' : 'no'}">${canWork ? 'Sim' : 'Não'}</div>
      </div>
      <div class="vp-stat">
        <div class="vp-stat-label">Trazer família</div>
        <div class="vp-stat-value ${canFamily ? 'yes' : 'no'}">${canFamily ? 'Sim' : 'Não'}</div>
      </div>
      <div class="vp-stat">
        <div class="vp-stat-label">Dados de</div>
        <div class="vp-stat-value" style="font-size:13px;">${updated}</div>
      </div>
    </div>
  </div>
</section>

<!-- BODY -->
<div class="vp-body">
  <div class="container">
    <div class="vp-grid">

      <!-- MAIN COLUMN -->
      <div>
        <p style="font-size:15px;color:var(--body);line-height:1.65;margin-bottom:40px;">${esc(visa.description)}</p>

        <div class="vp-section">
          <p class="vp-section-title">Documentos necessários</p>
          ${docsHtml}
        </div>

        <div class="vp-section">
          <p class="vp-section-title">Processo passo a passo</p>
          ${stepsHtml}
        </div>

        <div class="vp-section">
          <p class="vp-section-title">Taxas</p>
          ${feesHtml}
        </div>

        <div class="vp-section">
          <p class="vp-section-title">Direitos com este visto</p>
          ${rightsHtml}
        </div>

        ${visa.notes ? `
        <div class="vp-notes">
          <div class="vp-notes-label">Observação</div>
          ${esc(visa.notes)}
        </div>` : ''}

        <div class="vp-cta-row">
          <a class="vp-cta-primary" href="../pais-${esc(config.code)}.html#vistos">← Ver todos os vistos de ${esc(config.displayName)}</a>
          <a class="vp-cta-secondary" href="../historico.html">Histórico de mudanças</a>
        </div>
      </div>

      <!-- SIDEBAR -->
      <aside class="vp-sidebar">
        ${hasSidebarReqs ? `
        <div class="vp-card">
          <div class="vp-card-title">Requisitos financeiros e acadêmicos</div>
          ${incomeHtml}
          ${langHtml}
          ${qualsHtml}
        </div>` : ''}

        <div class="vp-card">
          <div class="vp-card-title">Informações do processo</div>
          <div class="vp-field">
            <div class="vp-field-label">Local de solicitação</div>
            <div class="vp-field-value">${esc(appLoc)}</div>
          </div>
          <div class="vp-field">
            <div class="vp-field-label">Prazo estimado</div>
            <div class="vp-field-value" style="color:var(--primary);">${esc(duration)}</div>
          </div>
        </div>

        <div class="vp-card">
          <div class="vp-card-title">Outros vistos de ${esc(config.displayName)}</div>
          <a class="vp-cta-secondary" href="../pais-${esc(config.code)}.html#vistos" style="width:100%;justify-content:center;margin-top:4px;">Ver todos os ${data.visaTypes.length} vistos →</a>
        </div>

        <div class="vp-card" style="border-color:var(--hairline);background:transparent;">
          <div class="vp-card-title">Precisão dos dados</div>
          <p style="font-size:12px;color:var(--muted);line-height:1.6;">
            Dados extraídos automaticamente e atualizados mensalmente.
            Verifique sempre nas fontes oficiais antes de iniciar um processo.
          </p>
          <p style="font-size:11px;color:var(--muted);margin-top:8px;font-family:'JetBrains Mono',monospace;">
            Confiança: ${data.reliability.extractionConfidence}
          </p>
        </div>
      </aside>
    </div>
  </div>
</div>

<!-- FOOTER -->
<footer class="footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="logo" href="../home.html" style="margin-bottom:8px;">
          <img src="../assets/images/logonobg.png" alt="Rota Legal" style="height:22px;width:auto;display:block;">
          <span>Rota Legal</span>
        </a>
        <p class="body-sm" style="color:var(--muted);max-width:280px;">Monitorização mensal de vistos e regulamentações de trabalho para brasileiros na Europa e Oceania.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <p class="caption-up" style="color:var(--muted);margin-bottom:12px;">Países</p>
          <a class="footer-link" href="../pais-nl.html">Países Baixos</a>
          <a class="footer-link" href="../pais-pt.html">Portugal</a>
          <a class="footer-link" href="../pais-de.html">Alemanha</a>
          <a class="footer-link" href="../pais-fr.html">França</a>
        </div>
        <div class="footer-col">
          <p class="caption-up" style="color:var(--muted);margin-bottom:12px;">Ferramentas</p>
          <a class="footer-link" href="../comparar.html">Comparar países</a>
          <a class="footer-link" href="../qual-pais.html">Qual país é meu?</a>
          <a class="footer-link" href="../calculadora.html">Calculadora</a>
          <a class="footer-link" href="../historico.html">Histórico</a>
        </div>
        <div class="footer-col">
          <p class="caption-up" style="color:var(--muted);margin-bottom:12px;">Sobre</p>
          <a class="footer-link" href="../sobre.html">Metodologia</a>
          <a class="footer-link" href="../sobre.html#limitacoes">Limitações</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="body-sm" style="color:var(--muted);">Rota Legal não é escritório de advocacia. Dados para fins informativos.</p>
      <p class="body-sm" style="color:var(--muted);">Atualizado em ${updated}.</p>
    </div>
  </div>
</footer>

<script>
(function(){
  var btn = document.getElementById('nav-hamburger-btn');
  var drawer = document.getElementById('mobile-drawer');
  if (!btn || !drawer) return;
  function open() {
    drawer.removeAttribute('aria-hidden');
    btn.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    drawer.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', open);
  drawer.querySelectorAll('[data-close]').forEach(function(el){ el.addEventListener('click', close); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
})();
</script>
</body>
</html>`
}
