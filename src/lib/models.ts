export const MODELS = {
  haiku: process.env['ANTHROPIC_MODEL_DEFAULT'] ?? 'claude-haiku-4-5',
  sonnet: process.env['ANTHROPIC_MODEL_PREMIUM'] ?? 'claude-sonnet-4-5',
} as const

export type ModelKey = keyof typeof MODELS
