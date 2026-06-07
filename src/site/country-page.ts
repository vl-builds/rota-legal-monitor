import type { CountryData, PathInfo, VisaType } from '@/extractors/schema'
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
  const periods: Record<string, string> = { monthly: '/mês', yearly: '/ano', 'one-time': '', total: ' no total' }
  return formatted + (periods[period] ?? '')
}

// Prefere a prosa rica (summary); cai para "após N anos" quando ha prazo; senao "disponível".
function pathLabel(path: PathInfo): string {
  if (path.summary) return path.summary
  if (path.yearsRequired != null) return `após ${path.yearsRequired} anos`
  return 'disponível'
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

function renderVisaCard(visa: VisaType, code?: string): string {
  const tag = getVisaTag(visa)
  const illoKey = pickIllustrationKey(visa)
  const description = truncateForCard(visa.description)
  const inactive = isRevokedVisa(visa)
  const pageLink = code ? `vistos/${code}-${esc(visa.id)}.html` : null
  return `
        <div class="visa-card-wrap" data-visa-tag="${esc(tagSlug(tag))}" data-visa-active="${inactive ? 'false' : 'true'}">
          <button type="button" class="visa-card${inactive ? ' is-inactive' : ''}" data-visa-id="${esc(visa.id)}">
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
          </button>
          ${pageLink ? `<a class="visa-card-page-link" href="${pageLink}" tabindex="0">Página completa →</a>` : ''}
        </div>`
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

function renderVisaDetail(visa: VisaType, config: CountryPageConfig): string {
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
      ? { ok: true, label: `Residência permanente: ${pathLabel(visa.rights.pathToResidency)}` }
      : null,
    visa.rights.pathToCitizenship
      ? { ok: true, label: `Cidadania: ${pathLabel(visa.rights.pathToCitizenship)}` }
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
          <a class="visa-cta-primary" href="vistos/${esc(config.code)}-${esc(visa.id)}.html">Ver página completa</a>
          <a class="visa-cta-secondary" href="#fontes" data-visa-cta="fontes">Fontes</a>
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

  type Tone = 'ok' | 'bad' | 'warn' | 'info' | 'neut'
  interface DocRow {
    label: string
    verdict: string
    long?: boolean
    tone: Tone
    prose: string
  }

  const rows: DocRow[] = []

  rows.push({
    label: br.schengenVisaFree ? 'Schengen — entrada sem visto' : 'Entrada sem visto',
    verdict: br.schengenVisaFree ? 'Sim' : 'Não',
    tone: br.schengenVisaFree ? 'ok' : 'bad',
    prose: br.schengenVisaFree
      ? `O passaporte brasileiro permite entrada em ${esc(config.displayName)} por até ${br.maxStayDaysAsTourist} dias em qualquer período de 180 dias, sem visto de turista.`
      : `${esc(config.displayName)} não é parte do Espaço Schengen. Brasileiros precisam de visto de turista separado.`,
  })

  rows.push({
    label: 'Trabalhar sem autorização',
    verdict: br.workPermitNeeded ? 'Não permitido' : 'Permitido',
    tone: br.workPermitNeeded ? 'bad' : 'ok',
    prose: br.workPermitNeeded
      ? 'Mesmo com entrada livre, trabalhar sem autorização de trabalho é ilegal. Você precisa de um dos vistos listados na aba Vistos.'
      : `Brasileiros podem trabalhar sem autorização especial de trabalho em ${esc(config.displayName)}.`,
  })

  rows.push({
    label: 'Permanência máxima como turista',
    verdict: `${br.maxStayDaysAsTourist} dias`,
    tone: 'warn',
    prose:
      'Em cada período de 180 dias. Este período pode ser usado para buscar emprego presencialmente antes de obter o visto de trabalho, sem remuneração.',
  })

  if (br.specialAgreements.length > 0) {
    br.specialAgreements.forEach((a, idx) => {
      rows.push({
        label: a.name,
        verdict: a.fullName,
        long: true,
        tone: idx === 0 && a.appliesToWork ? 'info' : 'neut',
        prose: a.benefits.length > 0 ? a.benefits.map(esc).join('. ') + '.' : esc(a.fullName),
      })
    })
  } else {
    rows.push({
      label: 'Acordos bilaterais com o Brasil',
      verdict: 'Nenhum',
      tone: 'neut',
      prose: `Não existe acordo bilateral de Working Holiday ou reconhecimento automático de diplomas entre Brasil e ${esc(config.displayName)}. O caminho é pelos vistos padrão.`,
    })
  }

  const pad = (n: number): string => String(n).padStart(2, '0')

  const rowsHtml = rows
    .map((r, i) => {
      const verdictClass = r.long ? 'docrow-verdict-text long' : 'docrow-verdict-text'
      const dotClass = r.long ? 'docrow-dot long' : 'docrow-dot'
      return `
          <div class="docrow">
            <div class="docrow-index">${pad(i + 1)}</div>
            <div class="docrow-label">${esc(r.label)}</div>
            <div class="docrow-verdict">
              <span class="${dotClass}" data-tone="${r.tone}"></span>
              <span class="${verdictClass}">${esc(r.verdict)}</span>
            </div>
            <p class="docrow-prose">${r.prose}</p>
          </div>`
    })
    .join('')

  const obsHtml = br.notes
    ? `
        <div class="docrow-obs">
          <span class="docrow-obs-label">Observações</span>
          <p class="docrow-obs-text">${esc(br.notes)}</p>
        </div>`
    : ''

  return `
  <div class="tab-panel" id="brasileiros">
    <section class="section-brasileiros">
      <div class="container">
        <div class="docrow-eyebrow">Condições específicas para brasileiros</div>
        <h2 class="docrow-title">O que muda para você</h2>
        <div class="docrows">
          ${rowsHtml}
        </div>
        ${obsHtml}
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

  type Tone = 'ok' | 'bad' | 'warn' | 'info' | 'neut'
  interface DocRow {
    label: string
    verdict: string
    long?: boolean
    tone: Tone
    prose: string
  }

  const rows: DocRow[] = []

  rows.push({
    label: 'Passaporte',
    verdict: esc(req.passportValidity),
    long: req.passportValidity.length > 18,
    tone: 'ok',
    prose: `Verifique a validade do seu passaporte antes de iniciar qualquer pedido de visto para ${esc(config.displayName)}. Renovação no Brasil leva em média 6 a 10 dias úteis.`,
  })

  if (req.proofOfFunds) {
    rows.push({
      label: 'Comprovante de fundos',
      verdict: fmtMoney(req.proofOfFunds.amount, req.proofOfFunds.currency, req.proofOfFunds.period),
      tone: 'warn',
      prose: req.proofOfFunds.notes
        ? esc(req.proofOfFunds.notes)
        : 'Valor mínimo aplicado de forma transversal aos vistos de trabalho. Cada categoria pode exigir patamares maiores: confira na aba Vistos.',
    })
  }

  if (req.healthInsurance.required) {
    const cov = req.healthInsurance.minimumCoverage
      ? `Cobertura mín. ${fmtMoney(req.healthInsurance.minimumCoverage.amount, req.healthInsurance.minimumCoverage.currency)}`
      : 'Obrigatório'
    rows.push({
      label: 'Seguro saúde',
      verdict: cov,
      long: cov.length > 18,
      tone: 'warn',
      prose: `${esc(req.healthInsurance.notes)}${req.healthInsurance.mustBeLocal ? ' Seguro local exigido após a chegada.' : ''}`,
    })
  }

  if (req.cleanCriminalRecord) {
    rows.push({
      label: 'Antecedentes criminais',
      verdict: 'Certidão apostilada',
      long: true,
      tone: 'info',
      prose:
        'Certidão de antecedentes criminais expedida pela Polícia Federal, com Apostila de Haia. Validade típica entre 90 dias e 6 meses, conforme o consulado.',
    })
  }

  if (req.vaccinations.length > 0) {
    rows.push({
      label: 'Vacinações',
      verdict: `Exigida: ${req.vaccinations.map(esc).join(', ')}`,
      long: true,
      tone: 'info',
      prose:
        'Mantenha a caderneta internacional de vacinação atualizada. Algumas vacinas exigem comprovante traduzido juramentado.',
    })
  }

  const pad = (n: number): string => String(n).padStart(2, '0')

  const rowsHtml = rows
    .map((r, i) => {
      const verdictClass = r.long ? 'docrow-verdict-text long' : 'docrow-verdict-text'
      const dotClass = r.long ? 'docrow-dot long' : 'docrow-dot'
      return `
          <div class="docrow">
            <div class="docrow-index">${pad(i + 1)}</div>
            <div class="docrow-label">${esc(r.label)}</div>
            <div class="docrow-verdict">
              <span class="${dotClass}" data-tone="${r.tone}"></span>
              <span class="${verdictClass}">${r.verdict}</span>
            </div>
            <p class="docrow-prose">${r.prose}</p>
          </div>`
    })
    .join('')

  return `
  <div class="tab-panel" id="requisitos">
    <section class="section-brasileiros">
      <div class="container">
        <div class="docrow-eyebrow">Válidos para todos os vistos de trabalho</div>
        <h2 class="docrow-title">Requisitos gerais</h2>
        <div class="docrows">
          ${rowsHtml}
        </div>
        <div class="docrow-obs">
          <span class="docrow-obs-label">Fontes & atualização</span>
          <p class="docrow-obs-text">Requisitos extraídos de <span style="color:var(--primary);">${sourceHostnames}</span> em ${updated}. Requisitos específicos de cada visto estão na aba Vistos. Sempre confirme na fonte oficial antes de iniciar.</p>
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

function deriveStepTitle(description: string, order: number): string {
  if (!description) return `Etapa ${order}`
  const splitMarkers = [' — ', ' - ', '. ', ', ', ' (']
  let head = description
  for (const m of splitMarkers) {
    const idx = head.indexOf(m)
    if (idx > 12 && idx < 70) {
      head = head.slice(0, idx)
      break
    }
  }
  if (head.length > 60) {
    const cut = head.slice(0, 57)
    const lastSpace = cut.lastIndexOf(' ')
    head = (lastSpace > 30 ? cut.slice(0, lastSpace) : cut) + '...'
  }
  return head.trim() || `Etapa ${order}`
}

type SkillObjective = {
  id: string
  title: string
  summary: string
  detail: string
  link?: string
  tip?: string
  tags?: string[]
}

type SkillPhase = {
  number: number
  title: string
  duration: string
  xp: number
  objectives: SkillObjective[]
}

function buildSkillPhases(data: CountryData, config: CountryPageConfig): SkillPhase[] {
  const req = data.generalRequirements
  const firstVisa = sortVisas(data.visaTypes)[0]
  const phases: SkillPhase[] = []

  // FASE 01 - Documentação essencial
  const p1: SkillObjective[] = []
  p1.push({
    id: 'p1-passport',
    title: 'Passaporte válido',
    summary: `Validade mínima: ${req.passportValidity}.`,
    detail:
      'Verifique com antecedência: renovação no Brasil pode levar várias semanas. Confirme também páginas em branco suficientes para vistos.',
    tip: 'Renovação online via Polícia Federal é mais rápida.',
    tags: ['Obrigatório', 'Brasil'],
  })
  if (req.cleanCriminalRecord) {
    p1.push({
      id: 'p1-criminal',
      title: 'Certidão de antecedentes criminais',
      summary: 'Emitida pela Polícia Federal, apostilada pela Convenção de Haia.',
      detail:
        'Solicite com pelo menos 30 dias de antecedência. A apostila de Haia é feita em cartório autorizado e tem custo separado.',
      tip: 'Validade típica de 90 dias após emissão.',
      tags: ['Obrigatório', 'Apostila Haia'],
    })
  }
  if (req.healthInsurance.required) {
    const ins = req.healthInsurance
    p1.push({
      id: 'p1-insurance',
      title: 'Seguro saúde internacional',
      summary: ins.notes
        ? ins.notes.length > 120
          ? ins.notes.slice(0, 117) + '...'
          : ins.notes
        : 'Seguro saúde obrigatório para o período do visto.',
      detail: ins.notes || 'Cobertura mínima exigida na candidatura ao visto. Após regularização, possível acesso ao sistema público local.',
      tip: 'Compare seguros com cobertura Schengen completa quando aplicável.',
      tags: ['Obrigatório', 'Visto D'],
    })
  }
  if (req.proofOfFunds) {
    const m = req.proofOfFunds
    p1.push({
      id: 'p1-funds',
      title: 'Comprovante de fundos',
      summary: `Mínimo ${fmtMoney(m.amount, m.currency, m.period)}.`,
      detail: m.notes || 'Demonstre meios financeiros suficientes para sua estadia. Geralmente equivalente ao salário mínimo local multiplicado pelos meses de permanência.',
      tip: 'Extratos dos últimos 3 meses + saldo atual costumam ser exigidos.',
      tags: ['Financeiro'],
    })
  }
  p1.push({
    id: 'p1-address',
    title: 'Comprovante de morada',
    summary: 'Contrato de arrendamento ou termo de responsabilidade.',
    detail: `No país de destino, o comprovante deve estar em seu nome ou ter um termo de responsabilidade emitido por residente legal.`,
    tip: 'Reservas de hospedagem por 3+ meses costumam ser aceitas.',
    tags: ['No destino'],
  })
  phases.push({
    number: 1,
    title: 'Documentação Essencial',
    duration: '2-4 semanas',
    xp: 800,
    objectives: p1,
  })

  // FASE 02 - Processo do visto
  const p2: SkillObjective[] = []
  const visaCount = data.visaTypes.length
  p2.push({
    id: 'p2-choose',
    title: 'Escolher o tipo de visto',
    summary: `${visaCount} tipos de visto monitorados em ${config.displayName}.`,
    detail: firstVisa
      ? `${firstVisa.name} é uma das opções mais relevantes para brasileiros. Cada tipo tem requisitos específicos. Consulte a aba Vistos para o panorama completo.`
      : 'Cada tipo de visto tem requisitos específicos. Consulte a aba Vistos para o panorama completo.',
    tip: 'Confira a aba Vistos para ver todos os tipos lado a lado.',
    tags: [`${visaCount} tipos`],
  })
  if (firstVisa && firstVisa.process.steps.length > 0) {
    for (const s of firstVisa.process.steps.slice(0, 4)) {
      const obj: SkillObjective = {
        id: `p2-step-${s.order}`,
        title: s.name || deriveStepTitle(s.description, s.order),
        summary: s.description.length > 140 ? s.description.slice(0, 137) + '...' : s.description,
        detail: s.description,
        tags: s.estimatedDays ? [`~${s.estimatedDays} dias`] : [],
      }
      if (s.estimatedDays) obj.tip = `Prazo estimado: ${s.estimatedDays} dias.`
      p2.push(obj)
    }
  } else {
    p2.push({
      id: 'p2-consult',
      title: 'Consultar fontes oficiais',
      summary: 'O passo a passo detalhado está nas fontes listadas na aba Fontes.',
      detail: 'As etapas exatas variam por tipo de visto. As URLs oficiais na aba Fontes têm as instruções completas e atualizadas.',
      tags: ['Fontes oficiais'],
    })
  }
  phases.push({
    number: 2,
    title: 'Processo do Visto',
    duration: firstVisa?.process.estimatedDuration || '30-90 dias',
    xp: 1000,
    objectives: p2,
  })

  // FASE 03 - Chegada e regularização
  const p3: SkillObjective[] = [
    {
      id: 'p3-arrival',
      title: 'Chegada ao país',
      summary: 'Apresente-se na fronteira com seu visto válido e documentação completa.',
      detail: 'No controle de fronteira, tenha em mãos passaporte, visto, comprovante de hospedagem e comprovante de fundos. Em países Schengen, o carimbo de entrada autoriza permanência no espaço.',
      tip: 'Tire foto de todos os documentos antes de embarcar.',
      tags: ['Fronteira'],
    },
    {
      id: 'p3-register',
      title: 'Registro local de residência',
      summary: `Maioria dos países exige registro municipal ou de imigração após chegada.`,
      detail: `Em ${config.displayName}, há um prazo para se registrar nas autoridades locais (imigração, prefeitura ou equivalente). Esse registro é o que oficializa sua residência legal.`,
      tip: 'Agende a entrevista o quanto antes: as filas podem ser longas.',
      tags: ['Pós-chegada'],
    },
    {
      id: 'p3-permit',
      title: 'Título / cartão de residência',
      summary: 'Documento físico que comprova sua estadia legal.',
      detail: 'Renovável conforme as regras do país. Após alguns anos de residência legal contínua, é geralmente possível solicitar residência permanente ou cidadania.',
      tip: 'Cidadania local em país da UE = passaporte da União Europeia.',
      tags: ['Recompensa final'],
    },
  ]
  phases.push({
    number: 3,
    title: 'Chegada e Regularização',
    duration: '30-90 dias',
    xp: 600,
    objectives: p3,
  })

  const visaPageUrl = firstVisa ? `vistos/${config.code}-${firstVisa.id}.html` : null
  for (const phase of phases) {
    for (const o of phase.objectives) {
      if (o.id.startsWith('p1-')) o.link = '#requisitos'
      else if (o.id === 'p2-choose') o.link = '#vistos'
      else if (o.id === 'p2-consult') o.link = '#fontes'
      else if (o.id.startsWith('p2-step-')) o.link = visaPageUrl || '#vistos'
      else if (o.id.startsWith('p3-')) o.link = '#brasileiros'
    }
  }

  return phases
}

function renderSkillTreeSVG(phases: SkillPhase[]): { svg: string; totalHeight: number; totalNodes: number } {
  const trunkX = 80
  const nodeX = 230
  const stepY = 134
  const r = 26
  const viewWidth = 760

  const phaseHeights = phases.map(p => 110 + p.objectives.length * stepY + 40)
  const yOffsets: number[] = []
  phaseHeights.forEach((h, i) => {
    yOffsets.push(i === 0 ? 80 : (yOffsets[i - 1] as number) + (phaseHeights[i - 1] as number))
  })
  const totalHeight = (yOffsets[yOffsets.length - 1] as number) + (phaseHeights[phaseHeights.length - 1] as number) + 40
  const totalNodes = phases.reduce((acc, p) => acc + p.objectives.length, 0)

  // global index across all phases for data-prev
  let globalIdx = -1
  const phaseGroups = phases
    .map((phase, phaseI) => {
      const baseY = yOffsets[phaseI] as number
      const phaseLabelY = baseY + 30
      const objs = phase.objectives.map((o, i) => ({
        ...o,
        idx: i + 1,
        x: nodeX,
        y: baseY + 110 + i * stepY,
      }))
      const lastY = (objs[objs.length - 1] as (typeof objs)[number]).y

      const trunkLine = `<line x1="${trunkX}" y1="${baseY}" x2="${trunkX}" y2="${lastY + 20}" stroke="rgba(245,180,37,0.2)" stroke-width="2" stroke-dasharray="3 5"/>`

      const phaseDiamond = `
        <g transform="translate(${trunkX}, ${phaseLabelY})" data-phase="${phase.number}">
          <polygon points="0,-22 22,0 0,22 -22,0" fill="#0a0a0d" stroke="#f5b425" stroke-width="1.8" class="st-phase-outer"/>
          <polygon points="0,-12 12,0 0,12 -12,0" fill="rgba(245,180,37,0.13)" class="st-phase-inner"/>
          <text text-anchor="middle" y="4" fill="#f5b425" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace" class="st-phase-num">${String(phase.number).padStart(2, '0')}</text>
        </g>
        <foreignObject x="${trunkX + 36}" y="${phaseLabelY - 24}" width="200" height="60">
          <div xmlns="http://www.w3.org/1999/xhtml" class="st-phase-label" data-phase="${phase.number}">
            <div class="st-phase-tag">FASE ${String(phase.number).padStart(2, '0')}</div>
            <div class="st-phase-title">${esc(phase.title)}</div>
            <div class="st-phase-meta">+${phase.xp} XP &middot; ${esc(phase.duration)}</div>
          </div>
        </foreignObject>`

      const nodesAndConnectors = objs
        .map((o, i) => {
          globalIdx++
          const prev = i > 0 ? (objs[i - 1] as (typeof objs)[number]) : null
          const prevId = prev ? prev.id : ''
          const stub = `<path d="M ${trunkX} ${o.y} Q ${(trunkX + o.x) / 2} ${o.y}, ${o.x - 28} ${o.y}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" class="st-stub" data-for="${o.id}"/>`
          const vertical = prev
            ? `<line x1="${prev.x}" y1="${prev.y + r}" x2="${o.x}" y2="${o.y - r}" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" stroke-dasharray="3 4" class="st-vert" data-for="${o.id}"/>`
            : ''

          const node = `
        <g class="st-node" data-id="${o.id}" data-prev="${prevId}" data-phase="${phase.number}" data-idx="${o.idx}" data-globalidx="${globalIdx}" role="button" tabindex="0" aria-label="${esc(o.title)}">
          <circle cx="${o.x}" cy="${o.y}" r="${r + 8}" fill="#f5b425" opacity="0" class="st-glow"/>
          <circle cx="${o.x}" cy="${o.y}" r="${r}" fill="#0a0a0d" stroke="#3a3a42" stroke-width="1.5" class="st-ring"/>
          <circle cx="${o.x}" cy="${o.y}" r="${r - 6}" fill="transparent" class="st-fill"/>
          <g class="st-icon-lock" transform="translate(${o.x - 6}, ${o.y - 7})" stroke="#6c6c75" stroke-width="1.5" fill="none">
            <rect x="0" y="5" width="12" height="9" rx="1"/>
            <path d="M2.5 5V3a3.5 3.5 0 0 1 7 0v2"/>
          </g>
          <text class="st-icon-num" x="${o.x}" y="${o.y + 4}" text-anchor="middle" fill="#f5b425" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">${o.idx}</text>
          <g class="st-icon-check" transform="translate(${o.x - 7}, ${o.y - 7})" stroke="#4ade80" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="0 7 5 12 14 3"/>
          </g>
        </g>
        <foreignObject x="${o.x + 38}" y="${o.y - 50}" width="380" height="120" style="pointer-events:none;">
          <div xmlns="http://www.w3.org/1999/xhtml" class="st-node-label" data-for="${o.id}">
            <div class="st-node-title">${esc(o.title)}</div>
            ${o.summary ? `<div class="st-node-desc">${esc(o.summary)}</div>` : ''}
            ${(o.tags || []).length > 0 ? `<div class="st-node-tags">${(o.tags || []).slice(0, 2).map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
            <div class="st-node-actions">
              <button type="button" class="st-node-action st-node-toggle" data-toggle="${esc(o.id)}">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="st-node-action-icon-check"><polyline points="20 6 9 17 4 12"/></svg>
                <span class="st-node-action-text">Marcar concluído</span>
              </button>
              ${o.link ? `<a class="st-node-action st-node-link" href="${esc(o.link)}">
                <span>Mais informações</span>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 6 H9 M6 3 L9 6 L6 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>` : ''}
            </div>
          </div>
        </foreignObject>`

          return stub + vertical + node
        })
        .join('')

      return `<g class="st-phase-group" data-phase="${phase.number}">${trunkLine}${phaseDiamond}${nodesAndConnectors}</g>`
    })
    .join('')

  const trophyY = totalHeight - 30
  const trophy = `
    <g class="st-trophy" transform="translate(${trunkX}, ${trophyY})">
      <circle r="20" fill="#0a0a0d" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" stroke-dasharray="3 4" class="st-trophy-ring"/>
      <g transform="translate(-9, -9)" stroke="#6c6c75" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="st-trophy-icon">
        <path d="M3 6H1.5A1.5 1.5 0 0 1 1.5 3H3"/>
        <path d="M15 6h1.5A1.5 1.5 0 0 0 16.5 3H15"/>
        <path d="M2 19h14"/>
        <path d="M9 12.66V14a.97.97 0 0 1-.79 1C7.21 15.6 6 16.86 6 18"/>
        <path d="M9 12.66V14c0 .47.39.86.79 1 1 .51 2.21 1.86 2.21 3"/>
        <path d="M15 2H3v6a4 4 0 0 0 12 0V2Z"/>
      </g>
    </g>
    <foreignObject x="${trunkX + 38}" y="${trophyY - 20}" width="320" height="40">
      <div xmlns="http://www.w3.org/1999/xhtml" class="st-trophy-label">
        <div class="st-trophy-title">Residência permanente / cidadania</div>
        <div class="st-trophy-sub">Recompensa final &middot; Caminho longo prazo</div>
      </div>
    </foreignObject>`

  const svg = `<svg width="100%" viewBox="0 0 ${viewWidth} ${totalHeight}" preserveAspectRatio="xMidYMin meet" style="display:block;">${phaseGroups}${trophy}</svg>`
  return { svg, totalHeight, totalNodes }
}

function renderSkillTreeMobile(phases: SkillPhase[]): string {
  const sections = phases.map(phase => {
    const items = phase.objectives.map((o, i) => {
      const prevId = i > 0 ? (phase.objectives[i - 1] as SkillObjective).id : ''
      const tagsHtml = (o.tags || []).slice(0, 2).map(t => `<span>${esc(t)}</span>`).join('')
      const linkHtml = o.link
        ? `<a class="st-mnode-link" href="${esc(o.link)}">Mais informações <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 6 H9 M6 3 L9 6 L6 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`
        : ''
      return `
          <li class="st-mnode" data-id="${esc(o.id)}" data-prev="${esc(prevId)}" data-phase="${phase.number}">
            <div class="st-mnode-bullet" aria-hidden="true">
              <svg class="st-mnode-lock" width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="10" height="7" rx="1"/><path d="M4 6V4a3 3 0 0 1 6 0v2"/></svg>
              <span class="st-mnode-num">${i + 1}</span>
              <svg class="st-mnode-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="st-mnode-body" data-for="${esc(o.id)}">
              <div class="st-mnode-title">${esc(o.title)}</div>
              ${o.summary ? `<div class="st-mnode-desc">${esc(o.summary)}</div>` : ''}
              ${tagsHtml ? `<div class="st-mnode-tags">${tagsHtml}</div>` : ''}
              <div class="st-mnode-actions">
                <button type="button" class="st-mnode-toggle" data-mtoggle="${esc(o.id)}">
                  <svg class="st-mnode-toggle-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span class="st-mnode-toggle-text">Marcar concluído</span>
                </button>
                ${linkHtml}
              </div>
            </div>
          </li>`
    }).join('')
    return `
        <section class="st-mphase" data-phase="${phase.number}">
          <header class="st-mphase-head">
            <div class="st-mphase-diamond"><span>${String(phase.number).padStart(2, '0')}</span></div>
            <div class="st-mphase-info">
              <div class="st-mphase-tag">FASE ${String(phase.number).padStart(2, '0')}</div>
              <div class="st-mphase-title">${esc(phase.title)}</div>
              <div class="st-mphase-meta">+${phase.xp} XP &middot; ${esc(phase.duration)}</div>
            </div>
          </header>
          <ol class="st-mnodes">${items}
          </ol>
        </section>`
  }).join('')
  return `<div class="st-mobile">${sections}</div>`
}

function renderGuiaTab(data: CountryData, config: CountryPageConfig): string {
  const updated = monthLabel(data.meta.lastUpdated)
  const phases = buildSkillPhases(data, config)
  const { svg, totalNodes } = renderSkillTreeSVG(phases)
  const mobileTree = renderSkillTreeMobile(phases)
  const totalXP = phases.reduce((acc, p) => acc + p.xp, 0)

  const skillDataJson = JSON.stringify(
    phases.map(p => ({
      number: p.number,
      title: p.title,
      objectives: p.objectives.map(o => ({
        id: o.id,
        title: o.title,
        summary: o.summary,
        detail: o.detail,
        tip: o.tip || '',
        tags: o.tags || [],
      })),
    })),
  )

  return `
  <div class="tab-panel" id="guia">
    <section class="section-tight">
      <div class="container">
        <div class="st-root" data-country-code="${esc(config.code)}">
          <div class="st-hero">
            <div class="st-hero-info">
              <div class="st-hero-eyebrow">SKILL TREE &middot; LEGALIZAÇÃO</div>
              <h2 class="st-hero-title">Como se legalizar em <span>${esc(config.displayName)}</span></h2>
              <p class="st-hero-sub">Cada nó é uma habilidade que você desbloqueia. Complete uma para abrir a próxima da árvore.</p>
            </div>
            <div class="st-progress-card">
              <div class="st-progress-label">PROGRESSO GERAL</div>
              <div class="st-progress-row">
                <span class="st-progress-num"><span data-bind="pct">0</span><span class="st-progress-pct">%</span></span>
                <span class="st-progress-counter"><span data-bind="done">0</span>/${totalNodes} skills</span>
              </div>
              <div class="st-progress-bar"><div class="st-progress-fill" data-bind="fill" style="width:0%"></div></div>
              <div class="st-progress-meta">+${totalXP} XP total &middot; ${phases.length} fases</div>
            </div>
          </div>

          <div class="st-main">
            <div class="st-canvas">
              <div class="st-canvas-label">&#9826; JOURNEY TREE &middot; ${totalNodes} NODES</div>
              <div class="st-canvas-svg">${svg}</div>
              ${mobileTree}
            </div>

            <div class="st-sidebar">
              <div class="st-detail" data-bind="detail">
                <div class="st-detail-empty">Clique em qualquer nó da árvore para ver os detalhes da habilidade.</div>
              </div>
              <div class="st-legend">
                <div class="st-legend-title">LEGENDA</div>
                <div class="st-legend-row"><span class="st-legend-dot" style="border-color:#f5b425;background:rgba(245,180,37,0.13);"></span>Disponível para desbloquear</div>
                <div class="st-legend-row"><span class="st-legend-dot" style="border-color:#4ade80;background:rgba(74,222,128,0.13);"></span>Concluído</div>
                <div class="st-legend-row"><span class="st-legend-dot" style="border-color:#3a3a42;background:rgba(58,58,66,0.4);"></span>Bloqueado &mdash; complete o anterior</div>
                <button type="button" class="st-reset" data-bind="reset">Resetar progresso</button>
              </div>
            </div>
          </div>

          <div class="st-disclaimer">// Dados extraídos em ${updated}. Confirme nas fontes oficiais antes de iniciar.</div>
        </div>

        <script type="application/json" data-skill-data>${skillDataJson.replace(/</g, '\\u003c')}</script>
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
  .quick-summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; background: var(--surface-soft); border-bottom: 1px solid var(--hairline); }
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
  .visa-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 16px; }
  .visa-card-wrap { display: flex; flex-direction: column; gap: 0; }
  .visa-card-wrap[hidden] { display: none !important; }
  .visa-card-page-link { display: block; text-align: right; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--muted); text-decoration: none; padding: 5px 6px 0; transition: color 150ms ease; }
  .visa-card-page-link:hover { color: var(--primary); }
  .visa-card { display: flex; flex-direction: column; align-items: flex-start; gap: 20px; padding: 28px 28px 26px; text-align: left; cursor: pointer; border-radius: 16px; background: rgba(255,255,255,0.012); border: 1px solid rgba(255,255,255,0.08); color: inherit; font: inherit; transition: all 200ms ease; transform: translateY(0); width: 100%; font-family: inherit; }
  .visa-card:hover { background: rgba(255,255,255,0.025); border-color: rgba(240,180,41,0.33); transform: translateY(-2px); }
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
  /* ---- para brasileiros (Document Rows) ---- */
  .section-brasileiros {
    --br-ink: #f5f5f0;
    --br-ink-2: rgba(245,245,240,.72);
    --br-ink-3: rgba(245,245,240,.5);
    --br-ink-4: rgba(245,245,240,.32);
    --br-line: rgba(245,245,240,.14);
    --br-card: rgba(255,255,255,.015);
    --br-ok: #34d399;
    --br-bad: #f87171;
    --br-warn: #fbbf24;
    --br-info: #a78bfa;
    --br-neut: #94a3b8;
    padding: 72px 0 96px;
    position: relative;
  }
  .section-brasileiros::before {
    content: "";
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(1200px 600px at 85% 110%, rgba(168,85,247,.06), transparent 60%),
      radial-gradient(900px 500px at 10% -10%, rgba(251,191,36,.04), transparent 60%);
  }
  .section-brasileiros > .container { position: relative; z-index: 1; }
  .docrow-eyebrow {
    font-size: 11px; font-weight: 500; line-height: 1; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--br-ink-3); margin-bottom: 14px;
  }
  .docrow-title {
    font-family: "Geist", "Inter", system-ui, sans-serif;
    font-size: 38px; font-weight: 500; line-height: 1.05; letter-spacing: -0.01em;
    color: var(--br-ink); margin: 0 0 36px;
  }
  .docrows { display: flex; flex-direction: column; border-top: 1px solid var(--br-line); }
  .docrow {
    display: grid;
    grid-template-columns: 56px 1.1fr 1.2fr 2.4fr;
    gap: 32px; padding: 28px 8px;
    border-bottom: 1px solid var(--br-line);
    align-items: start;
    transition: background 250ms ease;
  }
  .docrow:hover { background: var(--br-card); }
  .docrow-index {
    font-family: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; font-weight: 400; line-height: 1; letter-spacing: 0.05em;
    color: var(--br-ink-4); padding-top: 5px;
  }
  .docrow-label {
    font-size: 11px; font-weight: 500; line-height: 1.5; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--br-ink-3); padding-top: 5px;
  }
  .docrow-verdict { display: flex; gap: 10px; align-items: flex-start; }
  .docrow-dot {
    width: 8px; height: 8px; border-radius: 50%;
    margin-top: 9px; flex-shrink: 0;
    box-shadow: 0 0 0 4px rgba(255,255,255,.025);
  }
  .docrow-dot.long { margin-top: 7px; }
  .docrow-dot[data-tone="ok"]   { background: var(--br-ok); }
  .docrow-dot[data-tone="bad"]  { background: var(--br-bad); }
  .docrow-dot[data-tone="warn"] { background: var(--br-warn); }
  .docrow-dot[data-tone="info"] { background: var(--br-info); }
  .docrow-dot[data-tone="neut"] { background: var(--br-neut); }
  .docrow-verdict-text {
    font-size: 22px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em;
    color: var(--br-ink);
  }
  .docrow-verdict-text.long { font-size: 17px; font-weight: 500; line-height: 1.35; letter-spacing: normal; }
  .docrow-prose {
    font-size: 13.5px; line-height: 1.6; color: var(--br-ink-2); margin: 0;
  }
  .docrow-obs {
    display: flex; gap: 18px; align-items: flex-start;
    border: 1px solid var(--br-line); border-radius: 14px;
    padding: 18px 22px; background: var(--br-card); margin-top: 18px;
  }
  .docrow-obs-label {
    min-width: 200px; padding-top: 2px;
    font-size: 11px; font-weight: 500; line-height: 1.5; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--br-ink-3);
  }
  .docrow-obs-text { font-size: 13px; line-height: 1.55; color: var(--br-ink-2); margin: 0; }
  @media (max-width: 1000px) {
    .section-brasileiros { padding: 56px 0 72px; }
    .docrow-title { font-size: 30px; }
    .docrow {
      grid-template-columns: 36px 1fr;
      gap: 12px 16px;
      padding: 22px 4px;
    }
    .docrow-label { padding-top: 7px; }
    .docrow-verdict { grid-column: 1 / -1; }
    .docrow-prose { grid-column: 1 / -1; }
    .docrow-obs { flex-direction: column; gap: 8px; }
    .docrow-obs-label { min-width: 0; }
  }
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
    .quick-summary { grid-template-columns: repeat(3, 1fr); }
    .qs-item:nth-child(3n+1) { border-left: none; }
    .qs-item:nth-child(n+4) { border-top: 1px solid var(--hairline); }
    .visa-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .hero-name { font-size: 28px; }
    .tabs { margin-left: 0; }
    .sticky-inner { flex-wrap: wrap; height: auto; padding: var(--s-sm) 0; gap: var(--s-sm); }
    .sticky-id { padding-top: var(--s-xs); }
    .quick-summary { grid-template-columns: 1fr 1fr; }
    .qs-item:nth-child(2n+1) { border-left: none; }
    .qs-item:nth-child(n+3) { border-top: 1px solid var(--hairline); }
    .timeline-entry { grid-template-columns: 1fr; gap: var(--s-sm); }
    .timeline-date { align-items: flex-start; flex-direction: row; gap: var(--s-sm); }
    .rights-grid { grid-template-columns: 1fr; }
    /* legibilidade mobile: alvo de toque do fechar-modal */
    .visa-modal-close { width: 44px; height: 44px; }
  }

  /* ====================================================== */
  /* SKILL TREE — Guia Prático (variação Path of Exile)     */
  /* ====================================================== */
  .st-root {
    --st-gold: #f5b425;
    --st-green: #4ade80;
    --st-dim: #a0a0a8;
    --st-mute: #6c6c75;
    --st-line: rgba(255,255,255,0.06);
    --st-line-2: rgba(255,255,255,0.14);
    background:
      radial-gradient(1400px 800px at 50% -10%, rgba(245,180,37,0.06), transparent 60%),
      #050507;
    border: 1px solid var(--st-line);
    border-radius: 16px;
    padding: 32px 36px 28px;
    position: relative;
    overflow: hidden;
    color: #f3f3f4;
  }
  .st-root::before {
    content: "";
    position: absolute; inset: 0; pointer-events: none;
    opacity: 0.3;
    background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
    background-size: 24px 24px;
  }

  /* Hero */
  .st-hero { display: flex; align-items: center; gap: 24px; position: relative; z-index: 1; }
  .st-hero-info { flex: 1; min-width: 0; }
  .st-hero-eyebrow {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; letter-spacing: 2px; color: var(--st-gold);
    text-transform: uppercase; margin-bottom: 6px; font-weight: 600;
  }
  .st-hero-title { margin: 0; font-size: 40px; font-weight: 700; letter-spacing: -1px; line-height: 1; color: #fff; }
  .st-hero-title span { color: var(--st-gold); }
  .st-hero-sub { margin: 10px 0 0; font-size: 14px; color: var(--st-dim); max-width: 640px; line-height: 1.55; }

  .st-progress-card {
    min-width: 240px;
    padding: 16px 20px;
    border: 1px solid rgba(245,180,37,0.25);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(245,180,37,0.06), rgba(245,180,37,0.01));
  }
  .st-progress-label {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; letter-spacing: 1.5px; color: var(--st-dim);
    text-transform: uppercase; margin-bottom: 8px;
  }
  .st-progress-row { display: flex; align-items: baseline; gap: 6px; }
  .st-progress-num { font-size: 36px; font-weight: 700; color: var(--st-gold); line-height: 1; }
  .st-progress-pct { font-size: 18px; opacity: 0.7; margin-left: 1px; }
  .st-progress-counter {
    margin-left: auto;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 12px; color: var(--st-mute);
  }
  .st-progress-bar { margin-top: 10px; height: 4px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
  .st-progress-fill {
    height: 100%; width: 0%;
    background: linear-gradient(90deg, var(--st-gold), var(--st-green));
    transition: width 0.4s ease;
  }
  .st-progress-meta {
    margin-top: 10px;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 10px; letter-spacing: 1px; color: var(--st-mute); text-transform: uppercase;
  }

  /* Main grid */
  .st-main {
    margin-top: 28px;
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 20px;
    position: relative;
    z-index: 1;
  }

  /* Canvas */
  .st-canvas {
    background: linear-gradient(180deg, #0c0c10, #08080b);
    border: 1px solid var(--st-line);
    border-radius: 14px;
    padding: 32px 24px 20px;
    position: relative;
    overflow: hidden;
  }
  .st-canvas-label {
    position: absolute; top: 12px; left: 18px;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 10px; letter-spacing: 2px; color: var(--st-mute);
    text-transform: uppercase;
  }

  /* SVG node states */
  .st-node { cursor: pointer; transition: opacity 0.2s; }
  .st-icon-num, .st-icon-check { display: none; }
  .st-node:focus { outline: none; }
  .st-node:focus .st-ring { stroke-width: 2.5; }
  .st-node:hover .st-glow { opacity: 0.2 !important; }
  .st-node.is-unlocked .st-ring { stroke: var(--st-gold); }
  .st-node.is-unlocked .st-fill { fill: rgba(245,180,37,0.08); }
  .st-node.is-unlocked .st-glow { opacity: 0.1; }
  .st-node.is-unlocked .st-icon-lock { display: none; }
  .st-node.is-unlocked .st-icon-num { display: inline; }
  .st-node.is-completed .st-ring { stroke: var(--st-green); }
  .st-node.is-completed .st-fill { fill: rgba(74,222,128,0.15); }
  .st-node.is-completed .st-glow { fill: var(--st-green); opacity: 0.1; }
  .st-node.is-completed .st-icon-lock { display: none; }
  .st-node.is-completed .st-icon-num { display: none; }
  .st-node.is-completed .st-icon-check { display: inline; }
  .st-node.is-selected .st-ring { stroke-width: 2.5; }
  .st-node.is-selected .st-glow { opacity: 0.25 !important; }
  .st-stub.is-unlocked { stroke: rgba(245,180,37,0.3); }
  .st-vert.is-active { stroke: rgba(74,222,128,0.4); stroke-dasharray: 0; }
  .st-phase-group.is-done .st-phase-outer { stroke: var(--st-green); }
  .st-phase-group.is-done .st-phase-inner { fill: rgba(74,222,128,0.13); }
  .st-phase-group.is-done .st-phase-num { fill: var(--st-green); }
  .st-phase-group.is-done .st-phase-label .st-phase-tag { color: var(--st-green); }

  /* Phase labels (in foreignObject) */
  .st-phase-label .st-phase-tag {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; letter-spacing: 1.5px; color: var(--st-gold);
    text-transform: uppercase; font-weight: 600;
  }
  .st-phase-label .st-phase-title { font-size: 16px; font-weight: 700; color: #fff; margin-top: 2px; line-height: 1.15; }
  .st-phase-label .st-phase-meta {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; color: var(--st-mute); margin-top: 4px;
  }

  /* Node labels */
  .st-node-label .st-node-title {
    font-size: 14px; font-weight: 600; color: #fff; line-height: 1.2;
    transition: color 0.15s ease;
  }
  .st-node-label .st-node-desc {
    font-size: 12px; color: var(--st-dim); line-height: 1.4;
    margin-top: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .st-node-label.is-locked .st-node-desc { color: var(--st-mute); }
  .st-node-label .st-node-tags {
    display: flex; gap: 6px; margin-top: 6px;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    flex-wrap: wrap;
  }
  .st-node-label .st-node-tags span {
    padding: 1px 6px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
    font-size: 9px; letter-spacing: 0.5px;
    text-transform: uppercase; color: var(--st-dim);
  }
  .st-node-label.is-locked .st-node-title { color: var(--st-mute); }
  .st-node-label.is-completed .st-node-title { color: var(--st-green); text-decoration: line-through; }

  .st-node-label .st-node-actions {
    display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;
    pointer-events: auto;
  }
  .st-node-label .st-node-action {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 5px;
    font-family: inherit; font-size: 11px; font-weight: 600;
    border: 1px solid var(--st-line-2);
    background: rgba(255,255,255,0.04); color: #f3f3f4;
    text-decoration: none; cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    line-height: 1;
  }
  .st-node-action:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
  .st-node-action .st-node-action-icon-check { display: none; }
  .st-node-toggle { color: var(--st-gold); border-color: rgba(245,180,37,0.35); background: rgba(245,180,37,0.06); }
  .st-node-toggle:hover { background: rgba(245,180,37,0.12); border-color: rgba(245,180,37,0.55); }
  .st-node-label.is-completed .st-node-toggle {
    color: var(--st-green); border-color: rgba(74,222,128,0.45); background: rgba(74,222,128,0.1);
  }
  .st-node-label.is-completed .st-node-toggle .st-node-action-icon-check { display: inline-block; }
  .st-node-label.is-locked .st-node-toggle {
    color: var(--st-mute); border-color: var(--st-line); background: transparent; cursor: not-allowed;
    opacity: 0.55;
  }
  .st-node-label.is-locked .st-node-link {
    opacity: 0.6;
  }

  /* Trophy */
  .st-trophy-label .st-trophy-title { font-size: 13px; font-weight: 600; color: var(--st-dim); }
  .st-trophy-label .st-trophy-sub {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; color: var(--st-mute);
  }
  .st-trophy.is-done .st-trophy-ring { stroke: var(--st-green); stroke-dasharray: 0; }
  .st-trophy.is-done .st-trophy-icon { stroke: var(--st-green); }
  .st-trophy.is-done + foreignObject .st-trophy-title { color: var(--st-green); }

  /* Sidebar */
  .st-sidebar { position: sticky; top: 84px; align-self: start; }
  .st-detail {
    background: linear-gradient(180deg, #0d0d11, #0a0a0d);
    border: 1px solid var(--st-line);
    border-radius: 14px;
    overflow: hidden;
  }
  .st-detail-empty {
    padding: 32px 28px; color: var(--st-mute); font-size: 13px;
    text-align: center; font-style: italic; line-height: 1.55;
  }
  .st-detail-body { padding: 24px 24px 28px; }
  .st-detail-eyebrow {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 10px; letter-spacing: 1.5px; color: var(--st-gold);
    text-transform: uppercase; margin-bottom: 8px;
  }
  .st-detail-title { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: #fff; line-height: 1.2; }
  .st-detail-title.is-completed { color: var(--st-green); }
  .st-detail-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .st-detail-tags span {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 10px; padding: 2px 8px;
    border: 1px solid rgba(245,180,37,0.3); color: var(--st-gold);
    border-radius: 2px; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .st-detail-summary { margin-top: 14px; font-size: 14px; color: #c0c0c8; line-height: 1.6; }
  .st-detail-text { margin-top: 12px; font-size: 13px; color: var(--st-dim); line-height: 1.65; }
  .st-detail-tip {
    margin-top: 14px; padding: 10px 12px;
    background: rgba(245,180,37,0.06);
    border: 1px solid rgba(245,180,37,0.2);
    border-radius: 6px;
    font-size: 12px; color: var(--st-gold);
    display: flex; gap: 8px; align-items: flex-start;
  }
  .st-detail-tip-icon { flex-shrink: 0; margin-top: 1px; }
  .st-detail-actions { margin-top: 16px; display: flex; gap: 8px; }
  .st-detail-btn {
    flex: 1; padding: 8px 12px; border-radius: 6px;
    font-family: inherit; font-size: 12px; font-weight: 600;
    cursor: pointer; border: 1px solid var(--st-line-2);
    background: rgba(255,255,255,0.04); color: #fff;
    transition: all 0.15s ease;
  }
  .st-detail-btn:hover { background: rgba(255,255,255,0.08); }
  .st-detail-btn.is-primary { background: var(--st-gold); border-color: var(--st-gold); color: #0a0a0d; }
  .st-detail-btn.is-primary:hover { background: #ffc741; }
  .st-detail-btn.is-done { background: var(--st-green); border-color: var(--st-green); color: #0a0a0d; }

  .st-legend {
    margin-top: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
  }
  .st-legend-title {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 10px; letter-spacing: 1.5px; color: var(--st-mute);
    text-transform: uppercase; margin-bottom: 10px;
  }
  .st-legend-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; font-size: 12px; color: #c0c0c8; }
  .st-legend-dot { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid; flex-shrink: 0; }
  .st-reset {
    margin-top: 8px; width: 100%; padding: 8px;
    background: transparent; border: 1px solid var(--st-line);
    border-radius: 6px; color: var(--st-mute); cursor: pointer;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;
    transition: all 0.15s ease;
  }
  .st-reset:hover { color: #fff; border-color: var(--st-line-2); }

  .st-disclaimer {
    margin-top: 20px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 8px;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; color: var(--st-mute);
    position: relative; z-index: 1;
  }

  /* Mobile skill tree (vertical HTML list) */
  .st-mobile { display: none; }
  .st-mphase + .st-mphase { margin-top: 28px; }
  .st-mphase-head { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
  .st-mphase-diamond {
    width: 30px; height: 30px;
    border: 1.5px solid var(--st-gold);
    background: rgba(245,180,37,0.13);
    transform: rotate(45deg);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .st-mphase-diamond > span {
    transform: rotate(-45deg);
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 10px; font-weight: 700; color: var(--st-gold);
  }
  .st-mphase.is-done .st-mphase-diamond { border-color: var(--st-green); background: rgba(74,222,128,0.13); }
  .st-mphase.is-done .st-mphase-diamond > span { color: var(--st-green); }
  .st-mphase-tag {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 10px; letter-spacing: 1.5px; color: var(--st-gold);
    text-transform: uppercase; font-weight: 600;
  }
  .st-mphase.is-done .st-mphase-tag { color: var(--st-green); }
  .st-mphase-title { font-size: 17px; font-weight: 700; color: #fff; margin-top: 2px; line-height: 1.2; }
  .st-mphase-meta {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 10px; color: var(--st-mute); margin-top: 3px;
  }
  .st-mnodes { list-style: none; padding: 0; margin: 0; }
  .st-mnode { display: flex; gap: 12px; padding-bottom: 20px; position: relative; }
  .st-mnode:not(:last-child)::before {
    content: "";
    position: absolute;
    left: 13.5px; top: 32px; bottom: 2px;
    width: 1.5px;
    background: rgba(255,255,255,0.06);
    background-image: linear-gradient(to bottom, currentColor 50%, transparent 50%);
    background-size: 1.5px 7px;
    color: rgba(255,255,255,0.12);
  }
  .st-mnode.is-completed:not(:last-child)::before { color: rgba(74,222,128,0.35); }
  .st-mnode-bullet {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1.5px solid #3a3a42;
    background: #0a0a0d;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    position: relative; z-index: 1;
    margin-top: 1px;
  }
  .st-mnode.is-unlocked .st-mnode-bullet { border-color: var(--st-gold); background: rgba(245,180,37,0.08); }
  .st-mnode.is-completed .st-mnode-bullet { border-color: var(--st-green); background: rgba(74,222,128,0.15); }
  .st-mnode-lock, .st-mnode-num, .st-mnode-check { display: none; line-height: 1; }
  .st-mnode-lock { color: var(--st-mute); }
  .st-mnode-num {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; font-weight: 600; color: var(--st-gold);
  }
  .st-mnode-check { color: var(--st-green); }
  .st-mnode .st-mnode-lock { display: inline-block; }
  .st-mnode.is-unlocked .st-mnode-lock { display: none; }
  .st-mnode.is-unlocked .st-mnode-num { display: inline-block; }
  .st-mnode.is-completed .st-mnode-lock,
  .st-mnode.is-completed .st-mnode-num { display: none; }
  .st-mnode.is-completed .st-mnode-check { display: inline-block; }
  .st-mnode-body { flex: 1; min-width: 0; padding-top: 2px; }
  .st-mnode-title { font-size: 14px; font-weight: 600; color: #fff; line-height: 1.25; word-wrap: break-word; }
  .st-mnode.is-locked .st-mnode-title { color: var(--st-mute); }
  .st-mnode.is-completed .st-mnode-title { color: var(--st-green); text-decoration: line-through; }
  .st-mnode-desc { font-size: 12px; color: var(--st-dim); margin-top: 5px; line-height: 1.45; }
  .st-mnode.is-locked .st-mnode-desc { color: var(--st-mute); }
  .st-mnode-tags { display: flex; gap: 6px; margin-top: 7px; flex-wrap: wrap; }
  .st-mnode-tags span {
    padding: 1px 6px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 9px; letter-spacing: 0.5px;
    text-transform: uppercase; color: var(--st-dim);
  }
  .st-mnode-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .st-mnode-toggle, .st-mnode-link {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 11px; border-radius: 5px;
    font-family: inherit; font-size: 12px; font-weight: 600;
    border: 1px solid var(--st-line-2);
    background: rgba(255,255,255,0.04); color: #f3f3f4;
    text-decoration: none; cursor: pointer; line-height: 1;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .st-mnode-toggle { color: var(--st-gold); border-color: rgba(245,180,37,0.35); background: rgba(245,180,37,0.06); }
  .st-mnode-toggle:disabled,
  .st-mnode.is-locked .st-mnode-toggle {
    color: var(--st-mute); border-color: var(--st-line); background: transparent; cursor: not-allowed; opacity: 0.55;
  }
  .st-mnode.is-completed .st-mnode-toggle {
    color: var(--st-green); border-color: rgba(74,222,128,0.45); background: rgba(74,222,128,0.1);
  }
  .st-mnode-toggle-check { display: none; }
  .st-mnode.is-completed .st-mnode-toggle-check { display: inline-block; }
  .st-mnode.is-locked .st-mnode-link { opacity: 0.55; }

  @media (max-width: 1023px) {
    .st-main { grid-template-columns: 1fr; }
    .st-sidebar { position: static; }
    .st-root { padding: 24px 20px 20px; }
    .st-hero { flex-direction: column; align-items: flex-start; gap: 16px; }
    .st-progress-card { width: 100%; min-width: 0; }
  }
  @media (max-width: 767px) {
    .st-canvas-svg { display: none; }
    .st-mobile { display: block; }
    .st-canvas { padding: 36px 14px 16px; }
    .st-sidebar { display: none; }
    .st-disclaimer { margin-top: 14px; }
    /* legibilidade mobile: alvo de toque dos botoes do skill-tree */
    .st-mnode-toggle, .st-mnode-link { min-height: 44px; }
    .st-detail-btn { min-height: 44px; }
  }
  @media (max-width: 640px) {
    .st-hero-title { font-size: 26px; letter-spacing: -0.5px; }
    .st-hero-eyebrow { font-size: 12px; }
    .st-progress-num { font-size: 30px; }
    .st-progress-card { padding: 14px 16px; }
    /* legibilidade mobile: piso de fonte dos micro-labels (10px -> 12px) */
    .st-mphase-tag, .st-mphase-meta, .st-progress-meta,
    .st-detail-eyebrow, .st-legend-title { font-size: 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .st-progress-fill, .st-node, .st-detail-btn { transition: none; }
  }
`

export function generateCountryPage(data: CountryData, config: CountryPageConfig): string {
  const sorted = sortVisas(data.visaTypes)
  const updated = monthLabel(data.meta.lastUpdated)
  const hasSchengen = data.forBrazilians.schengenVisaFree
  const needsPermit = data.forBrazilians.workPermitNeeded
  const visaCount = data.visaTypes.length

  const year = new Date(data.meta.lastUpdated).getUTCFullYear()
  const mw = data.generalRequirements?.minimumWage
  const salaryPart = mw?.amount
    ? `, salário mínimo ${mw.currency} ${Math.round(mw.amount).toLocaleString('pt-BR')}`
    : ''
  const metaDescription = `Guia completo para trabalhar em ${config.displayName}: ${visaCount} tipos de visto monitorados${salaryPart}. Requisitos, taxas e prazos atualizados em ${updated} com fontes oficiais.`
  const pageTitle = `Vistos de Trabalho em ${config.displayName} ${year}: ${visaCount} opções | Rota Legal`

  const visaCardsHtml = sorted.length > 0
    ? sorted.map(v => renderVisaCard(v, config.code)).join('')
    : `<div style="padding:var(--s-xxl);text-align:center;color:var(--muted);">Vistos em levantamento para este ciclo.</div>`
  const visaFiltersHtml = sorted.length > 0 ? renderVisaFilterChips(sorted) : ''
  const visaTemplatesHtml = sorted.length > 0 ? renderVisaTemplates(sorted, config) : ''
  const visaModalShell = sorted.length > 0 ? renderVisaModalShell() : ''

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(metaDescription)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Rota Legal" />
<meta property="og:title" content="${esc(pageTitle)}" />
<meta property="og:description" content="${esc(metaDescription)}" />
<meta property="og:url" content="https://rotalegal.pro/pais-${config.code}.html" />
<meta property="og:image" content="https://rotalegal.pro/assets/og-default.png" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/png" href="favicon.png" />
<link rel="apple-touch-icon" href="favicon.png" />
<link rel="canonical" href="https://rotalegal.pro/pais-${config.code}.html" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" as="style" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
<noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" /></noscript>
<link rel="stylesheet" href="assets/design-system.css" />
<style>${PAGE_CSS}</style>
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `https://rotalegal.pro/pais-${config.code}.html`,
      url: `https://rotalegal.pro/pais-${config.code}.html`,
      name: `${config.displayName} — Rota Legal`,
      description: metaDescription,
      dateModified: data.meta.lastUpdated.slice(0, 10),
      inLanguage: 'pt-BR',
      publisher: { '@type': 'Organization', name: 'Rota Legal', url: 'https://rotalegal.pro' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://rotalegal.pro/' },
        { '@type': 'ListItem', position: 2, name: 'Países', item: 'https://rotalegal.pro/paises.html' },
        { '@type': 'ListItem', position: 3, name: config.displayName },
      ],
    },
  ],
})}</script>
</head>
<body>
<div class="bg-orbs" aria-hidden="true"><div class="orb-3"></div></div>

<!-- NAV -->
<nav class="top-nav">
  <div class="container">
    <a class="logo" href="index.html">
      <img src="assets/images/logonobg.png" alt="Rota Legal" style="height:26px;width:auto;display:block;">
      <span>Rota Legal</span>
    </a>
    <div class="nav-links">
      <a class="nav-link" href="paises.html" style="color:var(--on-dark);">Países</a>
      <a class="nav-link" href="comparar.html">Comparar</a>
      <a class="nav-link" href="guia-pratico.html">Guia Prático</a>
      <a class="nav-link" href="calculadora.html">Calculadora</a>
      <a class="nav-link" href="historico.html">Histórico</a>
      <a class="nav-link" href="parceiros.html">Parceiros</a>
      <a class="nav-link" href="sobre.html">Sobre</a>
    </div>
    <div class="nav-right">
      <a class="btn btn-secondary" href="area-aluno/login.html">Área do Aluno</a>
      <a class="btn btn-primary" href="qual-pais.html">Qual país é o meu?</a>
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
      <a href="index.html">Início</a>
      <a href="paises.html">Países</a>
      <a href="comparar.html">Comparar</a>
      <a href="qual-pais.html">Qual país é meu?</a>
      <a href="guia-pratico.html">Guia Prático</a>
      <a href="calculadora.html">Calculadora</a>
      <a href="historico.html">Histórico</a>
      <a href="parceiros.html">Parceiros</a>
      <a href="sobre.html">Sobre</a>
      <a href="area-aluno/login.html">Área do Aluno</a>
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
    <span class="qs-label">Salário mínimo nacional</span>
    <span class="qs-value accent">${data.generalRequirements.minimumWage ? fmtMoney(data.generalRequirements.minimumWage.amount, data.generalRequirements.minimumWage.currency, data.generalRequirements.minimumWage.period) : '—'}</span>
    <span class="qs-sub">${data.generalRequirements.minimumWage?.notes ? esc(data.generalRequirements.minimumWage.notes).slice(0, 65) + (data.generalRequirements.minimumWage.notes.length > 65 ? '…' : '') : 'Sem mínimo nacional por lei'}</span>
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
        <a class="logo" href="index.html" style="margin-bottom:var(--s-md);display:inline-flex;">
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
          <li><a href="https://github.com/vl-builds/rota-legal-monitor" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href="https://github.com/vl-builds/rota-legal-monitor/tree/master/data/current" target="_blank" rel="noopener noreferrer">JSON direto</a></li>
          <li><a href="historico.html">RSS de mudanças</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Rota Legal · <a href="https://github.com/vl-builds" target="_blank" rel="noopener noreferrer">vl-builds</a> · MIT</span>
      <nav class="footer-legal" aria-label="Links legais">
        <a href="politica-privacidade.html">Privacidade</a>
        <a href="politica-cookies.html">Cookies</a>
        <a href="termos-uso.html">Termos</a>
      </nav>
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

    grid.querySelectorAll('.visa-card').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.visaId))
    })

    function applyFilter(tag) {
      grid.querySelectorAll('.visa-card-wrap').forEach(wrap => {
        const isActive = wrap.dataset.visaActive !== 'false'
        let visible
        if (tag === 'all') visible = isActive
        else if (tag === 'inativos') visible = !isActive
        else visible = isActive && wrap.dataset.visaTag === tag
        wrap.hidden = !visible
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

  // ---- Skill Tree (Guia Prático) ----
  ;(function () {
    const root = document.querySelector('.st-root')
    if (!root) return
    const cc = root.getAttribute('data-country-code') || 'xx'
    const STORAGE_KEY = 'rotalegal:guia:' + cc + ':completed'
    const dataScript = document.querySelector('script[data-skill-data]')
    if (!dataScript) return

    let phases
    try { phases = JSON.parse(dataScript.textContent || '[]') } catch (_) { phases = [] }
    const allObjs = phases.flatMap(p => p.objectives)
    const byId = Object.fromEntries(allObjs.map(o => [o.id, o]))
    const idOrder = allObjs.map(o => o.id)

    let completed = new Set()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) completed = new Set(JSON.parse(stored))
    } catch (_) {}
    let selectedId = null

    const $pct = root.querySelector('[data-bind="pct"]')
    const $done = root.querySelector('[data-bind="done"]')
    const $fill = root.querySelector('[data-bind="fill"]')
    const $detail = root.querySelector('[data-bind="detail"]')
    const $reset = root.querySelector('[data-bind="reset"]')

    function isUnlocked(id) {
      const idx = idOrder.indexOf(id)
      if (idx <= 0) return true
      return completed.has(idOrder[idx - 1])
    }

    function persist() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed])) } catch (_) {}
    }

    function escapeHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    }

    function renderDetail() {
      if (!selectedId) {
        $detail.innerHTML = '<div class="st-detail-empty">Clique em qualquer nó da árvore para ver os detalhes da habilidade.</div>'
        return
      }
      const o = byId[selectedId]
      if (!o) return
      const isDone = completed.has(selectedId)
      const tagsHtml = (o.tags || []).map(t => '<span>' + escapeHtml(t) + '</span>').join('')
      const tipHtml = o.tip
        ? '<div class="st-detail-tip"><svg class="st-detail-tip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span><b>Dica:</b> ' + escapeHtml(o.tip) + '</span></div>'
        : ''
      $detail.innerHTML = '<div class="st-detail-body">' +
        '<div class="st-detail-eyebrow">&#9826; SKILL DETAIL</div>' +
        '<h3 class="st-detail-title' + (isDone ? ' is-completed' : '') + '">' + escapeHtml(o.title) + '</h3>' +
        (tagsHtml ? '<div class="st-detail-tags">' + tagsHtml + '</div>' : '') +
        '<div class="st-detail-summary">' + escapeHtml(o.summary) + '</div>' +
        (o.detail ? '<div class="st-detail-text">' + escapeHtml(o.detail) + '</div>' : '') +
        tipHtml +
      '</div>'
    }

    function updateNodes() {
      const nodes = root.querySelectorAll('.st-node, .st-mnode')
      nodes.forEach(g => {
        const id = g.getAttribute('data-id')
        const isDone = completed.has(id)
        const unlocked = isUnlocked(id)
        g.classList.toggle('is-completed', isDone)
        g.classList.toggle('is-unlocked', unlocked && !isDone)
        g.classList.toggle('is-locked', !unlocked && !isDone)
        g.classList.toggle('is-selected', selectedId === id)
      })
      root.querySelectorAll('.st-node-label').forEach(el => {
        const id = el.getAttribute('data-for')
        const isDone = completed.has(id)
        const unlocked = isUnlocked(id)
        el.classList.toggle('is-completed', isDone)
        el.classList.toggle('is-locked', !unlocked && !isDone)
        const toggleBtn = el.querySelector('.st-node-toggle')
        if (toggleBtn) {
          const txt = toggleBtn.querySelector('.st-node-action-text')
          if (txt) txt.textContent = isDone ? 'Concluído' : (unlocked ? 'Marcar concluído' : 'Bloqueado')
          toggleBtn.disabled = !unlocked && !isDone
        }
      })
      root.querySelectorAll('.st-mnode-toggle').forEach(btn => {
        const id = btn.getAttribute('data-mtoggle')
        const isDone = completed.has(id)
        const unlocked = isUnlocked(id)
        const txt = btn.querySelector('.st-mnode-toggle-text')
        if (txt) txt.textContent = isDone ? 'Concluído' : (unlocked ? 'Marcar concluído' : 'Bloqueado')
        btn.disabled = !unlocked && !isDone
      })
      root.querySelectorAll('.st-stub').forEach(el => {
        const id = el.getAttribute('data-for')
        el.classList.toggle('is-unlocked', isUnlocked(id) || completed.has(id))
      })
      root.querySelectorAll('.st-vert').forEach(el => {
        const id = el.getAttribute('data-for')
        const node = root.querySelector('.st-node[data-id="' + id + '"]')
        const prevId = node ? node.getAttribute('data-prev') : ''
        el.classList.toggle('is-active', prevId && completed.has(prevId))
      })
      root.querySelectorAll('.st-phase-group, .st-mphase').forEach(g => {
        const num = g.getAttribute('data-phase')
        const phase = phases.find(p => String(p.number) === String(num))
        if (!phase) return
        const allDone = phase.objectives.every(o => completed.has(o.id))
        g.classList.toggle('is-done', allDone)
      })
      const trophy = root.querySelector('.st-trophy')
      if (trophy) trophy.classList.toggle('is-done', completed.size === allObjs.length)
    }

    function updateProgress() {
      const done = allObjs.filter(o => completed.has(o.id)).length
      const pct = allObjs.length === 0 ? 0 : Math.round((done / allObjs.length) * 100)
      if ($done) $done.textContent = done
      if ($pct) $pct.textContent = pct
      if ($fill) $fill.style.width = pct + '%'
    }

    function toggle(id) {
      if (!id) return
      if (completed.has(id)) {
        completed.delete(id)
      } else {
        if (!isUnlocked(id)) return
        completed.add(id)
      }
      persist()
      updateNodes()
      updateProgress()
      renderDetail()
    }

    function select(id) {
      selectedId = id
      updateNodes()
      renderDetail()
    }

    root.querySelectorAll('.st-node').forEach(g => {
      g.addEventListener('click', () => {
        const id = g.getAttribute('data-id')
        select(id)
      })
      g.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          const id = g.getAttribute('data-id')
          select(id)
        }
      })
    })

    root.querySelectorAll('.st-node-toggle').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation()
        const id = btn.getAttribute('data-toggle')
        select(id)
        toggle(id)
      })
    })

    root.querySelectorAll('.st-mnode-toggle').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation()
        const id = btn.getAttribute('data-mtoggle')
        toggle(id)
      })
    })

    if ($reset) {
      $reset.addEventListener('click', () => {
        completed.clear()
        selectedId = null
        persist()
        updateNodes()
        updateProgress()
        renderDetail()
      })
    }

    updateNodes()
    updateProgress()
    renderDetail()
  })()
</script>
<script src="assets/nav.js" defer></script>
<script src="assets/site-extras.js" defer></script>
</body>
</html>`
}
