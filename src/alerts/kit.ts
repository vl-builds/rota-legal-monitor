import { log } from '@/lib/log'

// Cliente fino da API V4 do Kit (ConvertKit). Sem SDK: usa fetch nativo do Bun.
// Auth por header X-Kit-Api-Key. Docs: https://developers.kit.com/v4.html

const BASE = 'https://api.kit.com/v4'
// V4 limita a ~120 req/min. Espacar escritas para nao tomar 429 no batch mensal.
const WRITE_DELAY_MS = 520

function apiKey(): string {
  const key = process.env['KIT_API_KEY']
  if (!key) throw new Error('KIT_API_KEY ausente')
  return key
}

async function kitFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'X-Kit-Api-Key': apiKey(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })
}

export interface KitSubscriber {
  email_address: string
  fields: Record<string, string | null>
}

export async function listActiveSubscribers(): Promise<KitSubscriber[]> {
  const out: KitSubscriber[] = []
  let after: string | undefined
  do {
    const qs = new URLSearchParams({ status: 'active', per_page: '1000' })
    if (after) qs.set('after', after)
    const res = await kitFetch(`/subscribers?${qs.toString()}`, { method: 'GET' })
    if (!res.ok) throw new Error(`listar assinantes falhou: ${res.status}`)
    const data = (await res.json()) as {
      subscribers?: KitSubscriber[]
      pagination?: { has_next_page: boolean; end_cursor: string | null }
    }
    out.push(...(data.subscribers ?? []))
    after = data.pagination?.has_next_page ? (data.pagination.end_cursor ?? undefined) : undefined
  } while (after)
  return out
}

// Cria a tag (idempotente: 200 se ja existe, 201 se criada) e devolve o id.
export async function ensureTag(name: string): Promise<number> {
  const res = await kitFetch('/tags', { method: 'POST', body: JSON.stringify({ name }) })
  if (!res.ok) throw new Error(`criar tag ${name} falhou: ${res.status}`)
  const data = (await res.json()) as { tag?: { id: number } }
  if (data.tag?.id) return data.tag.id
  // Fallback: alguns retornos de "ja existe" podem nao trazer o objeto; busca por nome.
  const id = await findTagIdByName(name)
  if (id) return id
  throw new Error(`tag ${name} criada mas id nao retornado`)
}

async function findTagIdByName(name: string): Promise<number | undefined> {
  let after: string | undefined
  do {
    const qs = new URLSearchParams({ per_page: '1000' })
    if (after) qs.set('after', after)
    const res = await kitFetch(`/tags?${qs.toString()}`, { method: 'GET' })
    if (!res.ok) throw new Error(`listar tags falhou: ${res.status}`)
    const data = (await res.json()) as {
      tags?: Array<{ id: number; name: string }>
      pagination?: { has_next_page: boolean; end_cursor: string | null }
    }
    const found = data.tags?.find((t) => t.name === name)
    if (found) return found.id
    after = data.pagination?.has_next_page ? (data.pagination.end_cursor ?? undefined) : undefined
  } while (after)
  return undefined
}

export async function tagSubscriber(tagId: number, email: string): Promise<void> {
  const res = await kitFetch(`/tags/${tagId}/subscribers`, {
    method: 'POST',
    body: JSON.stringify({ email_address: email }),
  })
  // 201 aplicada, 200 ja tinha. Qualquer outro e erro.
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`taggear ${email} (tag ${tagId}) falhou: ${res.status}`)
  }
  await Bun.sleep(WRITE_DELAY_MS)
}

export interface BroadcastInput {
  tagId: number
  subject: string
  content: string
  previewText: string
  description: string
}

// Cria um broadcast e agenda envio imediato, mirando uma tag.
export async function sendBroadcastToTag(input: BroadcastInput): Promise<void> {
  const body = {
    content: input.content,
    description: input.description,
    subject: input.subject,
    preview_text: input.previewText,
    public: false,
    published_at: null,
    send_at: new Date().toISOString(),
    subscriber_filter: [{ all: [{ type: 'tag', ids: [input.tagId] }], any: null, none: null }],
  }
  const res = await kitFetch('/broadcasts', { method: 'POST', body: JSON.stringify(body) })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`criar broadcast falhou: ${res.status} ${text.slice(0, 200)}`)
  }
  log.info('broadcast criado', { tagId: input.tagId, subject: input.subject })
  await Bun.sleep(WRITE_DELAY_MS)
}
