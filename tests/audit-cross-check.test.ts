import { describe, it, expect } from 'bun:test'
import { criticalValues, annotateKnownIssues, type Finding } from '@/audit/cross-check'
import type { CountryData } from '@/extractors/schema'

function fakeData(over: Partial<CountryData> = {}): CountryData {
  return {
    generalRequirements: {
      minimumWage: { amount: 920, currency: 'EUR', period: 'monthly' },
      proofOfFunds: null,
    },
    visaTypes: [
      {
        id: 'work-x',
        requirements: { incomeRequirement: { amount: 1000, currency: 'EUR', period: 'monthly' } },
        process: { fees: [{ amount: 90, currency: 'EUR', period: 'one-time' }, { amount: 0, currency: 'EUR' }] },
      },
    ],
    reliability: { knownIssues: [] },
    ...over,
  } as unknown as CountryData
}

describe('criticalValues', () => {
  it('extrai salario minimo, renda e taxas (ignora dinheiro nulo)', () => {
    const vals = criticalValues(fakeData())
    const fields = vals.map((v) => v.field)
    expect(fields).toContain('generalRequirements.minimumWage')
    expect(fields).not.toContain('generalRequirements.proofOfFunds') // null
    expect(fields).toContain('work-x.incomeRequirement')
    expect(fields).toContain('work-x.fees')
    const mw = vals.find((v) => v.field === 'generalRequirements.minimumWage')
    expect(mw?.value).toBe('920 EUR/monthly')
    const fees = vals.find((v) => v.field === 'work-x.fees')
    expect(fees?.value).toContain('90 EUR/one-time')
  })
})

describe('annotateKnownIssues', () => {
  it('anota só divergências, preserva manuais e substitui auto-audit antigas', () => {
    const d = fakeData({
      reliability: {
        knownIssues: ['nota manual importante', '[auto-audit 2026-05-01] velho: x'],
      } as unknown as CountryData['reliability'],
    })
    const findings: Finding[] = [
      { field: 'work-x.incomeRequirement', stored: '1000 EUR/monthly', official: '1200 EUR/monthly', status: 'divergent', note: 'subiu em 2026' },
      { field: 'generalRequirements.minimumWage', stored: '920 EUR/monthly', official: '920 EUR/monthly', status: 'ok', note: 'bate' },
      { field: 'work-x.fees', stored: '90', official: '?', status: 'unverified', note: 'fonte nao cobre' },
    ]
    const n = annotateKnownIssues(d, findings, '2026-06-02')
    expect(n).toBe(1) // só a divergente
    expect(d.reliability.knownIssues).toContain('nota manual importante') // manual preservada
    expect(d.reliability.knownIssues.some((s) => s.includes('[auto-audit 2026-05-01]'))).toBe(false) // antiga removida
    const novo = d.reliability.knownIssues.find((s) => s.startsWith('[auto-audit 2026-06-02]'))
    expect(novo).toBeDefined()
    expect(novo).toContain('work-x.incomeRequirement')
    expect(novo).toContain('1200 EUR/monthly')
  })

  it('idempotente: rodar de novo não acumula', () => {
    const d = fakeData()
    const findings: Finding[] = [
      { field: 'a', stored: '1', official: '2', status: 'divergent', note: 'x' },
    ]
    annotateKnownIssues(d, findings, '2026-06-02')
    annotateKnownIssues(d, findings, '2026-06-02')
    const autos = d.reliability.knownIssues.filter((s) => s.startsWith('[auto-audit'))
    expect(autos).toHaveLength(1)
  })
})
