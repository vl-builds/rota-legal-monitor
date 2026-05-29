// Tipos compartilhados pelas Pages Functions.

export interface Env {
  DB: D1Database
  JWT_SECRET: string
  ADMIN_EMAIL: string
  ADMIN_PASSWORD_HASH: string
  // Cloudflare Turnstile (CAPTCHA). Opcionais: se ausentes, o captcha e pulado.
  TURNSTILE_SITE_KEY?: string
  TURNSTILE_SECRET?: string
  // Alertas por email (Kit/ConvertKit). KIT_API_KEY autentica a API V4 (ler/editar/cancelar).
  // KIT_FORM_ID e o formulario com double opt-in usado na primeira inscricao.
  KIT_API_KEY?: string
  KIT_FORM_ID?: string
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
