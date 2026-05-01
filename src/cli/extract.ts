import { sources } from '@/sources/index'
import { fetchPage } from '@/extractors/fetcher'
import { extractMainContent } from '@/extractors/content-cleaner'
import { extractFromHtml } from '@/extractors/llm-extractor'
import { PartialExtractionSchema } from '@/extractors/partial-schema'
import type { PartialExtraction, PartialVisaType, PartialMoneyAmount } from '@/extractors/partial-schema'
import { CountryDataSchema } from '@/extractors/schema'
import type { CountryData, SourceRef, PolicyChange, MoneyAmount } from '@/extractors/schema'
import { readCurrent, writeCurrent, archiveCurrent } from '@/storage/snapshot'
import { hashContent, isUnchanged, updateHashes } from '@/lib/content-cache'
import { log } from '@/lib/log'
import type { ModelKey } from '@/lib/models'
import type { SourceConfig } from '@/types'

// ---- merge helpers --------------------------------------------------------

function mergeVisaTypes(existing: PartialVisaType[], incoming: PartialVisaType[]): void {
  for (const newVisa of incoming) {
    const idx = existing.findIndex((v) => v.id === newVisa.id)
    if (idx === -1) {
      existing.push(newVisa)
    } else {
      existing[idx] = { ...existing[idx]!, ...newVisa }
    }
  }
}

function mergeRecentChanges(existing: PolicyChange[], incoming: PolicyChange[]): void {
  for (const change of incoming) {
    const key = `${change.date}|${change.title}`
    if (!existing.some((c) => `${c.date}|${c.title}` === key)) {
      existing.push(change)
    }
  }
  existing.sort((a, b) => b.date.localeCompare(a.date))
}

interface MergedData {
  forBrazilians: PartialExtraction['forBrazilians']
  visaTypes: PartialVisaType[]
  generalRequirements: PartialExtraction['generalRequirements']
  recentChanges: PolicyChange[]
}

function mergeExtractions(partials: PartialExtraction[]): MergedData {
  const result: MergedData = {
    forBrazilians: {},
    visaTypes: [],
    generalRequirements: {},
    recentChanges: [],
  }

  for (const partial of partials) {
    if (partial.forBrazilians) {
      result.forBrazilians = { ...result.forBrazilians, ...partial.forBrazilians }
    }
    if (partial.visaTypes) {
      mergeVisaTypes(result.visaTypes, partial.visaTypes)
    }
    if (partial.generalRequirements) {
      result.generalRequirements = {
        ...result.generalRequirements,
        ...partial.generalRequirements,
      }
    }
    if (partial.recentChanges) {
      mergeRecentChanges(result.recentChanges, partial.recentChanges)
    }
  }

  return result
}

// ---- build full CountryData from merged partials -------------------------

function toMoney(m: PartialMoneyAmount | null | undefined): MoneyAmount | null {
  if (!m || m.amount == null || m.amount <= 0) return null
  return m as MoneyAmount
}

function buildCountryData(
  merged: MergedData,
  sourceRefs: SourceRef[],
  config: SourceConfig,
): CountryData {
  const fb = merged.forBrazilians ?? {}
  const gr = merged.generalRequirements ?? {}
  const hi = gr.healthInsurance

  const successCount = sourceRefs.filter((r) => r.status === 'ok').length
  const confidence = merged.visaTypes.length >= 2 ? 'medium' : 'low'

  return {
    meta: {
      country: config.countryCode,
      countryName: config.countryName,
      lastUpdated: new Date().toISOString(),
      schemaVersion: '1.0.0',
      sources: sourceRefs,
    },
    forBrazilians: {
      schengenVisaFree: fb.schengenVisaFree ?? true,
      maxStayDaysAsTourist:
        fb.maxStayDaysAsTourist != null && fb.maxStayDaysAsTourist > 0
          ? fb.maxStayDaysAsTourist
          : 90,
      workPermitNeeded: fb.workPermitNeeded ?? true,
      specialAgreements: fb.specialAgreements ?? [],
      notes: (fb.notes ?? '').slice(0, 500),
    },
    visaTypes: merged.visaTypes.map((v) => ({
      ...v,
      eligibility: v.eligibility.slice(0, 5),
      requirements: {
        ...v.requirements,
        incomeRequirement: toMoney(v.requirements.incomeRequirement),
      },
      process: {
        ...v.process,
        estimatedDuration: v.process.estimatedDuration || 'A determinar',
        fees: v.process.fees.map(toMoney).filter((f): f is MoneyAmount => f !== null),
      },
      rights: {
        ...v.rights,
        canWork: v.rights.canWork ?? true,
        canBringFamily: v.rights.canBringFamily ?? false,
        canChangeEmployer: v.rights.canChangeEmployer ?? false,
        pathToResidency: v.rights.pathToResidency?.yearsRequired
          ? v.rights.pathToResidency
          : null,
        pathToCitizenship: v.rights.pathToCitizenship?.yearsRequired
          ? v.rights.pathToCitizenship
          : null,
      },
    })),
    generalRequirements: {
      passportValidity: gr.passportValidity || 'Minimo 6 meses apos a data de entrada',
      proofOfFunds: toMoney(gr.proofOfFunds),
      healthInsurance: {
        required: hi?.required ?? false,
        mustBeLocal: hi?.mustBeLocal ?? false,
        minimumCoverage: toMoney(hi?.minimumCoverage),
        notes: hi?.notes ?? '',
      },
      cleanCriminalRecord: gr.cleanCriminalRecord ?? true,
      vaccinations: gr.vaccinations ?? [],
    },
    recentChanges: merged.recentChanges,
    reliability: {
      extractedBy: 'llm',
      extractionConfidence: confidence,
      humanReviewedAt: null,
      knownIssues:
        successCount < sourceRefs.length
          ? [`${sourceRefs.length - successCount} URL(s) falharam na extracao`]
          : [],
    },
  }
}

// ---- per-country extraction ----------------------------------------------

interface FetchedPage {
  urlConfig: SourceConfig['urls'][number]
  ref: SourceRef
  cleanContent: string
  contentHash: string
  ok: boolean
}

async function extractCountry(countryCode: string, forceModel?: ModelKey): Promise<boolean> {
  const config = sources[countryCode]
  if (!config) {
    log.error('pais desconhecido', { country: countryCode })
    process.exit(1)
  }

  log.info('iniciando extracao', {
    country: countryCode,
    urls: config.urls.length,
    ...(forceModel ? { forceModel } : {}),
  })

  // Fase 1: buscar todas as paginas e calcular hashes (sem chamar LLM ainda)
  const pages: FetchedPage[] = []
  for (const urlConfig of config.urls) {
    let fetchedAt = new Date().toISOString()
    let contentLanguage = config.primaryLanguage as SourceRef['contentLanguage']
    const ref: SourceRef = { url: urlConfig.url, fetchedAt, status: 'ok', contentLanguage }

    try {
      const result = await fetchPage(urlConfig.url, urlConfig.ignoreSSL)
      fetchedAt = result.fetchedAt
      contentLanguage = result.contentLanguage as SourceRef['contentLanguage']
      ref.fetchedAt = fetchedAt
      ref.contentLanguage = contentLanguage
      const cleanContent = extractMainContent(result.html, urlConfig.url)
      const contentHash = hashContent(cleanContent)
      log.debug('pagina buscada', { url: urlConfig.url, chars: cleanContent.length, hash: contentHash.slice(0, 8) })
      pages.push({ urlConfig, ref, cleanContent, contentHash, ok: true })
    } catch (err) {
      log.warn('fetch falhou, pulando URL', { url: urlConfig.url, error: String(err) })
      ref.status = 'failed'
      pages.push({ urlConfig, ref, cleanContent: '', contentHash: '', ok: false })
    }
  }

  // Fase 2: pular LLM se nenhum conteudo mudou desde o ultimo run
  if (!forceModel) {
    const fetchedOk = pages.filter((p) => p.ok)
    const allUnchanged =
      fetchedOk.length > 0 && fetchedOk.every((p) => isUnchanged(p.urlConfig.url, p.contentHash))
    if (allUnchanged && readCurrent(countryCode) !== null) {
      log.info('conteudo identico ao ultimo run, reutilizando snapshot sem chamar LLM', {
        country: countryCode,
        urls: fetchedOk.length,
      })
      return true
    }
  }

  // Fase 3: arquivar snapshot anterior e extrair com LLM
  archiveCurrent(countryCode)

  const partials: PartialExtraction[] = []
  const newHashes: Record<string, string> = {}

  for (const page of pages) {
    if (!page.ok) continue

    try {
      const resolvedModel = forceModel ?? page.urlConfig.model
      const partial = await extractFromHtml(page.cleanContent, PartialExtractionSchema, {
        country: config.countryCode,
        countryName: config.countryName,
        contentType: page.urlConfig.contentType,
        sourceUrl: page.urlConfig.url,
        contentLanguage: page.ref.contentLanguage,
        promptHint: page.urlConfig.promptHint,
        ...(resolvedModel ? { model: resolvedModel } : {}),
      })
      partials.push(partial)
      newHashes[page.urlConfig.url] = page.contentHash
    } catch (err) {
      log.warn('extracao LLM falhou', { url: page.urlConfig.url, error: String(err) })
      page.ref.status = 'partial'
    }
  }

  const sourceRefs = pages.map((p) => p.ref)
  const okCount = sourceRefs.filter((r) => r.status === 'ok').length
  if (okCount === 0) {
    log.error('todas as URLs falharam, abortando sem sobrescrever snapshot', {
      country: countryCode,
    })
    return false
  }

  const merged = mergeExtractions(partials)
  const countryData = buildCountryData(merged, sourceRefs, config)
  const validation = CountryDataSchema.safeParse(countryData)

  if (!validation.success) {
    const issues = validation.error.issues
      .map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`)
      .join('; ')
    log.error('validacao final falhou, snapshot nao foi gravado', {
      country: countryCode,
      issues,
    })
    return false
  }

  updateHashes(newHashes)
  writeCurrent(countryCode, validation.data)
  log.info('extracao finalizada', {
    country: countryCode,
    visaTypes: validation.data.visaTypes.length,
    confidence: validation.data.reliability.extractionConfidence,
  })
  return true
}

// ---- entry point ---------------------------------------------------------

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const countryArg = args.find((a) => a.startsWith('--country='))?.split('=')[1]
  const forceModelArg = args.find((a) => a.startsWith('--force-model='))?.split('=')[1] as
    | ModelKey
    | undefined

  if (forceModelArg && forceModelArg !== 'haiku' && forceModelArg !== 'sonnet') {
    log.error('--force-model invalido: use haiku ou sonnet', { value: forceModelArg })
    process.exit(1)
  }

  const countries = countryArg ? [countryArg] : Object.keys(sources)

  const failed: string[] = []
  for (const country of countries) {
    const ok = await extractCountry(country, forceModelArg)
    if (!ok) failed.push(country)
  }

  if (failed.length > 0) {
    log.error('paises com falha', { countries: failed.join(', ') })
    process.exit(1)
  }
}

main().catch((err: unknown) => {
  log.error('erro fatal', { error: String(err) })
  process.exit(1)
})
