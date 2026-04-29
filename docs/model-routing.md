# Model Routing

Estratégia de roteamento de modelos LLM por URL. Define quando usar Haiku 4.5 (padrão) e quando promover para Sonnet 4.5 (URLs críticas).

## Por que híbrido

Usar Sonnet em todas as URLs custaria USD 21 por ano com 10 países. Haiku puro custaria USD 7. O híbrido 80/20 (40 URLs Haiku, 10 URLs Sonnet) entrega qualidade equivalente por USD 9,66 por ano.

A distinção é pragmática: Haiku acerta consistentemente em páginas bem estruturadas (listas, tabelas, FAQs). Sonnet vale o custo extra apenas quando há ambiguidade semântica real: vistos parecidos com nomes similares, valores monetários com condicionais, texto jurídico denso ou idioma menos comum.

Detalhe completo de custo em `docs/cost-and-billing.md`.

## Constante de modelos

Todos os source configs importam de `src/lib/models.ts`:

```typescript
export const MODELS = {
  haiku:  'claude-haiku-4-5',
  sonnet: 'claude-sonnet-4-5',
} as const

export type ModelKey = keyof typeof MODELS
```

Nunca hardcodar o nome do modelo em `src/sources/{cc}.ts`. Usar sempre `MODELS.haiku` ou `MODELS.sonnet`.

## Como configurar por URL

Cada entrada no array `urls` do SourceConfig aceita o campo opcional `model`:

```typescript
urls: [
  {
    url: 'https://ind.nl/en/residence-permits/work',
    contentType: 'visa-overview',
    promptHint: 'hub de todos os tipos de visto de trabalho, multiplos vistos por pagina',
    model: 'sonnet',
    fetchFrequency: 'monthly',
  },
  {
    url: 'https://ind.nl/en/fees-costs-of-an-application',
    contentType: 'fees',
    promptHint: 'tabela de taxas por tipo de visto',
    model: 'haiku',
    fetchFrequency: 'monthly',
  },
]
```

Se `model` for omitido, o extrator usa `MODELS.haiku` por padrão.

## Critérios para Sonnet

Marcar uma URL como `model: 'sonnet'` quando apresentar dois ou mais dos seguintes:

- **Vistos parecidos com nomes similares na mesma página:** risco de o modelo confundir categorias. Exemplo: "Skilled Worker", "Highly Skilled Migrant" e "EU Blue Card" numa listagem única.
- **Valores monetários com condicionais ou notas de rodapé:** "EUR 5.688 para profissionais acima de 30 anos, EUR 4.171 para 18 a 30 anos, exceto em cidades com acordo regional". Haiku tende a omitir as condições.
- **Seção de mudanças recentes em destaque:** páginas com "What's new", "Actualizaciones" ou "Änderungen" onde conteúdo novo se mistura com texto perene e o modelo precisa inferir o que mudou.
- **PDF complexo com tabelas aninhadas:** extração com múltiplas colunas e notas de rodapé cruzadas.
- **Idioma menos representado no treinamento:** italiano burocrático, alemão jurídico denso, holandês técnico legislativo.

Exemplos práticos de URLs que tipicamente merecem Sonnet:

- Hub de vistos de trabalho com 6 ou mais tipos listados na mesma página
- Página de decretos ou circulares com histórico de mudanças intercalado
- Tabela de taxas com subcategorias e condições por perfil de candidato

## Critérios para Haiku

Usar Haiku (padrão) quando a página for:

- **Lista de documentos exigidos:** conteúdo linear, campos bem definidos, sem ambiguidade entre categorias
- **Tabela de taxas simples:** valores numéricos diretos, poucas condições
- **FAQ ou guia passo a passo:** estrutura clara, cada passo isolado
- **Visão geral curta com links para subpáginas:** hub de navegação sem detalhes de elegibilidade
- **Página de requisitos gerais:** requisitos que se aplicam a todos os vistos do país igualmente

## Distribuição esperada

| Tipo | Quantidade | Percentual |
|------|-----------|-----------|
| URLs Haiku | 40 | 80% |
| URLs Sonnet | 10 | 20% |
| Total | 50 | 100% |

Cada país deve ter exatamente 1 URL marcada como Sonnet: tipicamente o hub principal de vistos ou a página com maior densidade semântica entre categorias similares.

## Avaliação após as primeiras execuções

Após as duas primeiras execuções de um país novo:

1. Conferir `reliability.extractionConfidence` no JSON gerado para cada URL
2. Se `'low'` em URL com `model: 'haiku'`: promover para `'sonnet'` e re-extrair
3. Se `'high'` em URL com `model: 'sonnet'` por três execuções seguidas: considerar rebaixar para `'haiku'` para reduzir custo
4. Anotar a decisão como comentário no campo `promptHint` do source config

Rebaixamento deve ser feito com cautela. A execução seguinte ao rebaixamento confirma se a qualidade se manteve.

## Override por execução

Para forçar todos os modelos numa extração pontual sem alterar o source config permanente:

```bash
bun run extract --country=nl --force-model=sonnet   # tudo Sonnet nesta run
bun run extract --country=de --force-model=haiku    # tudo Haiku nesta run
```

O flag `--force-model` sobrescreve o campo `model` de cada URL apenas para aquela execução. Útil para comparar qualidade entre modelos sem editar arquivos.

O suporte a `--force-model` fica em `src/cli/extract.ts` lendo `process.argv`.

## Tabela de custo por cenário

Premissas: 10 países, 5 URLs por país, 4.000 tokens de input por URL, 1.500 tokens de output, 12 execuções por ano.

| Cenário | URLs Sonnet | URLs Haiku | Custo por execução | Custo por ano |
|---------|------------|-----------|-------------------|--------------|
| A. Sonnet puro (referência) | 50 | 0 | USD 1,75 | USD 21 |
| B. Haiku puro | 0 | 50 | USD 0,58 | USD 7 |
| C. Híbrido 80/20 (recomendado) | 10 | 40 | USD 0,81 | USD 9,66 |
| D. Híbrido + cache de hash | 10 | 40 | USD 0,32 | USD 3,86 |
| E. Híbrido + cache hash + prompt caching | 10 | 40 | USD 0,21 | USD 2,50 |

Recomendação: começar com o Cenário C. Habilitar cache de hash (Cenário D) após 2 meses de execuções estáveis, quando tiver dados suficientes sobre taxa de mudança real das páginas.
