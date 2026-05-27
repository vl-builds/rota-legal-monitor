# Autenticação da Área do Aluno e Painel Admin

A Área do Aluno e o Painel Admin usam um backend serverless no Cloudflare Pages. As credenciais ficam num banco D1 (SQLite gerenciado), fora do Git. O login do aluno e do admin é validado no servidor, então emails e hashes nunca ficam públicos.

## Arquitetura

- **Hospedagem:** Cloudflare Pages serve as páginas estáticas de `previews/` e roda as funções de `functions/`. O site público (home, países) continua no GitHub Pages. Os JSONs de dados também continuam no GitHub Pages e são consumidos pela área do aluno via fallback (`https://vl-builds.github.io/rota-legal-monitor/...`).
- **Banco:** Cloudflare D1, tabela `alunos` (ver `migrations/0001_init.sql`).
- **Hashing:** PBKDF2 via Web Crypto, formato `pbkdf2$<iteracoes>$<salt>$<hash>` (`functions/_shared/crypto.ts`).
- **Sessão:** JWT HMAC-SHA256 em cookie httpOnly, Secure, SameSite=Lax (`functions/_shared/jwt.ts`). Aluno: 30 dias. Admin: 12 horas.
- **Admin:** único, fora do banco. Email e hash de senha ficam em variáveis de ambiente (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`).

## Endpoints (Pages Functions)

| Rota | Método | O que faz |
|------|--------|-----------|
| `/api/aluno/login` | POST | Valida email e senha, seta cookie `aluno_session` |
| `/api/aluno/session` | GET | Confirma a sessão do aluno |
| `/api/aluno/logout` | POST | Encerra a sessão do aluno |
| `/api/admin-login` | POST | Login do admin, seta cookie `admin_session` |
| `/api/admin-logout` | POST | Encerra a sessão do admin |
| `/api/admin/session` | GET | Confirma a sessão do admin |
| `/api/admin/alunos` | GET, POST | Lista alunos / cria acesso |
| `/api/admin/alunos/:id` | DELETE, PATCH | Revoga / reativa ou redefine senha |

Tudo em `/api/admin/*` é protegido por `functions/api/admin/_middleware.ts`. O login do admin fica fora desse diretório de propósito.

## Como o admin gerencia acessos

1. Acesse `/area-admin/login.html` e entre com o email e a senha de admin.
2. No painel, use **Criar acesso** (nome e email, senha opcional). A senha aparece uma vez na tela: copie e envie ao aluno pelo Discord.
3. Por aluno: **Revogar** (bloqueia o login), **Reativar** ou **Redefinir senha**.

O aluno entra em `/area-aluno/login.html` com email e senha.

## Desenvolvimento local

1. Crie um arquivo `.dev.vars` na raiz (já está no `.gitignore`):
   ```
   JWT_SECRET=qualquer-segredo-de-teste
   ADMIN_EMAIL=seu@email.com
   ADMIN_PASSWORD_HASH=<gere com o comando abaixo>
   ```
2. Gere o hash da senha de admin:
   ```bash
   bun -e 'import {hashPassword} from "./functions/_shared/crypto"; console.log(await hashPassword("SUA_SENHA_ADMIN"))'
   ```
3. Aplique a migration no D1 local e suba o servidor:
   ```bash
   bun run db:migrate:local
   bun run dev:web        # wrangler pages dev na porta 8788
   ```
4. Para criar um aluno de teste sem o painel, use `wrangler d1 execute rota-legal-alunos --local --command "INSERT INTO alunos ..."` ou simplesmente crie pelo painel em `/area-admin/`.

## Deploy em produção (passos no Cloudflare)

1. Crie uma conta no Cloudflare e instale o login do Wrangler (`bunx wrangler login`).
2. Crie o banco D1 e copie o `database_id` para o `wrangler.toml`:
   ```bash
   bunx wrangler d1 create rota-legal-alunos
   ```
3. Aplique a migration no banco remoto:
   ```bash
   bun run db:migrate
   ```
4. Crie o projeto Pages (conectado ao repositório ou via `bunx wrangler pages deploy previews`). Defina o diretório de publicação como `previews` e confirme que as funções de `functions/` são detectadas.
5. Configure os secrets de produção:
   ```bash
   bunx wrangler pages secret put JWT_SECRET
   bunx wrangler pages secret put ADMIN_EMAIL
   bunx wrangler pages secret put ADMIN_PASSWORD_HASH
   ```
   Gere o `ADMIN_PASSWORD_HASH` com o mesmo comando da seção de desenvolvimento, usando a senha real de admin.
6. Aponte o link "Área do Aluno" do site público para a URL do projeto Pages, ou configure um domínio próprio.

## Notas

- `previews/area-aluno/credentials.json` é um artefato **obsoleto** (o login antigo o lia). Foi removido do versionamento e está no `.gitignore`. Não é mais consultado por nada.
- Os CLIs `alunos:novo`, `alunos:revogar` e `scripts/add-aluno.ts` estão **depreciados**: escrevem no `credentials.json` morto. Use o painel admin. Eles emitem um aviso ao rodar.
- Rate limiting: o login bloqueia após 5 falhas em 15 minutos por email ou por IP (`functions/_shared/rate-limit.ts`).
- As ferramentas client-side (calculadora, checklist, comparador) têm apenas gating de UX. Proteção server-side do conteúdo de valor (cenários e guias) é uma melhoria futura, não incluída aqui.
