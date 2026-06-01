#!/usr/bin/env bun
/**
 * Taxas AIMA 2026 de Portugal, confirmadas no PDF oficial (Tabela de Taxas,
 * Portaria 307/2023, última atualização 26.02.2026, canal digital):
 *   - receção e análise da AR: €99,80 (substitui o €83 antigo e o €320 do D8)
 *   - título de residência: €59,40 (substitui o €28 antigo)
 * Descoberta relevante: brasileiros (CPLP) são ISENTOS das taxas de concessão e
 * renovação de residência — pagam só receção e análise + título.
 */
import { readCurrent, writeCurrent } from '@/storage/snapshot'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const d = readCurrent('pt')!
for (const v of d.visaTypes) {
  for (const f of v.process.fees) {
    if (f.amount === 83) { f.amount = 99.8; f.notes = 'Receção e análise da Autorização de Residência (AIMA 2026, canal digital). Fonte: Tabela de Taxas Portaria 307/2023 (atual. 26.02.2026).' }
    else if (f.amount === 320) { f.amount = 99.8; f.notes = 'Receção e análise da Autorização de Residência (AIMA 2026, canal digital).' }
    else if (f.amount === 28) { f.amount = 59.4; f.notes = 'Título de residência / impressos (AIMA 2026, canal digital).' }
  }
}

const sub = d.visaTypes.find((v) => v.id === 'work-subordinate-with-visa')
if (sub) {
  const cplp = ' Brasileiros (CPLP) são ISENTOS das taxas de concessão e renovação de residência — pagam apenas a receção e análise (€99,80) e o título de residência (€59,40), canal digital (Tabela AIMA 2026).'
  if (sub.notes && !sub.notes.includes('CPLP')) sub.notes += cplp
  else if (!sub.notes) sub.notes = cplp.trim()
}

d.reliability.knownIssues = d.reliability.knownIssues
  .filter((s) => !s.includes('Taxa AIMA') && !s.startsWith('Taxa visto D consular'))
d.reliability.knownIssues.push(
  'Taxas AIMA 2026 confirmadas no PDF oficial (Portaria 307/2023, atual. 26.02.2026, canal digital): receção e análise AR €99,80; concessão AR temporária €85,80; título €59,40; Cartão Azul receção €126,90 / título €120,40; dispensa de visto consular €230,40. Taxa de visto D consular (MNE) €110.',
  'CPLP: brasileiros são ISENTOS das taxas de concessão/renovação de residência (pagam só receção e análise + título). Fonte: Tabela AIMA pág. 5.',
)
writeCurrent('pt', d)
console.log('[ok] pt: taxas AIMA 2026 + isenção CPLP aplicadas')

// patch durabilidade
const path = join(import.meta.dir, 'patches', 'pt.json')
const patch = JSON.parse(readFileSync(path, 'utf-8')) as Record<string, any>
for (const entry of Object.values(patch)) {
  const fees = entry?.process?.fees
  if (!Array.isArray(fees)) continue
  for (const f of fees) {
    if (f?.amount === 83 || f?.amount === 320) f.amount = 99.8
    else if (f?.amount === 28) f.amount = 59.4
  }
}
writeFileSync(path, JSON.stringify(patch, null, 2) + '\n', 'utf-8')
console.log('[ok] patches/pt.json: taxas sincronizadas')
