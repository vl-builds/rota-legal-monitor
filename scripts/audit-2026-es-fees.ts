#!/usr/bin/env bun
/**
 * Taxas de estrangeria da Espanha 2026 (modelo 790), confirmadas em fonte oficial
 * (BOE-A-2025-12056 / sede.policia.gob.es). Mapeadas por tipo de visto:
 *  - Regime geral (cuenta ajena): tasa 062 trabajo €203,84 (<2×SMI; €407,71 se ≥2×SMI)
 *    + tasa 052 residencia €10,94 + TIE €16,08
 *  - Ley 14/2013 (nômade digital, altamente qualificado, ICT): tasa 038 ~€73,26 + TIE €16,08
 * A taxa do visto consular (MNE) é separada e não consta destas tasas.
 */
import { readCurrent, writeCurrent } from '@/storage/snapshot'
import type { CountryData, MoneyAmount } from '@/extractors/schema'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const fee = (amount: number, notes: string): MoneyAmount => ({ amount, currency: 'EUR', period: 'one-time', notes })

const FEES: Record<string, MoneyAmount[]> = {
  'trabajo-cuenta-ajena': [
    fee(203.84, 'Tasa 062 - autorización de trabajo por cuenta ajena (<2×SMI; €407,71 se ≥2×SMI). Costuma ser paga pelo empregador.'),
    fee(10.94, 'Tasa 052 - autorización de residencia (inicial).'),
    fee(16.08, 'TIE - tarjeta de identidad de extranjero.'),
  ],
  'residencia-excepcion-trabajo': [
    fee(10.94, 'Tasa 052 - autorización de residencia.'),
    fee(16.08, 'TIE - tarjeta de identidad de extranjero.'),
  ],
  'telework-nomad-visa': [
    fee(73.26, 'Tasa 038 - autorización de residencia e trabalho Ley 14/2013 (nómada digital), via UGE.'),
    fee(16.08, 'TIE - tarjeta de identidad de extranjero.'),
  ],
  'highly-qualified-worker-visa': [
    fee(73.26, 'Tasa 038 - autorización Ley 14/2013 (profesional altamente cualificado), via UGE.'),
    fee(16.08, 'TIE - tarjeta de identidad de extranjero.'),
  ],
  'intra-company-transfer-visa': [
    fee(73.26, 'Tasa 038 - autorización Ley 14/2013 (traslado intraempresarial), via UGE.'),
    fee(16.08, 'TIE - tarjeta de identidad de extranjero.'),
  ],
}

const d: CountryData = readCurrent('es')!
for (const v of d.visaTypes) {
  if (FEES[v.id]) v.process.fees = FEES[v.id]!.map((f) => ({ ...f }))
}
d.reliability.knownIssues = d.reliability.knownIssues.filter((s) => !s.startsWith('Taxas (18/64/73)'))
d.reliability.knownIssues.push(
  'Taxas 2026 mapeadas por código (modelo 790, BOE-A-2025-12056): regime geral tasa 062 trabajo €203,84 (€407,71 se ≥2×SMI) + tasa 052 residencia €10,94 + TIE €16,08; Ley 14/2013 (nômade/altamente qualificado/ICT) tasa 038 ~€73,26 + TIE €16,08. A taxa do visto consular (MNE) é separada.',
)
writeCurrent('es', d)
console.log('[ok] es: taxas 2026 mapeadas por visto')

// patch durabilidade: substitui as fees dos vistos correspondentes
const path = join(import.meta.dir, 'patches', 'es.json')
const patch = JSON.parse(readFileSync(path, 'utf-8')) as Record<string, any>
for (const [id, fees] of Object.entries(FEES)) {
  if (patch[id]) {
    patch[id].process = patch[id].process ?? {}
    patch[id].process.fees = fees.map((f) => ({ ...f }))
  }
}
writeFileSync(path, JSON.stringify(patch, null, 2) + '\n', 'utf-8')
console.log('[ok] patches/es.json: fees sincronizadas')
