#!/usr/bin/env bun
/**
 * Migracao unica: converte rights.pathToResidency / pathToCitizenship de string
 * descritiva para o objeto PathInfo { yearsRequired, conditions, summary }.
 *
 * A string vira o campo `summary` (prosa rica preservada). yearsRequired e
 * extraido por regex quando ha "N anos"; caso contrario fica null. conditions
 * comeca vazio: a nuance fica no summary, que os consumidores renderizam.
 *
 * Idempotente: valores ja em objeto ou null sao mantidos.
 * Aplica em data/current/*.json e scripts/patches/*.json.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '..')
const TARGETS = [join(ROOT, 'data', 'current'), join(ROOT, 'scripts', 'patches')]

// Remove travessao (proibido na prosa do projeto) e normaliza espacos.
function cleanProse(s: string): string {
  return s
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function toPathInfo(value: unknown): unknown {
  if (typeof value !== 'string') return value // ja e objeto ou null: mantem
  const summary = cleanProse(value)
  const match = summary.match(/(\d+)\s*anos?/i)
  const yearsRequired = match ? Number.parseInt(match[1]!, 10) : null
  return { yearsRequired, conditions: [], summary }
}

let converted = 0
let touchedFiles = 0

for (const dir of TARGETS) {
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    if (file === 'index.json' || file === 'example.json') continue
    const path = join(dir, file)
    const data = JSON.parse(readFileSync(path, 'utf-8'))

    // data/current: objeto pais com visaTypes[]. patches: { "visa-id": {...} }
    const visas: Array<Record<string, any>> = Array.isArray(data.visaTypes)
      ? data.visaTypes
      : Object.values(data)

    let dirty = false
    for (const visa of visas) {
      const rights = visa?.rights
      if (!rights) continue
      for (const key of ['pathToResidency', 'pathToCitizenship'] as const) {
        if (typeof rights[key] === 'string') {
          rights[key] = toPathInfo(rights[key])
          converted++
          dirty = true
        }
      }
    }

    if (dirty) {
      writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8')
      touchedFiles++
      console.log(`[ok] ${dir.split(/[\\/]/).slice(-2).join('/')}/${file}`)
    }
  }
}

console.log(`\n${converted} caminhos convertidos em ${touchedFiles} arquivos.`)
