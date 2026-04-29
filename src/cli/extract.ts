import { sources } from '@/sources/index'
import { fetchPage } from '@/extractors/fetcher'
import { extractMainContent } from '@/extractors/content-cleaner'
import { extractFromHtml } from '@/extractors/llm-extractor'
import { PartialExtractionSchema } from '@/extractors/partial-schema'
import type { PartialExtraction, PartialVisaType, PartialMoneyAmount } from '@/extractors/partial-schema'
import { CountryDataSchema } from '@/extractors/schema'
import type { CountryData, SourceRef, PolicyChange, MoneyAmount } from '@/extractors/schema'
import { readCurrent, writeCurrent, archiveCurrent } from '@/storage/snapshot'
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

  archiveCurrent(countryCode)

  const partials: PartialExtraction[] = []
  const sourceRefs: SourceRef[] = []

  for (const urlConfig of config.urls) {
    let fetchedAt = new Date().toISOString()
    let contentLanguage = config.primaryLanguage
    const ref: SourceRef = {
      url: urlConfig.url,
      fetchedAt,
      status: 'ok',
      contentLanguage: contentLanguage as SourceRef['contentLanguage'],
    }
    sourceRefs.push(ref)

    let html: string
    try {
      const result = await fetchPage(urlConfig.url, urlConfig.ignoreSSL)
      html = result.html
      fetchedAt = result.fetchedAt
      contentLanguage = result.contentLanguage
      ref.fetchedAt = fetchedAt
      ref.contentLanguage = contentLanguage as SourceRef['contentLanguage']
    } catch (err) {
      log.warn('fetch falhou, pulando URL', { url: urlConfig.url, error: String(err) })
      ref.status = 'failed'
      continue
    }

    const cleanContent = extractMainContent(html, urlConfig.url)
    log.debug('conteudo limpo', { url: urlConfig.url, chars: cleanContent.length })

    try {
      const resolvedModel = forceModel ?? urlConfig.model
      const partial = await extractFromHtml(cleanContent, PartialExtractionSchema, {
        country: config.countryCode,
        countryName: config.countryName,
        contentType: urlConfig.contentType,
        sourceUrl: urlConfig.url,
        contentLanguage,
        promptHint: urlConfig.promptHint,
        ...(resolvedModel ? { model: resolvedModel } : {}),
      })
      partials.push(partial)
    } catch (err) {
      log.warn('extracao LLM falhou', { url: urlConfig.url, error: String(err) })
      ref.status = 'partial'
    }
  }

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
