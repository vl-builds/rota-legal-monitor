#!/usr/bin/env bun
/**
 * Aplica as correções da auditoria 2026 (ver docs/audit-2026.md) aos
 * data/current/{cc}.json: atualiza limiares de renda e taxas de alta confiança
 * para os valores oficiais 2026, registra as divergências/itens a confirmar em
 * reliability.knownIssues (regra de verificação cruzada do CLAUDE.md) e marca
 * reliability.humanReviewedAt. Não fabrica valores: itens UNVERIFIED ficam só
 * como nota em knownIssues. Rode `bun run validate` depois.
 */
import { readCurrent, writeCurrent } from '@/storage/snapshot'
import type { CountryData, VisaType, MoneyAmount } from '@/extractors/schema'

const REVIEWED = '2026-06-02T00:00:00.000Z'

function visa(d: CountryData, id: string): VisaType | undefined {
  return d.visaTypes.find((v) => v.id === id)
}
function setIncome(d: CountryData, id: string, amount: number, notes?: string): void {
  const v = visa(d, id)
  if (!v) return
  const cur = (v.requirements.incomeRequirement as MoneyAmount | null) ?? {
    amount,
    currency: 'EUR',
    period: 'monthly',
  }
  v.requirements.incomeRequirement = {
    ...cur,
    amount,
    ...(notes ? { notes } : {}),
  } as MoneyAmount
}
function replaceFee(d: CountryData, oldAmt: number, newAmt: number): void {
  for (const v of d.visaTypes) {
    for (const f of v.process.fees) {
      if (f.amount === oldAmt) f.amount = newAmt
    }
  }
}
function setGR(d: CountryData, field: 'minimumWage' | 'proofOfFunds', amount: number | null, notes?: string): void {
  const gr = d.generalRequirements as Record<string, unknown>
  if (amount == null) {
    gr[field] = null
    return
  }
  const cur = (gr[field] as MoneyAmount | null) ?? { amount, currency: 'EUR', period: 'monthly' }
  gr[field] = { ...cur, amount, ...(notes ? { notes } : {}) }
}
function finalize(d: CountryData, issues: string[]): void {
  d.reliability.humanReviewedAt = REVIEWED
  d.reliability.knownIssues = issues
}

type Fn = (d: CountryData) => void

const UPDATES: Record<string, Fn> = {
  nl: (d) => {
    setIncome(d, 'highly-skilled-migrant', 5942, 'Limiar IND 2026 (30+): €5.942/mês bruto. <30 anos: €4.357/mês. Critério reduzido pós-zoekjaar: €3.122/mês.')
    setIncome(d, 'european-blue-card', 5942, 'Limiar IND 2026: €5.942/mês (alinhado ao HSM). Recém-graduado: €4.754/mês.')
    setIncome(d, 'intra-corporate-transferee', 5942, 'Limiar IND 2026 (30+): €5.942/mês; <30 anos: €4.357/mês.')
    setIncome(d, 'paid-employment-gvva', 2294.4, 'Salário de mercado mínimo IND 2026: €2.294,40/mês (sem subsídio de férias).')
    setIncome(d, 'paid-employment-no-gvva', 2294.4, 'Salário de mercado mínimo IND 2026: €2.294,40/mês.')
    setIncome(d, 'seasonal-work', 2294.4, 'Salário de mercado mínimo IND 2026: €2.294,40/mês.')
    replaceFee(d, 345, 423)
    finalize(d, [
      'Auditoria 2026-06-02: salário mínimo (€2.303,59/mês 01/01/2026) e proofOfFunds CURRENT; limiares de visto atualizados para 2026 (fonte ind.nl/required-amounts).',
      'Taxa IND atualizada 345→€423 (HSM/Blue Card/ICT/single permit). Researcher e orientation year: €254. A taxa MVV de €225 é obsoleta no modelo TEV (aplicação única) — revisar.',
      'researcher: limiar legal IND 2026 é €1.606,08/mês (na prática segue CAO-NU, maior); valor armazenado a revisar.',
      'self-employed (€1.400) e start-up-founder (€13.000) sem limiar fixo IND — UNVERIFIED, revisar.',
    ])
  },
  de: (d) => {
    finalize(d, [
      'Auditoria 2026-06-02: todos os valores CURRENT para 2026 (Mindestlohn €13,90/h ~€2.409/mês; EU Blue Card geral €50.700/ano, reduzida €45.934,20/ano; §19c €45.630; +45 anos €55.770; Sperrkonto/Chancenkarte €1.091/mês; taxas 75/100/147). Fonte make-it-in-germany.com, ey.com (Blue Card 2026).',
      'Higiene: registrar precisão €45.934,20 (não 45.934) e alinhar a nota de proofOfFunds para €3.828/mês.',
    ])
  },
  pt: (d) => {
    setIncome(d, 'work-job-search', 2760, 'Lei 61/2025 (23/10/2025): visto de procura de trabalho passou a ser só para QUALIFICADOS, com meios ~3x RMMG (€2.760/mês) e regra dos 120 dias + bloqueio de 1 ano. A modalidade genérica anterior (€760) foi suspensa.')
    replaceFee(d, 90, 110)
    finalize(d, [
      'Auditoria 2026-06-02: salário mínimo €920/mês (DL 139/2025) e D8 nômade digital €3.680/mês (4x RMMG) CURRENT. Corrigir notas que citam "SMN de 2024" e o erro "€3.480".',
      'ESTRUTURAL Lei 61/2025 (23/10/2025): fim da manifestação de interesse; visto de procura de trabalho só qualificado (~3x RMMG, 120 dias); reagrupamento mais exigente; decisão AIMA até 9 meses.',
      'Taxa visto D consular atualizada 90→€110. Taxa AIMA de atividade profissional subiu para ~€99,80 (tabela 01/03/2026, Portaria 307/2023); concessão ~€307,20 e taxas de AR D8/renovação a confirmar no PDF oficial AIMA — UNVERIFIED.',
      'Via CPLP (acordo de mobilidade) não detalhada — lacuna de cobertura.',
    ])
  },
  ie: (d) => {
    finalize(d, [
      'Auditoria 2026-06-02: limiares CURRENT para 2026 (vigentes desde 01/03/2026): Critical Skills €40.904, General €36.605, ICT €49.523; salário mínimo €14,15/h. Fonte enterprise.gov.ie.',
      'Corrigir nas notas/steps: CSEP rota salário alto 64.000→€68.911; setores de baixa remuneração 30.000→€32.691; Contract for Services confirmar (€40.904 vs €49.523).',
      'ESTRUTURAL: roadmap de aumentos faseados até 2030 (anúncio 02/12/2025); Seasonal Employment Permit (fev/2025) ausente; data do Employment Permits Act é 2024-09-02.',
      'sport-cultural (€30.000) e internship (€22.920): UNVERIFIED, provável desatualizado.',
    ])
  },
  au: (d) => {
    replaceFee(d, 2455, 2320)
    replaceFee(d, 1230, 1160)
    replaceFee(d, 635, 670)
    const t = visa(d, 'tss-482')
    if (t) t.nameOriginal = 'Skills in Demand visa (subclass 482)'
    finalize(d, [
      'Auditoria 2026-06-02: valores CURRENT no ciclo até 30/06/2026. Core Skills Income Threshold €AUD 76.515 → AUD 79.499 a partir de 01/07/2026; Specialist Skills 141.210 → 146.717 (01/07/2026). Reauditar após 01/07.',
      'Taxas atualizadas: 189/190 cônjuge adulto 2455→AUD 2.320 e dependente menor 1230→AUD 1.160; Working Holiday 462 635→~AUD 670.',
      'ESTRUTURAL: TSS 482 substituído pelo Skills in Demand visa (subclass 482) desde 07/12/2024 (nameOriginal atualizado); glossário deve incluir CSIT/SSIT/CSOL.',
    ])
  },
  at: (d) => {
    setGR(d, 'minimumWage', null)
    setGR(d, 'proofOfFunds', 1308.39, 'Áustria não tem salário mínimo legal (definido por convenção coletiva). Subsistência = Ausgleichszulagenrichtsatz 2026: €1.308,39/mês (solteiro), €2.064,12 (casal), +€201,88/filho.')
    setIncome(d, 'startup-founders', 30000, 'Capital mínimo €30.000 (≥50% próprio). Os €50.000 são investimento adicional que dá pontos-bônus, não requisito.')
    replaceFee(d, 160, 120)
    replaceFee(d, 150, 195)
    finalize(d, [
      'Auditoria 2026-06-02: rwr-other-key-workers €3.465/mês (2026) CURRENT. minimumWage removido (Áustria não tem mínimo legal). proofOfFunds corrigido para o Ausgleichszulagenrichtsatz 2026 (€1.308,39).',
      'startup-founders corrigido para €30.000 de capital. Taxas RWR 160→€120 (+€20 biométrico) e job-seeker 150→€195. Fonte migration.gv.at.',
      'job-seeker (Very Highly Qualified): requisito é 70 pontos, sem montante fixo; o valor €7.200 é UNVERIFIED.',
    ])
  },
  be: (d) => {
    setGR(d, 'minimumWage', 2189.81, 'RMMMG: €2.189,81/mês bruto a partir de 01/04/2026.')
    replaceFee(d, 215, 152)
    const pc = visa(d, 'professional-card-self-employed')
    if (pc) pc.requirements.incomeRequirement = null
    finalize(d, [
      'Auditoria 2026-06-02: RMMMG €2.189,81/mês (01/04/2026) CURRENT. Os limiares belgas são POR REGIÃO e atualizados anualmente.',
      'single-permit altamente qualificado: €3.703,44/mês é o de Bruxelas 2026; Valônia €53.220/ano; Flandres €48.912/ano (a reindexar). A nota deve deixar claro que é por região.',
      'GAP: falta a EU Blue Card (Bruxelas €4.748/mês; Valônia €68.815/ano; Flandres €63.586/ano).',
      'Taxa single permit corrigida 215→€152 (redevance federal 2026) + nova taxa regional flamenga (~€200-250). professional-card sem piso de renda fixo (avaliação de viabilidade) — €26.087 removido.',
    ])
  },
  es: (d) => {
    setIncome(d, 'telework-nomad-visa', 2849, 'Limiar 2026 = 200% do SMI (€1.221×14): €2.849/mês. Dependentes: +€916 (1º) e +€305 (cada).')
    setIncome(d, 'highly-qualified-worker-visa', 39270, 'Limiar 2026 (Orden PJC/44/2026): ~€39.270/ano (Tarjeta Azul-UE/PAC); reduzido ~€31.416 para profissões de difícil cobertura.')
    finalize(d, [
      'Auditoria 2026-06-02: SMI €1.221/mês (RD 126/2026) e proofOfFunds €2.849/mês CURRENT. Nômade digital corrigido 2.646→€2.849; altamente qualificado 40.077→~€39.270.',
      'Taxas (18/64/73) não casam com os trâmites atuais — mapear: tasa 052 residencia €10,94 / prórroga €16,40; tasa 062 trabajo €203,84 (ou €407,71 se ≥2×SMI); TIE €16,08. UNVERIFIED como estão.',
      'ESTRUTURAL: RD 1155/2024 (novo Reglamento de Extranjería, vigente 20/05/2025) reformou arraigos/vistos; busca de emprego ampliada para 1 ano; o conteúdo pode refletir o regulamento antigo (RD 557/2011).',
    ])
  },
  fr: (d) => {
    setGR(d, 'minimumWage', 1867.02, 'SMIC bruto 2026: €1.867,02/mês (revalorização de 01/06/2026), €22.404,24/ano.')
    setGR(d, 'proofOfFunds', 1867.02, 'Referência SMIC 2026: €1.867,02/mês.')
    setIncome(d, 'vls-ts-salarie', 1867.02, 'SMIC bruto 2026: €1.867,02/mês (01/06/2026).')
    setIncome(d, 'vls-carte-travailleur', 1867.02, 'SMIC bruto 2026: €1.867,02/mês.')
    setIncome(d, 'carte-sejour-temporaire-salarie', 1867.02, 'SMIC bruto 2026: €1.867,02/mês.')
    replaceFee(d, 269, 200)
    replaceFee(d, 225, 350)
    finalize(d, [
      'Auditoria 2026-06-02: SMIC atualizado para €1.867,02/mês (01/06/2026); renda dos vistos salarié corrigida 1.801→€1.867,02. Carte Talent salarié qualifié €39.582/ano e Carte Bleue €59.373/ano CURRENT (fixados por arrêté, já não atrelados ao SMIC).',
      'Taxas atualizadas (aumento de 01/05/2026): validação OFII 269→€200; primeira carte de séjour 225→€350 (€300 taxa + €50 timbre).',
      'ESTRUTURAL: Passeport Talent renomeado "Carte Talent" (Loi Immigration 2024). PVT/Working Holiday Brasil→França (€2.500): UNVERIFIED, confirmar no consulado.',
    ])
  },
  it: (d) => {
    setGR(d, 'minimumWage', null)
    setGR(d, 'proofOfFunds', 8400, 'Meios de subsistência ~€8.400/ano (limite de isenção da spesa sanitaria, referência anual revisável).')
    setIncome(d, 'eu-blue-card', 27000, 'Após D.Lgs 152/2023: retribuição ≥ CCNL aplicável e não inferior à média anual ISTAT (~€27.000/ano), sem múltiplo fixo. Validade 2 anos; mobilidade UE após 12 meses.')
    setIncome(d, 'lavoro-autonomo', 8400, 'Renda mínima ~€8.400/ano (referência à isenção da spesa sanitaria).')
    finalize(d, [
      'Auditoria 2026-06-02: minimumWage removido (Itália não tem mínimo legal; piso por CCNL). EU Blue Card corrigida 35.000→~€27.000 (D.Lgs 152/2023; validade 2 anos; mobilidade 12 meses, não 18). lavoro autonomo/proofOfFunds ~€8.400.',
      'ESTRUTURAL Decreto Flussi 2026 (DPCM 02/10/2025): total 164.850 (76.200 subordinado não sazonal incl. 13.600 colf/badanti; 650 autônomo; 88.000 sazonal); click days 09/16/18 de fevereiro 2026; moldura trienal 2026-2028.',
      'Taxa do permesso (€200) é imprecisa: compor marca da bollo €16 + bollettino €30,46 + contributo €40-100; adicionar a marca da bollo de €16. Visto D ~€116 e correio ~€30 CURRENT.',
    ])
  },
}

const codes = Object.keys(UPDATES)
for (const cc of codes) {
  const d = readCurrent(cc)
  if (!d) {
    console.error(`[erro] ${cc}: não foi possível ler/validar data/current/${cc}.json`)
    continue
  }
  UPDATES[cc]!(d)
  writeCurrent(cc, d)
  console.log(`[ok] ${cc}: corrigido (knownIssues=${d.reliability.knownIssues.length})`)
}
console.log('\nConcluído. Rode: bun run validate')
