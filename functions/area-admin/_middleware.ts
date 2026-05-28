import type { Env } from '../_shared/types'
import { verifyJWT } from '../_shared/jwt'
import { parseCookies } from '../_shared/cookies'

// Protege server-side todo o painel admin em /area-admin/*. A tela de login
// fica acessivel sem sessao. O Cloudflare Pages normaliza `login.html` para
// `/area-admin/login` (URL limpa), entao ambas as formas precisam ficar
// isentas, senao o redirecionamento entra em loop.
const LOGIN_PATH = '/area-admin/login'

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  if (url.pathname === LOGIN_PATH || url.pathname === `${LOGIN_PATH}.html`) return ctx.next()

  const token = parseCookies(ctx.request.headers.get('Cookie'))['admin_session']
  const claims = token ? await verifyJWT(token, ctx.env.JWT_SECRET) : null
  if (!claims || claims.role !== 'admin') {
    return Response.redirect(new URL(LOGIN_PATH, url.origin).toString(), 302)
  }
  return ctx.next()
}
