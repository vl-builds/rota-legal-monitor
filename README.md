# Rota Legal Monitor

> Monitor mensal automatizado das condições de imigração legal em 10 países (9 europeus e Austrália) para brasileiros que pretendem trabalhar como entregadores de delivery.

Parte do ecossistema **HenryZuka**. Este repositório alimenta de dados frescos a ferramenta web *Rota Legal* e fornece a fonte de verdade que o e-book *Rota Holanda* referencia.

---

## O que este projeto faz

No dia 1 de cada mês, automaticamente:

1. Visita as páginas oficiais de imigração de 10 países (Holanda, Portugal, Alemanha, Espanha, Irlanda, Itália, França, Bélgica, Áustria, Austrália)
2. Extrai dados estruturados sobre vistos, requisitos, taxas, prazos e mudanças recentes usando a API da Anthropic
3. Valida os dados contra um schema Zod
4. Salva um snapshot em JSON no diretório `data/current/`
5. Comita o histórico no `data/history/` para rastrear mudanças ao longo do tempo
6. Abre uma issue no GitHub se detectar mudança significativa

O resultado é um conjunto de arquivos JSON estáticos que o frontend consome via CDN do GitHub, sem precisar de servidor próprio.

## Por que isso importa

A maioria dos guias de imigração para brasileiros envelhece em meses. Requisitos de renda mudam, valores de taxa sobem, novos vistos são criados. Manter conteúdo manual atualizado é caro e propenso a falhas.

Com este monitor:

- O e-book pode dizer "consulte a versão atual em rotalegal.app"
- A ferramenta web sempre mostra dados frescos com data da última verificação
- O usuário confia mais no produto porque vê quando foi atualizado
- Concorrentes que vendem PDF estático ficam visivelmente desatualizados

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
```

Detalhe completo em [`docs/architecture.md`](docs/architecture.md).

## Quickstart

Pré-requisitos: Bun 1.1+ ou Node 20+, uma API key da Anthropic.

```bash
# clonar e instalar
git clone https://github.com/SEU_USER/rota-legal-monitor
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
```

O resultado fica em `data/current/{country}.json`.

## Estrutura do repositório

```
rota-legal-monitor/
├── README.md                    voce esta aqui
├── CLAUDE.md                    instrucoes para Claude Code
├── PLAN.md                      roadmap de implementacao em 6 fases
├── spec.md                      especificacao tecnica completa
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
|
├── docs/
|   ├── architecture.md          design do sistema
|   ├── sources.md               registro das fontes oficiais
|   ├── data-schema.md           contratos TypeScript
|   ├── extraction-strategy.md   como funciona a extracao via LLM
|   ├── workflow.md              fluxo mensal passo a passo
|   ├── model-routing.md         quando usar Haiku vs Sonnet por URL
|   ├── cost-and-billing.md      estimativa de custos e cenarios
|   └── adding-countries.md      como adicionar novo pais
|
├── src/
|   ├── cli/                     comandos executaveis
|   ├── sources/                 config por pais (urls, modelo por url)
|   ├── extractors/              fetch + LLM + validacao
|   ├── lib/                     utilitarios compartilhados (log, models)
|   ├── storage/                 leitura e escrita de snapshots
|   ├── diff/                    deteccao de mudancas
|   └── notify/                  alertas via GitHub Issues
|
├── data/
|   ├── current/                 ultimo snapshot por pais
|   └── history/                 snapshots mensais arquivados
|
└── .github/
    └── workflows/
        └── monthly-update.yml   cron mensal (dia 1)
```

## Consumindo os dados

Os snapshots JSON ficam disponíveis publicamente via GitHub Pages, sem autenticação e com CORS habilitado:

```
https://SEU_USER.github.io/rota-legal-monitor/{cc}.json
https://SEU_USER.github.io/rota-legal-monitor/index.json
```

Exemplos:

```
https://SEU_USER.github.io/rota-legal-monitor/nl.json   # Holanda
https://SEU_USER.github.io/rota-legal-monitor/pt.json   # Portugal
https://SEU_USER.github.io/rota-legal-monitor/de.json   # Alemanha
https://SEU_USER.github.io/rota-legal-monitor/es.json   # Espanha
https://SEU_USER.github.io/rota-legal-monitor/ie.json   # Irlanda
https://SEU_USER.github.io/rota-legal-monitor/it.json   # Italia
https://SEU_USER.github.io/rota-legal-monitor/fr.json   # Franca
https://SEU_USER.github.io/rota-legal-monitor/be.json   # Belgica
https://SEU_USER.github.io/rota-legal-monitor/at.json   # Austria
https://SEU_USER.github.io/rota-legal-monitor/au.json   # Australia
```

O `index.json` lista todos os países disponíveis com metadados (última atualização, número de tipos de visto, nível de confiança). Use-o para descobrir quais países têm dados antes de buscar o JSON completo.

Substitua `SEU_USER` pelo seu nome de usuário do GitHub. Configure o GitHub Pages apontando para o branch `gh-pages` nas configurações do repositório.

## Status dos países

| País | Código | Prioridade | Status |
|------|--------|------------|--------|
| Holanda | `nl` | P0 | ativo |
| Portugal | `pt` | P1 | ativo |
| Alemanha | `de` | P2 | ativo |
| Espanha | `es` | P3 | ativo |
| Irlanda | `ie` | P4 | ativo |
| Itália | `it` | P5 | ativo |
| França | `fr` | P6 | ativo |
| Bélgica | `be` | P7 | ativo |
| Áustria | `at` | P8 | ativo |
| Austrália | `au` | P9 | ativo |

Cada país é uma config isolada em `src/sources/{cc}.ts`. Adicionar país novo é seguir [`docs/adding-countries.md`](docs/adding-countries.md).

> Windows: o Playwright não consegue iniciar o chromium headless em alguns ambientes Windows. O fallback é ignorado nesses casos e a extração continua com as URLs que respondem via fetch nativo. No CI (Ubuntu) o Playwright funciona normalmente.

> Austrália: único país fora da Europa na v1.0. Incluído por relevância para brasileiros via Working Holiday Visa subclass 462. O campo `audienceFit` está marcado como `narrow` no source config.

## Como começar a desenvolver

Se você é o Claude Code lendo isso pela primeira vez, vá direto para [`CLAUDE.md`](CLAUDE.md). Depois leia [`PLAN.md`](PLAN.md) e execute as fases na ordem.

Se você é humano, leia [`spec.md`](spec.md) para a visão completa.

## Custo estimado de operação

- GitHub Actions: gratuito (free tier cobre folgadamente um cron mensal)
- Hospedagem dos JSON: gratuita (GitHub Pages)
- API da Anthropic: USD 4 a 10 por ano com 10 países e estratégia híbrida 80/20 (detalhe em [`docs/cost-and-billing.md`](docs/cost-and-billing.md))
- Domínio: opcional

Com os USD 5 de crédito grátis da Anthropic para contas novas, o sistema cobre os primeiros 6 meses no cenário inicial. Com cache de hash ativo, o crédito dura mais de 1 ano.

## Licença

A definir. Provavelmente MIT para o código e CC BY-SA para os dados extraídos.

---

Todas as 6 fases do roadmap estão completas. 10 países ativos, 128 testes, extração mensal automatizada. Última atualização desta documentação: abril de 2026.
