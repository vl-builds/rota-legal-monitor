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

function mergeSteps(steps: Array<{ order: number; description: string }>): Array<{
  order: number; description: string; estimatedDays: null; name: string | null
}> {
  return steps.map(s => ({
    order: s.order,
    description: s.description,
    estimatedDays: null,
    name: null,
  }))
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
      if (patch.process.applicationLocation) visa.process.applicationLocation = patch.process.applicationLocation
      if (patch.process.fees?.length) visa.process.fees = patch.process.fees
      if (patch.process.steps?.length) visa.process.steps = mergeSteps(patch.process.steps)
    }
    if (patch.requirements) {
      if (patch.requirements.documents?.length) visa.requirements.documents = patch.requirements.documents
      if (patch.requirements.incomeRequirement !== undefined) visa.requirements.incomeRequirement = patch.requirements.incomeRequirement
      if (patch.requirements.languageRequired !== undefined) visa.requirements.languageRequired = patch.requirements.languageRequired
      if (patch.requirements.qualificationsRequired?.length) visa.requirements.qualificationsRequired = patch.requirements.qualificationsRequired
    }
    if (patch.rights) {
      visa.rights.canWork = patch.rights.canWork ?? visa.rights.canWork
      visa.rights.canBringFamily = patch.rights.canBringFamily ?? visa.rights.canBringFamily
      visa.rights.canChangeEmployer = patch.rights.canChangeEmployer ?? visa.rights.canChangeEmployer
      if (patch.rights.pathToResidency !== undefined) visa.rights.pathToResidency = patch.rights.pathToResidency
      if (patch.rights.pathToCitizenship !== undefined) visa.rights.pathToCitizenship = patch.rights.pathToCitizenship
    }
    if (patch.notes !== undefined) visa.notes = patch.notes

    patched++
    console.log(`[ok] ${visa.id}`)
  }

  await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`\n${patched} vistos atualizados em ${cc}.json`)
}

main().catch(err => { console.error(err); process.exit(1) })
