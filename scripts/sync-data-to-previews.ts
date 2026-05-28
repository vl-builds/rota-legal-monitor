#!/usr/bin/env bun
/**
 * Copia os JSONs publicos de data/current para previews/data.
 *
 * O Cloudflare Pages so publica a pasta previews/. A pasta data/ fica de fora,
 * entao sem esta copia as paginas dinamicas (comparar, etc.) que fazem
 * fetch('/data/{cc}.json') recebem o HTML de fallback no lugar do JSON e quebram
 * no parse. Em dev o serve.ts ja roteia /data para data/current; isto da a mesma
 * disponibilidade no deploy do Cloudflare.
 *
 * Roda automaticamente no `bun run deploy:web`.
 */
import { mkdirSync, readdirSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '..')
const SRC = join(ROOT, 'data', 'current')
const DEST = join(ROOT, 'previews', 'data')

mkdirSync(DEST, { recursive: true })
const files = readdirSync(SRC).filter((f) => f.endsWith('.json'))
for (const f of files) {
  copyFileSync(join(SRC, f), join(DEST, f))
}
console.log(`[sync-data] ${files.length} arquivos copiados para previews/data/`)
