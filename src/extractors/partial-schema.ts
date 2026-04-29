import { z } from 'zod'
import {
  MoneyAmountSchema,
  SpecialAgreementSchema,
  VisaTypeSchema,
  PolicyChangeSchema,
  PathInfoSchema,
  VisaProcessSchema,
  VisaRightsSchema,
  VisaRequirementsSchema,
} from './schema'

// Schemas parciais usados durante a extracao por LLM.
// Regras relaxadas em relacao ao schema final:
// - Campos booleanos e strings aceitam null (LLM retorna null quando dado nao esta na pagina)
// - eligibility sem max(5) — truncamos no sanitize de extract.ts
// - yearsRequired aceita 0 — sanitizamos para null em extract.ts
// - estimatedDuration aceita null/vazio — sanitizamos para "A determinar"
// - MoneyAmount.amount aceita null — sanitizamos para null (objeto inteiro) em extract.ts

const PartialMoneyAmountSchema = MoneyAmountSchema.extend({
  amount: z.number().nullable(),
})

export type PartialMoneyAmount = z.infer<typeof PartialMoneyAmountSchema>

const PartialHealthInsuranceSchema = z.object({
  required: z.boolean().nullish(),
  mustBeLocal: z.boolean().nullish(),
  minimumCoverage: PartialMoneyAmountSchema.nullable().optional(),
  notes: z.string().nullish(),
})

const PartialPathInfoSchema = PathInfoSchema.extend({
  yearsRequired: z.number().int().min(0),
})

const PartialVisaRequirementsSchema = VisaRequirementsSchema.extend({
  incomeRequirement: PartialMoneyAmountSchema.nullable(),
})

const PartialVisaProcessSchema = VisaProcessSchema.extend({
  estimatedDuration: z.string().nullish(),
  fees: z.array(PartialMoneyAmountSchema),
})

const PartialVisaRightsSchema = VisaRightsSchema.extend({
  canWork: z.boolean().nullish(),
  canBringFamily: z.boolean().nullish(),
  canChangeEmployer: z.boolean().nullish(),
  pathToResidency: PartialPathInfoSchema.nullable(),
  pathToCitizenship: PartialPathInfoSchema.nullable(),
})

const PartialVisaTypeSchema = VisaTypeSchema.extend({
  eligibility: z.array(z.string()),
  requirements: PartialVisaRequirementsSchema,
  process: PartialVisaProcessSchema,
  rights: PartialVisaRightsSchema,
})

export type PartialVisaType = z.infer<typeof PartialVisaTypeSchema>

export const PartialExtractionSchema = z.object({
  forBrazilians: z
    .object({
      schengenVisaFree: z.boolean().nullish(),
      maxStayDaysAsTourist: z.number().int().min(0).nullish(),
      workPermitNeeded: z.boolean().nullish(),
      specialAgreements: z.array(SpecialAgreementSchema).optional(),
      notes: z.string().nullish(),
    })
    .optional(),

  visaTypes: z.array(PartialVisaTypeSchema).optional(),

  generalRequirements: z
    .object({
      passportValidity: z.string().nullish(),
      proofOfFunds: PartialMoneyAmountSchema.nullable().optional(),
      healthInsurance: PartialHealthInsuranceSchema.nullish(),
      cleanCriminalRecord: z.boolean().nullish(),
      vaccinations: z.array(z.string()).optional(),
    })
    .optional(),

  recentChanges: z.array(PolicyChangeSchema).optional(),
})

export type PartialExtraction = z.infer<typeof PartialExtractionSchema>
