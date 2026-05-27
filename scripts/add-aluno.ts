#!/usr/bin/env bun
/**
 * Adiciona ou atualiza um usuário na Área do Aluno.
 *
 * Uso:
 *   bun run scripts/add-aluno.ts --email=voce@email.com --password=suasenha
 *
 * Para revogar um acesso:
 *   bun run scripts/add-aluno.ts --email=voce@email.com --revoke
 */

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash, randomBytes } from 'node:crypto'

const CREDS_PATH = join(import.meta.dir, '..', 'previews', 'area-aluno', 'credentials.json')

interface Credential {
  email: string
  salt: string
  hash: string
  createdAt: string
  revokedAt?: string
}

interface CredsFile {
  version: number
  credentials: Credential[]
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main() {
  console.warn('[DEPRECADO] As credenciais agora vivem no D1 (Cloudflare), geridas pelo painel admin em /area-admin/. Este script escreve em credentials.json, que NAO e mais lido pelo login.')
  const args = process.argv.slice(2)
  const email = args.find(a => a.startsWith('--email='))?.split('=')[1]?.toLowerCase().trim()
  const password = args.find(a => a.startsWith('--password='))?.split('=')[1]
  const revoke = args.includes('--revoke')

  if (!email) {
    console.error('Uso: bun run scripts/add-aluno.ts --email=EMAIL --password=SENHA')
    console.error('     bun run scripts/add-aluno.ts --email=EMAIL --revoke')
    process.exit(1)
  }

  const raw = await readFile(CREDS_PATH, 'utf-8')
  const file = JSON.parse(raw) as CredsFile
  const existing = file.credentials.findIndex(c => c.email === email)

  if (revoke) {
    if (existing === -1) {
      console.error(`Email não encontrado: ${email}`)
      process.exit(1)
    }
    file.credentials[existing]!.revokedAt = new Date().toISOString()
    await writeFile(CREDS_PATH, JSON.stringify(file, null, 2) + '\n', 'utf-8')
    console.log(`Acesso revogado para: ${email}`)
    return
  }

  if (!password) {
    console.error('Informe --password=SENHA para criar ou atualizar o acesso.')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('Senha deve ter no mínimo 8 caracteres.')
    process.exit(1)
  }

  const salt = randomBytes(16).toString('hex')
  const hash = sha256(salt + password)
  const entry: Credential = {
    email,
    salt,
    hash,
    createdAt: new Date().toISOString(),
  }

  if (existing !== -1) {
    delete file.credentials[existing]!.revokedAt
    file.credentials[existing] = entry
    console.log(`Senha atualizada para: ${email}`)
  } else {
    file.credentials.push(entry)
    console.log(`Usuário criado: ${email}`)
  }

  await writeFile(CREDS_PATH, JSON.stringify(file, null, 2) + '\n', 'utf-8')
}

main().catch(err => {
  console.error('Erro:', err)
  process.exit(1)
})
