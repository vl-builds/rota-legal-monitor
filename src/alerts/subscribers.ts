import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { sources } from '@/sources/index'
import { log } from '@/lib/log'

const countryCodes = Object.keys(sources) as [string, ...string[]]

export const SubscriberSchema = z.object({
  email: z.string().email(),
  // Lista de codigos ISO alpha-2 que o assinante quer monitorar. Vazio = todos.
  countries: z.array(z.enum(countryCodes)),
  subscribedAt: z.string().datetime({ offset: true }),
})

export const SubscribersFileSchema = z.array(SubscriberSchema)

export type Subscriber = z.infer<typeof SubscriberSchema>

const SUBSCRIBERS_PATH = join('data', 'subscribers.json')

export function loadSubscribers(): Subscriber[] {
  if (!existsSync(SUBSCRIBERS_PATH)) {
    log.warn('arquivo de assinantes nao encontrado', { path: SUBSCRIBERS_PATH })
    return []
  }
  const raw = JSON.parse(readFileSync(SUBSCRIBERS_PATH, 'utf-8')) as unknown
  const result = SubscribersFileSchema.safeParse(raw)
  if (!result.success) {
    log.error('subscribers.json invalido', { issues: result.error.issues.length })
    throw new Error('subscribers.json falhou na validacao do schema')
  }
  return result.data
}

// Resolve quais paises um assinante recebe: lista explicita, ou todos quando vazia.
export function countriesFor(subscriber: Subscriber): string[] {
  return subscriber.countries.length > 0 ? subscriber.countries : countryCodes
}
