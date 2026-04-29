# Workflow

O que acontece, em ordem cronológica, quando o cron mensal dispara. Documento de referência para entender o ciclo completo.

## Trigger

No dia 1 de cada mês às 06:00 UTC, o GitHub Actions executa o workflow `monthly-update.yml`. Também pode ser disparado manualmente pelo botão Run workflow no painel do Actions ou via `workflow_dispatch`.

A escolha do dia 1 é deliberada:

- Sites de governo costumam publicar mudanças no início do mês, então o dia 1 pega rápido
- Data previsível facilita comunicar ao usuário quando esperar a próxima atualização ("sempre nos primeiros dias do mês")
- A contagem de dias entre execuções nunca ultrapassa 31, mantendo o indicador dentro do limite verde do frontend
- 06:00 UTC é horário comercial cedo na Europa (08:00 NL, 03:00 BR), bom para abrir issue antes do início do dia útil

## Steps do workflow

### 1. Checkout

`actions/checkout@v4` com `fetch-depth: 2`. Precisamos de pelo menos o commit anterior para conseguir fazer diff útil em caso de debug.

### 2. Setup do runtime

Instalar Bun (`oven-sh/setup-bun@v1`). Versão fixada no `bun.lockb` do repo.

### 3. Install dependencies

`bun install --frozen-lockfile`. O `--frozen-lockfile` garante que ninguém adicionou dependência sem comitar o lock.

### 4. Validar antes de tocar em nada

`bun run validate` confirma que `data/current/` ainda está válido contra o schema atual. Se não está, o workflow falha aqui antes de fazer qualquer mudança (significa que alguém comitou JSON inválido ou mudou o schema sem migrar).

### 5. Backup do estado atual

Para cada `data/current/{cc}.json`, copiar para `data/history/{cc}/{YYYY-MM-DD}.json`. Se já existe arquivo dessa data (ex: re-run no mesmo dia), sobrescrever.

Isso é feito antes da extração, intencionalmente. Mesmo que a extração falhe, o histórico já está salvo.

### 6. Extração por país

Sequencial, não paralelo. Por quê:

- Rate limit é por host. Paralelizar países não viola, mas dá menos previsibilidade no log.
- Custo total é o mesmo.
- Se um país falhar, é mais fácil debugar com log linear.

Para cada país:

1. Carregar `src/sources/{cc}.ts`
2. Para cada URL: fetch -> readability -> llm-extractor (Haiku ou Sonnet conforme campo `model`) -> acumular
3. Validar o objeto consolidado
4. Se inválido: registrar erro, NÃO sobrescrever o `current`, abrir issue de extração quebrada
5. Se válido: escrever `data/current/{cc}.json`

### 7. Diff por país

Para cada país que foi atualizado, comparar o snapshot novo com o último arquivo em `data/history/{cc}/`. Classificar mudanças em alta, média, baixa.

Saída do diff vai para o log e também para um arquivo temporário `data/.diff-summary.md` que será usado nos próximos steps.

### 8. Decisão de notificação

Se algum país tem mudança de relevância **alta**:

- Abrir issue no GitHub via `gh issue create`
- Título: `Mudanca detectada em YYYY-MM-DD`
- Corpo: trecho relevante de `.diff-summary.md`
- Labels: `data-update`, `relevance/high`

Mudanças médias e baixas não geram issue. Vão pro log do Actions e pro corpo do commit.

### 9. Commit

Mensagem padrão: `chore(data): monthly snapshot YYYY-MM-DD`

Se houve mudança de qualquer relevância, mensagem detalhada:

```
chore(data): monthly snapshot 2026-05-01

Changes detected:
- nl: highly-skilled-migrant income threshold updated (5688 -> 5731)
- pt: new section about CPLP added to overview page

See data/history for previous snapshots.
```

### 10. Push

`git push origin master`. Se falhar (alguém pushou commit no meio), o workflow falha e roda de novo no mês seguinte. Tudo bem perder uma execução mensal ocasional.

### 11. Limpeza

Apagar `data/.diff-summary.md` (foi temporário). Não fica no commit.

## Tempo total esperado

- Checkout + setup: 30 segundos
- Install: 20 segundos (com cache)
- Extração: 4 a 6 minutos por país, 40 a 50 minutos para 10 países
- Diff e commit: 30 segundos

Total: aproximadamente 45 a 55 minutos por execução.

## Falhas e recuperação

### Site fora do ar

Se uma URL retorna 5xx ou timeout:

- Registrar no log
- Marcar essa fonte com `status: 'failed'` no `meta.sources`
- Continuar com as outras URLs do mesmo país
- Se TODAS as URLs do país falharem: não sobrescrever `current`, abrir issue de "país inacessível"

### LLM retornando JSON inválido

- Retry 3 vezes com backoff exponencial (1s, 2s, 4s)
- Se ainda falhar: marcar essa URL como failed, seguir
- Se mais de 50% das URLs do país falharem assim: abrir issue de "qualidade de extração comprometida"

### API key expirada ou sem créditos

- Falha alta no primeiro request
- Workflow para imediatamente, não tenta os outros países
- GitHub manda email automaticamente sobre falha do workflow
- Mantenedor entra, renova chave, dispara manual

### Schema migration durante run

Não deveria acontecer (workflow não modifica schema), mas se acontecer:

- O step de validação no início pega
- Pipeline para antes de tocar em dados

## Trigger manual fora do ciclo

Casos válidos para disparar manual:

- Mantenedor sabe que houve mudança importante e quer atualizar agora
- Adicionou país novo e quer popular `data/current/` pela primeira vez
- Bug fix no extrator e quer re-rodar para validar

Para disparar:

```bash
gh workflow run monthly-update.yml
# ou pelo painel web: Actions > Monthly Update > Run workflow
```

## Observabilidade

Cada execução deixa rastros em:

- **Log do Actions:** verboso, com cada URL fetched, custo de cada chamada do LLM, diff completo
- **Commit:** mensagem resumida, mudanças detectadas
- **Issues:** para mudanças altas e para erros
- **`data/history/`:** snapshots completos para inspeção posterior

Não usamos Sentry, Datadog ou similar. O log do Actions é suficiente para projeto deste tamanho.
