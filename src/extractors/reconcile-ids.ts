import type { PartialVisaType } from './partial-schema'

// Reconciliacao de IDs de visto entre ciclos de extracao.
//
// A extracao por LLM e nao-deterministica e troca os IDs dos vistos de um mes
// para o outro (ex: "talent-empresa-inovante" -> "talent-entreprise-innovante").
// Como o sistema de patches e o merge sao chaveados por ID, esse churn quebra o
// enriquecimento e gera paginas orfas. Esta etapa remapeia cada visto extraido
// para o ID canonico do snapshot anterior quando ha match, mantendo os IDs
// estaveis. Vistos sem match sao tratados como genuinamente novos e reportados.

export interface CanonicalEntry {
  id: string
  name: string
  nameOriginal: string
}

export interface ReconcileReport {
  remapped: Array<{ from: string; to: string; via: 'exact' | 'name'; score: number }>
  newVisas: Array<{ id: string; name: string }>
  mergedDuplicates: Array<{ keptId: string; droppedId: string }>
}

// Limiares de similaridade. Conservadores de proposito: um falso match remapeia
// o visto errado e corrompe dados, entao preferimos precisao a cobertura. Quando
// em duvida, o visto vira "novo" (patch nao aplica) e a trava do cron sinaliza.
const JACCARD_MIN = 0.5
const BIGRAM_MIN = 0.72

const STOPWORDS = new Set([
  // gramaticais PT/ES/FR/IT/EN/DE
  'de', 'da', 'do', 'das', 'dos', 'e', 'para', 'com', 'sem', 'a', 'o', 'as', 'os',
  'um', 'uma', 'the', 'of', 'for', 'and', 'to', 'le', 'la', 'les', 'du', 'des',
  'un', 'une', 'pour', 'et', 'en', 'der', 'die', 'das', 'und', 'fur', 'el', 'los',
  'las', 'y', 'con', 'di', 'per', 'ed', 'als',
  // generic-os de dominio que nao distinguem um visto de outro
  'visa', 'visto', 'permit', 'permis', 'permiso', 'card', 'carte', 'mention',
])

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function normalizeName(s: string): string {
  return stripAccents(s.toLowerCase())
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function meaningfulTokens(s: string): Set<string> {
  return new Set(
    normalizeName(s)
      .split(' ')
      .filter((t) => t.length > 1 && !STOPWORDS.has(t)),
  )
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  return inter / (a.size + b.size - inter)
}

function bigrams(s: string): Set<string> {
  const norm = normalizeName(s).replace(/ /g, '')
  const grams = new Set<string>()
  for (let i = 0; i < norm.length - 1; i++) grams.add(norm.slice(i, i + 2))
  return grams
}

// Coeficiente de Sorensen-Dice sobre bigramas de caractere. Captura variacoes de
// grafia entre idiomas (ex: "inovante" vs "innovante").
function bigramDice(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const g of a) if (b.has(g)) inter++
  return (2 * inter) / (a.size + b.size)
}

// Similaridade entre dois vistos, tomando o melhor sinal entre os pares de campos
// (name e nameOriginal). nameOriginal costuma ser o mais estavel por estar sempre
// no idioma da fonte.
function visaSimilarity(
  a: { name: string; nameOriginal: string },
  b: { name: string; nameOriginal: string },
): { jaccard: number; bigram: number } {
  const aFields = [a.nameOriginal, a.name]
  const bFields = [b.nameOriginal, b.name]
  let bestJ = 0
  let bestB = 0
  for (const af of aFields) {
    const at = meaningfulTokens(af)
    const ab = bigrams(af)
    for (const bf of bFields) {
      bestJ = Math.max(bestJ, jaccard(at, meaningfulTokens(bf)))
      bestB = Math.max(bestB, bigramDice(ab, bigrams(bf)))
    }
  }
  return { jaccard: bestJ, bigram: bestB }
}

function isMatch(sim: { jaccard: number; bigram: number }): boolean {
  return sim.jaccard >= JACCARD_MIN || sim.bigram >= BIGRAM_MIN
}

// Pontuacao combinada para escolher o melhor candidato quando ha varios acima do
// limiar.
function matchScore(sim: { jaccard: number; bigram: number }): number {
  return Math.max(sim.jaccard, sim.bigram)
}

export function reconcileVisaIds(
  extracted: PartialVisaType[],
  registry: CanonicalEntry[],
): { visas: PartialVisaType[]; report: ReconcileReport } {
  const report: ReconcileReport = { remapped: [], newVisas: [], mergedDuplicates: [] }
  const byId = new Map(registry.map((e) => [e.id, e]))
  const claimed = new Set<string>() // ids canonicos ja atribuidos neste ciclo
  const assigned = new Set<string>() // ids finais ja usados na saida
  const out: PartialVisaType[] = []

  for (const visa of extracted) {
    let finalId = visa.id

    if (byId.has(visa.id) && !claimed.has(visa.id)) {
      // O LLM reutilizou o ID canonico. Nada a fazer.
      claimed.add(visa.id)
    } else {
      // Procura o melhor match por nome entre os canonicos ainda nao reivindicados.
      let best: { entry: CanonicalEntry; score: number } | null = null
      for (const entry of registry) {
        if (claimed.has(entry.id)) continue
        const sim = visaSimilarity(visa, entry)
        if (!isMatch(sim)) continue
        const score = matchScore(sim)
        if (!best || score > best.score) best = { entry, score }
      }
      if (best) {
        finalId = best.entry.id
        claimed.add(best.entry.id)
        report.remapped.push({ from: visa.id, to: finalId, via: 'name', score: Number(best.score.toFixed(3)) })
      } else {
        report.newVisas.push({ id: visa.id, name: visa.name })
      }
    }

    if (assigned.has(finalId)) {
      // Dois vistos extraidos colidem no mesmo ID canonico. Mantem o primeiro.
      report.mergedDuplicates.push({ keptId: finalId, droppedId: visa.id })
      continue
    }
    assigned.add(finalId)
    out.push(finalId === visa.id ? visa : { ...visa, id: finalId })
  }

  return { visas: out, report }
}
