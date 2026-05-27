// Acesso tipado ao D1 (tabela alunos).
import type { AlunoRow } from './types'

export async function getAlunoByEmail(db: D1Database, email: string): Promise<AlunoRow | null> {
  return db.prepare('SELECT * FROM alunos WHERE email = ?').bind(email).first<AlunoRow>()
}

export async function getAlunoById(db: D1Database, id: number): Promise<AlunoRow | null> {
  return db.prepare('SELECT * FROM alunos WHERE id = ?').bind(id).first<AlunoRow>()
}

export async function listAlunos(db: D1Database): Promise<AlunoRow[]> {
  const res = await db.prepare('SELECT * FROM alunos ORDER BY created_at DESC').all<AlunoRow>()
  return res.results ?? []
}

export async function touchLastLogin(db: D1Database, id: number): Promise<void> {
  await db.prepare('UPDATE alunos SET last_login_at = ? WHERE id = ?').bind(new Date().toISOString(), id).run()
}

export async function insertAluno(
  db: D1Database,
  data: { email: string; nome: string; passwordHash: string; createdBy: string },
): Promise<AlunoRow> {
  const now = new Date().toISOString()
  const row = await db
    .prepare(
      `INSERT INTO alunos (email, nome, password_hash, status, created_at, created_by, password_changed_at)
       VALUES (?, ?, ?, 'active', ?, ?, ?) RETURNING *`,
    )
    .bind(data.email, data.nome, data.passwordHash, now, data.createdBy, now)
    .first<AlunoRow>()
  if (!row) throw new Error('Falha ao inserir aluno')
  return row
}

export async function revokeAluno(db: D1Database, id: number): Promise<void> {
  await db
    .prepare("UPDATE alunos SET status = 'revoked', revoked_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), id)
    .run()
}

export async function reactivateAluno(db: D1Database, id: number): Promise<void> {
  await db.prepare("UPDATE alunos SET status = 'active', revoked_at = NULL WHERE id = ?").bind(id).run()
}

export async function updatePassword(db: D1Database, id: number, passwordHash: string): Promise<void> {
  await db
    .prepare('UPDATE alunos SET password_hash = ?, password_changed_at = ? WHERE id = ?')
    .bind(passwordHash, new Date().toISOString(), id)
    .run()
}
