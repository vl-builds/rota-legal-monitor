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

São regras do projeto que valem aqui também:

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

---

## Design Context

> Contexto de design para o frontend em `previews/`. Gerado via /impeccable teach em abril de 2026.

### Usuários

Três perfis em momentos distintos da jornada:

1. **Decidindo**: Curioso, não sabe se é viável. Precisa ser convencido com fatos antes de detalhes.
2. **Comparando**: Quer ir, está escolhendo entre países. Quer ver critérios que importam para a sua situação lado a lado.
3. **Em processo**: Já escolheu, está juntando documentos. Usa o site como checklist contínua.

Contexto de uso: pesquisa em casa, celular ou desktop, geralmente à noite. Baixa tolerância para juridiquês. Alta tolerância para informação densa se estiver organizada.

### Personalidade da Marca

Três palavras: **confiável, direto, vivo.**

- Confiável: fontes linkadas, datas visíveis, limitações declaradas.
- Direto: linguagem de guia de amigo, não de advogado.
- Vivo: dados atualizados mensalmente de forma automática.

Emoção alvo: competência tranquila. Não impressionar, gerar confiança.

### Direção Estética

Dark mode. Canvas `#0a0a0a`, âmbar dourado `#f0b429` como único accent. Inter + JetBrains Mono. Inspiração: ClickHouse docs — denso, preciso, sem decoração. Anti-referências: sites de agência de imigração com stock photos, portais gov.br confusos, guias de blog informal.

### Princípios de Design

1. **Dados primeiro, narrativa depois.** Stat grande antes de parágrafo, não depois.
2. **Profundidade progressiva.** Resumo rápido aparece antes das abas técnicas.
3. **Confiança visível.** Cada bloco mostra quando foi atualizado e de onde veio.
4. **Uma ação por tela.** Cada página tem um CTA principal.
5. **Amarelo é escasso.** Um uso por seção, no máximo.

### Mapa de Seções

Detalhado em `.impeccable.md`. Resumo das páginas planejadas:

| Rota | Descrição |
|---|---|
| `/` | Home com hero, strip de confiança, 3 caminhos por perfil, países em foco, como funciona |
| `/paises` | Lista com filtros + grid de países |
| `/paises/[cc]` | Detalhe com resumo rápido (antes das abas) + 5 abas |
| `/comparar` | Seletor de 2-3 países + tabela comparativa |
| `/qual-pais` | Questionário de 6 perguntas + recomendação justificada |
| `/historico` | Timeline mensal de mudanças com filtros + alertas |
| `/calculadora` | Inputs de país/duração/estilo + output de reserva necessária |
| `/sobre` | Metodologia, limitações, como contribuir |
