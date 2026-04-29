# Architecture

Como o Rota Legal Monitor está montado por dentro. Foco em decisões e fluxo, não em código linha a linha.

## Visão geral

```
                    GitHub Actions (cron mensal)
                              │
                              ▼
                    ┌─────────────────┐
                    │  cli/extract.ts │
                    │  orquestrador   │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
            ┌──────┐    ┌──────┐    ┌──────┐
            │ nl   │    │ pt   │    │ de   │   sources/
            │ urls │    │ urls │    │ urls │   por pais
            └──┬───┘    └──┬───┘    └──┬───┘
               │           │           │
               └─────┬─────┴─────┬─────┘
                     ▼           ▼
              ┌──────────────────────────┐
              │ extractors/fetcher.ts    │
              │ fetch + Playwright fallb │
              └──────────────┬───────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │ extractors/llm-extractor │
              │ Anthropic API + Zod      │
              └──────────────┬───────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │ storage/snapshot.ts      │
              │ archive + write current  │
              └──────────────┬───────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │ diff/detect-changes.ts   │
              │ classifica relevancia    │
              └──────────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
        ┌────────────────┐       ┌────────────────┐
        │ git commit +   │       │ notify/        │
        │ push           │       │ github-issue   │
        └────────────────┘       └────────────────┘
```

## Componentes

### `cli/`

Pontos de entrada executáveis. Cada arquivo aqui mapeia direto para um script no `package.json`.

- `extract.ts`: orquestrador principal. Lê argumento `--country` (default: todos), itera, chama os outros componentes.
- `diff.ts`: comando standalone para inspecionar diferenças entre `current` e o último arquivo em `history`.
- `validate.ts`: valida todos os JSONs em `data/current/` contra o schema Zod, sem fazer extração.

### `sources/`

Configuração declarativa por país. Não contém lógica, só dados.

Cada arquivo `{cc}.ts` exporta um objeto com:

- Lista de URLs a visitar
- Para cada URL: tipo de conteúdo esperado (visa-info, fees, requirements, news), prompt específico para passar ao LLM
- Metadados do país (nome em PT-BR, idiomas oficiais para tradução)
- Frequência sugerida (mensal por padrão)

### `extractors/fetcher.ts`

Responsável por trazer o HTML para casa.

- Tenta primeiro com `fetch` nativo (rápido, leve)
- Se a resposta vier vazia ou com `<noscript>` dominando, recorre ao Playwright
- Aplica rate limit por host: mantém um Map de `host → lastFetchedAt` e dorme se necessário
- User-Agent: `Rota-Legal-Monitor/0.1 (+https://github.com/USER/rota-legal-monitor)`
- Respeita timeout de 30 segundos por página

### `extractors/llm-extractor.ts`

O cérebro. Recebe HTML limpo (já passou por Readability) e devolve JSON validado.

Estratégia:

1. Constrói prompt baseado no `contentType` que veio do source config
2. Usa tool use da API da Anthropic com schema Zod convertido para JSON Schema
3. O modelo é forçado a chamar uma "tool" cuja entrada é exatamente o objeto que queremos
4. Validamos a entrada da tool contra Zod no nosso lado para confirmar
5. Em caso de erro, retry com backoff exponencial (3 tentativas)
6. Se todos os retries falharem, registra erro e segue para próxima URL (não derruba a extração inteira)

Detalhe completo em `extraction-strategy.md`.

### `storage/snapshot.ts`

Camada fina sobre o filesystem.

- `readCurrent(country)`: lê `data/current/{cc}.json`, retorna null se não existe
- `writeCurrent(country, data)`: serializa com 2 espaços de indentação, ordena chaves para diff estável
- `archiveCurrent(country)`: copia o atual para `data/history/{cc}/{YYYY-MM-DD}.json`. Se já existe arquivo da data de hoje, sobrescreve.
- `listHistory(country)`: lista todos os snapshots históricos ordenados por data

### `diff/detect-changes.ts`

Compara dois snapshots e classifica diferenças.

**Alta relevância** (abre issue automaticamente):

- Mudança em qualquer campo `MoneyAmount` (rendas mínimas, taxas)
- Adição ou remoção de `VisaType`
- Mudança em `forBrazilians.workPermitNeeded`
- Mudança em `forBrazilians.maxStayDaysAsTourist`
- Adição em `recentChanges` com `severity: 'major'`

**Média relevância** (logada, vai pro commit message):

- Mudança em strings longas (`description`, `notes`)
- Mudança em prazos de processamento estimados
- Reordenação de itens em arrays

**Baixa relevância** (ignorada para fins de notificação):

- Mudança em `meta.lastUpdated`
- Mudança em `reliability.extractionConfidence` quando se mantém em high ou medium

A saída é um objeto `ChangeSummary` com listas separadas por relevância e também um markdown formatado para colar em issue.

### `notify/github-issue.ts`

Quando há mudança alta, abre issue via `gh` CLI ou via API direta.

- Título: `[{country}] Mudança detectada: {resumo curto}`
- Corpo: markdown gerado pelo diff
- Labels: `data-update`, `country/{cc}`, `relevance/high`
- Atribui ao mantenedor do repo

### `lib/log.ts`

Logger estruturado pequeno. Saída em JSON quando rodando em CI, formatado quando rodando local. Níveis: debug, info, warn, error. Nunca usar `console.log` direto fora desse arquivo.

## Fluxo de dados detalhado

Exemplo do que acontece quando alguém roda `bun run extract:nl`:

1. `cli/extract.ts` carrega `src/sources/nl.ts`
2. Para cada URL no array (suponha 4 URLs):
   1. `fetcher.fetchPage(url)` retorna HTML
   2. Readability extrai conteúdo principal (descarta header, footer, sidebar)
   3. `llm-extractor.extractFromHtml(content, schema, prompt)` retorna parcial validado
   4. Acumula no objeto consolidado do país
3. Após todas URLs: monta `meta.sources`, `meta.lastUpdated`
4. `storage.archiveCurrent('nl')`: snapshot anterior vai pro history
5. `storage.writeCurrent('nl', data)`: novo snapshot vira o current
6. `diff.diffSnapshots(old, new)`: gera resumo
7. Se em CI e diff é alto: `notify.openIssue(summary)`
8. Em CI: `git add data/ && git commit && git push`

## Decisões e trade-offs

**Por que Bun em vez de Node?** Inicialização mais rápida, fetch nativo, runtime de testes embutido sem precisar de jest/vitest. A única razão para considerar Node seria compatibilidade com bibliotecas legacy, mas não usamos nenhuma.

**Por que Zod em vez de só TypeScript?** Tipos do TS desaparecem em runtime. Como recebemos dados de fora (LLM, HTML, fetch), precisamos validar em runtime. Zod gera tipo estático e validador runtime do mesmo schema.

**Por que arquivos JSON em vez de SQLite?** Diff visual no GitHub é grátis. Ferramentas de revisão de PR funcionam direto. Usuário pode baixar um JSON e abrir no editor. SQLite seria mais rápido mas não temos requisito de performance.

**Por que LLM em vez de seletores CSS?** Sites de governo redesenham sem aviso e sem changelog. Manter seletor `#main-content > div.requirements > ul:nth-child(3)` é dor de cabeça. LLM extrai por significado, não por estrutura.

**Por que não ter painel admin?** Adicionar dependências e infra para um caso de uso que acontece talvez 1 vez por mês não vale. Editar JSON e abrir PR é suficiente.

**Por que GitHub Actions em vez de Vercel Cron / fly.io / Render?** Free tier do Actions cobre folgadamente, integração nativa com Issues e PRs, secrets já estão lá. Outros serviços teriam que ser configurados separadamente para ganhar pouca coisa.
