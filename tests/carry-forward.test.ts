import { describe, expect, test } from 'bun:test'
import { carryForwardFromPrevious } from '@/extractors/carry-forward'
import type { CountryData } from '@/extractors/schema'

const visa = (id: string, over: Record<string, unknown> = {}) =>
  ({
    id,
    name: id,
    eligibility: [],
    notes: '',
    requirements: { documents: [] },
    process: { steps: [], fees: [] },
    ...over,
  }) as any

const country = (over: Record<string, unknown> = {}) =>
  ({
    forBrazilians: { specialAgreements: [] },
    visaTypes: [],
    reliability: { knownIssues: [] },
    ...over,
  }) as unknown as CountryData

describe('carryForwardFromPrevious', () => {
  test('devolve listas que a extracao nova zerou', () => {
    const prev = country({
      forBrazilians: { specialAgreements: [{ name: 'Tratado de Amizade' }] },
      visaTypes: [
        visa('d7', {
          eligibility: ['aposentados'],
          notes: 'nota curada',
          requirements: { documents: [{ name: 'passaporte' }] },
          process: { steps: [{ order: 1 }], fees: [{ amount: 90 }] },
        }),
      ],
      reliability: { knownIssues: ['auditoria 2026: taxa confirmada'] },
    })
    const next = country({ visaTypes: [visa('d7')] })

    carryForwardFromPrevious(next, prev)

    expect(next.forBrazilians.specialAgreements).toHaveLength(1)
    expect(next.reliability.knownIssues).toEqual(['auditoria 2026: taxa confirmada'])
    const d7 = next.visaTypes[0]!
    expect(d7.eligibility).toEqual(['aposentados'])
    expect(d7.notes).toBe('nota curada')
    expect(d7.requirements.documents).toHaveLength(1)
    expect(d7.process.steps).toHaveLength(1)
    expect(d7.process.fees).toHaveLength(1)
  })

  test('nao sobrescreve o que a extracao nova trouxe', () => {
    const prev = country({ visaTypes: [visa('d7', { eligibility: ['antigo'] })] })
    const next = country({ visaTypes: [visa('d7', { eligibility: ['novo'] })] })

    carryForwardFromPrevious(next, prev)

    expect(next.visaTypes[0]!.eligibility).toEqual(['novo'])
  })

  test('descarta o aviso automatico de URL falhada e nao duplica knownIssues', () => {
    const prev = country({ reliability: { knownIssues: ['2 URL(s) falharam na extracao', 'real'] } })
    const next = country({ reliability: { knownIssues: ['real', 'novo'] } })

    carryForwardFromPrevious(next, prev)

    expect(next.reliability.knownIssues).toEqual(['real', 'novo'])
  })

  test('sem snapshot anterior nao altera nada', () => {
    const next = country({ visaTypes: [visa('d7')] })
    carryForwardFromPrevious(next, null)
    expect(next.visaTypes[0]!.eligibility).toEqual([])
  })
})
