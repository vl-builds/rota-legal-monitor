import type { Env } from '../_shared/types'
import { json } from '../_shared/responses'

// Expoe a site key publica do Turnstile pro frontend (null se nao configurada).
// O frontend so renderiza o widget quando ha site key; o backend so exige o
// token quando ha TURNSTILE_SECRET. Assim ativa-se tudo via env, sem redeploy.
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  return json({ siteKey: ctx.env.TURNSTILE_SITE_KEY ?? null })
}
