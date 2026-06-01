import { appendFileSync } from 'node:fs'
import { sources } from '@/sources/index'
import { auditCountry, applyAudit, buildReport, type CountryAudit } from '@/audit/cross-check'
import { MODELS } from '@/lib/models'
import { log } from '@/lib/log'

// Auditoria cruzada mensal: compara os valores extraidos contra as verificationUrls
// oficiais via LLM, anota divergencias em reliability.knownIssues e imprime um
// relatorio markdown. Seta has_divergences no GITHUB_OUTPUT para o cron abrir issue.

function setGithubOutput(key: string, value: string): void {
  const outputFile = process.env['GITHUB_OUTPUT']
  if (outputFile) appendFileSync(outputFile, `${key}=${value}\n`)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const countryArg = args.find((a) => a.startsWith('--country='))?.split('=')[1]
  const codes = countryArg ? [countryArg] : Object.keys(sources)

  const audits: CountryAudit[] = []
  for (const cc of codes) {
    const a = await auditCountry(cc, MODELS.haiku)
    if (!a) continue
    const n = applyAudit(cc, a.findings)
    log.info('auditoria de pais concluida', { country: cc, divergencias: n })
    audits.push(a)
  }

  console.log(buildReport(audits))

  const hasDivergences = audits.some((a) => a.findings.some((f) => f.status === 'divergent'))
  setGithubOutput('has_divergences', String(hasDivergences))
}

main().catch((err: unknown) => {
  log.error('auditoria: erro fatal', { error: String(err) })
  process.exit(1)
})
