# PLAN.md

Roadmap de implementação em fases. Cada fase tem objetivo claro, entregáveis verificáveis e critério de aceite. **Não pular fase**, mesmo que pareça mais rápido. As fases anteriores derisco as posteriores.

Estimativa total: 4 a 6 dias de trabalho focado.

---

## Fase 0. Setup do repositório

**Objetivo:** ter um repositório TypeScript funcional com tooling pronto antes de escrever lógica.

**Entregáveis:**

- `package.json` com scripts e dependências mínimas
- `tsconfig.json` com `strict: true`
- `.gitignore` cobrindo `.env`, `node_modules`, `*.log`
- `.env.example` listando variáveis necessárias (ANTHROPIC_API_KEY no mínimo)
- Estrutura de pastas `src/`, `data/current/`, `data/history/`, `docs/`
- README, CLAUDE.md, PLAN.md, spec.md já existentes (você está lendo)

**Critério de aceite:**

- `bun install` roda sem erro
- `bun run typecheck` roda e passa em arquivo de teste vazio
- Pode comitar e o `.env` real não vai junto

---

## Fase 1. Schema de dados e validação

**Objetivo:** definir o contrato exato dos dados que vamos extrair antes de tentar extrair.

**Entregáveis:**

- `src/extractors/schema.ts` exportando o schema Zod completo descrito em `docs/data-schema.md`
- Tipos TypeScript inferidos do Zod e exportados
- Um exemplo manual válido em `data/current/example.json` (preenchido à mão para servir de fixture)
- Teste unitário que carrega o exemplo e valida contra o schema

**Critério de aceite:**

- O exemplo passa na validação
- Quebrar um campo obrigatório no exemplo faz o teste falhar com mensagem clara
- `bun run validate` consegue ser invocado e valida `data/current/example.json`

**Por que primeiro:** se o schema estiver mal modelado, todo o resto reflete o erro. Travar o contrato antes economiza retrabalho.

---

## Fase 2. Cliente da API da Anthropic e extrator MVP

**Objetivo:** mandar HTML real para o Claude e receber JSON validado de volta.

**Entregáveis:**

- `src/extractors/llm-extractor.ts` com função `extractFromHtml(html, schema, prompt): Promise<T>`
- Uso do recurso de tool use para forçar JSON válido
- Retry com backoff exponencial (3 tentativas, 1s, 2s, 4s)
- Tratamento de erros distintos (rate limit, JSON inválido, schema inválido) com mensagens úteis
- Logs estruturados (não usar `console.log` cru, criar `src/lib/log.ts`)
- `src/lib/models.ts` exportando `MODELS.haiku` e `MODELS.sonnet` como constantes

**Critério de aceite:**

- Passar HTML manual de uma página da IND e receber objeto validado contra o schema
- Se o LLM devolver JSON inválido, função lança erro claro com o caminho do campo problemático
- Custo da chamada é registrado no log (input tokens + output tokens)

---

## Fase 3. Fontes da Holanda e fetcher

**Objetivo:** extrair dados reais da IND.nl e gerar primeiro snapshot válido.

**Entregáveis:**

- `src/sources/nl.ts` listando 4 a 6 URLs prioritárias da IND com metadados (tipo de visto que cobrem, frequência, campo `model`)
- `src/extractors/fetcher.ts` com função `fetchPage(url): Promise<{ html: string, fetchedAt: string }>`
- Rate limit por domínio (mínimo 2 segundos entre requests)
- User agent honesto identificando o projeto
- Fallback para Playwright só se a página retornar conteúdo vazio ou bloquear (detectar e logar)
- Pipeline completo: para cada URL em `nl.ts`, fetch -> readability -> llm-extractor -> consolida em um JSON único `data/current/nl.json`

**Critério de aceite:**

- `bun run extract:nl` roda do zero e gera `data/current/nl.json` válido
- O JSON gerado passa na validação Zod
- Custo total da extração da Holanda é menor que USD 0,15
- Tempo total de execução menor que 5 minutos

**Saída esperada:** primeira versão do `data/current/nl.json` comitada manualmente como referência.

---

## Fase 4. Detecção de mudanças e histórico

**Objetivo:** comparar snapshots e arquivar histórico.

**Entregáveis:**

- `src/diff/detect-changes.ts` com função `diffSnapshots(old, new): ChangeSummary`
- Saída estruturada listando: campos adicionados, removidos, modificados
- Categorização por relevância: alta (mudança em valor de renda, taxa, prazo), média (texto descritivo), baixa (timestamp, ordem de array)
- `src/storage/snapshot.ts` com `archiveSnapshot(country, json): void` que copia para `data/history/{country}/{YYYY-MM-DD}.json`

**Critério de aceite:**

- Pegar dois `nl.json` ligeiramente diferentes e gerar diff legível
- Diff produz JSON estruturado e também resumo em markdown
- `bun run diff` mostra mudanças entre `data/current/nl.json` e o snapshot mais recente em `data/history/nl/`

---

## Fase 5. GitHub Actions

**Objetivo:** automatizar a execução mensal.

**Entregáveis:**

- `.github/workflows/monthly-update.yml` rodando no dia 1 de cada mês às 06:00 UTC
- Steps: checkout, setup Bun, install, run extract, run diff, archive, commit e push
- Variável `ANTHROPIC_API_KEY` configurada como secret no repositório
- Variáveis de ambiente `ANTHROPIC_MODEL_DEFAULT=claude-haiku-4-5` e `ANTHROPIC_MODEL_PREMIUM=claude-sonnet-4-5` no step de extração
- Se o diff detectar mudança de relevância alta, abrir issue automaticamente com `gh issue create`
- Workflow também roda manualmente via `workflow_dispatch`

**Critério de aceite:**

- Trigger manual pelo botão Run workflow funciona end-to-end
- Commit automático aparece com mensagem `chore(data): monthly snapshot YYYY-MM-DD`
- Issue é aberta quando uma mudança alta é injetada artificialmente
- Falha em qualquer step para o pipeline e notifica via email do GitHub

---

## Fase 6. Países adicionais

**Objetivo:** estender para Portugal, Alemanha, Espanha, Irlanda, Itália, França, Bélgica, Áustria e Austrália.

**Entregáveis:**

- `src/sources/pt.ts`, `de.ts`, `es.ts`, `ie.ts`, `it.ts`, `fr.ts`, `be.ts`, `at.ts`, `au.ts` com URLs e prompts específicos por país
- Cada URL tem campo `model` definido seguindo os critérios de `docs/model-routing.md` (tipicamente 1 URL Sonnet e 4 Haiku por país)
- Considerações específicas de Portugal: CPLP e Tratado de Amizade Luso-Brasileiro merecem seção própria em `forBrazilians.specialAgreements`
- Considerações específicas da Austrália: Working Holiday Visa subclass 462 é o caminho principal para brasileiros. Marcar `audienceFit: 'narrow'` no source config. Sem Schengen: qualquer entrada exige visto.
- Cada país gera seu próprio `data/current/{cc}.json`

**Ordem sugerida de implementação:** Portugal primeiro (mais relevante para brasileiros via CPLP), depois Alemanha, Espanha, Irlanda, Itália, França, Bélgica, Áustria, Austrália.

**Critério de aceite:**

- `bun run extract` extrai todos os 10 países sequencialmente
- Tempo total menor que 50 minutos
- Custo total menor que USD 1 por execução
- Cada JSON valida contra o mesmo schema central

---

## Marcos de validação cruzada

Não passe da fase X para X+1 sem confirmar:

- **Após fase 1:** schema reflete fielmente o que o usuário final precisa ver na ferramenta web. Confira com a wireframe da ferramenta antes de avançar.
- **Após fase 3:** o `nl.json` gerado é qualitativamente confiável. Compare 5 campos com a fonte original manualmente.
- **Após fase 5:** o cron rodou pelo menos uma vez de verdade no Actions, não só no manual. Espere o dia 1 do mês seguinte ou ajuste o cron temporariamente.
- **Após fase 6:** os 10 países estão com qualidade equivalente. Holanda excelente e Espanha pela metade não conta.

## Riscos conhecidos

- **Bloqueio anti-bot:** alguns sites de governo podem ter Cloudflare ou similar. Mitigação: Playwright como fallback, headers de browser real, rate limit conservador.
- **Mudança de layout brusca:** o LLM ajuda, mas se a página inteira for redesenhada o conteúdo pode não estar mais nas URLs antigas. Mitigação: monitorar 404s e abrir issue.
- **Custo do LLM crescer:** se adicionarmos muitas URLs por país, custo escala. Mitigação: cache por hash do HTML (se o HTML não mudou, não chama o LLM) e estratégia híbrida Haiku/Sonnet.
- **Tradução inconsistente:** terminologia técnica em PT-BR varia. Mitigação: glossário centralizado em `docs/glossary.md` na fase 6.

## Definição de "pronto"

O projeto está pronto para v1.0 quando:

- 10 países estão sendo atualizados mensalmente sem intervenção manual por pelo menos 4 execuções seguidas (4 meses)
- O frontend consome os dados em produção
- Existem testes unitários para schema, fetcher, extractor e diff
- A documentação cobre as áreas listadas no README
- Existe um plano simples para alguém da comunidade abrir PR adicionando país novo
