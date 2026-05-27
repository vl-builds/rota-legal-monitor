// Tipos compartilhados pelas Pages Functions.

export interface Env {
  DB: D1Database
  JWT_SECRET: string
  ADMIN_EMAIL: string
  ADMIN_PASSWORD_HASH: string
}

export type AlunoStatus = 'active' | 'revoked'

export interface AlunoRow {
  id: number
  email: string
  nome: string
  password_hash: string
  status: AlunoStatus
  created_at: string
  created_by: string
  revoked_at: string | null
  last_login_at: string | null
  password_changed_at: string | null
}

export type { Role, Claims } from './session-types'
