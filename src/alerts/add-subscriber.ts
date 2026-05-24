import { appendFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { sources } from '@/sources/index'
import { SubscriberSchema, loadSubscribers, type Subscriber } from '@/alerts/subscribers'
import { log } from '@/lib/log'

const SUBSCRIBERS_PATH = join('data', 'subscribers.json')
const VALID_CODES = new Set(Object.keys(sources))

// O corpo renderizado de um GitHub Issue Form usa "### <label>" por campo.
// Esta funcao devolve o conteudo (trim) da secao cujo heading contem o marcador.
function section(body: string, marker: string): string {
  const parts = body.split(/^###\s+/m)
  for (const part of parts) {
    const nl = part.indexOf('\n')
    if (nl === -1) continue
    const heading = part.slice(0, nl).trim().toLowerCase()
    if (heading.includes(marker.toLowerCase())) {
      return part.slice(nl + 1).trim()
    }
  }
  return ''
}

function isNoResponse(s: string): boolean {
  return s === '' || s.toLowerCase() === '_no response_'
}

function fail(message: string): never {
  setOutput('status', 'error')
  setOutput('message', message)
  log.error('inscricao invalida', { message })
  process.exit(1)
}

function setOutput(key: string, value: string): void {
  const out = process.env['GITHUB_OUTPUT']
  if (!out) return
  // Suporta valores multilinha via delimitador, embora aqui sejam curtos.
  appendFileSync(out, `${key}=${value.replace(/\n/g, ' ')}\n`)
}

function writeSubscribers(list: Subscriber[]): void {
  const sorted = [...list].sort((a, b) => a.email.localeCompare(b.email))
  writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf-8')
}

function main(): void {
  const body = process.env['ISSUE_BODY'] ?? ''
  if (!body.trim()) fail('Corpo da issue vazio: nao foi possivel ler o formulario.')

  const emailRaw = section(body, 'email')
  if (isNoResponse(emailRaw)) fail('Email nao informado.')
  const email = emailRaw.split(/\s/)[0]!.trim()

  const consent = section(body, 'consentimento')
  if (!/- \[x\]/i.test(consent)) {
    fail('Consentimento nao marcado: inscricao requer o aceite explicito.')
  }

  const paisesRaw = section(body, 'pa')
  let countries: string[] = []
  if (!isNoResponse(paisesRaw)) {
    const matches = [...paisesRaw.matchAll(/\(([a-z]{2})\)/g)].map((m) => m[1]!)
    countries = [...new Set(matches)].filter((cc) => VALID_CODES.has(cc))
  }

  const candidate = {
    email,
    countries,
    subscribedAt: new Date().toISOString(),
  }
  const parsed = SubscriberSchema.safeParse(candidate)
  if (!parsed.success) {
    fail(`Dados invalidos: ${parsed.error.issues.map((i) => i.message).join('; ')}`)
  }
  const subscriber = parsed.data

  const list = loadSubscribers()
  const existing = list.findIndex((s) => s.email.toLowerCase() === subscriber.email.toLowerCase())
  if (existing >= 0) {
    list[existing] = { ...list[existing]!, countries: subscriber.countries, subscribedAt: subscriber.subscribedAt }
    log.info('assinante atualizado', { email: subscriber.email, countries: subscriber.countries })
  } else {
    list.push(subscriber)
    log.info('assinante adicionado', { email: subscriber.email, countries: subscriber.countries })
  }
  writeSubscribers(list)

  const paisesLabel = subscriber.countries.length > 0 ? subscriber.countries.join(', ') : 'todos os paises'
  setOutput('status', 'ok')
  setOutput('message', `Inscricao confirmada para ${paisesLabel}.`)
}

try {
  main()
} catch (err) {
  fail(`Erro inesperado: ${String(err)}`)
}
