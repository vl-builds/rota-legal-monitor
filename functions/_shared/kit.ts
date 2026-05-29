// Cliente fino da API do Kit (ConvertKit) para o runtime de Pages Functions.
// Diferente de src/alerts/kit.ts (que roda em Bun no cron e usa process.env/Bun.sleep),
// aqui recebemos a apiKey por parametro e usamos apenas fetch, disponivel no Worker.

const V4_BASE = 'https://api.kit.com/v4'
const FORM_BASE = 'https://app.convertkit.com/forms'

// Erro com status HTTP do Kit, para o endpoint distinguir 429 (rate limit) dos demais.
export class KitError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'KitError'
    this.status = status
  }
}

export type SubscriberState = 'active' | 'inactive' | 'bounced' | 'complained' | 'cancelled'

export interface KitSubscriber {
  id: number
  state: SubscriberState
  fields: Record<string, string | null>
}

function v4Headers(apiKey: string): HeadersInit {
  return {
    'X-Kit-Api-Key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

// Busca o assinante pelo email. status=all para enxergar tambem pendentes/cancelados,
// senao um nao-confirmado some da resposta e pareceria "nunca inscrito".
export async function findSubscriberByEmail(apiKey: string, email: string): Promise<KitSubscriber | null> {
  const qs = new URLSearchParams({ email_address: email, status: 'all' })
  const res = await fetch(`${V4_BASE}/subscribers?${qs.toString()}`, {
    method: 'GET',
    headers: v4Headers(apiKey),
  })
  if (!res.ok) throw new KitError(res.status, `buscar assinante falhou: ${res.status}`)
  const data = (await res.json()) as { subscribers?: KitSubscriber[] }
  return data.subscribers?.[0] ?? null
}

// Atualiza o campo personalizado paises de um assinante existente (precisa do id numerico).
export async function updateSubscriberPaises(apiKey: string, id: number, csv: string): Promise<void> {
  const res = await fetch(`${V4_BASE}/subscribers/${id}`, {
    method: 'PUT',
    headers: v4Headers(apiKey),
    body: JSON.stringify({ fields: { paises: csv } }),
  })
  if (!res.ok) throw new KitError(res.status, `atualizar assinante falhou: ${res.status}`)
}

// Cancela a inscricao (unsubscribe). Sucesso = 204.
export async function unsubscribe(apiKey: string, id: number): Promise<void> {
  const res = await fetch(`${V4_BASE}/subscribers/${id}/unsubscribe`, {
    method: 'POST',
    headers: v4Headers(apiKey),
    body: '{}',
  })
  if (res.status !== 204 && !res.ok) throw new KitError(res.status, `cancelar inscricao falhou: ${res.status}`)
}

// Primeira inscricao pelo endpoint publico de formulario: dispara o double opt-in.
// Server-side nao ha CORS, entao lemos o status real (sem o "sucesso otimista" do browser).
export async function subscribeViaForm(formId: string, email: string, csv: string): Promise<void> {
  const body = new URLSearchParams()
  body.set('email_address', email)
  body.set('fields[paises]', csv)
  const res = await fetch(`${FORM_BASE}/${formId}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new KitError(res.status, `inscricao no formulario falhou: ${res.status}`)
}
