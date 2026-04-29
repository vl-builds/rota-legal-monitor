import { sources } from '@/sources/index'
import { fetchPage } from '@/extractors/fetcher'
import { extractMainContent } from '@/extractors/content-cleaner'
import { extractFromHtml } from '@/extractors/llm-extractor'
import { PartialExtractionSchema } from '@/extractors/partial-schema'
import type { PartialExtraction, PartialVisaType } from '@/extractors/partial-schema'
import { CountryDataSchema } from '@/extractors/schema'
import type { CountryData, SourceRef, PolicyChange } from '@/extractors/schema'
import { readCurrent, writeCurrent, archiveCurrent } from '@/storage/snapshot'
import { log } from '@/lib/log'
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

function buildCountryData(
  merged: MergedData,
  sourceRefs: SourceRef[],
  config: SourceConfig,
): CountryData {
  const fb = merged.forBrazilians ?? {}
  const gr = merged.generalRequirements ?? {}
  const hi = gr.healthInsurance ?? {}

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
      maxStayDaysAsTourist: (fb.maxStayDaysAsTourist ?? 0) > 0 ? fb.maxStayDaysAsTourist! : 90,
      workPermitNeeded: fb.workPermitNeeded ?? true,
      specialAgreements: fb.specialAgreements ?? [],
      notes: fb.notes ?? '',
    },
    visaTypes: merged.visaTypes.map((v) => ({
      ...v,
      process: {
        ...v.process,
        estimatedDuration: v.process.estimatedDuration || 'A determinar',
      },
      rights: {
        ...v.rights,
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
      proofOfFunds: gr.proofOfFunds ?? null,
      healthInsurance: {
        required: hi.required ?? false,
        mustBeLocal: hi.mustBeLocal ?? false,
        minimumCoverage: hi.minimumCoverage ?? null,
        notes: hi.notes ?? '',
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

async function extractCountry(countryCode: string): Promise<void> {
  const config = sources[countryCode]
  if (!config) {
    log.error('pais desconhecido', { country: countryCode })
    process.exit(1)
  }

  log.info('iniciando extracao', { country: countryCode, urls: config.urls.length })

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
      const partial = await extractFromHtml(cleanContent, PartialExtractionSchema, {
        country: config.countryCode,
        countryName: config.countryName,
        contentType: urlConfig.contentType,
        sourceUrl: urlConfig.url,
        contentLanguage,
        promptHint: urlConfig.promptHint,
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
    process.exit(1)
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
    process.exit(1)
  }

  writeCurrent(countryCode, validation.data)
  log.info('extracao finalizada', {
    country: countryCode,
    visaTypes: validation.data.visaTypes.length,
    confidence: validation.data.reliability.extractionConfidence,
  })
}

// ---- entry point ---------------------------------------------------------

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const countryArg = args.find((a) => a.startsWith('--country='))?.split('=')[1]

  const countries = countryArg ? [countryArg] : Object.keys(sources)

  for (const country of countries) {
    await extractCountry(country)
  }
}

main().catch((err: unknown) => {
  log.error('erro fatal', { error: String(err) })
  process.exit(1)
})
