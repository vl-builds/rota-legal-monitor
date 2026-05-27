// Rate limiting de login baseado na tabela login_attempts.
// Bloqueia apos MAX_FAILURES falhas na janela, por email ou por IP.

const WINDOW_MIN = 15
const MAX_FAILURES = 5

export async function checkRateLimit(db: D1Database, email: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString()
  const row = await db
    .prepare('SELECT COUNT(*) AS n FROM login_attempts WHERE success = 0 AND attempted_at > ? AND (email = ? OR ip = ?)')
    .bind(since, email, ip)
    .first<{ n: number }>()
  return (row?.n ?? 0) >= MAX_FAILURES
}

export async function recordAttempt(db: D1Database, email: string, ip: string, success: boolean): Promise<void> {
  await db
    .prepare('INSERT INTO login_attempts (email, ip, attempted_at, success) VALUES (?, ?, ?, ?)')
    .bind(email, ip, new Date().toISOString(), success ? 1 : 0)
    .run()
}
