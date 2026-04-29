import { z } from 'zod'
import {
  MoneyAmountSchema,
  SpecialAgreementSchema,
  VisaTypeSchema,
  PolicyChangeSchema,
} from './schema'

const PartialHealthInsuranceSchema = z.object({
  required: z.boolean().optional(),
  mustBeLocal: z.boolean().optional(),
  minimumCoverage: MoneyAmountSchema.nullable().optional(),
  notes: z.string().optional(),
})

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

  visaTypes: z.array(VisaTypeSchema).optional(),

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
