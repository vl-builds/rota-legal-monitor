import { diffAllCountries } from '@/diff/run'
import type { ChangeSummary, FieldChange } from '@/diff/detect-changes'
import { sources } from '@/sources/index'
import { listActiveSubscribers, ensureTag, tagSubscriber, sendBroadcastToTag } from '@/alerts/kit'
import { log } from '@/lib/log'

const COUNTRY_CODES = Object.keys(sources)
const SITE_URL = 'https://vl-builds.github.io/rota-legal-monitor'

function tagName(cc: string): string {
  return `pais-${cc}`
}

function countryName(cc: string): string {
  return sources[cc]?.countryName ?? cc.toUpperCase()
}

// "todos" quando o campo paises vem vazio; senao os codigos validos informados.
function parsePaisesField(value: string | null | undefined): string[] {
  if (!value) return [...COUNTRY_CODES]
  const codes = value
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((cc) => COUNTRY_CODES.includes(cc))
  return codes.length > 0 ? codes : [...COUNTRY_CODES]
}

// ---- render do conteudo (migrado do envio anterior) -----------------------

function formatMoney(v: { amount: number; currency: string; period: string | null }): string {
  const periodo = v.period === 'monthly' ? '/mes' : v.period === 'yearly' ? '/ano' : ''
  return `${v.amount.toLocaleString('pt-BR')} ${v.currency}${periodo}`
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '(nenhum)'
  if (typeof v === 'object' && v !== null && 'amount' in v && 'currency' in v) {
    return formatMoney(v as { amount: number; currency: string; period: string | null })
  }
  if (Array.isArray(v)) return `${v.length} item(s)`
  if (typeof v === 'string') return v
  return JSON.stringify(v)
}

function describeChange(c: FieldChange): string {
  if (c.path === 'visaTypes.added') return `Novo visto disponivel: ${formatValue(c.after)}`
  if (c.path === 'visaTypes.removed') return `Visto descontinuado: ${formatValue(c.before)}`
  if (c.path.includes('incomeRequirement')) {
    return `Renda exigida: ${formatValue(c.before)} passou para ${formatValue(c.after)}`
  }
  if (c.path.includes('.fees') || c.path.includes('.process.fees')) {
    return `Taxas: ${formatValue(c.before)} passou para ${formatValue(c.after)}`
  }
  if (c.path.includes('proofOfFunds')) {
    return `Comprovacao de fundos: ${formatValue(c.before)} passou para ${formatValue(c.after)}`
  }
  if (c.path.startsWith('recentChanges.new')) return `${formatValue(c.after)}`
  if (c.path === 'forBrazilians.workPermitNeeded') {
    return `Exigencia de autorizacao de trabalho mudou para ${formatValue(c.after)}`
  }
  if (c.path === 'forBrazilians.maxStayDaysAsTourist') {
    return `Estadia maxima como turista: ${formatValue(c.before)} passou para ${formatValue(c.after)} dias`
  }
  if (c.path === 'forBrazilians.schengenVisaFree') {
    return `Isencao de visto Schengen mudou para ${formatValue(c.after)}`
  }
  return `${c.path}: ${formatValue(c.before)} passou para ${formatValue(c.after)}`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface CountryEmail {
  subject: string
  previewText: string
  content: string
}

function buildCountryEmail(summary: ChangeSummary): CountryEmail {
  const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const nome = countryName(summary.country)
  const items = summary.high
    .map((c) => `<li style="margin:0 0 8px;line-height:1.5;color:#1a1a1a;">${escapeHtml(describeChange(c))}</li>`)
    .join('')

  const content = [
    `<div style="background:#f5f5f5;padding:24px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">`,
    `<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">`,
    `<div style="background:#0a0a0a;padding:20px 28px;">`,
    `<span style="color:#f0b429;font-weight:700;font-size:18px;letter-spacing:-0.5px;">Rota Legal</span>`,
    `<span style="color:#888;font-size:13px;display:block;margin-top:2px;">Alerta de ${escapeHtml(nome)} &middot; ${date}</span>`,
    `</div>`,
    `<div style="padding:28px;">`,
    `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#1a1a1a;">Detectamos mudancas de alta relevancia em <strong>${escapeHtml(nome)}</strong>, um dos paises que voce acompanha:</p>`,
    `<ul style="margin:0;padding-left:20px;">${items}</ul>`,
    `<div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e5e5;">`,
    `<a href="${SITE_URL}/pais-${summary.country}.html" style="display:inline-block;background:#f0b429;color:#0a0a0a;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;">Ver detalhes de ${escapeHtml(nome)}</a>`,
    `</div>`,
    `</div>`,
    `<div style="padding:16px 28px;background:#fafafa;border-top:1px solid #e5e5e5;">`,
    `<p style="margin:0;font-size:12px;color:#888;line-height:1.5;">Voce recebe este alerta por ter pedido para acompanhar ${escapeHtml(nome)}. Os dados sao extraidos automaticamente de fontes oficiais e podem conter erros: confirme sempre na fonte antes de decidir.</p>`,
    `</div>`,
    `</div>`,
    `</div>`,
  ].join('')

  return {
    subject: `Rota Legal: mudancas importantes em ${nome}`,
    previewText: `Resumo das mudancas de alta relevancia em ${nome}.`,
    content,
  }
}

// ---- orquestracao ----------------------------------------------------------

async function main(): Promise<void> {
  const dryRun = process.argv.slice(2).includes('--dry-run')

  const summaries = diffAllCountries()
  const withHigh = summaries.filter((s) => s.high.length > 0)
  if (withHigh.length === 0) {
    log.info('nenhuma mudanca de alta relevancia, nada a enviar')
    return
  }
  const changed = withHigh.map((s) => s.country)

  if (dryRun) {
    for (const s of withHigh) {
      log.info('[dry-run] broadcast', {
        country: s.country,
        tag: tagName(s.country),
        highChanges: s.high.length,
      })
    }
    return
  }

  // Garante as tags apenas dos paises que mudaram neste ciclo.
  const tagIds: Record<string, number> = {}
  for (const cc of changed) {
    tagIds[cc] = await ensureTag(tagName(cc))
  }

  // Reconciliacao: marca cada assinante com as tags dos paises mudados que ele acompanha.
  const subscribers = await listActiveSubscribers()
  let tagged = 0
  for (const sub of subscribers) {
    const acompanha = new Set(parsePaisesField(sub.fields?.['paises']))
    for (const cc of changed) {
      if (acompanha.has(cc)) {
        await tagSubscriber(tagIds[cc]!, sub.email_address)
        tagged++
      }
    }
  }
  log.info('tags reconciliadas', { subscribers: subscribers.length, tagged })

  // Um broadcast por pais mudado, mirando a tag daquele pais.
  for (const s of withHigh) {
    const email = buildCountryEmail(s)
    await sendBroadcastToTag({
      tagId: tagIds[s.country]!,
      subject: email.subject,
      content: email.content,
      previewText: email.previewText,
      description: `Alerta ${s.country} ${new Date().toISOString().slice(0, 10)}`,
    })
  }
  log.info('envio de alertas concluido', { broadcasts: withHigh.length })
}

main().catch((err: unknown) => {
  log.error('erro fatal no envio de alertas', { error: String(err) })
  process.exit(1)
})
