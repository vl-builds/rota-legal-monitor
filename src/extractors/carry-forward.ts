import type { CountryData } from '@/extractors/schema'

/**
 * O LLM omite listas inteiras de um ciclo para o outro (eligibility, documents,
 * steps, acordos bilaterais) e o extractor as grava vazias, apagando conteudo
 * curado. Lista vazia nao e informacao: quando a extracao nova nao traz nada e
 * o snapshot anterior trazia, o anterior vence. knownIssues segue a mesma regra,
 * preservando as limitacoes declaradas das auditorias.
 */
export function carryForwardFromPrevious(next: CountryData, previous: CountryData | null): void {
  if (!previous) return

  const keep = <T>(fresh: T[] | undefined | null, old: T[] | undefined | null): T[] =>
    fresh && fresh.length > 0 ? fresh : (old ?? [])

  next.forBrazilians.specialAgreements = keep(
    next.forBrazilians.specialAgreements,
    previous.forBrazilians?.specialAgreements,
  )

  const auto = /URL\(s\) falharam na extracao/
  const carried = (previous.reliability.knownIssues ?? []).filter((i) => !auto.test(i))
  const fresh = next.reliability.knownIssues ?? []
  next.reliability.knownIssues = [...carried, ...fresh.filter((i) => !carried.includes(i))]

  const prevById = new Map(previous.visaTypes.map((v) => [v.id, v]))
  for (const visa of next.visaTypes) {
    const old = prevById.get(visa.id)
    if (!old) continue
    visa.eligibility = keep(visa.eligibility, old.eligibility)
    visa.requirements.documents = keep(visa.requirements.documents, old.requirements?.documents)
    visa.process.steps = keep(visa.process.steps, old.process?.steps)
    visa.process.fees = keep(visa.process.fees, old.process?.fees)
    if (!visa.notes && old.notes) visa.notes = old.notes
  }
}
