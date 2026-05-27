// Hashing de senha com PBKDF2 (Web Crypto). Isomorfico: roda em Workers e em Bun.
// Formato armazenado, self-describing: pbkdf2$<iteracoes>$<salt_b64>$<hash_b64>

import { utf8 } from './bytes'

const ITERATIONS = 100_000
const KEY_BYTES = 32
const SALT_BYTES = 16

function toB64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function fromB64(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    KEY_BYTES * 8,
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const derived = await pbkdf2(password, salt, ITERATIONS)
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(derived)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Number(parts[1])
  if (!Number.isFinite(iterations) || iterations <= 0) return false
  const salt = fromB64(parts[2]!)
  const expected = fromB64(parts[3]!)
  const derived = await pbkdf2(password, salt, iterations)
  return timingSafeEqual(derived, expected)
}

// Gasta o mesmo tempo de um verifyPassword real, para uniformizar a resposta
// quando o email nao existe (evita enumeracao por timing).
export async function dummyVerify(password: string): Promise<void> {
  await pbkdf2(password, new Uint8Array(SALT_BYTES), ITERATIONS)
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!
  return diff === 0
}

// Senha legivel de 16 chars sem caracteres ambiguos (0, 1, l, o).
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomPassword(length = 16): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i]! % ALPHABET.length]
  return out
}
