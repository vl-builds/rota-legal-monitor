import type { Env } from '../../../_shared/types'
import { getAlunoById, revokeAluno, reactivateAluno, updatePassword } from '../../../_shared/db'
import { hashPassword, randomPassword } from '../../../_shared/crypto'
import { json, error } from '../../../_shared/responses'

function parseId(raw: string | string[] | undefined): number | null {
  if (raw === undefined) return null
  const id = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const id = parseId(ctx.params.id)
  if (id === null) return error(400, 'ID invalido')
  if (!(await getAlunoById(ctx.env.DB, id))) return error(404, 'Aluno nao encontrado')
  await revokeAluno(ctx.env.DB, id)
  return json({ ok: true })
}

export const onRequestPatch: PagesFunction<Env> = async (ctx) => {
  const id = parseId(ctx.params.id)
  if (id === null) return error(400, 'ID invalido')
  if (!(await getAlunoById(ctx.env.DB, id))) return error(404, 'Aluno nao encontrado')

  let body: { action?: unknown; senha?: unknown }
  try {
    body = await ctx.request.json()
  } catch {
    return error(400, 'JSON invalido')
  }

  if (body.action === 'reactivate') {
    await reactivateAluno(ctx.env.DB, id)
    return json({ ok: true })
  }

  if (body.action === 'reset-password') {
    const senhaInput = typeof body.senha === 'string' ? body.senha : ''
    if (senhaInput && senhaInput.length < 8) return error(400, 'Senha deve ter no minimo 8 caracteres')
    const senha = senhaInput || randomPassword(16)
    await updatePassword(ctx.env.DB, id, await hashPassword(senha))
    return json({ ok: true, senhaGerada: senha })
  }

  return error(400, 'Acao invalida')
}
