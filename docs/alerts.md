# Alertas por email

Avisa por email os alunos quando o ciclo mensal detecta uma mudança de alta relevância nos países que cada um acompanha. A captura e o armazenamento dos leads ficam no Kit (ConvertKit), nunca no repositório, por dois motivos: segurança do utilizador e LGPD (o repo é público para servir o GitHub Pages, então emails versionados ficariam expostos). O Kit também serve de base de leads reutilizável para o marketing do curso.

## Por que Kit e não JSON no repo

A primeira versão guardava assinantes em `data/subscribers.json` e coletava email por uma issue pública do GitHub. Isso expunha os emails e não tinha double opt-in. Trocamos por um provedor gerenciado (Kit), que resolve consentimento, confirmação em duas etapas, cancelamento e armazenamento privado, com free tier folgado (10.000 contatos, emails ilimitados).

## Fluxo de inscrição (server-side, aluno autenticado)

A inscrição passa pela Cloudflare Function `functions/api/aluno/alertas.ts`, não mais por um POST direto do navegador ao Kit. O aluno já está logado na Área do Aluno, então o email vem do JWT da sessão (cookie `aluno_session`), nunca do corpo da requisição: isso impede inscrever o email de outra pessoa.

1. O aluno abre `previews/area-aluno/alertas.html`, marca os países e clica em "Quero receber os alertas".
2. O JS chama `POST /api/aluno/alertas` com `{ paises: [...], consent: true }` (mesma origem, com cookie).
3. A Function decide pelo estado do assinante no Kit:
   - **Primeira inscrição** (ausente, inativo ou cancelado): chama o endpoint público de formulário `https://app.convertkit.com/forms/{KIT_FORM_ID}/subscriptions`, que dispara o **double opt-in**. Server-side não há CORS, então o status real é lido (sem o "sucesso otimista" antigo). Responde `{ pending: true }`.
   - **Já ativo**: atualiza só o campo `paises` via `PUT /v4/subscribers/{id}`. Responde `{ updated: true }`.
4. O Kit dispara o email de confirmação no caso de primeira inscrição. O aluno confirma e vira contato ativo.
5. O lead fica no Kit, disponível para o Vitor usar em campanhas do curso.

Países vazios significam "todos os países". Os códigos recebidos são validados contra a lista oficial antes de gravar.

## Gestão de preferências

A mesma página e o mesmo endpoint cobrem ver, editar e cancelar:

- `GET /api/aluno/alertas` devolve `{ subscribed, state, paises }`. A página pré-marca os países salvos e mostra o estado (inscrito, pendente de confirmação ou cancelado).
- `POST` com a nova lista de países atualiza as preferências de quem já está ativo.
- `DELETE /api/aluno/alertas` cancela a inscrição (`POST /v4/subscribers/{id}/unsubscribe`), idempotente se o aluno não estiver inscrito.

O estado vive só no Kit, não há espelho no D1.

O cliente do Kit para o runtime de Pages está em `functions/_shared/kit.ts` (recebe a `apiKey` por parâmetro e usa só `fetch`). O cliente do cron mensal (`src/alerts/kit.ts`) continua separado por rodar em Bun.

## Fluxo de envio (mensal)

Roda dentro de `.github/workflows/monthly-update.yml`, no step "Send email alerts to subscribers", após a detecção de mudanças e apenas quando `has_high_relevance == 'true'`.

`src/alerts/send-email.ts`:

1. Recalcula o diff via `diffAllCountries()` (de `src/diff/run.ts`, a mesma função da CLI `bun run diff`) e separa os países com `high.length > 0`.
2. Para cada país que mudou no ciclo, garante a tag `pais-<cc>` no Kit (`ensureTag`).
3. Lê os assinantes ativos (confirmados) e, para cada um, aplica as tags dos países mudados que ele acompanha (campo `paises`). Só os países que mudaram são processados, então o número de chamadas fica baixo.
4. Para cada país que mudou, cria e dispara um **broadcast** com o HTML daquele país, mirando a tag `pais-<cc>` via `subscriber_filter`.

O cliente da API V4 do Kit está em `src/alerts/kit.ts` (auth por header `X-Kit-Api-Key`, base `https://api.kit.com/v4`).

Teste local sem enviar:

```bash
bun run alerts:send --dry-run
```

O dry-run não exige `KIT_API_KEY`: apenas registra, por país mudado, qual broadcast e qual tag seriam usados. Sem mudança de alta relevância, faz no-op.

## Variáveis de ambiente

| Nome | Onde | Para que |
|------|------|----------|
| `KIT_API_KEY` | Secret do repositório (Actions) **e** secret do Cloudflare Pages | Autenticar na API V4 do Kit. No Actions: criar tags e enviar broadcasts. No Pages: ler/atualizar/cancelar a inscrição do aluno. |
| `KIT_FORM_ID` | Secret do Cloudflare Pages | Endpoint de formulário com double opt-in usado na primeira inscrição (a Function fala com ele server-side). |

Os secrets do Pages são definidos com `wrangler pages secret put KIT_API_KEY` e `wrangler pages secret put KIT_FORM_ID`. Não vão para `wrangler.toml` nem para o cliente.

## Setup manual no Kit (uma vez)

1. Criar conta no Kit e um **formulário com double opt-in ativo** (não "auto-confirm"). Anotar o `FORM_ID`.
2. Criar o campo personalizado com a key exata `paises` (Settings, Custom Fields). Sem ele o `PUT` retorna 422 e o formulário ignora o campo.
3. Gerar uma **API key V4** (Settings, aba Developer).
4. Salvar `KIT_API_KEY` como secret do repositório (Actions) e do Pages, e `KIT_FORM_ID` como secret do Pages.

As tags `pais-<cc>` são criadas automaticamente pelo envio mensal, não precisa criá-las à mão.

## Detalhe de implementação a confirmar

O envio mira as tags `pais-<cc>` via `subscriber_filter` (caminho garantido). Como alternativa, o `create-broadcast` da V4 também aceita mirar **segmentos** (`type: segment`). Se preferir, dá para criar 10 segmentos no painel (`paises contém <cc>`) e mirar o segmento, dispensando a reconciliação de tags. O código atual usa tags por serem o alvo mais previsível pela API.

## Arquivos

| Arquivo | Papel |
|---------|-------|
| `src/alerts/kit.ts` | Cliente da API V4 do Kit (subscribers, tags, broadcasts). |
| `src/alerts/send-email.ts` | CLI de envio mensal: diff por país mudado, reconcilia tags e dispara broadcasts. |
| `src/diff/run.ts` | `diffCountry()` e `diffAllCountries()` reusados pela CLI e pelo envio. |
| `.github/workflows/monthly-update.yml` | Dispara o envio mensal. |
| `functions/_shared/kit.ts` | Cliente do Kit para o runtime de Pages (buscar, atualizar, cancelar, inscrever via formulário). |
| `functions/api/aluno/alertas.ts` | Endpoint da Área do Aluno: GET (estado), POST (inscrever/atualizar), DELETE (cancelar). |
| `previews/area-aluno/alertas.html` | Página da Área Aluno: inscrição e gestão de preferências, falando com o endpoint acima. |
