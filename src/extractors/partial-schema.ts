import { z } from 'zod'
import {
  MoneyAmountSchema,
  SpecialAgreementSchema,
  VisaTypeSchema,
  PolicyChangeSchema,
  PathInfoSchema,
  VisaProcessSchema,
  VisaRightsSchema,
} from './schema'

const PartialHealthInsuranceSchema = z.object({
  required: z.boolean().optional(),
  mustBeLocal: z.boolean().optional(),
  minimumCoverage: MoneyAmountSchema.nullable().optional(),
  notes: z.string().optional(),
})

const PartialPathInfoSchema = PathInfoSchema.extend({
  yearsRequired: z.number().int().min(0),
})

const PartialVisaProcessSchema = VisaProcessSchema.extend({
  estimatedDuration: z.string(),
})

const PartialVisaRightsSchema = VisaRightsSchema.extend({
  pathToResidency: PartialPathInfoSchema.nullable(),
  pathToCitizenship: PartialPathInfoSchema.nullable(),
})

const PartialVisaTypeSchema = VisaTypeSchema.extend({
  process: PartialVisaProcessSchema,
  rights: PartialVisaRightsSchema,
})

export type PartialVisaType = z.infer<typeof PartialVisaTypeSchema>

export const PartialExtractionSchema = z.object({
  forBrazilians: z
    .object({
      schengenVisaFree: z.boolean().optional(),
      maxStayDaysAsTourist: z.number().int().min(0).optional(),
      workPermitNeeded: z.boolean().optional(),
      specialAgreements: z.array(SpecialAgreementSchema).optional(),
      notes: z.string().max(500).optional(),
    })
    .optional(),

  visaTypes: z.array(PartialVisaTypeSchema).optional(),

  generalRequirements: z
    .object({
      passportValidity: z.string().optional(),
      proofOfFunds: MoneyAmountSchema.nullable().optional(),
      healthInsurance: PartialHealthInsuranceSchema.optional(),
      cleanCriminalRecord: z.boolean().optional(),
      vaccinations: z.array(z.string()).optional(),
    })
    .optional(),

  recentChanges: z.array(PolicyChangeSchema).optional(),
})

export type PartialExtraction = z.infer<typeof PartialExtractionSchema>
