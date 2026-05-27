// JWT HMAC-SHA256 minimo via Web Crypto. Isomorfico (Workers e Bun).
import type { Claims } from './session-types'
import { utf8 } from './bytes'

function bytesToB64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function strToB64url(s: string): string {
  return bytesToB64url(new TextEncoder().encode(s))
}

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function b64urlToStr(s: string): string {
  return new TextDecoder().decode(b64urlToBytes(s))
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function signJWT(claims: Claims, secret: string): Promise<string> {
  const header = strToB64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = strToB64url(JSON.stringify(claims))
  const data = `${header}.${payload}`
  const key = await importKey(secret)
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, utf8(data)))
  return `${data}.${bytesToB64url(sig)}`
}

export async function verifyJWT(token: string, secret: string): Promise<Claims | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const data = `${parts[0]}.${parts[1]}`
  const key = await importKey(secret)
  const ok = await crypto.subtle.verify('HMAC', key, b64urlToBytes(parts[2]!), utf8(data))
  if (!ok) return null
  let claims: Claims
  try {
    claims = JSON.parse(b64urlToStr(parts[1]!)) as Claims
  } catch {
    return null
  }
  if (typeof claims.exp !== 'number' || claims.exp < Math.floor(Date.now() / 1000)) return null
  return claims
}
