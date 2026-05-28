# Rota Legal Monitor

> Monitor mensal automatizado das condições de imigração legal em 10 países (9 europeus e Austrália) para brasileiros que pretendem trabalhar legalmente no exterior.

Projeto criado por [Vitorcode1](https://github.com/Vitorcode1). Este repositório faz duas coisas: coleta dados de imigração mensalmente via scraping com LLM, e entrega um site estático que exibe essas informações de forma clara para quem está planejando emigrar.

---

## O que este projeto faz

**Camada de dados (backend):** no dia 1 de cada mês, automaticamente:

1. Visita as páginas oficiais de imigração de 10 países
2. Extrai dados estruturados sobre vistos, requisitos, taxas e prazos usando a API da Anthropic
3. Valida os dados contra um schema Zod e rejeita outputs inválidos
4. Salva um snapshot em JSON em `data/current/`
5. Arquiva o histórico em `data/history/` para rastrear mudanças ao longo do tempo
6. Abre uma issue no GitHub se detectar mudança significativa

**Camada visual (frontend):** um site estático em `previews/` que consome esses JSONs e exibe:

- Página inicial com perfis de usuário e países em destaque
- Lista comparativa dos 10 países com filtros
- Página de detalhe por país com resumo, vistos disponíveis, requisitos e fontes
- Comparador lado a lado de até 3 países
- Quiz "Qual país combina com você?" com 6 perguntas e recomendação justificada
- Calculadora de reserva financeira por país e duração
- Histórico de mudanças mês a mês
- Mais de 80 páginas individuais por tipo de visto

O resultado são arquivos estáticos que rodam sem servidor de aplicação. O site serve via GitHub Pages e os dados via CDN do GitHub.

## Por que isso importa

A maioria dos guias de imigração para brasileiros envelhece em meses. Requisitos de renda mudam, valores de taxa sobem, novos vistos são criados. Manter conteúdo manual atualizado é caro e propenso a falhas.

Com este monitor:

- A ferramenta web sempre mostra dados frescos com data da última verificação
- O usuário vê exatamente quando e de onde cada dado foi extraído
- Concorrentes que vendem PDF estático ficam visivelmente desatualizados

## Open-core: o que é aberto e o que não é

Este repositório é open-core. O motor de extração, os dados de imigração e o site público são abertos de propósito, porque transparência é o diferencial do projeto: qualquer pessoa pode auditar de onde vem cada número e como ele é extraído.

Aberto (neste repositório):

- Motor de extração e geração de páginas (`src/`)
- Dados de imigração (`data/current`, `data/history`)
- Site público (`previews/`, fora o conteúdo premium da Área do Aluno)
- Código de autenticação da área logada (`functions/`), sem segredos embutidos

Não incluído (produto pago, mantido em repositório privado):

- Cenários personalizados, Ferramentas Pro, checklist e alertas da Área do Aluno
- Painel administrativo e dados pessoais de alunos

Licença: código sob MIT, dados sob CC BY-SA. O conteúdo premium é todos os direitos reservados e não faz parte deste repositório.

## Arquitetura em 30 segundos

```
GitHub Actions (cron mensal: dia 1)
        |
  fetcher (fetch nativo + Playwright fallback)
        |
  extractor (Anthropic API + schema Zod)
        |
  validator (rejeita output invalido)
        |
  storage (JSON em data/current/)
        |
  diff (compara com snapshot anterior)
        |
  notify (issue no GitHub se mudou)
        |
  commit + push (historico em data/history/)
        |
  site estático em previews/ consome os JSONs
```

Detalhe completo em [`docs/architecture.md`](docs/architecture.md).

## Quickstart

Pré-requisitos: Bun 1.1+ ou Node 20+, uma API key da Anthropic.

```bash
# clonar e instalar
git clone https://github.com/Vitorcode1/rota-legal-monitor
cd rota-legal-monitor
bun install

# configurar
cp .env.example .env
# editar .env e colar sua ANTHROPIC_API_KEY

# rodar uma extracao local (Holanda)
bun run extract:nl

# rodar todos os paises
bun run extract

# verificar diff entre snapshot atual e anterior
bun run diff

# subir o site localmente na porta 4173
bun run serve
```

Com `bun run serve` rodando, abra `http://localhost:4173` no navegador para ver o site completo.

## Estrutura do repositório

```
rota-legal-monitor/
├── README.md                    voce esta aqui
├── CLAUDE.md                    instrucoes para o Claude Code
├── PLAN.md                      roadmap de implementacao em 6 fases
├── spec.md                      especificacao tecnica completa
├── package.json
├── tsconfig.json
├── .env.example
|
├── docs/
|   ├── architecture.md          design do sistema completo
|   ├── sources.md               registro das fontes oficiais por pais
|   ├── data-schema.md           contratos TypeScript dos dados extraidos
|   ├── extraction-strategy.md   como a extracao via LLM funciona
|   ├── workflow.md              fluxo mensal passo a passo
|   ├── model-routing.md         quando usar Haiku vs Sonnet por URL
|   ├── cost-and-billing.md      estimativa de custos e cenarios
|   └── adding-countries.md      como adicionar novo pais
|
├── src/
|   ├── cli/                     comandos executaveis (extract, diff, serve...)
|   ├── sources/                 config por pais (urls, modelo por url)
|   ├── extractors/              fetch + LLM + validacao Zod
|   ├── lib/                     utilitarios compartilhados
|   ├── storage/                 leitura e escrita de snapshots
|   ├── diff/                    deteccao de mudancas entre snapshots
|   ├── notify/                  alertas via GitHub Issues
|   └── site/                    gerador das paginas HTML estaticas
|
├── previews/                    site estatico (HTML + CSS + JS inline)
|   ├── assets/
|   |   └── design-system.css    tokens e componentes visuais
|   ├── index.html               home
|   ├── home.html                home (versao preview)
|   ├── paises.html              lista de paises com filtros
|   ├── pais-{cc}.html           detalhe por pais (nl, pt, de, es...)
|   ├── comparar.html            comparador lado a lado
|   ├── qual-pais.html           quiz de recomendacao
|   ├── calculadora.html         calculadora de reserva financeira
|   ├── historico.html           timeline de mudancas
|   ├── sobre.html               metodologia e limitacoes
|   └── vistos/                  mais de 80 paginas por tipo de visto
|
├── imagens/                     assets visuais do site (bandeiras, fundos)
|
├── data/
|   ├── current/                 ultimo snapshot por pais (10 JSONs)
|   └── history/                 snapshots mensais arquivados
|
└── .github/
    └── workflows/
        └── monthly-update.yml   cron mensal (dia 1)
```

## O site visual

O frontend fica em `previews/`. Toda a estética segue um design system documentado em `previews/assets/design-system.css` e `previews/CLAUDE.md`.

Paleta: dark mode com canvas `#0a0a0a` e accent âmbar `#f0b429`. Tipografia Inter + JetBrains Mono. Inspiração visual no estilo das docs da ClickHouse: denso, preciso, sem decoração.

Cada página é um arquivo HTML autocontido que carrega o design system via CSS e consome dados via JSON inline ou fetch local. Sem framework de frontend, sem build step para o site.

Para rodar o site:

```bash
bun run serve
# abre http://localhost:4173
```

Para gerar as páginas de países a partir dos JSONs de dados:

```bash
bun run site:generate
```

## Consumindo os dados via API

Os snapshots JSON ficam disponíveis publicamente via GitHub Pages, sem autenticação:

```
https://Vitorcode1.github.io/rota-legal-monitor/{cc}.json
https://Vitorcode1.github.io/rota-legal-monitor/index.json
```

Exemplos:

```
/nl.json   # Holanda
/pt.json   # Portugal
/de.json   # Alemanha
/es.json   # Espanha
/ie.json   # Irlanda
/it.json   # Italia
/fr.json   # Franca
/be.json   # Belgica
/at.json   # Austria
/au.json   # Australia
```

O `index.json` lista todos os países com metadados (última atualização, número de vistos, nível de confiança). Use-o para descobrir o que está disponível antes de buscar o JSON completo de um país.

## Status dos países

| País | Código | Status | Vistos mapeados |
|------|--------|--------|-----------------|
| Holanda | `nl` | ativo | 16 |
| Portugal | `pt` | ativo | 6 |
| Alemanha | `de` | ativo | 6 |
| Espanha | `es` | ativo | 5 |
| Irlanda | `ie` | ativo | 9 |
| Itália | `it` | ativo | 4 |
| França | `fr` | ativo | 13 |
| Bélgica | `be` | ativo | 3 |
| Áustria | `at` | ativo | 8 |
| Austrália | `au` | ativo | 5 |

Cada país é uma config isolada em `src/sources/{cc}.ts`. Para adicionar um país novo, siga [`docs/adding-countries.md`](docs/adding-countries.md).

> Windows: o Playwright não consegue iniciar o Chromium headless em alguns ambientes. O fallback é ignorado nesses casos e a extração continua com as URLs que respondem via fetch nativo. No CI (Ubuntu) o Playwright funciona normalmente.

## Como contribuir

O projeto está ativo e aceita contribuições nas seguintes frentes:

### Dados e extração

- **Adicionar um país novo:** siga o guia em [`docs/adding-countries.md`](docs/adding-countries.md). Os países mais pedidos são: Reino Unido, Canadá, Emirados Árabes e Nova Zelândia.
- **Verificar fontes existentes:** as URLs oficiais estão em `src/sources/{cc}.ts`. Se algum link quebrou ou há uma fonte melhor, abra um PR atualizando o campo `url` ou `verificationUrls`.
- **Corrigir dados extraídos:** se você perceber que um valor extraído está errado (salário mínimo, taxa, prazo), crie um patch em `scripts/patches/` seguindo o padrão existente e abra uma issue descrevendo a divergência.

### Frontend e design

- **Melhorar uma página existente:** as páginas ficam em `previews/`. Toda página nova ou editada deve usar apenas as classes do `design-system.css`.
- **Traduzir conteúdo:** o site está em português brasileiro. Se quiser adicionar suporte a espanhol ou inglês, abra uma issue para discutir a abordagem antes.
- **Reportar bug visual:** abra uma issue com screenshot, URL da página e descrição do comportamento esperado.

### Infraestrutura

- **Melhorar o pipeline de extração:** o código de extração fica em `src/extractors/`. Melhorias de performance, cache ou robustez são bem-vindas.
- **Ampliar os testes:** os testes ficam em `tests/`. Cobertura atual: 128 testes. Novas asserções sobre casos de borda são sempre úteis.

### Como abrir um PR

1. Fork o repositório
2. Crie um branch descritivo: `feat/adiciona-reino-unido` ou `fix/nl-salario-minimo`
3. Rode `bun run typecheck` e `bun test` antes de submeter
4. Descreva no PR o que mudou e por que, com link para a fonte oficial se envolver dados

Se tiver dúvida sobre por onde começar, abra uma issue com a etiqueta `pergunta` e descreva o que quer fazer.

## Custo estimado de operação

- GitHub Actions: gratuito (free tier cobre folgadamente um cron mensal)
- Hospedagem do site e JSONs: gratuita (GitHub Pages)
- API da Anthropic: USD 4 a 10 por ano com 10 países e estratégia híbrida Haiku/Sonnet (detalhe em [`docs/cost-and-billing.md`](docs/cost-and-billing.md))
- Domínio: opcional

Com os USD 5 de crédito inicial da Anthropic para contas novas, o sistema cobre os primeiros 6 meses. Com cache de hash ativo, o crédito dura mais de 1 ano.

## Licença

A definir. Provavelmente MIT para o código e CC BY-SA para os dados extraídos.

---

10 países ativos, mais de 80 tipos de visto mapeados, extração mensal automatizada. Última atualização: maio de 2026.
