import type { Env } from '../_shared/types'
import { json, error } from '../_shared/responses'
import { verifyTurnstile } from '../_shared/captcha'
import { KitError, subscribeViaForm } from '../_shared/kit'

// Endpoint PUBLICO de inscricao em alertas (pagina /historico, sem login).
// Diferente de /api/aluno/alertas (que exige sessao e gerencia paises por aluno),
// aqui qualquer visitante se inscreve para receber o resumo mensal de TODOS os paises.
// Protecao contra abuso: double opt-in do Kit (ninguem entra sem confirmar no email)
// + Turnstile quando configurado. Usa apenas KIT_FORM_ID, nao a KIT_API_KEY.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  if (!ctx.env.KIT_FORM_ID) return error(503, 'Alertas ainda nao configurados.')

  let body: { email?: unknown; consent?: unknown; turnstileToken?: unknown }
  try {
    body = await ctx.request.json()
  } catch {
    return error(400, 'JSON invalido')
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email) || email.length > 254) return error(400, 'Informe um email valido.')
  if (body.consent !== true) return error(400, 'E preciso aceitar receber os alertas.')

  const ip = ctx.request.headers.get('CF-Connecting-IP') ?? 'desconhecido'
  if (ctx.env.TURNSTILE_SECRET) {
    const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : ''
    if (!(await verifyTurnstile(token, ctx.env.TURNSTILE_SECRET, ip))) {
      return error(403, 'Verificacao de seguranca falhou. Recarregue e tente de novo.')
    }
  }

  try {
    // paises vazio = todos os paises, mesma semantica do envio mensal (parsePaises('')).
    await subscribeViaForm(ctx.env.KIT_FORM_ID, email, '')
    return json({ pending: true })
  } catch (err) {
    // Log de diagnostico: status + mensagem do Kit, nunca dados sensiveis. Aparece no `wrangler tail`.
    const status = err instanceof KitError ? err.status : 'n/a'
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[alertas-publico] falha na chamada ao Kit: status=${status} message=${message}`)

    if (err instanceof KitError && err.status === 429) {
      return error(429, 'Muitas solicitacoes ao servico de email. Tente de novo em alguns minutos.')
    }
    return error(502, 'Nao foi possivel ativar os alertas agora. Tente mais tarde.')
  }
}
