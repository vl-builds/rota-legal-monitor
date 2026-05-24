import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { readCurrent, listHistory } from '@/storage/snapshot'
import { CountryDataSchema } from '@/extractors/schema'
import { diffSnapshots } from '@/diff/detect-changes'
import type { ChangeSummary } from '@/diff/detect-changes'
import { sources } from '@/sources/index'
import { log } from '@/lib/log'

function readHistorySnapshot(country: string, date: string) {
  const path = join('data', 'history', country, `${date}.json`)
  if (!existsSync(path)) return null
  try {
    const raw = JSON.parse(readFileSync(path, 'utf-8')) as unknown
    const result = CountryDataSchema.safeParse(raw)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function diffCountry(countryCode: string): ChangeSummary | null {
  const current = readCurrent(countryCode)
  if (!current) {
    log.warn('sem snapshot atual', { country: countryCode })
    return null
  }

  const history = listHistory(countryCode)
  if (history.length === 0) {
    log.info('sem historico para comparar, primeira execucao', { country: countryCode })
    return null
  }

  const lastDate = history.at(-1)!
  const previous = readHistorySnapshot(countryCode, lastDate)
  if (!previous) {
    log.warn('ultimo snapshot do historico invalido', { country: countryCode, date: lastDate })
    return null
  }

  return diffSnapshots(previous, current)
}

export function diffAllCountries(countryCodes?: string[]): ChangeSummary[] {
  const countries = countryCodes ?? Object.keys(sources)
  const summaries: ChangeSummary[] = []
  for (const country of countries) {
    const summary = diffCountry(country)
    if (summary) summaries.push(summary)
  }
  return summaries
}
