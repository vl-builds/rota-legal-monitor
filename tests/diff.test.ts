import { describe, it, expect } from 'bun:test'
import { diffSnapshots } from '@/diff/detect-changes'
import type { CountryData, VisaType, MoneyAmount } from '@/extractors/schema'

// ---- fixtures ----------------------------------------------------------------

function makeVisa(overrides: Partial<VisaType> = {}): VisaType {
  return {
    id: 'test-visa',
    name: 'Test Visa',
    nameOriginal: 'Test Visa Original',
    description: 'Visto de teste',
    eligibility: ['graduacao completa'],
    requirements: {
      documents: [],
      incomeRequirement: null,
      qualificationsRequired: [],
      languageRequired: null,
    },
    process: {
      steps: [{ order: 1, name: 'Solicitar', description: 'Enviar requerimento', estimatedDays: 30 }],
      estimatedDuration: '30 dias',
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
    relevanceForDelivery: 'direct',
    notes: null,
    ...overrides,
  }
}

function makeSnapshot(overrides: Partial<CountryData> = {}): CountryData {
  return {
    meta: {
      country: 'nl',
      countryName: 'Holanda',
      lastUpdated: '2026-01-01T00:00:00Z',
      schemaVersion: '1.0.0',
      sources: [
        {
          url: 'https://example.com',
          fetchedAt: '2026-01-01T00:00:00Z',
          status: 'ok',
          contentLanguage: 'en',
        },
      ],
    },
    forBrazilians: {
      schengenVisaFree: true,
      maxStayDaysAsTourist: 90,
      workPermitNeeded: false,
      specialAgreements: [],
      notes: '',
    },
    visaTypes: [],
    generalRequirements: {
      passportValidity: 'Minimo 6 meses',
      proofOfFunds: null,
      healthInsurance: { required: false, mustBeLocal: false, minimumCoverage: null, notes: '' },
      cleanCriminalRecord: true,
      vaccinations: [],
    },
    recentChanges: [],
    reliability: {
      extractedBy: 'llm',
      extractionConfidence: 'medium',
      humanReviewedAt: null,
      knownIssues: [],
    },
    ...overrides,
  }
}

const EUR = (amount: number): MoneyAmount => ({
  amount,
  currency: 'EUR',
  period: 'monthly',
  notes: null,
})

// ---- sem mudancas ------------------------------------------------------------

describe('diffSnapshots sem mudancas', () => {
  it('snapshots identicos retornam hasChanges false', () => {
    const snap = makeSnapshot()
    const result = diffSnapshots(snap, snap)
    expect(result.hasChanges).toBe(false)
    expect(result.high).toHaveLength(0)
    expect(result.medium).toHaveLength(0)
    expect(result.low).toHaveLength(0)
  })

  it('preenche country e snapshotDate do snapshot mais recente', () => {
    const snap = makeSnapshot({
      meta: { ...makeSnapshot().meta, country: 'pt', lastUpdated: '2026-05-01T00:00:00Z' },
    })
    const result = diffSnapshots(snap, snap)
    expect(result.country).toBe('pt')
    expect(result.snapshotDate).toBe('2026-05-01T00:00:00Z')
  })
})

// ---- relevancia alta ---------------------------------------------------------

describe('diffSnapshots relevancia alta', () => {
  it('schengenVisaFree mudou → high', () => {
    const fb = makeSnapshot().forBrazilians
    const before = makeSnapshot({ forBrazilians: { ...fb, schengenVisaFree: true } })
    const after = makeSnapshot({ forBrazilians: { ...fb, schengenVisaFree: false } })
    const result = diffSnapshots(before, after)
    expect(result.high).toHaveLength(1)
    expect(result.high[0]!.path).toBe('forBrazilians.schengenVisaFree')
    expect(result.high[0]!.before).toBe(true)
    expect(result.high[0]!.after).toBe(false)
  })

  it('workPermitNeeded mudou → high', () => {
    const fb = makeSnapshot().forBrazilians
    const before = makeSnapshot({ forBrazilians: { ...fb, workPermitNeeded: false } })
    const after = makeSnapshot({ forBrazilians: { ...fb, workPermitNeeded: true } })
    const result = diffSnapshots(before, after)
    expect(result.high.some((c) => c.path === 'forBrazilians.workPermitNeeded')).toBe(true)
  })

  it('maxStayDaysAsTourist mudou → high', () => {
    const fb = makeSnapshot().forBrazilians
    const before = makeSnapshot({ forBrazilians: { ...fb, maxStayDaysAsTourist: 90 } })
    const after = makeSnapshot({ forBrazilians: { ...fb, maxStayDaysAsTourist: 30 } })
    const result = diffSnapshots(before, after)
    expect(result.high.some((c) => c.path === 'forBrazilians.maxStayDaysAsTourist')).toBe(true)
  })

  it('visaType adicionado → high com path visaTypes.added', () => {
    const before = makeSnapshot()
    const after = makeSnapshot({ visaTypes: [makeVisa()] })
    const result = diffSnapshots(before, after)
    const change = result.high.find((c) => c.path === 'visaTypes.added')
    expect(change).toBeDefined()
    expect(change!.after).toBe('Test Visa')
    expect(change!.before).toBeNull()
  })

  it('visaType removido → high com path visaTypes.removed', () => {
    const before = makeSnapshot({ visaTypes: [makeVisa()] })
    const after = makeSnapshot()
    const result = diffSnapshots(before, after)
    const change = result.high.find((c) => c.path === 'visaTypes.removed')
    expect(change).toBeDefined()
    expect(change!.before).toBe('Test Visa')
    expect(change!.after).toBeNull()
  })

  it('incomeRequirement do visto mudou → high', () => {
    const req = (income: MoneyAmount | null) => ({
      documents: [],
      incomeRequirement: income,
      qualificationsRequired: [],
      languageRequired: null,
    })
    const before = makeSnapshot({ visaTypes: [makeVisa({ requirements: req(EUR(4_000)) })] })
    const after = makeSnapshot({ visaTypes: [makeVisa({ requirements: req(EUR(5_000)) })] })
    const result = diffSnapshots(before, after)
    expect(result.high.some((c) => c.path.includes('incomeRequirement'))).toBe(true)
  })

  it('fees do visto mudaram → high', () => {
    const proc = makeVisa().process
    const before = makeSnapshot({ visaTypes: [makeVisa({ process: { ...proc, fees: [EUR(300)] } })] })
    const after = makeSnapshot({ visaTypes: [makeVisa({ process: { ...proc, fees: [EUR(400)] } })] })
    const result = diffSnapshots(before, after)
    expect(result.high.some((c) => c.path.includes('fees'))).toBe(true)
  })

  it('proofOfFunds mudou de valor para null → high', () => {
    const gr = makeSnapshot().generalRequirements
    const before = makeSnapshot({ generalRequirements: { ...gr, proofOfFunds: EUR(3_000) } })
    const after = makeSnapshot({ generalRequirements: { ...gr, proofOfFunds: null } })
    const result = diffSnapshots(before, after)
    expect(result.high.some((c) => c.path.includes('proofOfFunds'))).toBe(true)
  })

  it('novo recentChange major → high', () => {
    const before = makeSnapshot()
    const after = makeSnapshot({
      recentChanges: [{
        date: '2026-04-01',
        title: 'Nova lei de imigracao',
        summary: 'Requisitos de renda alterados',
        severity: 'major',
        affects: ['skilled-worker'],
        sourceUrl: 'https://example.com/lei',
      }],
    })
    const result = diffSnapshots(before, after)
    expect(result.high.some((c) => c.path.includes('recentChanges'))).toBe(true)
  })
})

// ---- relevancia media --------------------------------------------------------

describe('diffSnapshots relevancia media', () => {
  it('description do visto mudou → medium', () => {
    const before = makeSnapshot({ visaTypes: [makeVisa({ description: 'Descricao antiga' })] })
    const after = makeSnapshot({ visaTypes: [makeVisa({ description: 'Descricao nova' })] })
    const result = diffSnapshots(before, after)
    expect(result.medium.some((c) => c.path.includes('description'))).toBe(true)
    expect(result.high.some((c) => c.path.includes('description'))).toBe(false)
  })

  it('estimatedDuration mudou → medium', () => {
    const proc = makeVisa().process
    const before = makeSnapshot({ visaTypes: [makeVisa({ process: { ...proc, estimatedDuration: '30 dias' } })] })
    const after = makeSnapshot({ visaTypes: [makeVisa({ process: { ...proc, estimatedDuration: '60 dias' } })] })
    const result = diffSnapshots(before, after)
    expect(result.medium.some((c) => c.path.includes('estimatedDuration'))).toBe(true)
  })

  it('rights do visto mudaram → medium', () => {
    const before = makeSnapshot({ visaTypes: [makeVisa({ rights: { ...makeVisa().rights, canBringFamily: false } })] })
    const after = makeSnapshot({ visaTypes: [makeVisa({ rights: { ...makeVisa().rights, canBringFamily: true } })] })
    const result = diffSnapshots(before, after)
    expect(result.medium.some((c) => c.path.includes('rights'))).toBe(true)
  })

  it('eligibility do visto mudou → medium', () => {
    const before = makeSnapshot({ visaTypes: [makeVisa({ eligibility: ['req A'] })] })
    const after = makeSnapshot({ visaTypes: [makeVisa({ eligibility: ['req A', 'req B'] })] })
    const result = diffSnapshots(before, after)
    expect(result.medium.some((c) => c.path.includes('eligibility'))).toBe(true)
  })

  it('novo recentChange minor → medium', () => {
    const before = makeSnapshot()
    const after = makeSnapshot({
      recentChanges: [{
        date: '2026-04-01',
        title: 'Atualizacao de formularios',
        summary: 'Formulario atualizado',
        severity: 'minor',
        affects: ['all'],
        sourceUrl: 'https://example.com',
      }],
    })
    const result = diffSnapshots(before, after)
    expect(result.medium.some((c) => c.path.includes('recentChanges'))).toBe(true)
    expect(result.high.some((c) => c.path.includes('recentChanges'))).toBe(false)
  })

  it('passportValidity mudou → medium', () => {
    const gr = makeSnapshot().generalRequirements
    const before = makeSnapshot({ generalRequirements: { ...gr, passportValidity: '6 meses' } })
    const after = makeSnapshot({ generalRequirements: { ...gr, passportValidity: '3 meses' } })
    const result = diffSnapshots(before, after)
    expect(result.medium.some((c) => c.path.includes('passportValidity'))).toBe(true)
  })
})

// ---- relevancia baixa --------------------------------------------------------

describe('diffSnapshots relevancia baixa', () => {
  it('name do visto mudou → low (nao e high nem medium)', () => {
    const before = makeSnapshot({ visaTypes: [makeVisa({ name: 'Nome antigo' })] })
    const after = makeSnapshot({ visaTypes: [makeVisa({ name: 'Nome novo' })] })
    const result = diffSnapshots(before, after)
    expect(result.low.some((c) => c.path.includes('.name'))).toBe(true)
    expect(result.high.some((c) => c.path.includes('.name'))).toBe(false)
    expect(result.medium.some((c) => c.path.includes('.name'))).toBe(false)
  })
})

// ---- markdown ----------------------------------------------------------------

describe('diffSnapshots markdown', () => {
  it('sem mudancas inclui mensagem de ausencia', () => {
    const snap = makeSnapshot()
    const result = diffSnapshots(snap, snap)
    expect(result.markdown).toContain('Nenhuma mudanca detectada')
  })

  it('com mudancas alta inclui secao Alta relevancia', () => {
    const fb = makeSnapshot().forBrazilians
    const before = makeSnapshot({ forBrazilians: { ...fb, schengenVisaFree: true } })
    const after = makeSnapshot({ forBrazilians: { ...fb, schengenVisaFree: false } })
    const result = diffSnapshots(before, after)
    expect(result.markdown).toContain('Alta relevancia')
    expect(result.markdown).toContain('schengenVisaFree')
  })

  it('inclui o codigo do pais em maiusculas no titulo', () => {
    const snap = makeSnapshot()
    const result = diffSnapshots(snap, snap)
    expect(result.markdown).toContain('NL')
  })
})
