import { json } from '../../_shared/responses'

// O _middleware ja validou a sessao admin. So confirma e devolve o email.
export const onRequestGet: PagesFunction = async (ctx) => {
  return json({ email: ctx.data.adminEmail })
}
