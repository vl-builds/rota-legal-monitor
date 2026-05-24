import { appendFileSync } from 'node:fs'
import type { ChangeSummary } from '@/diff/detect-changes'
import { diffAllCountries } from '@/diff/run'
import { log } from '@/lib/log'

function setGithubOutput(key: string, value: string): void {
  const outputFile = process.env['GITHUB_OUTPUT']
  if (outputFile) {
    appendFileSync(outputFile, `${key}=${value}\n`)
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const countryArg = args.find((a) => a.startsWith('--country='))?.split('=')[1]

  const summaries: ChangeSummary[] = diffAllCountries(countryArg ? [countryArg] : undefined)

  const hasHigh = summaries.some((s) => s.high.length > 0)
  const highCountries = summaries.filter((s) => s.high.length > 0).map((s) => s.country)

  // stdout vai para diff-output.md quando rodando no workflow
  if (summaries.length === 0) {
    console.log('Nenhum historico disponivel para comparar.')
  } else {
    const date = new Date().toISOString().slice(0, 10)
    console.log(`# Rota Legal Monitor — snapshot ${date}`)
    console.log()
    for (const s of summaries) {
      console.log(s.markdown)
      console.log()
      console.log(`Alta: ${s.high.length} | Media: ${s.medium.length} | Baixa: ${s.low.length}`)
      console.log()
    }
  }

  // outputs para o GitHub Actions
  setGithubOutput('has_high_relevance', String(hasHigh))
  setGithubOutput('affected_countries', highCountries.join(','))

  log.info('diff concluido', {
    countries: summaries.length,
    hasHigh,
    highCountries,
  })
}

main().catch((err: unknown) => {
  log.error('erro fatal', { error: String(err) })
  process.exit(1)
})
