import { test, expect } from 'bun:test'
import { hashPassword, verifyPassword, randomPassword } from '../functions/_shared/crypto'

test('hashPassword gera formato pbkdf2 self-describing', async () => {
  const stored = await hashPassword('senha-secreta')
  const parts = stored.split('$')
  expect(parts[0]).toBe('pbkdf2')
  expect(Number(parts[1])).toBeGreaterThan(0)
  expect(parts.length).toBe(4)
})

test('verifyPassword aceita a senha correta e rejeita a errada', async () => {
  const stored = await hashPassword('correta#2026')
  expect(await verifyPassword('correta#2026', stored)).toBe(true)
  expect(await verifyPassword('errada', stored)).toBe(false)
})

test('verifyPassword rejeita formato invalido sem lancar', async () => {
  expect(await verifyPassword('x', 'nao-e-pbkdf2')).toBe(false)
  expect(await verifyPassword('x', 'sha256$1$a$b')).toBe(false)
})

test('hashes do mesmo texto diferem (salt aleatorio)', async () => {
  const a = await hashPassword('mesma')
  const b = await hashPassword('mesma')
  expect(a).not.toBe(b)
})

test('randomPassword tem o tamanho pedido e evita chars ambiguos', () => {
  const pw = randomPassword(16)
  expect(pw.length).toBe(16)
  expect(pw).not.toMatch(/[01lo]/)
})
