// Utilitario de manutencao: lista e remove inscritos do Kit (ConvertKit).
// Uso pontual para limpar inscritos de TESTE. Le KIT_API_KEY do ambiente.
//
//   bun run scripts/kit-cleanup-subs.ts list
//   bun run scripts/kit-cleanup-subs.ts remove a@x.com b@y.com            # dry-run (nao apaga)
//   bun run scripts/kit-cleanup-subs.ts remove a@x.com --apply            # unsubscribe de verdade
//   bun run scripts/kit-cleanup-subs.ts remove a@x.com --apply --delete   # delete permanente
//
// unsubscribe (padrao): marca como cancelado, mantem o registro.
// --delete: apaga o assinante de vez (irreversivel).

const BASE = 'https://api.kit.com/v4'
const WRITE_DELAY_MS = 520

function apiKey(): string {
  const key = process.env['KIT_API_KEY']
  if (!key) throw new Error('KIT_API_KEY ausente no ambiente')
  return key
}

async function kitFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'X-Kit-Api-Key': apiKey(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })
}

interface Sub {
  id: number
  email_address: string
  state: string
  created_at: string
}

async function listAll(): Promise<Sub[]> {
  const out: Sub[] = []
  let after: string | undefined
  do {
    const qs = new URLSearchParams({ status: 'all', per_page: '1000' })
    if (after) qs.set('after', after)
    const res = await kitFetch(`/subscribers?${qs.toString()}`, { method: 'GET' })
    if (!res.ok) throw new Error(`listar assinantes falhou: ${res.status}`)
    const data = (await res.json()) as {
      subscribers?: Sub[]
      pagination?: { has_next_page: boolean; end_cursor: string | null }
    }
    out.push(...(data.subscribers ?? []))
    after = data.pagination?.has_next_page ? (data.pagination.end_cursor ?? undefined) : undefined
  } while (after)
  return out
}

async function findByEmail(email: string): Promise<Sub | null> {
  const qs = new URLSearchParams({ email_address: email, status: 'all' })
  const res = await kitFetch(`/subscribers?${qs.toString()}`, { method: 'GET' })
  if (!res.ok) throw new Error(`buscar ${email} falhou: ${res.status}`)
  const data = (await res.json()) as { subscribers?: Sub[] }
  return data.subscribers?.[0] ?? null
}

async function unsubscribe(id: number): Promise<number> {
  const res = await kitFetch(`/subscribers/${id}/unsubscribe`, { method: 'POST', body: '{}' })
  return res.status
}

async function remove(id: number): Promise<number> {
  const res = await kitFetch(`/subscribers/${id}`, { method: 'DELETE' })
  return res.status
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2)
  if (cmd === 'list') {
    const subs = await listAll()
    subs.sort((a, b) => a.created_at.localeCompare(b.created_at))
    for (const s of subs) {
      console.log(`${s.state.padEnd(10)} ${String(s.id).padEnd(12)} ${s.created_at}  ${s.email_address}`)
    }
    console.log(`\nTotal: ${subs.length} assinantes`)
    return
  }

  if (cmd === 'remove') {
    const apply = rest.includes('--apply')
    const hardDelete = rest.includes('--delete')
    const emails = rest.filter((a) => !a.startsWith('--'))
    if (emails.length === 0) throw new Error('informe ao menos um email')

    const action = hardDelete ? 'DELETE permanente' : 'unsubscribe'
    console.log(`Modo: ${apply ? 'APLICAR' : 'DRY-RUN (nada sera alterado)'}  |  Acao: ${action}\n`)

    for (const email of emails) {
      const sub = await findByEmail(email)
      if (!sub) {
        console.log(`-- nao encontrado: ${email}`)
        continue
      }
      if (!apply) {
        console.log(`[dry-run] ${action} -> ${email} (id ${sub.id}, estado ${sub.state})`)
        continue
      }
      const status = hardDelete ? await remove(sub.id) : await unsubscribe(sub.id)
      const ok = status === 204 || status === 200
      console.log(`${ok ? 'ok ' : `FALHA(${status}) `}${action} -> ${email} (id ${sub.id})`)
      await Bun.sleep(WRITE_DELAY_MS)
    }
    return
  }

  console.error('comando invalido. Use: list | remove <emails...> [--apply] [--delete]')
  process.exit(1)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
