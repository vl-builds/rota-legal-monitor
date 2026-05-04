import type { CountryData, VisaType } from '@/extractors/schema'

export interface CountryPageConfig {
  code: string
  displayName: string
  flagClass: string
  workingHoliday: boolean
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

function fmtMoney(amount: number, currency: string, period?: string | null): string {
  const formatted = `${currency} ${amount.toLocaleString('pt-BR')}`
  if (!period) return formatted
  const periods: Record<string, string> = { monthly: '/mês', yearly: '/ano', 'one-time': '' }
  return formatted + (periods[period] ?? '')
}

function severityLabel(sev: string): string {
  return sev === 'major' ? 'Alta relevância' : sev === 'minor' ? 'Relevância média' : 'Baixa relevância'
}

function severityClass(sev: string): string {
  return sev === 'major' ? 'sev-high' : sev === 'minor' ? 'sev-medium' : 'sev-low'
}

function sortVisas(visas: VisaType[]): VisaType[] {
  const order: Record<string, number> = { direct: 0, indirect: 1, low: 2 }
  return [...visas].sort((a, b) => (order[a.relevanceForDelivery] ?? 3) - (order[b.relevanceForDelivery] ?? 3))
}

function renderVisaCard(visa: VisaType, isFirst: boolean): string {
  const isPrimary = visa.relevanceForDelivery === 'direct'
  const isLow = visa.relevanceForDelivery === 'low'

  const tags = [
    isPrimary ? '<span class="visa-tag hl">Principal</span>' : '',
    isLow ? '<span class="visa-tag">Baixa relevância</span>' : '',
    ...visa.eligibility.map(e => `<span class="visa-tag">${esc(e)}</span>`),
  ]
    .filter(Boolean)
    .join('\n                ')

  const incomeHtml = visa.requirements.incomeRequirement
    ? `<div class="visa-field">
              <span class="visa-field-label">Renda mínima</span>
              <span class="visa-field-value mono">${fmtMoney(visa.requirements.incomeRequirement.amount, visa.requirements.incomeRequirement.currency, visa.requirements.incomeRequirement.period)}</span>
            </div>`
    : ''

  const qualsHtml =
    visa.requirements.qualificationsRequired.length > 0
      ? `<div class="visa-field">
              <span class="visa-field-label">Qualificação exigida</span>
              <span class="visa-field-value">${visa.requirements.qualificationsRequired.map(esc).join('; ')}</span>
            </div>`
      : ''

  const langHtml = visa.requirements.languageRequired
    ? `<div class="visa-field">
              <span class="visa-field-label">Idioma</span>
              <span class="visa-field-value">${esc(visa.requirements.languageRequired.language)} — ${esc(visa.requirements.languageRequired.level)}</span>
            </div>`
    : ''

  const appLocMap: Record<string, string> = {
    origem: 'No Brasil (antes de entrar)',
    destino: 'No país de destino',
    ambos: 'No Brasil ou no destino',
  }

  const stepsHtml =
    visa.process.steps.length > 0
      ? `<div class="step-list">${visa.process.steps
          .map(
            s => `
              <div class="step-item">
                <span class="step-n">${s.order}</span>
                <span class="step-text">${esc(s.description)}</span>
              </div>`,
          )
          .join('')}
            </div>`
      : `<p style="font-size:13px;color:var(--muted);margin:0;">Etapas em levantamento. Ver aba Fontes.</p>`

  const feesHtml =
    visa.process.fees.length > 0
      ? visa.process.fees
          .map(
            f =>
              `<div><span class="visa-field-value mono" style="font-size:20px;">${fmtMoney(f.amount, f.currency)}</span>${f.notes ? `<div class="visa-field-label" style="margin-top:4px;">${esc(f.notes)}</div>` : ''}</div>`,
          )
          .join('')
      : `<span style="font-size:13px;color:var(--muted);">Taxa em levantamento.</span>`

  const rightsItems = [
    { ok: visa.rights.canWork, label: 'Trabalhar legalmente' },
    { ok: visa.rights.canBringFamily, label: 'Trazer família' },
    { ok: visa.rights.canChangeEmployer, label: 'Mudar de empregador' },
    visa.rights.pathToResidency
      ? { ok: true, label: `Residência permanente após ${visa.rights.pathToResidency.yearsRequired} anos` }
      : null,
    visa.rights.pathToCitizenship
      ? { ok: true, label: `Cidadania após ${visa.rights.pathToCitizenship.yearsRequired} anos` }
      : null,
  ].filter(Boolean)

  const rightsHtml = rightsItems
    .map(
      r =>
        `<div class="right-item"><span class="right-icon ${r!.ok ? 'yes' : 'no'}">${r!.ok ? '✓' : '✗'}</span>${esc(r!.label)}</div>`,
    )
    .join('\n              ')

  return `
        <div class="visa-card${isFirst ? ' open' : ''}">
          <div class="visa-head" onclick="toggleVisa(this)">
            <div class="visa-title-row">
              <h3 class="visa-name">${esc(visa.name)}</h3>
              <span class="visa-name-orig">${esc(visa.nameOriginal)}</span>
              <div class="visa-tags">
                ${tags}
              </div>
            </div>
            <span class="visa-toggle">+</span>
          </div>
          <div class="visa-body">
            <p style="font-size:13px;color:var(--body);line-height:1.55;margin:var(--s-lg) 0 0;">${esc(visa.description)}</p>
            <div class="visa-grid">
              <div>
                <p class="visa-section-title">Requisitos</p>
                ${incomeHtml}
                ${qualsHtml}
                ${langHtml}
                <div class="visa-field">
                  <span class="visa-field-label">Local do pedido</span>
                  <span class="visa-field-value">${esc(appLocMap[visa.process.applicationLocation] ?? visa.process.applicationLocation)}</span>
                </div>
                <div class="visa-field">
                  <span class="visa-field-label">Prazo estimado</span>
                  <span class="visa-field-value">${esc(visa.process.estimatedDuration)}</span>
                </div>
              </div>
              <div>
                <p class="visa-section-title">Processo</p>
                ${stepsHtml}
                <div style="margin-top:var(--s-lg);">
                  <p class="visa-section-title">Taxa</p>
                  ${feesHtml}
                </div>
              </div>
            </div>
            <div style="margin-top:var(--s-lg);">
              <p class="visa-section-title">Direitos</p>
              <div class="rights-grid">
                ${rightsHtml}
              </div>
            </div>
            ${visa.notes ? `<div style="margin-top:var(--s-lg);padding:var(--s-md);background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-lg);font-size:13px;color:var(--muted);">${esc(visa.notes)}</div>` : ''}
          </div>
        </div>`
}

function renderBrasileirosTab(data: CountryData, config: CountryPageConfig): string {
  const br = data.forBrazilians

  const schengenCard = `
        <div class="br-card ${br.schengenVisaFree ? 'highlight' : 'warning'}">
          <span class="br-label">Schengen — entrada sem visto</span>
          <span class="br-value ${br.schengenVisaFree ? 'yes' : 'no'}">${br.schengenVisaFree ? 'Sim' : 'Não'}</span>
          <p class="br-desc">${br.schengenVisaFree ? `O passaporte brasileiro permite entrada em ${esc(config.displayName)} por até ${br.maxStayDaysAsTourist} dias em qualquer período de 180 dias, sem visto de turista.` : `${esc(config.displayName)} não é parte do Espaço Schengen. Brasileiros precisam de visto de turista separado.`}</p>
        </div>`

  const workCard = `
        <div class="br-card ${br.workPermitNeeded ? 'warning' : 'highlight'}">
          <span class="br-label">Trabalhar sem autorização</span>
          <span class="br-value ${br.workPermitNeeded ? 'no' : 'yes'}">${br.workPermitNeeded ? 'Não permitido' : 'Sim'}</span>
          <p class="br-desc">${br.workPermitNeeded ? 'Mesmo com entrada livre, trabalhar sem autorização de trabalho é ilegal. Você precisa de um dos vistos listados na aba Vistos.' : 'Brasileiros podem trabalhar sem autorização especial de trabalho neste país.'}</p>
        </div>`

  const stayCard = `
        <div class="br-card">
          <span class="br-label">Permanência máxima como turista</span>
          <span class="br-value">${br.maxStayDaysAsTourist} dias</span>
          <p class="br-desc">Em cada período de 180 dias. Este período pode ser usado para buscar emprego presencialmente antes de obter o visto de trabalho, sem remuneração.</p>
        </div>`

  const agreementsCard =
    br.specialAgreements.length > 0
      ? br.specialAgreements
          .map(
            a => `
        <div class="br-card highlight">
          <span class="br-label">${esc(a.name)}</span>
          <span class="br-value" style="font-size:18px;">${esc(a.fullName)}</span>
          <p class="br-desc">${a.benefits.map(esc).join('. ')}</p>
        </div>`,
          )
          .join('')
      : `
        <div class="br-card">
          <span class="br-label">Acordos bilaterais com o Brasil</span>
          <span class="br-value no" style="color:var(--muted);">Nenhum</span>
          <p class="br-desc">Não existe acordo bilateral de Working Holiday ou reconhecimento automático de diplomas entre Brasil e ${esc(config.displayName)}. O caminho é pelos vistos padrão.</p>
        </div>`

  const notesCard = br.notes
    ? `
        <div class="br-card" style="grid-column:1/-1;">
          <span class="br-label">Observações para brasileiros</span>
          <p class="br-desc">${esc(br.notes)}</p>
        </div>`
    : ''

  return `
  <div class="tab-panel" id="brasileiros">
    <section class="section-tight">
      <div class="container">
        <div class="eyebrow">Condições específicas para brasileiros</div>
        <h2 class="display-sm" style="margin-bottom:var(--s-xl);">O que muda para você</h2>
        <div class="br-grid">
          ${schengenCard}
          ${workCard}
          ${stayCard}
          ${agreementsCard}
          ${notesCard}
        </div>
      </div>
    </section>
  </div>`
}

function renderRequisitosTab(data: CountryData, config: CountryPageConfig): string {
  const req = data.generalRequirements
  const updated = monthLabel(data.meta.lastUpdated)
  const sourceHostnames = data.meta.sources
    .filter(s => s.status === 'ok')
    .map(s => {
      try {
        return new URL(s.url).hostname
      } catch {
        return s.url
      }
    })
    .slice(0, 2)
    .join(', ')

  const items: Array<{ icon: string; iconClass: string; text: string; note: string }> = [
    {
      icon: '✓',
      iconClass: 'ok',
      text: `Passaporte — ${esc(req.passportValidity)}`,
      note: 'Verificar antes de iniciar',
    },
  ]

  if (req.proofOfFunds) {
    items.push({
      icon: '●',
      iconClass: 'req',
      text: `Comprovante de fundos — mínimo ${fmtMoney(req.proofOfFunds.amount, req.proofOfFunds.currency, req.proofOfFunds.period)}${req.proofOfFunds.notes ? `. ${req.proofOfFunds.notes}` : ''}`,
      note: 'Ver cada visto',
    })
  }

  if (req.healthInsurance.required) {
    const covNote = req.healthInsurance.minimumCoverage
      ? `Cobertura mín. ${fmtMoney(req.healthInsurance.minimumCoverage.amount, req.healthInsurance.minimumCoverage.currency)}`
      : 'Obrigatório'
    items.push({
      icon: '●',
      iconClass: 'req',
      text: `Seguro saúde obrigatório${req.healthInsurance.mustBeLocal ? ' (seguro local exigido após chegada)' : ''}. ${esc(req.healthInsurance.notes)}`,
      note: covNote,
    })
  }

  if (req.cleanCriminalRecord) {
    items.push({
      icon: '✓',
      iconClass: 'ok',
      text: 'Certidão de antecedentes criminais (apostilada)',
      note: 'Apostila de Haia',
    })
  }

  if (req.vaccinations.length > 0) {
    items.push({
      icon: '●',
      iconClass: 'req',
      text: `Vacinação exigida: ${req.vaccinations.map(esc).join(', ')}`,
      note: 'Verificar caderneta',
    })
  }

  const rowsHtml = items
    .map(
      item => `
          <div class="req-item">
            <span class="req-icon ${item.iconClass}">${item.icon}</span>
            <span class="req-text">${item.text}</span>
            <span class="req-note">${item.note}</span>
          </div>`,
    )
    .join('')

  return `
  <div class="tab-panel" id="requisitos">
    <section class="section-tight">
      <div class="container">
        <div class="eyebrow">Válidos para todos os vistos de trabalho</div>
        <h2 class="display-sm" style="margin-bottom:var(--s-xl);">Requisitos gerais</h2>
        <div class="req-list">
          ${rowsHtml}
        </div>
        <div style="margin-top:var(--s-xl);padding:var(--s-lg);background:var(--glass-bg);backdrop-filter:blur(var(--glass-blur));-webkit-backdrop-filter:blur(var(--glass-blur));border:1px solid var(--glass-border);border-radius:var(--r-lg);">
          <p class="body-sm" style="color:var(--muted);margin:0;">
            Requisitos extraídos de <span style="color:var(--primary);">${sourceHostnames}</span> em ${updated}.
            Requisitos específicos de cada visto estão na aba Vistos. Sempre confirme na fonte oficial antes de iniciar.
          </p>
        </div>
      </div>
    </section>
  </div>`
}

function renderMudancasTab(data: CountryData): string {
  if (data.recentChanges.length === 0) {
    return `
  <div class="tab-panel" id="mudancas">
    <section class="section-tight">
      <div class="container">
        <div class="eyebrow">Histórico de alterações detectadas</div>
        <h2 class="display-sm" style="margin-bottom:var(--s-xl);">Mudanças recentes</h2>
        <div style="padding:var(--s-xxl);text-align:center;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--r-lg);">
          <p style="color:var(--muted);margin:0;">Nenhuma mudança detectada no último ciclo de extração.</p>
        </div>
        <div style="margin-top:var(--s-xl);text-align:center;">
          <a class="text-link body-sm" href="historico.html">Ver histórico completo de todos os países →</a>
        </div>
      </div>
    </section>
  </div>`
  }

  const entriesHtml = data.recentChanges
    .map(
      ch => `
          <div class="timeline-entry">
            <div class="timeline-date">
              <span class="timeline-date-str">${ch.date}</span>
              <span class="${severityClass(ch.severity)}">${severityLabel(ch.severity)}</span>
            </div>
            <div class="timeline-content">
              <h3 class="timeline-title">${esc(ch.title)}</h3>
              <p class="timeline-summary">${esc(ch.summary)}</p>
              ${
                ch.affects.length > 0
                  ? `<div class="timeline-affects">${ch.affects.map(a => `<span class="affect-pill">${esc(a)}</span>`).join('')}</div>`
                  : ''
              }
            </div>
          </div>`,
    )
    .join('')

  return `
  <div class="tab-panel" id="mudancas">
    <section class="section-tight">
      <div class="container">
        <div class="eyebrow">Histórico de alterações detectadas</div>
        <h2 class="display-sm" style="margin-bottom:var(--s-xl);">Mudanças recentes</h2>
        <div class="timeline">
          ${entriesHtml}
        </div>
        <div style="margin-top:var(--s-xl);text-align:center;">
          <a class="text-link body-sm" href="historico.html">Ver histórico completo de todos os países →</a>
        </div>
      </div>
    </section>
  </div>`
}

function renderFontesTab(data: CountryData): string {
  const updated = monthLabel(data.meta.lastUpdated)
  const allOk = data.meta.sources.every(s => s.status === 'ok')
  const confidence = data.reliability.extractionConfidence

  const sourcesHtml = data.meta.sources
    .map(s => {
      let displayUrl: string
      try {
        const u = new URL(s.url)
        displayUrl = u.hostname + u.pathname
      } catch {
        displayUrl = s.url
      }
      const fetchDate = s.fetchedAt.slice(0, 10)
      const statusBadge =
        s.status === 'ok'
          ? '<span class="badge up"><span class="pulse"></span>ok</span>'
          : s.status === 'partial'
            ? '<span class="badge">parcial</span>'
            : '<span class="badge down">falhou</span>'
      return `
          <div class="source-item">
            <div>
              <a class="source-url" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(displayUrl)}</a>
            </div>
            <div class="source-status">
              ${statusBadge}
              <span style="font-size:12px;color:var(--muted);font-family:'JetBrains Mono',monospace;">${fetchDate}</span>
              <span style="font-size:11px;color:var(--muted);">${s.contentLanguage}</span>
            </div>
          </div>`
    })
    .join('')

  const confidenceLabel =
    confidence === 'high'
      ? 'Alta confiança'
      : confidence === 'medium'
        ? 'Confiança média'
        : 'Baixa confiança'
  const confidenceBadge =
    confidence === 'high'
      ? '<span class="badge up"><span class="pulse"></span>Alta confiança</span>'
      : confidence === 'medium'
        ? '<span class="badge">Confiança média</span>'
        : '<span class="badge down">Baixa confiança</span>'

  return `
  <div class="tab-panel" id="fontes">
    <section class="section-tight">
      <div class="container">
        <div class="eyebrow">Transparência total</div>
        <h2 class="display-sm" style="margin-bottom:var(--s-md);">Fontes usadas na extração</h2>
        <p class="body-md" style="max-width:600px;margin-bottom:var(--s-xl);">
          Todos os dados foram extraídos das URLs abaixo em ${updated}. Clique para ver a fonte original.
        </p>
        <div class="sources-list">
          ${sourcesHtml}
        </div>
        <div style="margin-top:var(--s-xl);padding:var(--s-lg);background:var(--glass-bg);backdrop-filter:blur(var(--glass-blur));-webkit-backdrop-filter:blur(var(--glass-blur));border:1px solid var(--glass-border);border-radius:var(--r-lg);">
          <div style="display:flex;align-items:center;gap:var(--s-md);">
            ${confidenceBadge}
            <span class="body-sm" style="color:var(--muted);">
              ${confidenceLabel} — ${allOk ? 'Todas as URLs responderam com sucesso.' : 'Algumas URLs tiveram problemas na última extração.'} Extração por Claude Haiku 4.5 com schema Zod v${data.meta.schemaVersion}.
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>`
}

function renderGuiaTab(data: CountryData, config: CountryPageConfig): string {
  const updated = monthLabel(data.meta.lastUpdated)
  const req = data.generalRequirements
  const firstVisa = sortVisas(data.visaTypes)[0]

  const docSteps: Array<{ heading: string; desc: string }> = []
  docSteps.push({
    heading: 'Passaporte válido',
    desc: `Validade mínima: ${esc(req.passportValidity)}. Verifique com antecedência pois renovação no Brasil pode demorar semanas.`,
  })
  if (req.cleanCriminalRecord) {
    docSteps.push({
      heading: 'Certidão de antecedentes criminais',
      desc: 'Emitida pelo DETRAN ou cartório, apostilada pela Convenção de Haia. Solicite com pelo menos 30 dias de antecedência.',
    })
  }
  if (req.healthInsurance.required) {
    docSteps.push({
      heading: 'Seguro saúde',
      desc: req.healthInsurance.notes || 'Seguro saúde obrigatório para o período do visto.',
    })
  }
  if (req.proofOfFunds) {
    docSteps.push({
      heading: 'Comprovante de fundos',
      desc: `Mínimo ${fmtMoney(req.proofOfFunds.amount, req.proofOfFunds.currency, req.proofOfFunds.period)}. ${req.proofOfFunds.notes ?? ''}`.trim(),
    })
  }

  const docStepsHtml = docSteps
    .map(
      (s, i) => `
              <div class="guide-step${i < 2 ? ' highlight' : ''}">
                <div class="guide-step-left">
                  <div class="step-circle">${i + 1}</div>
                  ${i < docSteps.length - 1 ? '<div class="step-line"></div>' : ''}
                </div>
                <div class="step-body">
                  <h4 class="step-heading">${s.heading}</h4>
                  <p class="step-desc">${s.desc}</p>
                </div>
              </div>`,
    )
    .join('')

  const visaPhaseHtml =
    firstVisa && firstVisa.process.steps.length > 0
      ? `
          <div class="guide-phase">
            <div class="phase-header">
              <span class="phase-num">FASE 02</span>
              <div>
                <h3 class="phase-title">Processo do visto: ${esc(firstVisa.name)}</h3>
                <p class="phase-subtitle">${firstVisa.process.applicationLocation === 'origem' ? 'Realizado no Brasil antes de embarcar' : firstVisa.process.applicationLocation === 'destino' ? 'Realizado no país de destino após chegada' : 'Pode ser iniciado no Brasil ou no destino'}</p>
              </div>
            </div>
            <div class="guide-steps">
              ${firstVisa.process.steps
                .map(
                  (s, i) => `
              <div class="guide-step${i === 0 ? ' highlight' : ''}">
                <div class="guide-step-left">
                  <div class="step-circle">${s.order}</div>
                  ${i < firstVisa.process.steps.length - 1 ? '<div class="step-line"></div>' : ''}
                </div>
                <div class="step-body">
                  <h4 class="step-heading">${esc(s.name)}</h4>
                  <p class="step-desc">${esc(s.description)}</p>
                  ${s.estimatedDays ? `<div class="step-tags"><span class="step-tag prazo">Prazo estimado: ${s.estimatedDays} dias</span></div>` : ''}
                </div>
              </div>`,
                )
                .join('')}
            </div>
          </div>`
      : `
          <div class="guide-phase">
            <div class="phase-header">
              <span class="phase-num">FASE 02</span>
              <div>
                <h3 class="phase-title">Processo do visto</h3>
                <p class="phase-subtitle">Consulte as fontes oficiais para o passo a passo completo</p>
              </div>
            </div>
            <div class="guide-steps">
              <div class="guide-step highlight">
                <div class="guide-step-left"><div class="step-circle">1</div></div>
                <div class="step-body">
                  <h4 class="step-heading">Consulte as fontes listadas na aba Fontes</h4>
                  <p class="step-desc">As etapas detalhadas do processo estão em levantamento. As URLs oficiais na aba Fontes têm as instruções completas e atualizadas.</p>
                </div>
              </div>
            </div>
          </div>`

  return `
  <div class="tab-panel" id="guia">
    <section class="section-tight">
      <div class="container">
        <div class="eyebrow">Guia prático para brasileiros</div>
        <h2 class="display-sm" style="margin-bottom:var(--s-md);">Como se legalizar em ${esc(config.displayName)}</h2>
        <div class="guide-intro">
          <p>Resumo das etapas principais baseado em dados extraídos em ${updated}. Este guia é simplificado, consulte sempre as fontes oficiais para o seu caso específico.</p>
        </div>

        <div class="guide-phases">
          <div class="guide-phase">
            <div class="phase-header">
              <span class="phase-num">FASE 01</span>
              <div>
                <h3 class="phase-title">Documentação essencial</h3>
                <p class="phase-subtitle">Prepare estes documentos antes de iniciar o processo</p>
              </div>
            </div>
            <div class="guide-steps">
              ${docStepsHtml}
            </div>
          </div>

          ${visaPhaseHtml}
        </div>

        <div class="guide-disclaimer">
          <p>Guia gerado automaticamente a partir de dados de ${updated}. Requisitos e prazos mudam com frequência por regulamentação do governo de ${esc(config.displayName)}. Sempre confirme nas fontes oficiais antes de iniciar o processo.</p>
        </div>
      </div>
    </section>
  </div>`
}

const PAGE_CSS = `
  /* ---- country hero ---- */
  .country-hero { padding: var(--s-xxl) 0; border-bottom: 1px solid var(--hairline); }
  .hero-row { display: flex; align-items: center; gap: var(--s-xl); flex-wrap: wrap; }
  .hero-flag { width: 64px; height: 46px; border-radius: 6px; display: block; flex-shrink: 0; }
  .hero-info { flex: 1; min-width: 200px; }
  .hero-name { font-size: 40px; font-weight: 700; letter-spacing: -1.5px; color: var(--on-dark); line-height: 1.1; margin: 0 0 var(--s-sm); }
  .hero-badges { display: flex; gap: var(--s-xs); flex-wrap: wrap; }
  /* ---- sticky subheader + tabs ---- */
  .country-sticky { position: sticky; top: 64px; z-index: 39; background: rgba(10,10,10,0.55); backdrop-filter: blur(var(--glass-blur-strong)) saturate(140%); -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(140%); border-bottom: 1px solid var(--glass-border); }
  .sticky-inner { display: flex; align-items: center; gap: var(--s-lg); height: 52px; }
  .sticky-id { display: flex; align-items: center; gap: var(--s-sm); flex-shrink: 0; }
  .sticky-flag { width: 24px; height: 18px; border-radius: 3px; display: block; }
  .sticky-name { font-size: 14px; font-weight: 700; color: var(--on-dark); letter-spacing: -0.2px; }
  .tabs { display: flex; gap: 0; margin-left: auto; height: 100%; overflow-x: auto; scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab-btn { height: 52px; padding: 0 var(--s-lg); font-size: 14px; font-weight: 500; color: var(--muted); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; white-space: nowrap; transition: color 120ms ease, border-color 120ms ease; }
  .tab-btn:hover { color: var(--body-strong); }
  .tab-btn.active { color: var(--on-dark); border-bottom-color: var(--primary); font-weight: 600; }
  /* ---- quick summary ---- */
  .quick-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; background: var(--surface-soft); border-bottom: 1px solid var(--hairline); }
  .qs-item { padding: var(--s-xl); display: flex; flex-direction: column; gap: var(--s-xxs); }
  .qs-item + .qs-item { border-left: 1px solid var(--hairline); }
  .qs-label { font-size: 12px; color: var(--muted); font-weight: 500; letter-spacing: 0.3px; }
  .qs-value { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: var(--on-dark); line-height: 1.1; }
  .qs-value.accent { color: var(--primary); }
  .qs-value.positive { color: var(--accent-emerald); }
  .qs-value.negative { color: var(--muted); }
  .qs-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
  /* ---- tab panels ---- */
  .tab-panel { display: none; }
  .tab-panel.active { display: block; }
  /* ---- visa cards ---- */
  .visa-list { display: flex; flex-direction: column; gap: var(--s-lg); }
  .visa-card { background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--glass-border); border-radius: var(--r-lg); overflow: hidden; }
  .visa-head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-md); padding: var(--s-xl); cursor: pointer; transition: background 120ms ease; }
  .visa-head:hover { background: rgba(255,255,255,0.02); }
  .visa-title-row { display: flex; flex-direction: column; gap: var(--s-xs); }
  .visa-name { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; color: var(--on-dark); margin: 0; }
  .visa-name-orig { font-size: 12px; color: var(--muted); font-family: "JetBrains Mono", ui-monospace, monospace; }
  .visa-tags { display: flex; gap: var(--s-xxs); flex-wrap: wrap; }
  .visa-tag { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: var(--r-pill); background: var(--surface-elevated); color: var(--muted); border: 1px solid var(--hairline); }
  .visa-tag.hl { background: rgba(240,180,41,0.1); color: var(--primary); border-color: rgba(240,180,41,0.2); }
  .visa-toggle { font-size: 18px; color: var(--muted); font-weight: 400; flex-shrink: 0; transition: transform 200ms ease; user-select: none; padding-top: 2px; }
  .visa-card.open .visa-toggle { transform: rotate(45deg); color: var(--primary); }
  .visa-body { display: none; padding: 0 var(--s-xl) var(--s-xl); border-top: 1px solid var(--hairline); }
  .visa-card.open .visa-body { display: block; }
  .visa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-xl); margin-top: var(--s-lg); }
  .visa-section-title { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); margin: 0 0 var(--s-md); }
  .visa-field { display: flex; flex-direction: column; gap: 2px; margin-bottom: var(--s-md); }
  .visa-field-label { font-size: 12px; color: var(--muted); font-weight: 500; }
  .visa-field-value { font-size: 14px; color: var(--body-strong); font-weight: 600; }
  .visa-field-value.mono { font-family: "JetBrains Mono", ui-monospace, monospace; color: var(--primary); font-size: 16px; }
  .step-list { display: flex; flex-direction: column; gap: var(--s-sm); }
  .step-item { display: grid; grid-template-columns: 28px 1fr; gap: var(--s-sm); align-items: start; }
  .step-n { width: 24px; height: 24px; border-radius: 50%; background: var(--surface-elevated); border: 1px solid var(--hairline); display: grid; place-items: center; font-size: 11px; font-weight: 700; color: var(--muted); font-family: "JetBrains Mono", ui-monospace, monospace; flex-shrink: 0; }
  .step-text { font-size: 13px; color: var(--body); line-height: 1.5; padding-top: 3px; }
  .rights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-sm); }
  .right-item { display: flex; align-items: center; gap: var(--s-xs); font-size: 13px; color: var(--body); }
  .right-icon { font-size: 14px; width: 16px; text-align: center; }
  .right-icon.yes { color: var(--accent-emerald); }
  .right-icon.no { color: var(--muted-soft); }
  /* ---- para brasileiros ---- */
  .br-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-lg); }
  .br-card { background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--glass-border); border-radius: var(--r-lg); padding: var(--s-xl); display: flex; flex-direction: column; gap: var(--s-sm); }
  .br-card.highlight { border-color: rgba(240,180,41,0.3); background: rgba(240,180,41,0.05); }
  .br-card.warning { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.04); }
  .br-label { font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: 0.3px; text-transform: uppercase; }
  .br-value { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: var(--on-dark); }
  .br-value.yes { color: var(--accent-emerald); }
  .br-value.no { color: var(--accent-rose); }
  .br-desc { font-size: 13px; color: var(--body); line-height: 1.55; }
  /* ---- requisitos gerais ---- */
  .req-list { display: flex; flex-direction: column; gap: var(--s-sm); }
  .req-item { display: grid; grid-template-columns: auto 1fr auto; gap: var(--s-md); align-items: center; padding: var(--s-md) var(--s-lg); background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--glass-border); border-radius: var(--r-lg); }
  .req-icon { font-size: 16px; width: 20px; text-align: center; }
  .req-icon.ok { color: var(--accent-emerald); }
  .req-icon.req { color: var(--accent-blue); }
  .req-text { font-size: 14px; color: var(--body-strong); }
  .req-note { font-size: 12px; color: var(--muted); text-align: right; white-space: nowrap; }
  /* ---- mudanças recentes ---- */
  .timeline { display: flex; flex-direction: column; gap: 0; }
  .timeline-entry { display: grid; grid-template-columns: 120px 1fr; gap: var(--s-xl); padding: var(--s-lg) 0; }
  .timeline-entry + .timeline-entry { border-top: 1px solid var(--hairline); }
  .timeline-date { display: flex; flex-direction: column; align-items: flex-end; gap: var(--s-xxs); padding-top: 2px; }
  .timeline-date-str { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: var(--muted); white-space: nowrap; }
  .timeline-content { display: flex; flex-direction: column; gap: var(--s-xs); }
  .timeline-title { font-size: 15px; font-weight: 700; color: var(--on-dark); margin: 0; }
  .timeline-summary { font-size: 13px; color: var(--body); line-height: 1.55; margin: 0; }
  .timeline-affects { font-size: 12px; color: var(--muted); display: flex; gap: var(--s-xs); flex-wrap: wrap; }
  .affect-pill { padding: 2px 8px; border-radius: var(--r-pill); background: var(--surface-elevated); border: 1px solid var(--hairline); }
  .sev-high { background: rgba(239,68,68,0.12); color: var(--accent-rose); font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--r-pill); }
  .sev-medium { background: rgba(59,130,246,0.12); color: var(--accent-blue); font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--r-pill); }
  .sev-low { background: var(--surface-elevated); color: var(--muted); font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--r-pill); }
  /* ---- fontes ---- */
  .sources-list { display: flex; flex-direction: column; gap: var(--s-md); }
  .source-item { background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--glass-border); border-radius: var(--r-lg); padding: var(--s-lg); display: grid; grid-template-columns: 1fr auto; gap: var(--s-lg); align-items: start; }
  .source-url { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 13px; color: var(--primary); text-decoration: underline; text-underline-offset: 3px; word-break: break-all; margin-bottom: var(--s-xs); }
  .source-meta { font-size: 12px; color: var(--muted); }
  .source-status { display: flex; flex-direction: column; align-items: flex-end; gap: var(--s-xxs); }
  @media (max-width: 1024px) {
    .quick-summary { grid-template-columns: repeat(2, 1fr); }
    .qs-item:nth-child(2n+1) { border-left: none; }
    .qs-item:nth-child(n+3) { border-top: 1px solid var(--hairline); }
    .visa-grid { grid-template-columns: 1fr; }
    .br-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .hero-name { font-size: 28px; }
    .tabs { margin-left: 0; }
    .sticky-inner { flex-wrap: wrap; height: auto; padding: var(--s-sm) 0; gap: var(--s-sm); }
    .sticky-id { padding-top: var(--s-xs); }
    .quick-summary { grid-template-columns: 1fr 1fr; }
    .timeline-entry { grid-template-columns: 1fr; gap: var(--s-sm); }
    .timeline-date { align-items: flex-start; flex-direction: row; gap: var(--s-sm); }
    .req-item { grid-template-columns: auto 1fr; }
    .req-note { display: none; }
    .rights-grid { grid-template-columns: 1fr; }
  }
`

export function generateCountryPage(data: CountryData, config: CountryPageConfig): string {
  const sorted = sortVisas(data.visaTypes)
  const updated = monthLabel(data.meta.lastUpdated)
  const hasSchengen = data.forBrazilians.schengenVisaFree
  const needsPermit = data.forBrazilians.workPermitNeeded
  const visaCount = data.visaTypes.length

  const visaCardsHtml = sorted.length > 0
    ? sorted.map((v, i) => renderVisaCard(v, i === 0)).join('')
    : `<div style="padding:var(--s-xxl);text-align:center;color:var(--muted);">Vistos em levantamento para este ciclo.</div>`

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(config.displayName)} — Rota Legal</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/design-system.css" />
<style>${PAGE_CSS}</style>
</head>
<body>
<div class="bg-orbs" aria-hidden="true"><div class="orb-3"></div></div>

<!-- NAV -->
<nav class="top-nav">
  <div class="container">
    <a class="logo" href="home.html">
      <img src="assets/images/logonobg.png" alt="Rota Legal" style="height:26px;width:auto;display:block;">
      <span>Rota Legal</span>
    </a>
    <div class="nav-links">
      <a class="nav-link" href="paises.html" style="color:var(--on-dark);">Países</a>
      <a class="nav-link" href="comparar.html">Comparar</a>
      <a class="nav-link" href="qual-pais.html">Qual país?</a>
      <a class="nav-link" href="calculadora.html">Calculadora</a>
      <a class="nav-link" href="historico.html">Histórico</a>
      <a class="nav-link" href="sobre.html">Sobre</a>
    </div>
    <div class="nav-right">
      <a class="btn btn-secondary" href="paises.html">← Todos os países</a>
      <a class="btn btn-primary" href="comparar.html">Comparar</a>
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
      <a href="home.html">Início</a>
      <a href="paises.html">Países</a>
      <a href="comparar.html">Comparar</a>
      <a href="qual-pais.html">Qual país é meu?</a>
      <a href="calculadora.html">Calculadora</a>
      <a href="historico.html">Histórico</a>
      <a href="sobre.html">Sobre</a>
    </nav>
    <div class="mobile-drawer-cta">
      <a class="btn btn-primary" href="qual-pais.html">Qual país é meu?</a>
      <a class="btn btn-secondary" href="comparar.html">Comparar países</a>
    </div>
  </aside>
</div>

<!-- COUNTRY HERO -->
<div class="country-hero">
  <div class="container">
    <div class="hero-row">
      <span class="hero-flag ${config.flagClass}"></span>
      <div class="hero-info">
        <h1 class="hero-name">${esc(config.displayName)}</h1>
        <div class="hero-badges">
          <span class="badge up"><span class="pulse"></span>${data.reliability.extractionConfidence === 'high' ? 'Alta confiança' : data.reliability.extractionConfidence === 'medium' ? 'Confiança média' : 'Baixa confiança'}</span>
          ${hasSchengen ? '<span class="badge">Schengen</span>' : ''}
          ${needsPermit ? '<span class="badge">Work Permit exigido</span>' : ''}
          ${config.workingHoliday ? '<span class="badge new">Working Holiday</span>' : ''}
          <span class="badge new">Atualizado ${updated}</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- STICKY SUBHEADER + TABS -->
<div class="country-sticky" id="sticky">
  <div class="container">
    <div class="sticky-inner">
      <div class="sticky-id">
        <span class="sticky-flag ${config.flagClass}"></span>
        <span class="sticky-name">${esc(config.displayName)}</span>
      </div>
      <nav class="tabs">
        <button class="tab-btn active" data-tab="vistos">Vistos</button>
        <button class="tab-btn" data-tab="brasileiros">Para Brasileiros</button>
        <button class="tab-btn" data-tab="requisitos">Requisitos Gerais</button>
        <button class="tab-btn" data-tab="mudancas">Mudanças Recentes</button>
        <button class="tab-btn" data-tab="fontes">Fontes</button>
        <button class="tab-btn" data-tab="guia">Guia Prático</button>
      </nav>
    </div>
  </div>
</div>

<!-- QUICK SUMMARY -->
<div class="quick-summary">
  <div class="qs-item">
    <span class="qs-label">Entrada sem visto (Schengen)</span>
    <span class="qs-value ${hasSchengen ? 'positive' : 'negative'}">${hasSchengen ? 'Sim' : 'Não'}</span>
    <span class="qs-sub">${hasSchengen ? `Até ${data.forBrazilians.maxStayDaysAsTourist} dias por turismo` : 'Visto de turista necessário'}</span>
  </div>
  <div class="qs-item">
    <span class="qs-label">Tipos de visto monitorados</span>
    <span class="qs-value accent">${visaCount}</span>
    <span class="qs-sub">${sorted.filter(v => v.relevanceForDelivery === 'direct').length} de relevância direta</span>
  </div>
  <div class="qs-item">
    <span class="qs-label">Work permit exigido</span>
    <span class="qs-value ${needsPermit ? 'negative' : 'positive'}">${needsPermit ? 'Sim' : 'Não'}</span>
    <span class="qs-sub">${needsPermit ? 'Autorização obrigatória para trabalhar' : 'Trabalho permitido sem autorização especial'}</span>
  </div>
  <div class="qs-item">
    <span class="qs-label">Dados atualizados em</span>
    <span class="qs-value">${updated}</span>
    <span class="qs-sub">Extração automática mensal</span>
  </div>
</div>

<!-- TAB CONTENT -->
<main>

  <!-- ABA: VISTOS -->
  <div class="tab-panel active" id="vistos">
    <section class="section-tight">
      <div class="container">
        <div class="eyebrow">${visaCount} tipo${visaCount !== 1 ? 's' : ''} de visto monitorado${visaCount !== 1 ? 's' : ''}</div>
        <h2 class="display-sm" style="margin-bottom:var(--s-xl);">Opções de visto de trabalho</h2>
        <div class="visa-list">
          ${visaCardsHtml}
        </div>
      </div>
    </section>
  </div>

  ${renderBrasileirosTab(data, config)}
  ${renderRequisitosTab(data, config)}
  ${renderMudancasTab(data)}
  ${renderFontesTab(data)}
  ${renderGuiaTab(data, config)}

</main>

<!-- CTA BAND -->
<section>
  <div class="container">
    <div class="cta-band-yellow">
      <div>
        <h2>Comparar com outros países</h2>
        <p>Veja ${esc(config.displayName)} lado a lado com outros destinos. Todos os critérios na mesma tabela.</p>
      </div>
      <div class="actions">
        <a class="btn btn-on-yellow" href="paises.html">← Lista de países</a>
        <a class="btn btn-on-yellow" href="comparar.html">Abrir comparador</a>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="logo" href="home.html" style="margin-bottom:var(--s-md);display:inline-flex;">
          <img src="assets/images/logonobg.png" alt="Rota Legal" style="height:26px;width:auto;display:block;">
          <span>Rota Legal</span>
        </a>
        <p class="body-sm" style="max-width:300px;color:var(--muted);">
          Condições de imigração em 10 países para brasileiros que querem trabalhar no exterior. Dados de fontes oficiais, atualizados todo mês.
        </p>
      </div>
      <div>
        <h4>Países</h4>
        <ul>
          <li><a href="pais-nl.html">Países Baixos</a></li>
          <li><a href="pais-pt.html">Portugal</a></li>
          <li><a href="pais-de.html">Alemanha</a></li>
          <li><a href="pais-ie.html">Irlanda</a></li>
          <li><a href="paises.html">Ver todos →</a></li>
        </ul>
      </div>
      <div>
        <h4>Ferramentas</h4>
        <ul>
          <li><a href="comparar.html">Comparar países</a></li>
          <li><a href="qual-pais.html">Qual país é o meu?</a></li>
          <li><a href="calculadora.html">Calculadora</a></li>
          <li><a href="historico.html">Histórico</a></li>
        </ul>
      </div>
      <div>
        <h4>Projeto</h4>
        <ul>
          <li><a href="sobre.html">Sobre</a></li>
          <li><a href="sobre.html#metodologia">Metodologia</a></li>
          <li><a href="sobre.html#contribuir">Contribuir</a></li>
        </ul>
      </div>
      <div>
        <h4>Dados</h4>
        <ul>
          <li><a href="#">GitHub</a></li>
          <li><a href="#">JSON direto</a></li>
          <li><a href="historico.html">RSS de mudanças</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Rota Legal · <a href="https://github.com/Vitorcode1" target="_blank" rel="noopener noreferrer">Vitorcode1</a> · MIT</span>
      <span class="caption-up">Última extração: ${updated}</span>
    </div>
  </div>
</footer>

<script>
  const tabBtns = document.querySelectorAll('.tab-btn')
  const tabPanels = document.querySelectorAll('.tab-panel')
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'))
      tabPanels.forEach(p => p.classList.remove('active'))
      btn.classList.add('active')
      document.getElementById(btn.dataset.tab).classList.add('active')
      document.getElementById('sticky').scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
  function toggleVisa(head) {
    head.closest('.visa-card').classList.toggle('open')
  }
</script>
<script src="assets/nav.js" defer></script>
</body>
</html>`
}
