import type { Env, AlunoRow } from '../../_shared/types'
import { listAlunos, insertAluno, getAlunoByEmail } from '../../_shared/db'
import { hashPassword, randomPassword } from '../../_shared/crypto'
import { json, error } from '../../_shared/responses'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function publicAluno(a: AlunoRow) {
  return {
    id: a.id,
    email: a.email,
    nome: a.nome,
    status: a.status,
    createdAt: a.created_at,
    createdBy: a.created_by,
    lastLoginAt: a.last_login_at,
    revokedAt: a.revoked_at,
  }
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const alunos = await listAlunos(ctx.env.DB)
  return json({ alunos: alunos.map(publicAluno) })
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let body: { email?: unknown; nome?: unknown; senha?: unknown }
  try {
    body = await ctx.request.json()
  } catch {
    return error(400, 'JSON invalido')
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const nome = typeof body.nome === 'string' ? body.nome.trim() : ''
  const senhaInput = typeof body.senha === 'string' ? body.senha : ''
  if (!EMAIL_RE.test(email)) return error(400, 'Email invalido')
  if (!nome) return error(400, 'Nome obrigatorio')
  if (senhaInput && senhaInput.length < 8) return error(400, 'Senha deve ter no minimo 8 caracteres')

  if (await getAlunoByEmail(ctx.env.DB, email)) {
    return error(409, 'Email ja cadastrado. Use as acoes do aluno para reativar ou redefinir a senha.')
  }

  const senha = senhaInput || randomPassword(16)
  const passwordHash = await hashPassword(senha)
  const createdBy = typeof ctx.data.adminEmail === 'string' ? ctx.data.adminEmail : 'admin'
  const aluno = await insertAluno(ctx.env.DB, { email, nome, passwordHash, createdBy })
  return json({ aluno: publicAluno(aluno), senhaGerada: senha }, { status: 201 })
}
