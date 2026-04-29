import { z } from "zod";

export const MoneyAmountSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["EUR", "USD", "BRL", "AUD"]),
  period: z.enum(["one-time", "monthly", "yearly"]).nullable(),
  notes: z.string().nullable(),
});

export const SourceRefSchema = z.object({
  url: z.string().url(),
  fetchedAt: z.string().datetime({ offset: true }),
  status: z.enum(["ok", "partial", "failed"]),
  contentLanguage: z.enum(["en", "pt", "de", "es", "nl", "fr", "it"]),
});

export const MetaSchema = z.object({
  country: z.string().regex(/^[a-z]{2}$/),
  countryName: z.string().min(1),
  lastUpdated: z.string().datetime({ offset: true }),
  schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  sources: z.array(SourceRefSchema),
});

export const SpecialAgreementSchema = z.object({
  name: z.string().min(1),
  fullName: z.string().min(1),
  benefits: z.array(z.string()),
  appliesToWork: z.boolean(),
});

export const ForBraziliansSchema = z.object({
  schengenVisaFree: z.boolean(),
  maxStayDaysAsTourist: z.number().int().positive(),
  workPermitNeeded: z.boolean(),
  specialAgreements: z.array(SpecialAgreementSchema),
  notes: z.string().max(500),
});

export const DocumentRequirementSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  isCritical: z.boolean(),
});

export const LanguageRequirementSchema = z.object({
  language: z.string().min(1),
  level: z.string().min(1),
  testsAccepted: z.array(z.string()),
});

export const VisaRequirementsSchema = z.object({
  documents: z.array(DocumentRequirementSchema),
  incomeRequirement: MoneyAmountSchema.nullable(),
  qualificationsRequired: z.array(z.string()),
  languageRequired: LanguageRequirementSchema.nullable(),
});

export const ProcessStepSchema = z.object({
  order: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  estimatedDays: z.number().int().positive().nullable(),
});

export const VisaProcessSchema = z.object({
  steps: z.array(ProcessStepSchema),
  estimatedDuration: z.string().min(1),
  fees: z.array(MoneyAmountSchema),
  applicationLocation: z.enum(["origem", "destino", "ambos"]),
});

export const PathInfoSchema = z.object({
  yearsRequired: z.number().int().positive(),
  conditions: z.array(z.string()),
});

export const VisaRightsSchema = z.object({
  canWork: z.boolean(),
  canBringFamily: z.boolean(),
  canChangeEmployer: z.boolean(),
  pathToResidency: PathInfoSchema.nullable(),
  pathToCitizenship: PathInfoSchema.nullable(),
});

export const VisaTypeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  nameOriginal: z.string().min(1),
  description: z.string().min(1),
  eligibility: z.array(z.string()).max(5),
  requirements: VisaRequirementsSchema,
  process: VisaProcessSchema,
  rights: VisaRightsSchema,
  relevanceForDelivery: z.enum(["direct", "indirect", "low"]),
  notes: z.string().nullable(),
});

export const HealthInsuranceReqSchema = z.object({
  required: z.boolean(),
  mustBeLocal: z.boolean(),
  minimumCoverage: MoneyAmountSchema.nullable(),
  notes: z.string(),
});

export const GeneralRequirementsSchema = z.object({
  passportValidity: z.string().min(1),
  proofOfFunds: MoneyAmountSchema.nullable(),
  healthInsurance: HealthInsuranceReqSchema,
  cleanCriminalRecord: z.boolean(),
  vaccinations: z.array(z.string()),
});

export const PolicyChangeSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
  summary: z.string().min(1),
  severity: z.enum(["major", "minor"]),
  affects: z.array(z.string()),
  sourceUrl: z.string().url(),
});

export const ReliabilitySchema = z.object({
  extractedBy: z.enum(["llm", "manual"]),
  extractionConfidence: z.enum(["high", "medium", "low"]),
  humanReviewedAt: z.string().datetime({ offset: true }).nullable(),
  knownIssues: z.array(z.string()),
});

export const CountryDataSchema = z
  .object({
    meta: MetaSchema,
    forBrazilians: ForBraziliansSchema,
    visaTypes: z.array(VisaTypeSchema),
    generalRequirements: GeneralRequirementsSchema,
    recentChanges: z.array(PolicyChangeSchema),
    reliability: ReliabilitySchema,
  })
  .superRefine((data, ctx) => {
    if (data.forBrazilians.workPermitNeeded && data.visaTypes.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "visaTypes deve ter pelo menos 1 item quando workPermitNeeded for true",
        path: ["visaTypes"],
      });
    }

    const seen = new Set<string>();
    for (const visa of data.visaTypes) {
      if (seen.has(visa.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `ID de visaType duplicado: "${visa.id}"`,
          path: ["visaTypes"],
        });
      }
      seen.add(visa.id);
    }

    for (let i = 1; i < data.recentChanges.length; i++) {
      const prev = data.recentChanges[i - 1];
      const curr = data.recentChanges[i];
      if (prev !== undefined && curr !== undefined && prev.date < curr.date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "recentChanges deve estar ordenado por data decrescente",
          path: ["recentChanges", i],
        });
      }
    }

    if (new Date(data.meta.lastUpdated) > new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "meta.lastUpdated nao pode ser no futuro",
        path: ["meta", "lastUpdated"],
      });
    }

    data.visaTypes.forEach((visa, visaIndex) => {
      const { steps } = visa.process;
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step !== undefined && step.order !== i + 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `process.steps deve ser sequencial a partir de 1 (visto "${visa.id}")`,
            path: ["visaTypes", visaIndex, "process", "steps"],
          });
          break;
        }
      }
    });
  });

export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;
export type SourceRef = z.infer<typeof SourceRefSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type SpecialAgreement = z.infer<typeof SpecialAgreementSchema>;
export type ForBrazilians = z.infer<typeof ForBraziliansSchema>;
export type DocumentRequirement = z.infer<typeof DocumentRequirementSchema>;
export type LanguageRequirement = z.infer<typeof LanguageRequirementSchema>;
export type VisaRequirements = z.infer<typeof VisaRequirementsSchema>;
export type ProcessStep = z.infer<typeof ProcessStepSchema>;
export type VisaProcess = z.infer<typeof VisaProcessSchema>;
export type PathInfo = z.infer<typeof PathInfoSchema>;
export type VisaRights = z.infer<typeof VisaRightsSchema>;
export type VisaType = z.infer<typeof VisaTypeSchema>;
export type HealthInsuranceReq = z.infer<typeof HealthInsuranceReqSchema>;
export type GeneralRequirements = z.infer<typeof GeneralRequirementsSchema>;
export type PolicyChange = z.infer<typeof PolicyChangeSchema>;
export type Reliability = z.infer<typeof ReliabilitySchema>;
export type CountryData = z.infer<typeof CountryDataSchema>;
