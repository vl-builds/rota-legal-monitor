# Contribuindo com o Rota Legal Monitor

O Rota Legal Monitor é um projeto de dados abertos que extrai, valida e publica mensalmente as condições de imigração de 10 países para brasileiros que querem trabalhar no exterior. Os dados vêm de fontes oficiais de imigração e são processados por um pipeline automático com múltiplas camadas de validação.

Contribuições são bem-vindas: correções de dados, novos países, melhorias no schema, aprimoramentos no pipeline.

## Modelo open-core

O repositório `rota-legal-monitor` é **público**. O código do pipeline, os dados de países e as páginas públicas do site vivem aqui.

Conteúdo pago, painel administrativo e dados pessoais de alunos vivem no repositório **privado** `rota-legal-premium` e nunca devem entrar neste repositório público.

Caminhos que nunca entram aqui:

- `previews/area-aluno/cenarios/`, `calculadora-pro.html`, `comparar-pro.html`, `checklist.html`, `alertas.html`
- `previews/area-admin/`
- `src/scenarios/`, `src/site/scenario-page.ts`, `data/scenarios/`
- Qualquer `credentials.json`, `.env*`, `.dev.vars`, arquivos `*.db` ou `*.sqlite`

O hook `.githooks/pre-commit` bloqueia o commit desses caminhos no repositório público. Ele é ativado automaticamente pelo `bun install` (via script `prepare`).

## Setup local

Pré-requisito: **Bun 1.1+** (ver [bun.sh](https://bun.sh)).

```bash
# Instala dependências e configura o git hook de segurança
bun install
```

A maioria das contribuições de dados não exige a variável de ambiente `ANTHROPIC_API_KEY`. Ela é necessária apenas para rodar extrações LLM (`bun run extract`). Para corrigir valores em `data/current/` manualmente, não precisa da chave.

Se for rodar extração, crie `.env` na raiz com:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Tipos de contribuição

### 1. Reportar um erro nos dados

Se encontrar um valor incorreto ou desatualizado, abra uma issue no GitHub com:

- O código do país (ex: `nl`, `pt`, `de`)
- O campo específico (ex: `generalRequirements.minimumWage`)
- O valor incorreto que está publicado
- A fonte oficial que contradiz o dado (URL da página de imigração oficial)

### 2. Corrigir um valor diretamente

Para correções simples em `data/current/{cc}.json`:

```bash
# Edite o arquivo do país
# Ex: data/current/nl.json

# Valide o JSON contra o schema
bun run validate

# Confirme que os tipos estão corretos
bun run typecheck
```

Abra um PR com o link da fonte oficial que justifica a correção. O título do commit deve seguir o padrão `fix(data): ...` ou `fix(nl): ...`.

**Importante:** não edite `data/history/`. O histórico é o produto e nunca deve ser alterado manualmente.

### 3. Adicionar um país novo

O processo completo está documentado em `docs/adding-countries.md`. O resumo dos passos principais:

1. Documente as fontes em `docs/sources.md` (mínimo de 3 URLs por país, idealmente de 3 a 8).
2. Crie `src/sources/{cc}.ts` exportando um `SourceConfig`. O campo `verificationUrls` é obrigatório: são os links usados pela auditoria cruzada automática para verificar os valores extraídos.
3. Registre o país em `src/sources/index.ts`.
4. Rode a extração:
   ```bash
   bun run extract --country={cc}
   ```
5. Valide manualmente o JSON gerado contra as fontes (mínimo 5 campos críticos).
6. Rode `bun run validate` e `bun run typecheck`.
7. Atualize a tabela de status no `README.md`.
8. Abra o PR com título `feat(country): adicionar {nome do país}`.

Critério de aceite: pelo menos 3 fontes funcionando, `extractionConfidence` em `high` ou `medium`, revisão humana dos valores críticos.

### 4. Melhorar o schema

Mudanças em `src/extractors/schema.ts` exigem migração simultânea de:

- `src/extractors/schema.ts`
- `docs/data-schema.md`
- Todos os arquivos em `data/current/`

Sem a migração dos dados, a validação quebra no próximo ciclo de extração. Abra uma issue antes para discutir a mudança.

## Travas de qualidade

O projeto tem duas travas que o CI executa todo mês e que você pode rodar localmente:

**`bun run guard` (bloqueante):** detecta extração degradada comparando o resultado atual com o git HEAD. Verifica churn de IDs de visto, variação de contagem, regressões em campos críticos (proofOfFunds, minimumWage) e perda de enriquecimento. Se o guard detectar degradação, o commit e o deploy são abortados e uma issue é aberta no GitHub.

**`bun run audit` (não bloqueante):** auditoria cruzada via LLM. Busca os `verificationUrls` de cada país e compara os valores críticos (salário mínimo, taxas, renda exigida) contra os dados extraídos. Divergência maior que 5% é anotada em `reliability.knownIssues` e gera uma issue de revisão. Não impede o deploy.

Se você fizer alterações no pipeline de extração, rode ambos antes de abrir o PR.

## Comandos essenciais

| Comando | O que faz |
|---|---|
| `bun install` | Instala dependências e configura o git hook |
| `bun run extract` | Extrai todos os países |
| `bun run extract --country={cc}` | Extrai só um país (ex: `--country=nl`) |
| `bun run validate` | Valida todos os JSONs em `data/current/` contra o schema |
| `bun run typecheck` | Roda `tsc --noEmit` para verificar tipos |
| `bun test` | Roda os testes |
| `bun run guard` | Detecta degradação na extração vs HEAD |
| `bun run audit` | Auditoria cruzada: valores extraídos vs fontes de verificação |
| `bun run diff` | Compara `data/current/` com o último snapshot em `data/history/` |
| `bun run site:generate` | Gera as páginas HTML do site a partir dos dados |

## Convenções

- **Nomes de arquivos:** kebab-case (`netherlands-source.ts`, não `NetherlandsSource.ts`)
- **Códigos de país:** ISO 3166-1 alpha-2 minúsculo (`nl`, `pt`, `de`)
- **Datas:** sempre ISO 8601 (`2026-04-28T10:30:00Z`)
- **Valores monetários:** sempre objeto `{ amount: number, currency: 'EUR' }`, nunca string com símbolo
- **Imports:** absolutos a partir de `src/` usando o alias `@/` configurado no tsconfig
- Sempre rode `bun run typecheck` antes de finalizar qualquer mudança em TypeScript

**Regras de prosa (docs, mensagens de commit):**

- Nunca usar travessão. Substituir por dois pontos, vírgula, parênteses ou frase nova.
- Sem ponto e vírgula em texto corrido.
- Português brasileiro.
- Sem emoji em documentação.

## Fluxo de PR

1. Faça fork do repositório e crie uma branch descritiva (`fix/nl-minimum-wage-2026`, `feat/country-se`).
2. Faça as alterações seguindo as convenções acima.
3. Rode `bun run validate` e `bun run typecheck` e confirme que passam.
4. Escreva uma mensagem de commit no formato `tipo(escopo): descrição` (ex: `fix(data): corrigir salário mínimo Holanda jun/2026`).
5. Abra o PR descrevendo o que foi alterado e linkando a fonte oficial que embasou a mudança.

PRs sem referência a fontes oficiais para mudanças de dados serão pedindo revisão antes do merge.
