import type { Env } from '../../_shared/types'
import { verifyJWT } from '../../_shared/jwt'
import { parseCookies } from '../../_shared/cookies'
import { error } from '../../_shared/responses'

// Protege todas as rotas /api/admin/*. O login do admin fica em
// /api/admin-login (fora deste diretorio), entao nao precisa de excecao aqui.
export const onRequest: PagesFunction<Env> = async (ctx) => {
  const token = parseCookies(ctx.request.headers.get('Cookie'))['admin_session']
  const claims = token ? await verifyJWT(token, ctx.env.JWT_SECRET) : null
  if (!claims || claims.role !== 'admin') return error(401, 'Acesso restrito')
  ctx.data.adminEmail = claims.sub
  return ctx.next()
}
