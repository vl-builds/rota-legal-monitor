import type { Env } from '../_shared/types'
import { verifyPassword, dummyVerify } from '../_shared/crypto'
import { signJWT } from '../_shared/jwt'
import { serializeCookie } from '../_shared/cookies'
import { json, error } from '../_shared/responses'
import { checkRateLimit, recordAttempt } from '../_shared/rate-limit'
import { verifyTurnstile } from '../_shared/captcha'

const ADMIN_TTL = 60 * 60 * 12 // 12 horas (sessao curta para conta privilegiada)

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let body: { email?: unknown; senha?: unknown; turnstileToken?: unknown }
  try {
    body = await ctx.request.json()
  } catch {
    return error(400, 'JSON invalido')
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const senha = typeof body.senha === 'string' ? body.senha : ''
  if (!email || !senha) return error(400, 'Email e senha obrigatorios')

  const ip = ctx.request.headers.get('CF-Connecting-IP') ?? 'desconhecido'

  if (ctx.env.TURNSTILE_SECRET) {
    const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : ''
    if (!(await verifyTurnstile(token, ctx.env.TURNSTILE_SECRET, ip))) {
      return error(403, 'Verificacao de seguranca falhou. Recarregue e tente de novo.')
    }
  }

  if (await checkRateLimit(ctx.env.DB, email, ip)) {
    return error(429, 'Muitas tentativas. Tente novamente em alguns minutos.')
  }

  const adminEmail = ctx.env.ADMIN_EMAIL.trim().toLowerCase()
  const ok = email === adminEmail ? await verifyPassword(senha, ctx.env.ADMIN_PASSWORD_HASH) : ((await dummyVerify(senha)), false)

  await recordAttempt(ctx.env.DB, email, ip, ok)
  if (!ok) return error(401, 'Email ou senha invalidos')

  const now = Math.floor(Date.now() / 1000)
  const token = await signJWT(
    { sub: adminEmail, nome: 'Admin', role: 'admin', iat: now, exp: now + ADMIN_TTL },
    ctx.env.JWT_SECRET,
  )
  return json({ email: adminEmail }, { cookies: [serializeCookie('admin_session', token, { maxAge: ADMIN_TTL })] })
}
