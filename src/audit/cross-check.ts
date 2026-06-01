import Anthropic from '@anthropic-ai/sdk'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { fetchPage } from '@/extractors/fetcher'
import { extractMainContent } from '@/extractors/content-cleaner'
import { readCurrent, writeCurrent } from '@/storage/snapshot'
import { sources } from '@/sources/index'
import { MODELS } from '@/lib/models'
import { log } from '@/lib/log'
import type { CountryData, MoneyAmount } from '@/extractors/schema'

// Auditoria cruzada: compara os valores críticos extraídos contra o conteúdo das
// verificationUrls oficiais de cada país (regra "Verificação cruzada" do CLAUDE.md),
// usando o LLM. Anota as divergências em reliability.knownIssues. Não bloqueia.

export interface CriticalValue {
  field: string
  value: string
}

function fmtMoney(m: MoneyAmount | null | undefined): string | null {
  if (!m || m.amount == null) return null
  return `${m.amount} ${m.currency}${m.period ? '/' + m.period : ''}`
}

export function criticalValues(d: CountryData): CriticalValue[] {
  const out: CriticalValue[] = []
  const gr = d.generalRequirements
  const mw = fmtMoney(gr.minimumWage)
  if (mw) out.push({ field: 'generalRequirements.minimumWage', value: mw })
  const pf = fmtMoney(gr.proofOfFunds)
  if (pf) out.push({ field: 'generalRequirements.proofOfFunds', value: pf })
  for (const v of d.visaTypes) {
    const inc = fmtMoney(v.requirements.incomeRequirement)
    if (inc) out.push({ field: `${v.id}.incomeRequirement`, value: inc })
    const fees = v.process.fees.map(fmtMoney).filter((x): x is string => x !== null)
    if (fees.length) out.push({ field: `${v.id}.fees`, value: fees.join(', ') })
  }
  return out
}

const FindingsSchema = z.object({
  findings: z.array(
    z.object({
      field: z.string(),
      stored: z.string(),
      official: z.string(),
      status: z.enum(['ok', 'divergent', 'unverified']),
      note: z.string(),
    }),
  ),
})
export type Finding = z.infer<typeof FindingsSchema>['findings'][number]

const SYSTEM_PROMPT =
  'Voce audita dados de imigracao comparando valores armazenados contra o conteudo de fontes oficiais. ' +
  'Seja conservador: marque "divergent" SO quando a fonte oficial claramente indica um valor diferente ' +
  '(diferenca > 5% ou contradicao explicita). Marque "unverified" quando as fontes fornecidas nao cobrem ' +
  'o valor. Marque "ok" quando bate. Nunca invente: o campo "official" deve vir do texto das fontes. ' +
  'Priorize fontes de governo (.gov, portais oficiais) sobre agregadores.'

async function callLLM(prompt: string, model: string): Promise<Finding[]> {
  const client = new Anthropic()
  const raw = zodToJsonSchema(FindingsSchema, { $refStrategy: 'none' }) as Record<string, unknown>
  delete raw['$schema']
  const tool: Anthropic.Messages.Tool = {
    name: 'submit_audit',
    description: 'Retorna as findings da auditoria cruzada.',
    input_schema: raw as Anthropic.Messages.Tool['input_schema'],
    cache_control: { type: 'ephemeral' },
  }
  const msg = await client.messages.create({
    model,
    max_tokens: 4096,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    tools: [tool],
    tool_choice: { type: 'tool', name: 'submit_audit' },
    messages: [{ role: 'user', content: prompt }],
  })
  const block = msg.content.find(
    (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use',
  )
  if (!block) return []
  const parsed = FindingsSchema.safeParse(block.input)
  if (!parsed.success) {
    log.warn('audit: saida do LLM invalida', { issues: parsed.error.issues.length })
    return []
  }
  return parsed.data.findings
}

export interface CountryAudit {
  country: string
  findings: Finding[]
}

export async function auditCountry(cc: string, model: string = MODELS.haiku): Promise<CountryAudit | null> {
  const d = readCurrent(cc)
  if (!d) {
    log.warn('audit: sem snapshot valido', { country: cc })
    return null
  }
  const cfg = sources[cc]
  // As verificationUrls vêm com as fontes mais oficiais primeiro; limitamos a 2
  // para conter o custo/tempo do fallback Playwright em portais JS-pesados.
  const vurls = ((cfg?.verificationUrls ?? []) as Array<{ url: string; description?: string }>).slice(0, 2)
  if (vurls.length === 0) return { country: cc, findings: [] }

  const sourceTexts: string[] = []
  for (const vu of vurls) {
    try {
      const r = await fetchPage(vu.url)
      const content = extractMainContent(r.html, vu.url).slice(0, 12000)
      sourceTexts.push(`### FONTE: ${vu.url}${vu.description ? ' — ' + vu.description : ''}\n${content}`)
    } catch (err) {
      log.warn('audit: fetch da verificationUrl falhou', { url: vu.url, error: String(err) })
    }
  }
  if (sourceTexts.length === 0) {
    return {
      country: cc,
      findings: [{ field: '(fontes)', stored: '-', official: '-', status: 'unverified', note: 'Nenhuma verificationUrl pode ser buscada.' }],
    }
  }

  const vals = criticalValues(d)
  const year = new Date().getFullYear()
  const prompt = [
    `Pais: ${d.meta.countryName} (${cc}). Ano de referencia: ${year}.`,
    '',
    'VALORES ARMAZENADOS (auditar cada um):',
    ...vals.map((v) => `- ${v.field}: ${v.value}`),
    '',
    'CONTEUDO DAS FONTES OFICIAIS:',
    sourceTexts.join('\n\n'),
    '',
    `Compare cada valor armazenado com o que as fontes dizem para ${year}. Chame submit_audit.`,
  ].join('\n')

  const findings = await callLLM(prompt, model)
  return { country: cc, findings }
}

const AUDIT_TAG = '[auto-audit'

// Pura: muta o objeto recebido, retorna o número de divergências anotadas.
// Remove anotações [auto-audit] anteriores (idempotente) e preserva as manuais.
export function annotateKnownIssues(d: CountryData, findings: Finding[], date: string): number {
  const divergent = findings.filter((f) => f.status === 'divergent')
  const kept = d.reliability.knownIssues.filter((s) => !s.startsWith(AUDIT_TAG))
  for (const f of divergent) {
    kept.push(`${AUDIT_TAG} ${date}] ${f.field}: armazenado ${f.stored} vs oficial ${f.official}. ${f.note}`)
  }
  d.reliability.knownIssues = kept
  return divergent.length
}

export function applyAudit(cc: string, findings: Finding[]): number {
  const d = readCurrent(cc)
  if (!d) return 0
  const date = new Date().toISOString().slice(0, 10)
  const n = annotateKnownIssues(d, findings, date)
  writeCurrent(cc, d)
  return n
}

export function buildReport(audits: CountryAudit[]): string {
  const date = new Date().toISOString().slice(0, 10)
  const lines: string[] = [`# Auditoria cruzada — ${date}`, '']
  let totalDiv = 0
  for (const a of audits) {
    const div = a.findings.filter((f) => f.status === 'divergent')
    const unv = a.findings.filter((f) => f.status === 'unverified')
    const ok = a.findings.filter((f) => f.status === 'ok')
    if (div.length === 0 && a.findings.length === 0) continue
    lines.push(`## ${a.country.toUpperCase()} — ${div.length} divergência(s), ${ok.length} ok, ${unv.length} não verificado(s)`)
    for (const f of div) {
      lines.push(`- **DIVERGENTE** \`${f.field}\`: armazenado ${f.stored} | oficial ${f.official} — ${f.note}`)
      totalDiv++
    }
    lines.push('')
  }
  if (totalDiv === 0) lines.push('Nenhuma divergência detectada contra as fontes oficiais.')
  else lines.push(`Total de divergências: ${totalDiv}. Revisar e corrigir os valores ou os verificationUrls.`)
  return lines.join('\n')
}
