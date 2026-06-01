import { describe, it, expect } from 'bun:test'
import { reconcileVisaIds, normalizeName, type CanonicalEntry } from '@/extractors/reconcile-ids'
import type { PartialVisaType } from '@/extractors/partial-schema'

// Constroi um PartialVisaType minimo. reconcileVisaIds so le id/name/nameOriginal
// e preserva o resto via spread, entao o restante pode ficar vazio.
function v(id: string, name: string, nameOriginal: string): PartialVisaType {
  return {
    id,
    name,
    nameOriginal,
    description: 'x',
    eligibility: [],
    requirements: { documents: [], incomeRequirement: null, qualificationsRequired: [], languageRequired: null },
    process: { steps: [], estimatedDuration: null, fees: [], applicationLocation: 'origem' },
    rights: {
      canWork: true, canBringFamily: false, canChangeEmployer: false,
      pathToResidency: null, pathToCitizenship: null,
    },
    relevanceForDelivery: 'indirect',
    notes: null,
  } as unknown as PartialVisaType
}

function reg(id: string, name: string, nameOriginal: string): CanonicalEntry {
  return { id, name, nameOriginal }
}

describe('normalizeName', () => {
  it('remove acentos e pontuacao', () => {
    expect(normalizeName('Salarié d’une Entreprise Innovante')).toBe('salarie d une entreprise innovante')
    expect(normalizeName('Cartão Azul Européu')).toBe('cartao azul europeu')
  })
})

describe('reconcileVisaIds', () => {
  it('mantem o id quando o LLM reutiliza o canonico (match exato)', () => {
    const registry = [reg('highly-skilled-migrant', 'Migrante Altamente Qualificado', 'Highly Skilled Migrant')]
    const { visas, report } = reconcileVisaIds(
      [v('highly-skilled-migrant', 'Migrante Altamente Qualificado', 'Highly Skilled Migrant')],
      registry,
    )
    expect(visas[0]!.id).toBe('highly-skilled-migrant')
    expect(report.remapped).toHaveLength(0)
    expect(report.newVisas).toHaveLength(0)
  })

  it('remapeia id churned de volta ao canonico por nome (caso fr talent)', () => {
    const registry = [
      reg('talent-empresa-inovante', 'Talento - Assalariado de Empresa Inovante', "Passeport Talent - Salarié d'une entreprise innovante"),
    ]
    const { visas, report } = reconcileVisaIds(
      [v('talent-entreprise-innovante', 'Talento Empresa Inovadora', "Carte Talent - Salarié d'une Entreprise Innovante")],
      registry,
    )
    expect(visas[0]!.id).toBe('talent-empresa-inovante')
    expect(report.remapped).toHaveLength(1)
    expect(report.remapped[0]!.via).toBe('name')
  })

  it('trata visto genuinamente novo como novo', () => {
    const registry = [reg('skilled-worker-visa', 'Trabalhador Qualificado', 'Skilled Worker Visa')]
    const { visas, report } = reconcileVisaIds(
      [v('orientation-year', 'Ano de Orientacao', 'Orientation Year Permit')],
      registry,
    )
    expect(visas[0]!.id).toBe('orientation-year')
    expect(report.newVisas).toHaveLength(1)
    expect(report.remapped).toHaveLength(0)
  })

  it('nao casa vistos distintos com nomes diferentes (conservador)', () => {
    const registry = [reg('skilled-worker-visa', 'Trabalhador Qualificado', 'Skilled Worker Visa')]
    const { visas, report } = reconcileVisaIds(
      [v('eu-blue-card', 'Cartao Azul UE', 'EU Blue Card')],
      registry,
    )
    expect(visas[0]!.id).toBe('eu-blue-card')
    expect(report.newVisas).toHaveLength(1)
  })

  it('funde duplicatas quando o LLM repete o mesmo id', () => {
    const registry = [reg('start-up-personnel', 'Pessoal Essencial de Startup', 'Start-up Essential Personnel')]
    const { visas, report } = reconcileVisaIds(
      [
        v('start-up-personnel', 'Pessoal Essencial de Startup', 'Start-up Essential Personnel'),
        v('start-up-personnel', 'Pessoal Essencial de Startup (dup)', 'Start-up Essential Personnel'),
      ],
      registry,
    )
    expect(visas).toHaveLength(1)
    expect(visas[0]!.id).toBe('start-up-personnel')
    expect(report.mergedDuplicates).toHaveLength(1)
  })

  it('conservador: visto extra com id distinto e nome parecido sobrevive como novo, nao some', () => {
    // Evita descartar um visto real so porque parece com outro ja reivindicado.
    const registry = [reg('start-up-personnel', 'Pessoal Essencial de Startup', 'Start-up Essential Personnel')]
    const { visas } = reconcileVisaIds(
      [
        v('start-up-personnel', 'Pessoal Essencial de Startup', 'Start-up Essential Personnel'),
        v('startup-essential-personnel', 'Pessoal essencial em start-up', 'Essential personnel for a start-up'),
      ],
      registry,
    )
    expect(visas).toHaveLength(2)
  })

  it('sem registro (pais novo), mantem todos os ids', () => {
    const { visas, report } = reconcileVisaIds([v('a', 'A', 'A'), v('b', 'B', 'B')], [])
    expect(visas.map((x) => x.id)).toEqual(['a', 'b'])
    expect(report.newVisas).toHaveLength(2)
  })
})
