# Cost and Billing

Guia de custos do Rota Legal Monitor. Atualizado para cadência mensal (dia 1 de cada mês, 12 execuções por ano) e estratégia híbrida de modelos Haiku/Sonnet.

## Premissas técnicas

- 10 países monitorados
- Média de 5 URLs por país, 50 URLs por execução
- Conteúdo limpo por URL: 5 a 15 KB, estimando 4.000 tokens de input por URL (após Readability)
- Output por URL: aproximadamente 1.500 tokens
- Distribuição de modelos: 40 URLs no Haiku 4.5 (80%) e 10 URLs no Sonnet 4.5 (20%)
- Tokens de input por execução: 50 URLs x 4.000 = 200.000 tokens
- Tokens de output por execução: 50 URLs x 1.500 = 75.000 tokens
- Cadência mensal: 12 execuções por ano

## Cenários de custo

| Cenário | Modelo | Otimizações | Custo por execução | Custo por ano |
|---------|--------|-------------|-------------------|---------------|
| A: Sonnet puro | Sonnet 4.5 | nenhuma | USD 1,73 | USD 21 |
| B: Haiku puro | Haiku 4.5 | nenhuma | USD 0,59 | USD 7 |
| C: Híbrido 80/20 (recomendado) | Haiku 4.5 + Sonnet 4.5 | nenhuma | USD 0,81 | USD 9,66 |
| D: Híbrido + cache de hash | Haiku 4.5 + Sonnet 4.5 | hash cache | USD 0,32 | USD 3,86 |
| E: Híbrido + todos os caches | Haiku 4.5 + Sonnet 4.5 | hash + prompt cache | USD 0,21 | USD 2,50 |

### Detalhamento do Cenário C (híbrido 80/20)

| Componente | Cálculo | Custo |
|------------|---------|-------|
| 40 URLs Haiku (input) | 40 x 4.000 x USD 0,80/Mtok | USD 0,128 |
| 40 URLs Haiku (output) | 40 x 1.500 x USD 4,00/Mtok | USD 0,240 |
| 10 URLs Sonnet (input) | 10 x 4.000 x USD 3,00/Mtok | USD 0,120 |
| 10 URLs Sonnet (output) | 10 x 1.500 x USD 15,00/Mtok | USD 0,225 |
| **Total por execução** | | **USD 0,71 a 0,90** |

12 execuções por ano = USD 8,50 a 10,80. Estimativa central: USD 9,66.

## Por que a estratégia híbrida?

Haiku 4.5 cobre bem a maioria das URLs: listas de documentos, tabelas de taxas, guias passo a passo, visões gerais curtas. A qualidade de extração é equivalente ao Sonnet para conteúdo estruturado com schema claro.

Sonnet 4.5 entra nas 10 URLs marcadas com `model: 'sonnet'` no source config, onde o conteúdo tem:

- Múltiplos vistos parecidos na mesma página (ex: Skilled Worker vs Highly Skilled Migrant)
- Valores monetários com condicionais complexas
- Seções de mudanças recentes com terminologia jurídica densa
- Idioma legal que o Haiku interpreta de forma menos precisa

Monitorando `extractionConfidence`: se cair abaixo de `medium` em URLs servidas pelo Haiku, mover para Sonnet e ajustar o campo `model` no source config.

## Como começar sem gastar nada

A Anthropic oferece USD 5 de crédito grátis para contas novas.

Com o Cenário C (híbrido 80/20, USD 0,81 por execução):

- USD 5 cobre aproximadamente 6 meses de operação mensal
- Com hash cache ativo (Cenário D, USD 0,32 por execução): USD 5 cobre quase 16 meses
- Com todos os caches (Cenário E, USD 0,21 por execução): USD 5 cobre 2 anos

Para começar:

1. Criar conta em console.anthropic.com
2. O crédito grátis aparece automaticamente
3. Configurar `ANTHROPIC_API_KEY` no repositório como secret do GitHub Actions
4. As variáveis `ANTHROPIC_MODEL_DEFAULT` e `ANTHROPIC_MODEL_PREMIUM` já estão configuradas no `monthly-update.yml`

## Adicionar crédito quando necessário

Quando o crédito gratuito acabar, recomenda-se comprar USD 25 por ano. Isso cobre:

- Cenário C (recomendado): 2,5 anos de operação mensal
- Cenário D (com hash cache): mais de 6 anos de operação mensal
- Margem para testes manuais, reruns e adição de novos países

Para adicionar crédito: console.anthropic.com > Settings > Billing > Add Credits.

Spend limit recomendado: USD 25 por ano. Isso protege contra loops acidentais ou bugs que chamem a API repetidamente, sem risco de custo inesperado alto.

## Como reduzir custo se necessário

Em ordem de impacto, do maior para o menor:

1. Habilitar cache de hash de conteúdo: se o HTML limpo não mudou desde a última execução, reutilizar o JSON anterior sem chamar o LLM. Redução de 50 a 70% do custo total. Implementação em `src/extractors/cache.ts`.
2. Habilitar prompt caching da Anthropic: o system prompt e a tool definition são reutilizados entre chamadas. Redução de 30 a 40% nos tokens de input.
3. Filtrar URLs de baixa prioridade: reduzir de 5 para 3 URLs por país corta 40% do custo sem impacto significativo na cobertura.
4. Reduzir frequência para bimestral se mudanças falsas forem frequentes: indica que o LLM está sendo chamado sem necessidade.
