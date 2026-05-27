-- Credenciais dos alunos da Area do Aluno. Fica no D1 (Cloudflare), fora do Git.
CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  revoked_at TEXT,
  last_login_at TEXT,
  password_changed_at TEXT
);

-- Email unico (global): reativar um aluno reusa o mesmo registro.
CREATE UNIQUE INDEX IF NOT EXISTS idx_alunos_email ON alunos (email);

-- Tentativas de login para rate limiting (por email e por IP).
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  ip TEXT NOT NULL,
  attempted_at TEXT NOT NULL,
  success INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attempts_email_time ON login_attempts (email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_attempts_ip_time ON login_attempts (ip, attempted_at);
