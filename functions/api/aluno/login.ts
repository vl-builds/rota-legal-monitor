import type { Env } from '../../_shared/types'
import { getAlunoByEmail, touchLastLogin } from '../../_shared/db'
import { verifyPassword, dummyVerify } from '../../_shared/crypto'
import { signJWT } from '../../_shared/jwt'
import { serializeCookie } from '../../_shared/cookies'
import { json, error } from '../../_shared/responses'
import { checkRateLimit, recordAttempt } from '../../_shared/rate-limit'

const ALUNO_TTL = 60 * 60 * 24 * 30 // 30 dias

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let body: { email?: unknown; senha?: unknown }
  try {
    body = await ctx.request.json()
  } catch {
    return error(400, 'JSON invalido')
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const senha = typeof body.senha === 'string' ? body.senha : ''
  if (!email || !senha) return error(400, 'Email e senha obrigatorios')

  const ip = ctx.request.headers.get('CF-Connecting-IP') ?? 'desconhecido'
  if (await checkRateLimit(ctx.env.DB, email, ip)) {
    return error(429, 'Muitas tentativas. Tente novamente em alguns minutos.')
  }

  const aluno = await getAlunoByEmail(ctx.env.DB, email)
  const ok = aluno && aluno.status === 'active' ? await verifyPassword(senha, aluno.password_hash) : ((await dummyVerify(senha)), false)

  await recordAttempt(ctx.env.DB, email, ip, ok)
  if (!aluno || aluno.status !== 'active' || !ok) {
    return error(401, 'Email ou senha invalidos')
  }

  await touchLastLogin(ctx.env.DB, aluno.id)
  const now = Math.floor(Date.now() / 1000)
  const token = await signJWT(
    { sub: aluno.email, nome: aluno.nome, role: 'aluno', iat: now, exp: now + ALUNO_TTL },
    ctx.env.JWT_SECRET,
  )
  return json({ email: aluno.email, nome: aluno.nome }, { cookies: [serializeCookie('aluno_session', token, { maxAge: ALUNO_TTL })] })
}
