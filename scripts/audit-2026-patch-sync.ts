#!/usr/bin/env bun
/**
 * Sincroniza os patches de pesquisa (scripts/patches/{cc}.json) com os limiares
 * de renda e taxas corrigidos na auditoria 2026 (ver docs/audit-2026.md), para
 * que `patch:all` NÃO reverta as correções na próxima extração mensal. Só mexe
 * em valores (amount/fees/nameOriginal) de visa-keys já existentes no patch;
 * não cria novas entradas. generalRequirements (salário mínimo/proofOfFunds) não
 * são patcháveis — vivem em data/current e estão documentados em knownIssues.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(import.meta.dir, 'patches')

const INCOME: Record<string, Record<string, number | null>> = {
  nl: {
    'highly-skilled-migrant': 5942,
    'european-blue-card': 5942,
    'intra-corporate-transferee': 5942,
    'paid-employment-gvva': 2294.4,
    'paid-employment-no-gvva': 2294.4,
    'seasonal-work': 2294.4,
  },
  fr: {
    'vls-ts-salarie': 1867.02,
    'vls-carte-travailleur': 1867.02,
    'carte-sejour-temporaire-salarie': 1867.02,
  },
  es: { 'telework-nomad-visa': 2849, 'highly-qualified-worker-visa': 39270 },
  at: { 'startup-founders': 30000 },
  it: { 'eu-blue-card': 27000, 'lavoro-autonomo': 8400 },
  pt: { 'work-job-search': 2760 },
  be: { 'professional-card-self-employed': null },
}

const FEES: Record<string, Array<[number, number]>> = {
  nl: [[345, 423]],
  pt: [[90, 110]],
  au: [[2455, 2320], [1230, 1160], [635, 670]],
  at: [[160, 120], [150, 195]],
  be: [[215, 152]],
  fr: [[269, 200], [225, 350]],
}

const NAME_ORIGINAL: Record<string, Record<string, string>> = {
  au: { 'tss-482': 'Skills in Demand visa (subclass 482)' },
}

const codes = new Set([...Object.keys(INCOME), ...Object.keys(FEES), ...Object.keys(NAME_ORIGINAL)])

for (const cc of codes) {
  const path = join(DIR, `${cc}.json`)
  const patch = JSON.parse(readFileSync(path, 'utf-8')) as Record<string, any>
  let changed = 0

  for (const [id, amount] of Object.entries(INCOME[cc] ?? {})) {
    const entry = patch[id]
    if (!entry) continue
    entry.requirements = entry.requirements ?? {}
    if (amount === null) {
      entry.requirements.incomeRequirement = null
    } else {
      const cur = entry.requirements.incomeRequirement ?? { currency: 'EUR', period: 'monthly' }
      entry.requirements.incomeRequirement = { ...cur, amount }
    }
    changed++
  }

  for (const [oldAmt, newAmt] of FEES[cc] ?? []) {
    for (const entry of Object.values(patch)) {
      const fees = (entry as any)?.process?.fees
      if (!Array.isArray(fees)) continue
      for (const f of fees) if (f && f.amount === oldAmt) { f.amount = newAmt; changed++ }
    }
  }

  for (const [id, name] of Object.entries(NAME_ORIGINAL[cc] ?? {})) {
    if (patch[id]) { patch[id].nameOriginal = name; changed++ }
  }

  writeFileSync(path, JSON.stringify(patch, null, 2) + '\n', 'utf-8')
  console.log(`[ok] patches/${cc}.json: ${changed} alterações`)
}
console.log('\nPatches sincronizados com a auditoria 2026.')
