#!/usr/bin/env bun
/**
 * Trava de seguranca da extracao mensal.
 *
 * Compara o data/current recem-extraido (ja enriquecido por patch:all) contra o
 * estado commitado anterior (git HEAD) e sinaliza degradacao tipica do ruido de
 * re-extracao do LLM: churn de IDs, contagem de vistos disparando, perda de
 * generalRequirements e enriquecimento sumindo. Se algum pais for sinalizado, sai
 * com codigo 1 para que o cron ABORTE o commit e abra issue de revisao manual em
 * vez de publicar o ruido.
 *
 * Uso:
 *   bun run scripts/extraction-guard.ts                # todos os paises
 *   bun run scripts/extraction-guard.ts --country=fr   # so um pais
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { sources } from '@/sources/index'

// Limiares. Ajustar com cautela: muito frouxo deixa ruido passar, muito apertado
// bloqueia mudancas reais de politica.
const ID_CHURN_RATIO = 0.34 // fracao de IDs anteriores que sumiram
const ID_CHURN_MIN_ABS = 2 // ignora churn em paises com pouquissimos vistos
const COUNT_DELTA_RATIO = 0.5 // variacao relativa na contagem de vistos

interface Money {
  amount: number | null
}
interface VisaType {
  id: string
  requirements?: { documents?: unknown[]; incomeRequirement?: Money | null }
  process?: { fees?: unknown[]; steps?: unknown[] }
}
interface CountryData {
  visaTypes: VisaType[]
  forBrazilians?: { schengenVisaFree?: boolean | null }
  generalRequirements?: {
    proofOfFunds?: Money | null
    minimumWage?: Money | null
    healthInsurance?: { required?: boolean | null } | null
  }
}

function currentPath(cc: string): string {
  return join('data', 'current', `${cc}.json`)
}

function readNew(cc: string): CountryData | null {
  const p = currentPath(cc)
  if (!existsSync(p)) return null
  return JSON.parse(readFileSync(p, 'utf-8')) as CountryData
}

function readPrevFromGit(cc: string): CountryData | null {
  try {
    const raw = execFileSync('git', ['show', `HEAD:${currentPath(cc).replace(/\\/g, '/')}`], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return JSON.parse(raw) as CountryData
  } catch {
    return null // sem baseline no HEAD (pais novo) -> nada a comparar
  }
}

function hasMoney(m: Money | null | undefined): boolean {
  return !!m && m.amount != null && m.amount > 0
}

function visaEnriched(v: VisaType): boolean {
  return (
    (v.requirements?.documents?.length ?? 0) > 0 ||
    (v.process?.fees?.length ?? 0) > 0 ||
    (v.process?.steps?.length ?? 0) > 0
  )
}

function checkCountry(cc: string): string[] {
  const flags: string[] = []
  const next = readNew(cc)
  const prev = readPrevFromGit(cc)
  if (!next || !prev) return flags // sem baseline ou sem dado novo: nao bloqueia

  const prevIds = new Set(prev.visaTypes.map((v) => v.id))
  const nextIds = new Set(next.visaTypes.map((v) => v.id))

  // 1. churn de IDs
  const vanished = [...prevIds].filter((id) => !nextIds.has(id))
  if (vanished.length >= ID_CHURN_MIN_ABS && vanished.length / prevIds.size > ID_CHURN_RATIO) {
    flags.push(
      `churn de IDs: ${vanished.length}/${prevIds.size} sumiram (${vanished.slice(0, 6).join(', ')}${vanished.length > 6 ? '...' : ''})`,
    )
  }

  // 2. contagem de vistos
  const delta = (next.visaTypes.length - prev.visaTypes.length) / Math.max(1, prev.visaTypes.length)
  if (Math.abs(delta) > COUNT_DELTA_RATIO) {
    flags.push(`contagem de vistos: ${prev.visaTypes.length} -> ${next.visaTypes.length}`)
  }

  // 3. regressoes em generalRequirements
  const pg = prev.generalRequirements ?? {}
  const ng = next.generalRequirements ?? {}
  if (hasMoney(pg.proofOfFunds) && !hasMoney(ng.proofOfFunds)) flags.push('generalRequirements.proofOfFunds zerado')
  if (hasMoney(pg.minimumWage) && !hasMoney(ng.minimumWage)) flags.push('generalRequirements.minimumWage zerado')
  if (pg.healthInsurance?.required === true && ng.healthInsurance?.required === false) {
    flags.push('generalRequirements.healthInsurance.required virou false')
  }

  // Isencao de visto Schengen para brasileiros e fato estavel: o LLM confunde
  // "precisa de visto para trabalhar" com "precisa de visto para entrar".
  if (prev.forBrazilians?.schengenVisaFree === true && next.forBrazilians?.schengenVisaFree === false) {
    flags.push('forBrazilians.schengenVisaFree virou false')
  }

  // 4. perda de enriquecimento em vistos que continuam existindo
  const nextById = new Map(next.visaTypes.map((v) => [v.id, v]))
  let lost = 0
  for (const pv of prev.visaTypes) {
    const nv = nextById.get(pv.id)
    if (nv && visaEnriched(pv) && !visaEnriched(nv)) lost++
  }
  if (lost > 0) flags.push(`${lost} visto(s) perderam enriquecimento (documentos/taxas/passos)`)

  return flags
}

function main(): void {
  const args = process.argv.slice(2)
  const countryArg = args.find((a) => a.startsWith('--country='))?.split('=')[1]
  const countries = countryArg ? [countryArg] : Object.keys(sources)

  const suspect: Record<string, string[]> = {}
  for (const cc of countries) {
    const flags = checkCountry(cc)
    if (flags.length > 0) suspect[cc] = flags
  }

  const names = Object.keys(suspect)
  if (names.length === 0) {
    console.log('guard: extracao OK, nenhuma degradacao detectada.')
    process.exit(0)
  }

  console.error('guard: extracao SUSPEITA, commit deve ser abortado.\n')
  for (const cc of names) {
    console.error(`## ${cc.toUpperCase()}`)
    for (const f of suspect[cc]!) console.error(`  - ${f}`)
    console.error('')
  }
  console.error('Revisar manualmente: comparar data/current com o snapshot anterior e reverter o ruido (ver memoria project-extraction-noise).')
  process.exit(1)
}

main()
