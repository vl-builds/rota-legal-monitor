// Verificacao server-side do Cloudflare Turnstile.
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<boolean> {
  if (!token) return false
  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)
  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body: form })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
