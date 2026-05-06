import type { CountryData, VisaType } from '@/extractors/schema'
import type { VerificationUrl } from '@/types'

export interface CountryPageConfig {
  code: string
  displayName: string
  flagClass: string
  workingHoliday: boolean
  verificationUrls?: VerificationUrl[]
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

// ---- Visa illustration SVGs (14 abstract geometric icons, currentColor based) ----
const ILLUSTRATIONS: Record<string, string> = {
  briefcase: `<svg viewBox="0 0 100 100" fill="none"><rect x="18" y="36" width="64" height="46" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><rect x="18" y="36" width="64" height="14" fill="currentColor" opacity="0.18"/><path d="M38 36 V28 a4 4 0 0 1 4 -4 h16 a4 4 0 0 1 4 4 v8" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="58" x2="82" y2="58" stroke="currentColor" stroke-width="1" opacity="0.5"/><circle cx="50" cy="58" r="2.5" fill="currentColor"/></svg>`,
  globe: `<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="55" r="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><ellipse cx="50" cy="55" rx="22" ry="9" stroke="currentColor" stroke-width="1"/><ellipse cx="50" cy="55" rx="9" ry="22" stroke="currentColor" stroke-width="1"/><line x1="28" y1="55" x2="72" y2="55" stroke="currentColor" stroke-width="1" opacity="0.6"/><path d="M62 22 a14 14 0 0 1 12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M65 18 a20 20 0 0 1 17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><circle cx="62" cy="22" r="1.8" fill="currentColor"/></svg>`,
  compass: `<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="28" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><circle cx="50" cy="50" r="22" stroke="currentColor" stroke-width="1" opacity="0.3"/><path d="M50 30 L56 50 L50 56 L44 50 Z" fill="currentColor" opacity="0.85"/><path d="M50 70 L44 50 L50 44 L56 50 Z" fill="currentColor" opacity="0.25"/><circle cx="50" cy="50" r="2" fill="#000"/><circle cx="50" cy="22" r="1.5" fill="currentColor"/></svg>`,
  spark: `<svg viewBox="0 0 100 100" fill="none"><path d="M50 18 L54 46 L82 50 L54 54 L50 82 L46 54 L18 50 L46 46 Z" fill="currentColor" opacity="0.85"/><path d="M50 18 L54 46 L82 50 L54 54 L50 82 L46 54 L18 50 L46 46 Z" stroke="currentColor" stroke-width="0.5" opacity="0.4"/><circle cx="50" cy="50" r="3" fill="#000"/></svg>`,
  crystal: `<svg viewBox="0 0 100 100" fill="none"><path d="M50 18 L72 38 L62 78 L38 78 L28 38 Z" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><path d="M50 18 L62 78 L38 78 Z" fill="currentColor" opacity="0.18"/><path d="M28 38 L50 50 L72 38" stroke="currentColor" stroke-width="1.2"/><path d="M50 18 L50 50 L38 78" stroke="currentColor" stroke-width="1" opacity="0.7"/><path d="M50 50 L62 78" stroke="currentColor" stroke-width="1" opacity="0.7"/><circle cx="50" cy="50" r="2" fill="currentColor"/></svg>`,
  circuit: `<svg viewBox="0 0 100 100" fill="none"><rect x="32" y="32" width="36" height="36" rx="2" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><rect x="42" y="42" width="16" height="16" fill="currentColor" opacity="0.25"/><line x1="50" y1="20" x2="50" y2="32" stroke="currentColor" stroke-width="1.2"/><line x1="50" y1="68" x2="50" y2="80" stroke="currentColor" stroke-width="1.2"/><line x1="20" y1="50" x2="32" y2="50" stroke="currentColor" stroke-width="1.2"/><line x1="68" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="1.2"/><line x1="32" y1="40" x2="22" y2="40" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="32" y1="60" x2="22" y2="60" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="68" y1="40" x2="78" y2="40" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="68" y1="60" x2="78" y2="60" stroke="currentColor" stroke-width="1" opacity="0.5"/><circle cx="50" cy="20" r="2.5" fill="currentColor"/><circle cx="20" cy="50" r="2.5" fill="currentColor"/><circle cx="80" cy="50" r="2.5" fill="currentColor"/><circle cx="50" cy="80" r="2.5" fill="currentColor"/></svg>`,
  diamond: `<svg viewBox="0 0 100 100" fill="none"><rect x="22" y="32" width="56" height="36" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><path d="M50 38 L62 50 L50 62 L38 50 Z" fill="currentColor" opacity="0.7"/><path d="M50 38 L62 50 L50 62 L38 50 Z" stroke="currentColor" stroke-width="0.6"/><circle cx="32" cy="42" r="1.2" fill="currentColor" opacity="0.6"/><circle cx="68" cy="42" r="1.2" fill="currentColor" opacity="0.6"/><circle cx="32" cy="58" r="1.2" fill="currentColor" opacity="0.6"/><circle cx="68" cy="58" r="1.2" fill="currentColor" opacity="0.6"/></svg>`,
  pillar: `<svg viewBox="0 0 100 100" fill="none"><rect x="22" y="56" width="14" height="26" fill="currentColor" opacity="0.3"/><rect x="22" y="56" width="14" height="26" stroke="currentColor" stroke-width="1.2"/><rect x="42" y="40" width="14" height="42" fill="currentColor" opacity="0.55"/><rect x="42" y="40" width="14" height="42" stroke="currentColor" stroke-width="1.2"/><rect x="62" y="22" width="14" height="60" fill="currentColor" opacity="0.85"/><rect x="62" y="22" width="14" height="60" stroke="currentColor" stroke-width="1.2"/><line x1="18" y1="82" x2="82" y2="82" stroke="currentColor" stroke-width="1.2"/></svg>`,
  rocket: `<svg viewBox="0 0 100 100" fill="none"><path d="M50 18 L62 50 L62 70 L38 70 L38 50 Z" fill="currentColor" opacity="0.7"/><path d="M50 18 L62 50 L62 70 L38 70 L38 50 Z" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="44" r="4" fill="#000" stroke="currentColor" stroke-width="1"/><path d="M38 60 L26 72 L34 70 L32 78" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" opacity="0.6"/><path d="M62 60 L74 72 L66 70 L68 78" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" opacity="0.6"/><path d="M44 70 L50 84 L56 70" stroke="currentColor" stroke-width="1.2" opacity="0.5"/></svg>`,
  launch: `<svg viewBox="0 0 100 100" fill="none"><path d="M20 78 Q40 70 50 50 T82 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><circle cx="20" cy="78" r="3" fill="currentColor" opacity="0.5"/><circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.7"/><path d="M76 22 L82 22 L82 28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M82 22 L72 32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="68" y="14" width="22" height="22" rx="2" stroke="currentColor" stroke-width="1" opacity="0.3" stroke-dasharray="2 2"/></svg>`,
  beaker: `<svg viewBox="0 0 100 100" fill="none"><path d="M40 24 V58 L50 64 L60 58 V24" stroke="currentColor" stroke-width="1.5"/><path d="M40 24 H60 V32 H40 Z" fill="currentColor" opacity="0.18"/><path d="M40 32 H60" stroke="currentColor" stroke-width="0.8" opacity="0.4"/><path d="M40 40 H60" stroke="currentColor" stroke-width="0.8" opacity="0.4"/><path d="M40 48 H60" stroke="currentColor" stroke-width="0.8" opacity="0.4"/><circle cx="50" cy="74" r="8" fill="currentColor" opacity="0.6"/><circle cx="50" cy="74" r="8" stroke="currentColor" stroke-width="1"/><circle cx="48" cy="72" r="1.5" fill="#000"/></svg>`,
  arrow: `<svg viewBox="0 0 100 100" fill="none"><rect x="20" y="62" width="16" height="20" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><rect x="42" y="46" width="16" height="36" stroke="currentColor" stroke-width="1.2" opacity="0.7"/><rect x="42" y="46" width="16" height="36" fill="currentColor" opacity="0.15"/><rect x="64" y="30" width="16" height="52" stroke="currentColor" stroke-width="1.2"/><rect x="64" y="30" width="16" height="52" fill="currentColor" opacity="0.3"/><path d="M22 30 L50 22 L78 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M72 14 L78 14 L78 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  heart: `<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="6" fill="currentColor"/><path d="M50 26 a12 12 0 0 1 12 12 a12 12 0 0 1 -12 12 a12 12 0 0 1 -12 -12 a12 12 0 0 1 12 -12 z" fill="currentColor" opacity="0.18"/><circle cx="50" cy="30" r="5" stroke="currentColor" stroke-width="1.2"/><circle cx="70" cy="50" r="5" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="70" r="5" stroke="currentColor" stroke-width="1.2"/><circle cx="30" cy="50" r="5" stroke="currentColor" stroke-width="1.2"/><circle cx="64" cy="36" r="3" fill="currentColor" opacity="0.5"/><circle cx="64" cy="64" r="3" fill="currentColor" opacity="0.5"/><circle cx="36" cy="64" r="3" fill="currentColor" opacity="0.5"/><circle cx="36" cy="36" r="3" fill="currentColor" opacity="0.5"/></svg>`,
  sun: `<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="14" fill="currentColor" opacity="0.6"/><circle cx="50" cy="50" r="14" stroke="currentColor" stroke-width="1.2"/><line x1="72" y1="50" x2="82" y2="50" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="65.56" y1="65.56" x2="72.63" y2="72.63" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="50" y1="72" x2="50" y2="82" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="34.44" y1="65.56" x2="27.37" y2="72.63" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="50" x2="18" y2="50" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="34.44" y1="34.44" x2="27.37" y2="27.37" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="50" y1="28" x2="50" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="65.56" y1="34.44" x2="72.63" y2="27.37" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
}

function getIllustrationSVG(key: string): string {
  return ILLUSTRATIONS[key] ?? ILLUSTRATIONS.briefcase ?? ''
}

function pickIllustrationKey(visa: VisaType): string {
  const text = (visa.id + ' ' + visa.name).toLowerCase()
  const has = (...words: string[]) => words.some(w => text.includes(w))
  if (has('tech', 'tecnolog')) return 'circuit'
  if (has('nomada', 'nômada', 'digital', 'remote', 'remoto')) return 'globe'
  if (has('procura', 'busca', 'seeker', 'job-seeker', 'jobseek')) return 'compass'
  if (has('startup', 'founder')) return 'launch'
  if (has('empreend', 'entrepreneur', 'business owner')) return 'rocket'
  if (has('investiment', 'investor', 'golden', 'capital')) return 'pillar'
  if (has('docencia', 'docência', 'professor', 'pesquis', 'research', 'cientif', 'científ')) return 'beaker'
  if (has('estagio', 'estágio', 'internship', 'trainee')) return 'arrow'
  if (has('voluntar', 'volunteer')) return 'heart'
  if (has('sazonal', 'seasonal', 'temporario', 'temporário', 'working holiday', 'working-holiday')) return 'sun'
  if (has('cartao azul', 'cartão azul', 'blue card', 'eu mobility')) return 'diamond'
  if (has('altamente qualif', 'highly qualified', 'skilled', 'qualified worker')) return 'crystal'
  if (has('independente', 'freelance', 'autônomo', 'autonomo', 'self-employ', 'conta propria', 'conta própria')) return 'spark'
  return 'briefcase'
}

function isRevokedVisa(visa: VisaType): boolean {
  if (/revogad|extinto|deprecat/i.test(visa.id)) return true
  if (/REVOGAD/.test(visa.description)) return true
  if (visa.notes && /revogad|extinto|deixou de existir/i.test(visa.notes)) return true
  return false
}

function getVisaTag(visa: VisaType): string {
  if (isRevokedVisa(visa)) return 'Revogado'
  if (visa.relevanceForDelivery === 'direct') return 'Principal'
  if (visa.relevanceForDelivery === 'low') return 'Baixa relevância'
  return visa.eligibility[0] ?? 'Outros'
}

function shortenVisaTitle(name: string): string {
  let s = name.trim()

  // "Long official name — Short common name" → preferir o sufixo curto
  const dashSplit = s.match(/^(.+)\s+[-—–]\s+(.+?)$/)
  if (dashSplit) {
    const tail = dashSplit[2]!.trim()
    if (tail.length > 0 && tail.length < dashSplit[1]!.length && tail.length <= 38 && !/^Art\b/i.test(tail) && !/^REVOGAD/i.test(tail)) {
      return tail
    }
  }

  s = s
    .replace(/^Autoriza[çc][ãa]o de Resid[êe]ncia para (?:o )?Exerc[íi]cio de\s+/i, '')
    .replace(/^Autoriza[çc][ãa]o de Resid[êe]ncia para\s+/i, '')
    .replace(/^Autoriza[çc][ãa]o de Resid[êe]ncia\s+/i, '')
    .replace(/^Autoriza[çc][ãa]o para\s+/i, '')
    .replace(/^Visto (?:de trabalho )?para (?:o )?Exerc[íi]cio de\s+/i, '')
    .replace(/^Visto (?:de trabalho )?para\s+/i, '')
    .replace(/^Visto de\s+/i, '')

  s = s
    .replace(/,?\s*com Visto de Resid[êe]ncia.*$/i, '')
    .replace(/,?\s*com Dispensa de Visto.*$/i, ' (sem visto)')
    .replace(/,?\s*com Visto para Procura de Trabalho.*$/i, ' (procura)')
    .replace(/,?\s*com Visto para [^.]*$/i, '')
    .replace(/\s*\(Art\.?\s*\d+.*?\)$/i, '')
    .replace(/\s*[-—–]\s*REVOGAD[OA]?\s*$/i, '')
    .trim()

  if (s.length > 0) s = s.charAt(0).toUpperCase() + s.slice(1)

  if (s.length > 50) {
    const cut = s.slice(0, 50)
    const lastSpace = cut.lastIndexOf(' ')
    s = (lastSpace > 28 ? cut.slice(0, lastSpace) : cut) + '…'
  }

  return s || name
}

function truncateForCard(s: string, maxChars = 110): string {
  const firstSentence = s.split(/(?<=[.!?])\s+/)[0] ?? s
  const cleaned = firstSentence.replace(/REVOGAD[OA]?/g, '').trim()
  if (cleaned.length <= maxChars) return cleaned
  const cut = cleaned.slice(0, maxChars).replace(/[\s,;:.]+$/, '')
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + '…'
}

function tagSlug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function renderTagPill(label: string): string {
  let variant = 'neutral'
  if (label === 'Principal') variant = 'principal'
  else if (label === 'Revogado') variant = 'revoked'
  return `<span class="visa-tag-pill ${variant}"><span class="visa-tag-pill-dot"></span>${esc(label)}</span>`
}

function renderVisaCard(visa: VisaType): string {
  const tag = getVisaTag(visa)
  const illoKey = pickIllustrationKey(visa)
  const description = truncateForCard(visa.description)
  const inactive = isRevokedVisa(visa)
  return `
        <button type="button" class="visa-card${inactive ? ' is-inactive' : ''}" data-visa-id="${esc(visa.id)}" data-visa-tag="${esc(tagSlug(tag))}" data-visa-active="${inactive ? 'false' : 'true'}">
          <div class="visa-illo-tile">${getIllustrationSVG(illoKey)}</div>
          <div class="visa-card-body">
            <h3 class="visa-card-title">${esc(shortenVisaTitle(visa.name))}</h3>
            <p class="visa-card-desc">${esc(description)}</p>
          </div>
          <div class="visa-card-foot">
            ${renderTagPill(tag)}
            <span class="visa-arrow-btn" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 6 H9 M6 3 L9 6 L6 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </div>
        </button>`
}

function renderVisaFilterChips(visas: VisaType[]): string {
  const active = visas.filter(v => !isRevokedVisa(v))
  const revokedCount = visas.length - active.length

  const counts = new Map<string, number>()
  for (const v of active) {
    const t = getVisaTag(v)
    counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  const tags = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])

  const allChip = `<button type="button" class="visa-chip active" data-tag="all">Todos · ${active.length}</button>`
  const tagChips = tags
    .map(([label, count]) => `<button type="button" class="visa-chip" data-tag="${esc(tagSlug(label))}">${esc(label)} · ${count}</button>`)
    .join('\n            ')
  const inactiveChip = revokedCount > 0
    ? `<button type="button" class="visa-chip visa-chip-inactive" data-tag="inativos">Inativos · ${revokedCount}</button>`
    : ''
  return `<div class="visa-filter-row">
            ${allChip}
            ${tagChips}
            ${inactiveChip}
          </div>`
}

function renderVisaDetail(visa: VisaType, _config: CountryPageConfig): string {
  const tag = getVisaTag(visa)
  const illoKey = pickIllustrationKey(visa)

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
                <span class="visa-field-value">${esc(visa.requirements.languageRequired.language)}: ${esc(visa.requirements.languageRequired.level)}</span>
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
          .map(s => `
                <div class="step-item">
                  <span class="step-n">${s.order}</span>
                  <span class="step-text">${esc(s.description)}</span>
                </div>`)
          .join('')}
              </div>`
      : `<p style="font-size:13px;color:var(--muted);margin:0;">Etapas em levantamento. Ver aba Fontes.</p>`

  const feesHtml =
    visa.process.fees.length > 0
      ? visa.process.fees
          .map(f => `<div><span class="visa-field-value mono" style="font-size:18px;">${fmtMoney(f.amount, f.currency)}</span>${f.notes ? `<div class="visa-field-label" style="margin-top:4px;">${esc(f.notes)}</div>` : ''}</div>`)
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
  ].filter(Boolean) as { ok: boolean; label: string }[]

  const rightsHtml = rightsItems
    .map(r => `<div class="right-item"><span class="right-icon ${r.ok ? 'yes' : 'no'}">${r.ok ? '✓' : '✗'}</span>${esc(r.label)}</div>`)
    .join('\n                ')

  return `
        <div class="visa-modal-header">
          <div class="visa-modal-illo">${getIllustrationSVG(illoKey)}</div>
          <div class="visa-modal-head-info">
            ${renderTagPill(tag)}
            <h2 class="visa-modal-title" id="visa-modal-title">${esc(visa.name)}</h2>
          </div>
        </div>

        <p class="visa-modal-summary">${esc(visa.description)}</p>

        <div class="visa-modal-info-grid">
          <div class="visa-modal-cell">
            <div class="visa-modal-cell-label">Local do pedido</div>
            <div class="visa-modal-cell-value">${esc(appLocMap[visa.process.applicationLocation] ?? visa.process.applicationLocation)}</div>
          </div>
          <div class="visa-modal-cell">
            <div class="visa-modal-cell-label">Tempo médio</div>
            <div class="visa-modal-cell-value accent">${esc(visa.process.estimatedDuration)}</div>
          </div>
        </div>

        <div class="visa-modal-official">
          <div class="visa-modal-cell-label">Designação oficial</div>
          <div class="visa-modal-official-text">${esc(visa.nameOriginal)}</div>
        </div>

        <div class="visa-modal-section">
          <p class="visa-section-title">Requisitos</p>
          ${incomeHtml}
          ${qualsHtml}
          ${langHtml}
          ${!incomeHtml && !qualsHtml && !langHtml ? '<p style="font-size:13px;color:var(--muted);margin:0;">Sem requisitos específicos catalogados. Ver aba Fontes.</p>' : ''}
        </div>

        <div class="visa-modal-section">
          <p class="visa-section-title">Processo</p>
          ${stepsHtml}
          <div style="margin-top:var(--s-md);">
            <p class="visa-section-title" style="margin-bottom:6px;">Taxa</p>
            ${feesHtml}
          </div>
        </div>

        <div class="visa-modal-section">
          <p class="visa-section-title">Direitos</p>
          <div class="rights-grid">
            ${rightsHtml}
          </div>
        </div>

        ${visa.notes ? `<div class="visa-modal-notes">${esc(visa.notes)}</div>` : ''}

        <div class="visa-modal-cta-row">
          <a class="visa-cta-primary" href="historico.html">Ver monitorização ao vivo</a>
          <a class="visa-cta-secondary" href="#fontes" data-visa-cta="fontes">Saber mais</a>
        </div>`
}

function renderVisaTemplates(visas: VisaType[], config: CountryPageConfig): string {
  return visas
    .map(v => `<template id="visa-detail-${esc(v.id)}">${renderVisaDetail(v, config)}</template>`)
    .join('\n        ')
}

function renderVisaModalShell(): string {
  return `<div class="visa-modal-backdrop" id="visa-modal" role="dialog" aria-modal="true" aria-labelledby="visa-modal-title" aria-hidden="true">
        <div class="visa-modal-dialog" role="document">
          <button type="button" class="visa-modal-close" aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3 L11 11 M11 3 L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div id="visa-modal-body"></div>
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

function renderFontesTab(data: CountryData, verificationUrls?: VerificationUrl[]): string {
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

  const verificationHtml =
    verificationUrls && verificationUrls.length > 0
      ? `
        <div style="margin-top:var(--s-xl);">
          <h3 class="title-md" style="margin-bottom:var(--s-sm);">Fontes de verificação cruzada</h3>
          <p class="body-sm" style="color:var(--muted);max-width:600px;margin-bottom:var(--s-md);">Links usados para validar a acurácia dos dados extraídos. Consultados na pesquisa de mai/2026 e integrados ao processo de extração mensal.</p>
          <div class="sources-list">
            ${verificationUrls
              .map(
                v => `
            <div class="source-item">
              <div>
                <a class="source-url" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${esc(v.label)}</a>
                <div class="body-sm" style="color:var(--muted);margin-top:2px;">${esc(v.description)}</div>
              </div>
              <div class="source-status">
                <span class="badge">verificação</span>
              </div>
            </div>`
              )
              .join('')}
          </div>
        </div>`
      : ''

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
        ${verificationHtml}
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
  /* ---- visa header ---- */
  .visa-eyebrow { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.82); font-family: "JetBrains Mono", ui-monospace, monospace; margin-bottom: 24px; }
  .visa-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); }
  .visa-section-h1 { margin: 0; font-size: 56px; font-weight: 500; letter-spacing: -0.03em; line-height: 1.05; max-width: 780px; }
  .visa-section-h1-soft { color: rgba(255,255,255,0.4); }
  .visa-section-lede { margin: 20px 0 0; font-size: 16px; line-height: 1.55; color: rgba(255,255,255,0.55); max-width: 580px; }
  /* ---- visa filter chips ---- */
  .visa-filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 36px 0 var(--s-xl); }
  .visa-chip { padding: 8px 16px; font-size: 12.5px; font-family: "JetBrains Mono", ui-monospace, monospace; letter-spacing: 0.02em; color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; cursor: pointer; transition: all 150ms ease; font-weight: 400; }
  .visa-chip:hover { color: var(--on-dark); border-color: rgba(255,255,255,0.18); }
  .visa-chip.active { color: var(--canvas); background: var(--primary); border-color: var(--primary); font-weight: 600; }
  /* ---- visa grid + cards ---- */
  .visa-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .visa-card { display: flex; flex-direction: column; align-items: flex-start; gap: 20px; padding: 28px 28px 26px; text-align: left; cursor: pointer; border-radius: 16px; background: rgba(255,255,255,0.012); border: 1px solid rgba(255,255,255,0.08); color: inherit; font: inherit; transition: all 200ms ease; transform: translateY(0); width: 100%; font-family: inherit; }
  .visa-card:hover { background: rgba(255,255,255,0.025); border-color: rgba(240,180,41,0.33); transform: translateY(-2px); }
  .visa-card[hidden] { display: none !important; }
  .visa-illo-tile { width: 76px; height: 76px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(255,255,255,0.02); color: var(--primary); transition: background 200ms ease; }
  .visa-card:hover .visa-illo-tile { background: rgba(240,180,41,0.10); }
  .visa-illo-tile svg { width: 78%; height: 78%; }
  .visa-card-body { flex: 1; display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .visa-card-title { margin: 0; font-size: 19px; font-weight: 500; letter-spacing: -0.015em; color: var(--on-dark); line-height: 1.25; }
  .visa-card-desc { margin: 0; font-size: 13.5px; line-height: 1.5; color: rgba(255,255,255,0.5); }
  .visa-card-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; margin-top: 4px; }
  /* ---- tag pill ---- */
  .visa-tag-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; border-radius: 999px; font-family: "JetBrains Mono", ui-monospace, monospace; }
  .visa-tag-pill-dot { width: 5px; height: 5px; border-radius: 50%; }
  .visa-tag-pill.principal { color: var(--primary); background: rgba(240,180,41,0.13); border: 1px solid rgba(240,180,41,0.33); }
  .visa-tag-pill.principal .visa-tag-pill-dot { background: var(--primary); }
  .visa-tag-pill.neutral { color: rgba(255,255,255,0.82); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); }
  .visa-tag-pill.neutral .visa-tag-pill-dot { background: rgba(255,255,255,0.6); }
  .visa-tag-pill.revoked { color: rgb(252, 165, 165); background: rgba(239,68,68,0.16); border: 1px solid rgba(239,68,68,0.40); }
  .visa-tag-pill.revoked .visa-tag-pill-dot { background: rgb(252, 165, 165); }
  /* ---- inactive card variant ---- */
  .visa-card.is-inactive { opacity: 0.72; }
  .visa-card.is-inactive .visa-illo-tile { color: rgba(255,255,255,0.45); }
  .visa-card.is-inactive:hover { opacity: 1; border-color: rgba(239,68,68,0.30); }
  .visa-card.is-inactive:hover .visa-illo-tile { background: rgba(239,68,68,0.08); }
  .visa-chip-inactive { color: rgba(239,68,68,0.85); }
  .visa-chip-inactive.active { background: rgba(239,68,68,0.85); color: var(--canvas); border-color: rgba(239,68,68,0.85); }
  /* ---- arrow button on card ---- */
  .visa-arrow-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 999px; color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: all 200ms ease; flex-shrink: 0; }
  .visa-card:hover .visa-arrow-btn { background: var(--primary); color: var(--canvas); border-color: var(--primary); }
  /* ---- visa modal ---- */
  .visa-modal-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; padding: 24px; }
  .visa-modal-backdrop.is-open { display: flex; animation: visa-fade-in 200ms ease; }
  .visa-modal-dialog { position: relative; width: 100%; max-width: 620px; background: var(--canvas); border: 1px solid rgba(240,180,41,0.33); border-radius: 20px; padding: 40px 44px 36px; color: var(--on-dark); max-height: 85vh; overflow-y: auto; animation: visa-slide-up 280ms cubic-bezier(0.2, 0.8, 0.2, 1); }
  .visa-modal-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.6); border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .visa-modal-close:hover { background: rgba(255,255,255,0.06); color: var(--on-dark); }
  .visa-modal-header { display: flex; gap: 20px; align-items: center; margin-bottom: 24px; }
  .visa-modal-illo { width: 84px; height: 84px; display: flex; align-items: center; justify-content: center; background: rgba(240,180,41,0.15); border: 1px solid rgba(240,180,41,0.33); border-radius: 16px; color: var(--primary); flex-shrink: 0; }
  .visa-modal-illo svg { width: 70%; height: 70%; }
  .visa-modal-head-info { flex: 1; min-width: 0; }
  .visa-modal-title { margin: 10px 0 0; font-size: 24px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.2; color: var(--on-dark); }
  .visa-modal-summary { margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.7); }
  .visa-modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
  .visa-modal-cell { padding: 16px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; }
  .visa-modal-cell-label { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.45); font-family: "JetBrains Mono", ui-monospace, monospace; margin-bottom: 8px; }
  .visa-modal-cell-value { font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.85); }
  .visa-modal-cell-value.accent { color: var(--primary); font-weight: 500; }
  .visa-modal-official { padding: 18px 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin-bottom: 24px; }
  .visa-modal-official-text { font-size: 13.5px; line-height: 1.55; color: rgba(255,255,255,0.75); font-family: "JetBrains Mono", ui-monospace, monospace; }
  .visa-modal-section { margin-bottom: 22px; }
  .visa-modal-notes { margin-bottom: 22px; padding: 14px 16px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.55; }
  .visa-modal-cta-row { display: flex; gap: 10px; }
  .visa-cta-primary { flex: 1; padding: 14px 20px; background: var(--primary); color: var(--canvas); border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; letter-spacing: -0.01em; text-decoration: none; text-align: center; transition: filter 150ms ease; }
  .visa-cta-primary:hover { filter: brightness(1.06); }
  .visa-cta-secondary { padding: 14px 20px; background: transparent; color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; text-align: center; transition: background 150ms ease; }
  .visa-cta-secondary:hover { background: rgba(255,255,255,0.04); }
  /* ---- shared step/right components used in modal ---- */
  .visa-section-title { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin: 0 0 var(--s-md); font-family: "JetBrains Mono", ui-monospace, monospace; }
  .visa-field { display: flex; flex-direction: column; gap: 2px; margin-bottom: var(--s-md); }
  .visa-field-label { font-size: 12px; color: var(--muted); font-weight: 500; }
  .visa-field-value { font-size: 14px; color: var(--body-strong); font-weight: 600; }
  .visa-field-value.mono { font-family: "JetBrains Mono", ui-monospace, monospace; color: var(--primary); font-size: 16px; }
  .step-list { display: flex; flex-direction: column; gap: var(--s-sm); }
  .step-item { display: grid; grid-template-columns: 28px 1fr; gap: var(--s-sm); align-items: start; }
  .step-n { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: grid; place-items: center; font-size: 11px; font-weight: 700; color: var(--muted); font-family: "JetBrains Mono", ui-monospace, monospace; flex-shrink: 0; }
  .step-text { font-size: 13px; color: var(--body); line-height: 1.5; padding-top: 3px; }
  .rights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-sm); }
  .right-item { display: flex; align-items: center; gap: var(--s-xs); font-size: 13px; color: var(--body); }
  .right-icon { font-size: 14px; width: 16px; text-align: center; }
  .right-icon.yes { color: var(--accent-emerald); }
  .right-icon.no { color: var(--muted-soft); }
  /* ---- animations ---- */
  @keyframes visa-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes visa-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) {
    .visa-card, .visa-card:hover, .visa-arrow-btn, .visa-illo-tile, .visa-modal-backdrop, .visa-modal-dialog { transition: none !important; animation: none !important; transform: none !important; }
  }
  /* ---- responsive: visa stack ---- */
  @media (max-width: 600px) {
    .visa-section-h1 { font-size: 40px; }
    .visa-modal-dialog { padding: 32px 24px 28px; }
    .visa-modal-info-grid { grid-template-columns: 1fr; }
    .visa-modal-header { gap: 14px; }
    .visa-modal-illo { width: 64px; height: 64px; }
    .rights-grid { grid-template-columns: 1fr; }
  }
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
    ? sorted.map(v => renderVisaCard(v)).join('')
    : `<div style="padding:var(--s-xxl);text-align:center;color:var(--muted);">Vistos em levantamento para este ciclo.</div>`
  const visaFiltersHtml = sorted.length > 0 ? renderVisaFilterChips(sorted) : ''
  const visaTemplatesHtml = sorted.length > 0 ? renderVisaTemplates(sorted, config) : ''
  const visaModalShell = sorted.length > 0 ? renderVisaModalShell() : ''

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
      <a class="nav-link" href="guia-pratico.html">Guia Prático</a>
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
      <a href="guia-pratico.html">Guia Prático</a>
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
        <div class="visa-eyebrow"><span class="visa-eyebrow-dot"></span>${visaCount} tipo${visaCount !== 1 ? 's' : ''} de visto monitorado${visaCount !== 1 ? 's' : ''}</div>
        <h2 class="visa-section-h1">Opções de visto<br/><span class="visa-section-h1-soft">de trabalho</span></h2>
        <p class="visa-section-lede">Escolha o tipo de visto adequado ao seu caso. Cada categoria é monitorada mensalmente para acompanhar prazos, requisitos e atualizações legais.</p>
        ${visaFiltersHtml}
        <div class="visa-grid">
          ${visaCardsHtml}
        </div>
        ${visaTemplatesHtml}
        ${visaModalShell}
      </div>
    </section>
  </div>

  ${renderBrasileirosTab(data, config)}
  ${renderRequisitosTab(data, config)}
  ${renderMudancasTab(data)}
  ${renderFontesTab(data, config.verificationUrls)}
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
          <li><a href="https://github.com/Vitorcode1/rota-legal-monitor" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href="https://github.com/Vitorcode1/rota-legal-monitor/tree/master/data/current" target="_blank" rel="noopener noreferrer">JSON direto</a></li>
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
  function activateTab(name, scroll) {
    const btn = document.querySelector('.tab-btn[data-tab="' + name + '"]')
    const panel = document.getElementById(name)
    if (!btn || !panel) return false
    tabBtns.forEach(b => b.classList.remove('active'))
    tabPanels.forEach(p => p.classList.remove('active'))
    btn.classList.add('active')
    panel.classList.add('active')
    if (scroll) document.getElementById('sticky').scrollIntoView({ behavior: 'smooth', block: 'start' })
    return true
  }
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab, true)
      history.replaceState(null, '', '#' + btn.dataset.tab)
    })
  })
  if (location.hash) {
    const name = location.hash.slice(1)
    if (activateTab(name, false)) {
      setTimeout(() => document.getElementById('sticky')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    }
  }

  // ---- Visa filter chips + modal ----
  ;(function () {
    const grid = document.querySelector('.visa-grid')
    const modal = document.getElementById('visa-modal')
    if (!grid || !modal) return
    const chips = document.querySelectorAll('.visa-chip')
    const modalBody = document.getElementById('visa-modal-body')
    const closeBtn = modal.querySelector('.visa-modal-close')
    let lastFocus = null

    function openModal(visaId) {
      const tpl = document.getElementById('visa-detail-' + visaId)
      if (!tpl || !modalBody) return
      lastFocus = document.activeElement
      modalBody.innerHTML = ''
      modalBody.appendChild(tpl.content.cloneNode(true))
      modal.classList.add('is-open')
      modal.setAttribute('aria-hidden', 'false')
      document.body.style.overflow = 'hidden'
      setTimeout(() => closeBtn && closeBtn.focus(), 50)
    }
    function closeModal() {
      modal.classList.remove('is-open')
      modal.setAttribute('aria-hidden', 'true')
      document.body.style.overflow = ''
      if (lastFocus && lastFocus.focus) lastFocus.focus()
    }

    grid.querySelectorAll('.visa-card').forEach(card => {
      card.addEventListener('click', () => openModal(card.dataset.visaId))
    })

    function applyFilter(tag) {
      grid.querySelectorAll('.visa-card').forEach(card => {
        const isActive = card.dataset.visaActive !== 'false'
        let visible
        if (tag === 'all') visible = isActive
        else if (tag === 'inativos') visible = !isActive
        else visible = isActive && card.dataset.visaTag === tag
        card.hidden = !visible
      })
    }
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'))
        chip.classList.add('active')
        applyFilter(chip.dataset.tag)
      })
    })
    applyFilter('all')

    if (closeBtn) closeBtn.addEventListener('click', closeModal)
    modal.addEventListener('click', e => { if (e.target === modal) closeModal() })
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal()
    })

    // "Saber mais" CTA: troca para a aba Fontes
    modal.addEventListener('click', e => {
      const t = e.target.closest('[data-visa-cta="fontes"]')
      if (!t) return
      e.preventDefault()
      closeModal()
      if (typeof activateTab === 'function') {
        activateTab('fontes', true)
        history.replaceState(null, '', '#fontes')
      }
    })
  })()
</script>
<script src="assets/nav.js" defer></script>
</body>
</html>`
}
