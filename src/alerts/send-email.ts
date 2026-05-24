import { diffAllCountries } from '@/diff/run'
import type { ChangeSummary, FieldChange } from '@/diff/detect-changes'
import { loadSubscribers, countriesFor, type Subscriber } from '@/alerts/subscribers'
import { sources } from '@/sources/index'
import { log } from '@/lib/log'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
// Resend free tier limita a 2 req/s. Espacar envios com folga.
const SEND_DELAY_MS = 600
const SITE_URL = 'https://vl-builds.github.io/rota-legal-monitor'

function countryName(cc: string): string {
  return sources[cc]?.countryName ?? cc.toUpperCase()
}

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

// Traduz o path tecnico do diff para uma frase legivel ao assinante.
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

function renderCountryBlock(summary: ChangeSummary): string {
  const items = summary.high
    .map(
      (c) =>
        `<li style="margin:0 0 8px;line-height:1.5;color:#1a1a1a;">${escapeHtml(describeChange(c))}</li>`,
    )
    .join('')
  return [
    `<div style="margin:0 0 24px;">`,
    `<h2 style="font-size:18px;margin:0 0 4px;color:#0a0a0a;">${escapeHtml(countryName(summary.country))}</h2>`,
    `<a href="${SITE_URL}/pais-${summary.country}.html" style="color:#a8780a;font-size:13px;text-decoration:none;">Ver detalhes no site &rarr;</a>`,
    `<ul style="margin:12px 0 0;padding-left:20px;">${items}</ul>`,
    `</div>`,
  ].join('')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildEmail(summaries: ChangeSummary[]): { subject: string; html: string } {
  const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const paises = summaries.map((s) => countryName(s.country)).join(', ')
  const subject =
    summaries.length === 1
      ? `Rota Legal: mudancas importantes em ${countryName(summaries[0]!.country)}`
      : `Rota Legal: mudancas importantes em ${summaries.length} paises que voce acompanha`

  const html = [
    `<div style="background:#f5f5f5;padding:24px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">`,
    `<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">`,
    `<div style="background:#0a0a0a;padding:20px 28px;">`,
    `<span style="color:#f0b429;font-weight:700;font-size:18px;letter-spacing:-0.5px;">Rota Legal</span>`,
    `<span style="color:#888;font-size:13px;display:block;margin-top:2px;">Alerta de mudancas &middot; ${date}</span>`,
    `</div>`,
    `<div style="padding:28px;">`,
    `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#1a1a1a;">Detectamos mudancas de alta relevancia nos paises que voce acompanha. Confira o resumo abaixo:</p>`,
    summaries.map(renderCountryBlock).join(''),
    `<div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e5e5;">`,
    `<a href="${SITE_URL}/historico.html" style="display:inline-block;background:#f0b429;color:#0a0a0a;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;">Ver historico completo</a>`,
    `</div>`,
    `</div>`,
    `<div style="padding:16px 28px;background:#fafafa;border-top:1px solid #e5e5e5;">`,
    `<p style="margin:0;font-size:12px;color:#888;line-height:1.5;">Voce recebe este alerta por ser aluno do curso e ter pedido para acompanhar estes paises. Os dados sao extraidos automaticamente de fontes oficiais e podem conter erros: confirme sempre na fonte antes de decidir.</p>`,
    `</div>`,
    `</div>`,
    `</div>`,
  ].join('')

  return { subject, html }
}

async function sendViaResend(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html }),
  })
  if (!res.ok) {
    const body = await res.text()
    log.error('falha no envio Resend', { to, status: res.status, body: body.slice(0, 300) })
    return false
  }
  const data = (await res.json()) as { id?: string }
  log.info('email enviado', { to, id: data.id })
  return true
}

function highChangesFor(subscriber: Subscriber, all: ChangeSummary[]): ChangeSummary[] {
  const wanted = new Set(countriesFor(subscriber))
  return all.filter((s) => s.high.length > 0 && wanted.has(s.country))
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  const subscribers = loadSubscribers()
  if (subscribers.length === 0) {
    log.info('nenhum assinante, nada a enviar')
    return
  }

  const allSummaries = diffAllCountries()
  const withHigh = allSummaries.filter((s) => s.high.length > 0)
  if (withHigh.length === 0) {
    log.info('nenhuma mudanca de alta relevancia, nada a enviar')
    return
  }

  const apiKey = process.env['RESEND_API_KEY']
  const from = process.env['ALERTS_FROM'] ?? 'Rota Legal <onboarding@resend.dev>'

  if (!apiKey && !dryRun) {
    log.error('RESEND_API_KEY ausente: use --dry-run para testar sem enviar')
    process.exit(1)
  }

  let sent = 0
  let skipped = 0
  for (const subscriber of subscribers) {
    const relevant = highChangesFor(subscriber, withHigh)
    if (relevant.length === 0) {
      skipped++
      continue
    }
    const { subject, html } = buildEmail(relevant)

    if (dryRun) {
      log.info('[dry-run] enviaria email', {
        to: subscriber.email,
        subject,
        countries: relevant.map((s) => s.country),
      })
      sent++
      continue
    }

    const ok = await sendViaResend(apiKey!, from, subscriber.email, subject, html)
    if (ok) sent++
    else skipped++
    await Bun.sleep(SEND_DELAY_MS)
  }

  log.info('envio de alertas concluido', { sent, skipped, total: subscribers.length, dryRun })
}

main().catch((err: unknown) => {
  log.error('erro fatal no envio de alertas', { error: String(err) })
  process.exit(1)
})
