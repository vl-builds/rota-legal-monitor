#!/usr/bin/env bun
/**
 * Mudanças estruturais (conteúdo, não só número) da auditoria 2026:
 *  - PT: Lei 61/2025 (fim da manifestação de interesse) + nova tabela de taxas
 *        AIMA em recentChanges; nota no visto de dispensa de visto.
 *  - ES: novo Regulamento de Estrangeiria (RD 1155/2024) em recentChanges.
 */
import { readCurrent, writeCurrent } from '@/storage/snapshot'
import type { CountryData } from '@/extractors/schema'

type Change = CountryData['recentChanges'][number]

function addChange(d: CountryData, c: Change): void {
  if (!d.recentChanges.some((x) => x.title === c.title)) d.recentChanges.push(c)
  d.recentChanges.sort((a, b) => b.date.localeCompare(a.date))
}

// ---- Portugal ----
{
  const d = readCurrent('pt')!
  addChange(d, {
    date: '2025-10-23',
    title: 'Lei 61/2025: nova lei de imigração',
    summary:
      'Fim da manifestação de interesse: já não é possível regularizar a partir de Portugal sem visto prévio emitido na origem. O visto de procura de trabalho passou a ser só para qualificados (meios ~3x RMMG, regra dos 120 dias e bloqueio de 1 ano). Reagrupamento familiar mais exigente e decisão da AIMA em até 9 meses.',
    severity: 'major',
    affects: ['work-job-search', 'autorizacao-residencia-atividade-subordinada-dispensa-visto'],
    sourceUrl: 'https://vistos.mne.gov.pt/pt/vistos-nacionais/documentacao-instrutoria/procura-de-trabalho',
  })
  addChange(d, {
    date: '2026-03-01',
    title: 'Nova tabela de taxas da AIMA',
    summary:
      'Tabela de Taxas (Portaria 307/2023, atualizada em 26.02.2026): receção e análise da Autorização de Residência €99,80 (canal digital), título €59,40. Brasileiros (CPLP) são isentos das taxas de concessão e renovação de residência.',
    severity: 'minor',
    affects: [],
    sourceUrl: 'https://aima.gov.pt/pt/noticias/atualizacao-da-tabela-de-taxas',
  })
  const disp = d.visaTypes.find((v) => v.id === 'autorizacao-residencia-atividade-subordinada-dispensa-visto')
  if (disp) {
    const note = ' ATENÇÃO: a Lei 61/2025 (em vigor 23/10/2025) acabou com a manifestação de interesse — não é mais possível regularizar a partir de Portugal sem visto prévio emitido no consulado de origem.'
    if (disp.notes && !disp.notes.includes('Lei 61/2025')) disp.notes += note
    else if (!disp.notes) disp.notes = note.trim()
  }
  writeCurrent('pt', d)
  console.log('[ok] pt: Lei 61/2025 + tabela AIMA em recentChanges')
}

// ---- Espanha ----
{
  const d = readCurrent('es')!
  addChange(d, {
    date: '2025-05-20',
    title: 'Novo Regulamento de Estrangeiria (RD 1155/2024)',
    summary:
      'Em vigor desde 20/05/2025, o RD 1155/2024 reformou arraigos, vistos e residências e revogou o RD 557/2011. O visto de busca de emprego foi ampliado de 3 meses para 1 ano. Parte do conteúdo de processos pode ainda refletir o regulamento antigo e precisa de revisão.',
    severity: 'major',
    affects: [],
    sourceUrl: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2024-24099',
  })
  d.reliability.knownIssues = d.reliability.knownIssues.filter((s) => !s.startsWith('ESTRUTURAL: RD 1155/2024'))
  d.reliability.knownIssues.push('RD 1155/2024 registrado em recentChanges. Revisar conteúdo dos processos (pode refletir o RD 557/2011 antigo). Busca de emprego agora 1 ano.')
  writeCurrent('es', d)
  console.log('[ok] es: RD 1155/2024 em recentChanges')
}

console.log('\nConcluído. Rode: bun run validate')
