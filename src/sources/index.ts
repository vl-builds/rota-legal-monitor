import type { SourceConfig } from '@/types'
import { nlSource } from './nl'
import { ptSource } from './pt'
import { deSource } from './de'
import { esSource } from './es'
import { ieSource } from './ie'
import { itSource } from './it'
import { frSource } from './fr'
import { beSource } from './be'
import { atSource } from './at'
import { auSource } from './au'

export const sources: Record<string, SourceConfig> = {
  nl: nlSource,
  pt: ptSource,
  de: deSource,
  es: esSource,
  ie: ieSource,
  it: itSource,
  fr: frSource,
  be: beSource,
  at: atSource,
  au: auSource,
}
