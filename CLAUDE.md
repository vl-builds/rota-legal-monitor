# CLAUDE.md

Instruções para o Claude Code trabalhando neste repositório. Mantenha curto. Aprofundamentos ficam em `docs/`.

## Stack

- **Runtime:** Bun 1.1+ (compatível com Node 20+)
- **Linguagem:** TypeScript estrito
- **LLM:** API da Anthropic, estratégia híbrida 80/20: Haiku 4.5 como padrão, Sonnet 4.5 em URLs marcadas como críticas. Ver `docs/model-routing.md`
- **Validação:** Zod
- **HTTP:** `fetch` nativo do Bun, com Playwright apenas como fallback para sites JS-pesados
- **Parser HTML:** `@mozilla/readability` para extrair conteúdo principal antes de mandar pro LLM
- **CI:** GitHub Actions (cron mensal, dia 1 de cada mês)
- **Storage:** arquivos JSON versionados no Git, sem banco de dados

## Antes de começar uma tarefa

1. Leia `PLAN.md` para entender em qual fase o projeto está
2. Leia o documento específico em `docs/` que cobre a área (data-schema, extraction-strategy, etc)
3. Se a tarefa envolve adicionar país novo, siga `docs/adding-countries.md`
4. Se modificar schema, atualize **simultaneamente**: `src/extractors/schema.ts`, `docs/data-schema.md`, e exemplos em `data/current/`

## Comandos essenciais

```bash
bun install              # instalar dependencias
bun run extract:nl       # extrair so a Holanda
bun run extract          # extrair todos os paises
bun run diff             # comparar current vs ultimo do history
bun run validate         # validar todos os JSON em current contra o schema
bun run typecheck        # tsc --noEmit
bun test                 # rodar testes
```

Sempre rode `bun run typecheck` antes de finalizar qualquer alteração em código TypeScript.

## Convenções

- **Nomes de arquivos:** kebab-case (`netherlands-source.ts`, não `NetherlandsSource.ts`)
- **Códigos de país:** ISO 3166-1 alpha-2 minúsculo (`nl`, `pt`, `de`)
- **Datas:** sempre ISO 8601 (`2026-04-28T10:30:00Z`)
- **Valores monetários:** sempre objeto `{ amount: number, currency: 'EUR' }`, nunca string com símbolo
- **Comentários no código:** somente quando explicam o porquê, nunca o quê
- **Imports:** absolutos a partir de `src/`, configurados via tsconfig paths

## Regras de escrita em prosa (docs, README, mensagens de commit)

São regras do projeto HenryZuka que valem aqui também:

- Nunca usar travessão (—). Substituir por dois pontos, vírgula, parênteses ou frase nova.
- Nunca usar ponto e vírgula (;) em texto corrido. Em código TypeScript, ponto e vírgula é normal.
- Português brasileiro.
- Sem emoji em prosa de documentação.
- Não citar ZZP nem a Diretiva 2024/1233 da UE no conteúdo extraído ou em prosa direcionada ao usuário final. No código e nas docs internas, é permitido referenciar tecnicamente quando indispensável.

## O que NUNCA fazer

- **Comitar `.env`** ou qualquer chave de API. O `.gitignore` cobre, mas confira sempre.
- **Mudar o schema sem migrar `data/current/`**. Schema novo + JSON antigo = quebra de validação no próximo run.
- **Fazer scraping sem rate limit**. Mínimo de 2 segundos entre requests pro mesmo domínio.
- **Confiar cegamente no output do LLM**. Sempre validar com Zod e falhar alto se inválido.
- **Deletar arquivos de `data/history/`**. O histórico é o produto.
- **Hardcodar URLs no código de extração**. URLs ficam em `src/sources/{cc}.ts`.

## Onde ler para se aprofundar

| Pergunta | Documento |
|----------|-----------|
| Como o sistema funciona como um todo? | `docs/architecture.md` |
| Que dados extraímos exatamente? | `docs/data-schema.md` |
| Como o LLM extrai dados estruturados? | `docs/extraction-strategy.md` |
| De que sites tiramos os dados? | `docs/sources.md` |
| Como o cron mensal funciona? | `docs/workflow.md` |
| Quando usar Haiku vs Sonnet em uma URL? | `docs/model-routing.md` |
| Como adicionar um país novo? | `docs/adding-countries.md` |
| Em que ordem implementar tudo? | `PLAN.md` |
| Por que o projeto existe? | `spec.md` |

## Quando estiver em dúvida

Pergunte antes de presumir. Especificamente:

- Mudanças de arquitetura grandes (trocar runtime, adicionar banco, mudar formato de saída) sempre passam por confirmação
- Adicionar dependência nova: justifique em uma frase no PR
- Renomear coisas que aparecem em mais de 3 arquivos: confirma antes
