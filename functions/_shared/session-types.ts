// Tipos de sessao/JWT, sem dependencia de tipos do Workers (D1, etc.).
// Mantido separado para que jwt.ts seja testavel em Bun sem puxar D1Database.

export type Role = 'aluno' | 'admin'

export interface Claims {
  sub: string
  nome: string
  role: Role
  iat: number
  exp: number
}
