// Respostas JSON consistentes para as Functions.

interface JsonInit {
  status?: number
  cookies?: string[]
}

export function json(data: unknown, init?: JsonInit): Response {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
  if (init?.cookies) for (const c of init.cookies) headers.append('Set-Cookie', c)
  return new Response(JSON.stringify(data), { status: init?.status ?? 200, headers })
}

export function error(status: number, message: string): Response {
  return json({ error: message }, { status })
}

export function noContent(cookies?: string[]): Response {
  const headers = new Headers()
  if (cookies) for (const c of cookies) headers.append('Set-Cookie', c)
  return new Response(null, { status: 204, headers })
}
