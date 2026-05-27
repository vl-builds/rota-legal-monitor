#!/usr/bin/env bun
/**
 * Reaplica todos os patches de pesquisa em scripts/patches/*.json sobre os
 * data/current/{cc}.json. Deve rodar APOS `bun run extract`, porque a extracao
 * mensal sobrescreve os arquivos e perde os enriquecimentos manuais (ex: o
 * visto D7 portugues, que so existe via patch).
 *
 * Uso:
 *   bun run scripts/patch-all.ts                # aplica todos os paises com patch
 *   bun run scripts/patch-all.ts --country=pt   # aplica so um pais
 */
import { readdir } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { applyPatch } from './patch-visa'

const ROOT = join(import.meta.dir, '..')
const PATCHES_DIR = join(ROOT, 'scripts', 'patches')

async function main() {
  const args = process.argv.slice(2)
  const only = args.find((a) => a.startsWith('--country='))?.split('=')[1]

  const files = (await readdir(PATCHES_DIR)).filter((f) => f.endsWith('.json'))
  const targets = only ? files.filter((f) => basename(f, '.json') === only) : files

  if (targets.length === 0) {
    console.error(only ? `Nenhum patch para "${only}" em scripts/patches/` : 'Nenhum patch em scripts/patches/')
    process.exit(1)
  }

  let totalPatched = 0
  let totalCreated = 0
  for (const file of targets) {
    const cc = basename(file, '.json')
    console.log(`\n=== ${cc} ===`)
    const { patched, created } = await applyPatch(cc, join(PATCHES_DIR, file))
    totalPatched += patched
    totalCreated += created
  }

  console.log(`\nTotal: ${totalPatched} vistos atualizados, ${totalCreated} criados em ${targets.length} pais(es).`)
}

main().catch((err) => { console.error(err); process.exit(1) })
