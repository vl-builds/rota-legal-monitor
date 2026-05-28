import type { Env } from '../_shared/types'
import { verifyJWT } from '../_shared/jwt'
import { parseCookies } from '../_shared/cookies'

// Protege server-side todo o conteudo de /area-aluno/*. Sem isto, o gating e
// apenas de UX e qualquer um abre os cenarios e ferramentas Pro pela URL direta.
// A tela de login fica acessivel sem sessao. O Cloudflare Pages normaliza
// `login.html` para `/area-aluno/login` (URL limpa), entao ambas as formas
// precisam ficar isentas, senao o redirecionamento entra em loop.
const LOGIN_PATH = '/area-aluno/login'

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  if (url.pathname === LOGIN_PATH || url.pathname === `${LOGIN_PATH}.html`) return ctx.next()

  const token = parseCookies(ctx.request.headers.get('Cookie'))['aluno_session']
  const claims = token ? await verifyJWT(token, ctx.env.JWT_SECRET) : null
  if (!claims || claims.role !== 'aluno') {
    return Response.redirect(new URL(LOGIN_PATH, url.origin).toString(), 302)
  }
  return ctx.next()
}
