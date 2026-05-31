import type { Env, Claims } from '../../_shared/types'
import { verifyJWT } from '../../_shared/jwt'
import { parseCookies } from '../../_shared/cookies'
import { json, error, noContent } from '../../_shared/responses'
import {
  KitError,
  findSubscriberByEmail,
  updateSubscriberPaises,
  unsubscribe,
  subscribeViaForm,
} from '../../_shared/kit'

// Codigos oficiais (ISO 3166-1 alpha-2). Mesma lista do workflow_dispatch do cron mensal.
// Mantida como constante porque a Function nao tem acesso a src/sources.
const COUNTRY_CODES = ['nl', 'pt', 'de', 'es', 'ie', 'it', 'fr', 'be', 'at', 'au']

// Valida a sessao do aluno (cookie JWT) e devolve o email confiavel, sempre do token.
async function authAluno(request: Request, env: Env): Promise<Claims | null> {
  const token = parseCookies(request.headers.get('Cookie'))['aluno_session']
  if (!token) return null
  const claims = await verifyJWT(token, env.JWT_SECRET)
  if (!claims || claims.role !== 'aluno') return null
  return claims
}

// "todos" quando vazio; senao os codigos validos. Espelha parsePaisesField do envio mensal.
function parsePaises(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((cc) => COUNTRY_CODES.includes(cc))
}

// Normaliza a lista recebida do cliente para um CSV de codigos validos, sem duplicatas.
function normalizePaises(input: unknown): string {
  if (!Array.isArray(input)) return ''
  const valid = input
    .filter((c): c is string => typeof c === 'string')
    .map((c) => c.trim().toLowerCase())
    .filter((cc) => COUNTRY_CODES.includes(cc))
  return [...new Set(valid)].join(',')
}

// Converte um erro do Kit em resposta amigavel (429 = rate limit compartilhado com o cron).
function kitErrorResponse(err: unknown): Response {
  // Log de diagnostico: status + mensagem do Kit, nunca a chave. Aparece no `wrangler tail`.
  const status = err instanceof KitError ? err.status : 'n/a'
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[alertas] falha na chamada ao Kit: status=${status} message=${message}`)

  if (err instanceof KitError && err.status === 429) {
    return error(429, 'Muitas solicitacoes ao servico de email. Tente de novo em alguns minutos.')
  }
  return error(502, 'Nao foi possivel falar com o servico de email agora. Tente mais tarde.')
}

// GET: estado da inscricao do aluno.
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const claims = await authAluno(ctx.request, ctx.env)
  if (!claims) return error(401, 'Sessao invalida')
  if (!ctx.env.KIT_API_KEY) return error(503, 'Alertas ainda nao configurados.')

  try {
    const sub = await findSubscriberByEmail(ctx.env.KIT_API_KEY, claims.sub)
    return json({
      subscribed: sub?.state === 'active',
      state: sub?.state ?? null,
      paises: parsePaises(sub?.fields?.['paises']),
    })
  } catch (err) {
    return kitErrorResponse(err)
  }
}

// POST: inscreve (primeira vez, com double opt-in) ou atualiza os paises (se ja ativo).
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const claims = await authAluno(ctx.request, ctx.env)
  if (!claims) return error(401, 'Sessao invalida')
  if (!ctx.env.KIT_API_KEY || !ctx.env.KIT_FORM_ID) return error(503, 'Alertas ainda nao configurados.')

  let body: { paises?: unknown; consent?: unknown }
  try {
    body = await ctx.request.json()
  } catch {
    return error(400, 'JSON invalido')
  }
  const csv = normalizePaises(body.paises)

  try {
    const sub = await findSubscriberByEmail(ctx.env.KIT_API_KEY, claims.sub)
    if (sub && sub.state === 'active') {
      await updateSubscriberPaises(ctx.env.KIT_API_KEY, sub.id, csv)
      return json({ updated: true, subscribed: true, paises: parsePaises(csv) })
    }
    // Ausente, inativo ou cancelado: primeira inscricao via formulario (double opt-in).
    // Exige consentimento explicito antes de mandar email de confirmacao.
    if (body.consent !== true) return error(400, 'E preciso aceitar receber os alertas.')
    await subscribeViaForm(ctx.env.KIT_FORM_ID, claims.sub, csv)
    return json({ pending: true, subscribed: false, paises: parsePaises(csv) })
  } catch (err) {
    return kitErrorResponse(err)
  }
}

// DELETE: cancela a inscricao (idempotente se nao existir).
export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const claims = await authAluno(ctx.request, ctx.env)
  if (!claims) return error(401, 'Sessao invalida')
  if (!ctx.env.KIT_API_KEY) return error(503, 'Alertas ainda nao configurados.')

  try {
    const sub = await findSubscriberByEmail(ctx.env.KIT_API_KEY, claims.sub)
    if (sub) await unsubscribe(ctx.env.KIT_API_KEY, sub.id)
    return noContent()
  } catch (err) {
    return kitErrorResponse(err)
  }
}
