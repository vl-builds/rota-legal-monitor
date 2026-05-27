// Helpers de cookie de sessao (httpOnly, Secure, SameSite=Lax).

interface CookieOptions {
  maxAge: number
  path?: string
}

export function serializeCookie(name: string, value: string, opts: CookieOptions): string {
  const path = opts.path ?? '/'
  return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=${path}; Max-Age=${opts.maxAge}`
}

export function clearCookie(name: string, path = '/'): string {
  return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=${path}; Max-Age=0`
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (k) out[k] = v
  }
  return out
}
