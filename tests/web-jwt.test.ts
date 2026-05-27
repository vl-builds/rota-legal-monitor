import { test, expect } from 'bun:test'
import { signJWT, verifyJWT } from '../functions/_shared/jwt'
import type { Claims } from '../functions/_shared/session-types'

const SECRET = 'segredo-de-teste-123'

function claims(expOffsetSec: number): Claims {
  const now = Math.floor(Date.now() / 1000)
  return { sub: 'a@b.com', nome: 'Aluno', role: 'aluno', iat: now, exp: now + expOffsetSec }
}

test('signJWT e verifyJWT fazem round-trip', async () => {
  const token = await signJWT(claims(3600), SECRET)
  const got = await verifyJWT(token, SECRET)
  expect(got?.sub).toBe('a@b.com')
  expect(got?.role).toBe('aluno')
})

test('verifyJWT rejeita assinatura com secret errado', async () => {
  const token = await signJWT(claims(3600), SECRET)
  expect(await verifyJWT(token, 'outro-secret')).toBeNull()
})

test('verifyJWT rejeita token expirado', async () => {
  const token = await signJWT(claims(-10), SECRET)
  expect(await verifyJWT(token, SECRET)).toBeNull()
})

test('verifyJWT rejeita token malformado', async () => {
  expect(await verifyJWT('abc', SECRET)).toBeNull()
  expect(await verifyJWT('a.b.c.d', SECRET)).toBeNull()
})
