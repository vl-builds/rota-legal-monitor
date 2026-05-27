#!/usr/bin/env bun
/**
 * Aplica patches de pesquisa nos arquivos data/current/{cc}.json
 * Uso: bun run scripts/patch-visa.ts <cc> <patches-file.json>
 * O patches-file.json é um objeto { "visa-id": { process, requirements, rights, notes } }
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '..')
const DATA_DIR = join(ROOT, 'data', 'current')

const [, , cc, patchFile] = process.argv
if (!cc || !patchFile) {
  console.error('Uso: bun run scripts/patch-visa.ts <cc> <patches.json>')
  process.exit(1)
}

function mergeSteps(steps: Array<{ order: number; description: string; name?: string | null; estimatedDays?: number | null }>): Array<{
  order: number; description: string; estimatedDays: number | null; name: string | null
}> {
  return steps.map(s => ({
    order: s.order,
    description: s.description,
    estimatedDays: s.estimatedDays ?? null,
    name: s.name ?? null,
  }))
}

// Normaliza sinonimos para os enums do schema.
function normLocation(loc: string): string {
  if (loc === 'qualquer') return 'ambos'
  // Nomes de pais usados por engano no lugar do enum significam "no destino".
  if (/^(australia|austria|alemanha|portugal|espanha|holanda|paises baixos|belgica|franca|italia|irlanda)$/i.test(loc)) return 'destino'
  return loc
}

function normMoney(m: unknown): unknown {
  if (!m || typeof m !== 'object') return m
  const money = m as Record<string, unknown>
  if (money.period === 'annual') money.period = 'yearly'
  return money
}

// Converte pathInfo em string descritiva para o objeto PathInfo conforme schema.
// Mantem objetos/null inalterados. Espelha scripts/migrate-pathinfo.ts.
function normalizePathInfo(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const summary = value.replace(/\s*[—–]\s*/g, ', ').replace(/\s{2,}/g, ' ').trim()
  const match = summary.match(/(\d+)\s*anos?/i)
  return { yearsRequired: match ? Number.parseInt(match[1]!, 10) : null, conditions: [], summary }
}

async function main() {
  const dataPath = join(DATA_DIR, `${cc}.json`)
  const raw = await readFile(dataPath, 'utf-8')
  const data = JSON.parse(raw)

  const patchRaw = await readFile(patchFile, 'utf-8')
  const patches = JSON.parse(patchRaw)

  let patched = 0
  for (const visa of data.visaTypes) {
    const patch = patches[visa.id]
    if (!patch) continue

    if (patch.process) {
      if (patch.process.estimatedDuration) visa.process.estimatedDuration = patch.process.estimatedDuration
      if (patch.process.applicationLocation) visa.process.applicationLocation = normLocation(patch.process.applicationLocation)
      if (patch.process.fees?.length) visa.process.fees = patch.process.fees
      if (patch.process.steps?.length) visa.process.steps = mergeSteps(patch.process.steps)
    }
    if (patch.requirements) {
      if (patch.requirements.documents?.length) visa.requirements.documents = patch.requirements.documents
      if (patch.requirements.incomeRequirement !== undefined) visa.requirements.incomeRequirement = normMoney(patch.requirements.incomeRequirement)
      if (patch.requirements.languageRequired !== undefined) visa.requirements.languageRequired = patch.requirements.languageRequired
      if (patch.requirements.qualificationsRequired?.length) visa.requirements.qualificationsRequired = patch.requirements.qualificationsRequired
    }
    if (patch.rights) {
      visa.rights.canWork = patch.rights.canWork ?? visa.rights.canWork
      visa.rights.canBringFamily = patch.rights.canBringFamily ?? visa.rights.canBringFamily
      visa.rights.canChangeEmployer = patch.rights.canChangeEmployer ?? visa.rights.canChangeEmployer
      if (patch.rights.pathToResidency !== undefined) visa.rights.pathToResidency = normalizePathInfo(patch.rights.pathToResidency)
      if (patch.rights.pathToCitizenship !== undefined) visa.rights.pathToCitizenship = normalizePathInfo(patch.rights.pathToCitizenship)
    }
    if (patch.notes !== undefined) visa.notes = patch.notes

    patched++
    console.log(`[ok] ${visa.id}`)
  }

  await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`\n${patched} vistos atualizados em ${cc}.json`)
}

main().catch(err => { console.error(err); process.exit(1) })
