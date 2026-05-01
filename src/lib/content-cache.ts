import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const CACHE_PATH = join('data', 'cache', 'html-hashes.json')

type HashCache = Record<string, string>

function load(): HashCache {
  if (!existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8')) as HashCache
  } catch {
    return {}
  }
}

function save(cache: HashCache): void {
  const dir = dirname(CACHE_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n', 'utf-8')
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex')
}

export function isUnchanged(url: string, newHash: string): boolean {
  return load()[url] === newHash
}

export function updateHashes(entries: Record<string, string>): void {
  const cache = load()
  Object.assign(cache, entries)
  save(cache)
}
