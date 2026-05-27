import type { Env } from '../../_shared/types'
import { verifyJWT } from '../../_shared/jwt'
import { parseCookies } from '../../_shared/cookies'
import { json, error } from '../../_shared/responses'

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const token = parseCookies(ctx.request.headers.get('Cookie'))['aluno_session']
  if (!token) return error(401, 'Sem sessao')
  const claims = await verifyJWT(token, ctx.env.JWT_SECRET)
  if (!claims || claims.role !== 'aluno') return error(401, 'Sessao invalida')
  return json({ email: claims.sub, nome: claims.nome })
}
