#!/usr/bin/env bun
/**
 * Itens estruturais da auditoria 2026 (ver docs/audit-2026.md):
 *  - BE: cria o visto EU Blue Card (estava ausente)
 *  - IE: cria o Seasonal Employment Permit (novo, Employment Permits Act 2024)
 *  - IT: registra o Decreto Flussi 2026 em recentChanges + nota no lavoro-subordinato
 * Adiciona os vistos novos tanto em data/current (ao vivo) quanto em
 * scripts/patches (para o cron recriar). Rode `bun run validate` depois.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { readCurrent, writeCurrent } from '@/storage/snapshot'
import type { CountryData, VisaType } from '@/extractors/schema'

const PATCH_DIR = join(import.meta.dir, 'patches')

const BE_BLUE_CARD: VisaType = {
  id: 'eu-blue-card',
  name: 'Cartão Azul UE',
  nameOriginal: 'European Blue Card / Carte bleue européenne / Europese blauwe kaart',
  description:
    'Autorização única para trabalhadores altamente qualificados com diploma de ensino superior (ou experiência equivalente) e oferta de emprego que pague acima do limiar da região onde o trabalho é exercido. Caminho mais rápido para residência de longa duração e mobilidade dentro da UE.',
  eligibility: [
    'Diploma de ensino superior reconhecido ou 5 anos de experiência profissional equivalente',
    'Contrato de trabalho de pelo menos 6 meses na Bélgica',
    'Salário bruto acima do limiar da região (Bruxelas, Valônia ou Flandres)',
  ],
  requirements: {
    documents: [
      { name: 'Passaporte válido', description: 'Validade compatível com a duração do contrato', isCritical: true },
      { name: 'Diploma de ensino superior reconhecido', description: 'Equivalência pode ser exigida pela região', isCritical: true },
      { name: 'Contrato de trabalho assinado', description: 'Mínimo de 6 meses, com salário acima do limiar regional', isCritical: true },
    ],
    incomeRequirement: {
      amount: 4748,
      currency: 'EUR',
      period: 'monthly',
      notes: 'Limiar de Bruxelas 2026 (€4.748/mês). Valônia: €68.815/ano. Flandres: €63.586/ano. A Bélgica define o limiar pela região onde o trabalho é exercido.',
    },
    qualificationsRequired: ['Diploma de ensino superior ou experiência profissional equivalente (5 anos)'],
    languageRequired: null,
  },
  process: {
    steps: [
      { order: 1, name: 'Empregador inicia o pedido', description: 'O empregador belga solicita a autorização única (single permit) na categoria Blue Card junto à região onde o trabalho será exercido.', estimatedDays: null },
      { order: 2, name: 'Decisão regional + federal', description: 'A região avalia o emprego/salário e o nível federal emite a autorização de residência.', estimatedDays: null },
      { order: 3, name: 'Visto D e chegada', description: 'Com a aprovação, o trabalhador solicita o visto D no consulado belga no Brasil e registra-se na comuna ao chegar.', estimatedDays: null },
    ],
    estimatedDuration: '2 a 4 meses',
    fees: [
      { amount: 152, currency: 'EUR', period: 'one-time', notes: 'Redevance federal 2026. A Flandres cobra taxa regional adicional (~€200-250) desde 01/01/2026.' },
    ],
    applicationLocation: 'ambos',
  },
  rights: {
    canWork: true,
    canBringFamily: true,
    canChangeEmployer: false,
    pathToResidency: { yearsRequired: 5, conditions: [], summary: 'Após 5 anos de residência legal na UE como Blue Card (período cumulável em vários países), residência de longa duração.' },
    pathToCitizenship: { yearsRequired: 5, conditions: [], summary: 'Naturalização belga em geral após 5 anos de residência legal e integração.' },
  },
  relevanceForDelivery: 'indirect',
  notes:
    'Limiares 2026 por região: Bruxelas €4.748/mês; Valônia €68.815/ano; Flandres €63.586/ano (a confirmar com Statbel). É a rota principal para qualificados e não estava coberta antes da auditoria 2026.',
}

const IE_SEASONAL: VisaType = {
  id: 'seasonal-employment-permit',
  name: 'Permissão de Trabalho Sazonal',
  nameOriginal: 'Seasonal Employment Permit',
  description:
    'Permite a trabalhadores de fora do EEE atuar até 7 meses por ano civil em ocupações sazonais recorrentes (ex: agricultura, horticultura), para empregadores pré-aprovados como Approved Seasonal Employer. Criado pelo Employment Permits Act 2024.',
  eligibility: [
    'Oferta de emprego sazonal de um Approved Seasonal Employer',
    'Ocupação na lista de trabalhos sazonais elegíveis',
    'Estadia limitada a 7 meses por ano civil',
  ],
  requirements: {
    documents: [
      { name: 'Passaporte válido', description: 'Validade compatível com o período sazonal', isCritical: true },
      { name: 'Oferta de emprego sazonal', description: 'De empregador pré-aprovado pelo DETE', isCritical: true },
    ],
    incomeRequirement: null,
    qualificationsRequired: [],
    languageRequired: null,
  },
  process: {
    steps: [
      { order: 1, name: 'Empregador pré-aprovado', description: 'O empregador precisa estar registrado como Approved Seasonal Employer junto ao DETE (aprovação anual).', estimatedDays: null },
      { order: 2, name: 'Pedido da permissão', description: 'O empregador ou o trabalhador solicita o Seasonal Employment Permit ao DETE.', estimatedDays: null },
      { order: 3, name: 'Entrada e trabalho', description: 'Com a permissão, o trabalhador entra na Irlanda e atua na função sazonal por até 7 meses no ano civil.', estimatedDays: null },
    ],
    estimatedDuration: 'algumas semanas',
    fees: [],
    applicationLocation: 'origem',
  },
  rights: {
    canWork: true,
    canBringFamily: false,
    canChangeEmployer: false,
    pathToResidency: null,
    pathToCitizenship: null,
  },
  relevanceForDelivery: 'low',
  notes:
    'Novo (Employment Permits Act 2024, em vigor desde fev/2025). Até 7 meses por ano civil. Salário ao menos o mínimo nacional (€14,15/h em 2026). O empregador precisa de pré-aprovação anual. Valor da taxa a confirmar no DETE.',
}

function addVisa(d: CountryData, visa: VisaType): void {
  if (d.visaTypes.some((v) => v.id === visa.id)) return
  d.visaTypes.push(visa)
}

function patchEntryFromVisa(visa: VisaType): Record<string, unknown> {
  const { id: _id, ...rest } = visa
  return rest
}

function addToPatch(cc: string, visa: VisaType): void {
  const path = join(PATCH_DIR, `${cc}.json`)
  const patch = JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>
  if (!patch[visa.id]) patch[visa.id] = patchEntryFromVisa(visa)
  writeFileSync(path, JSON.stringify(patch, null, 2) + '\n', 'utf-8')
}

// ---- BE ----
{
  const d = readCurrent('be')!
  addVisa(d, BE_BLUE_CARD)
  const ki = d.reliability.knownIssues.filter((s) => !s.startsWith('GAP: falta a EU Blue Card'))
  ki.push('EU Blue Card adicionada na auditoria 2026 (limiares por região: Bruxelas €4.748/mês, Valônia €68.815/ano, Flandres €63.586/ano).')
  d.reliability.knownIssues = ki
  writeCurrent('be', d)
  addToPatch('be', BE_BLUE_CARD)
  console.log('[ok] be: EU Blue Card adicionada')
}

// ---- IE ----
{
  const d = readCurrent('ie')!
  addVisa(d, IE_SEASONAL)
  d.reliability.knownIssues.push('Seasonal Employment Permit adicionado na auditoria 2026 (taxa a confirmar no DETE).')
  writeCurrent('ie', d)
  addToPatch('ie', IE_SEASONAL)
  console.log('[ok] ie: Seasonal Employment Permit adicionado')
}

// ---- IT ----
{
  const d = readCurrent('it')!
  const change = {
    date: '2026-02-16',
    title: 'Decreto Flussi 2026: cotas e click days',
    summary:
      'Programação trienal 2026-2028 (DPCM 02/10/2025). Cota total de 164.850 ingressos de trabalhadores não-UE em 2026: 76.200 trabalho subordinado não sazonal (incl. 13.600 assistência familiar), 650 autônomo, 88.000 sazonal. Click days em 9, 16 e 18 de fevereiro de 2026.',
    severity: 'major' as const,
    affects: ['lavoro-subordinato', 'lavoro-autonomo'],
    sourceUrl:
      'https://www.lavoro.gov.it/notizie/pagine/flussi-2026-attribuite-le-quote-per-lavoro-subordinato-non-stagionale-click-day-il-16-febbraio',
  }
  if (!d.recentChanges.some((c) => c.title === change.title)) d.recentChanges.push(change)
  d.recentChanges.sort((a, b) => b.date.localeCompare(a.date))
  const sub = d.visaTypes.find((v) => v.id === 'lavoro-subordinato')
  if (sub) {
    const extra = ' Ingresso via Decreto Flussi 2026 (cota de 76.200 para subordinado não sazonal; click day 16/02/2026).'
    if (sub.notes && !sub.notes.includes('Decreto Flussi 2026')) sub.notes = sub.notes + extra
    else if (!sub.notes) sub.notes = extra.trim()
  }
  d.reliability.knownIssues = d.reliability.knownIssues.filter((s) => !s.startsWith('ESTRUTURAL Decreto Flussi'))
  d.reliability.knownIssues.push('Decreto Flussi 2026 registrado em recentChanges (cotas + click days fev/2026).')
  writeCurrent('it', d)
  console.log('[ok] it: Decreto Flussi 2026 registrado')
}

console.log('\nConcluído. Rode: bun run validate')
