# Extraction Strategy

Como transformamos HTML caótico de sites de governo em JSON estruturado e validado. Este documento explica a abordagem, não a implementação linha a linha.

## Princípio central

Não escrevemos seletores CSS. Não usamos regex. Não dependemos da estrutura visual da página.

Em vez disso, deixamos que o LLM leia o conteúdo principal e extraia os campos que descrevemos. Validamos com Zod no nosso lado para garantir que o que voltou é confiável.

Isso significa que uma página que muda de layout amanhã continua funcionando hoje, desde que o conteúdo semântico ainda esteja lá.

## Pipeline em 5 passos

### 1. Fetch

Usar `fetch` nativo do Bun. User-Agent identifica o projeto. Timeout de 30 segundos. Se a resposta vier com `Content-Type: application/pdf`, usar parser de PDF. Se vier HTML mas com `<noscript>` cobrindo o conteúdo, ir para Playwright.

### 2. Limpeza

Passar o HTML pelo `@mozilla/readability`, a mesma lib que o modo de leitura do Firefox usa. Resultado: texto principal sem cabeçalho, rodapé, sidebar, banners.

Tipicamente reduz de 200 KB de HTML cru para 5 a 15 KB de conteúdo útil. Isso economiza dinheiro na chamada do LLM.

### 3. Construção do prompt

O prompt é montado em camadas:

- **Sistema:** identidade e regras gerais. "Você é um extrator de dados oficiais de imigração. Responda apenas chamando a tool."
- **Contexto:** o país, o tipo de conteúdo (overview, fees, requirements, etc.), idioma do texto fonte
- **Instrução específica:** "Da página abaixo, extraia os tipos de visto disponíveis para trabalhadores brasileiros."
- **Conteúdo:** o texto limpo da página
- **Tool definition:** o schema Zod convertido para JSON Schema, anexado como tool

### 4. Chamada com tool use forçado

A API da Anthropic suporta `tool_choice: { type: 'tool', name: 'submit_extraction' }`, que força o modelo a chamar nossa tool em vez de responder em texto. A entrada da tool é o objeto que queremos.

Isso elimina o problema de o modelo às vezes incluir markdown wrapper ou prosa antes do JSON. A resposta sempre vem como tool_use call.

### 5. Validação

Pegar o input da tool, passar pelo Zod. Se passar, ótimo. Se não passar, o erro do Zod aponta o caminho exato do campo problemático e tentamos de novo até 3 vezes (com backoff). Após 3 falhas, registrar erro e seguir.

## Modelo e custo

Estratégia híbrida: Haiku 4.5 como padrão (80% das URLs) e Sonnet 4.5 para URLs marcadas como críticas (20%). Detalhamento em `docs/model-routing.md`.

Critério resumido: Haiku cobre listas de documentos, tabelas de taxas, guias passo a passo e visões gerais curtas. Sonnet entra quando há múltiplos vistos parecidos na mesma página, valores monetários com condicionais, seções de mudanças recentes ou idioma jurídico denso.

Por que não Opus? Custo desproporcional. Sonnet entrega qualidade equivalente para esta tarefa.

### Estimativa de custo por execução

Premissas: 10 países, 5 URLs por país, 4.000 tokens de input por URL (após Readability), 1.500 tokens de output, distribuição 40 URLs Haiku e 10 URLs Sonnet.

| Componente | Cálculo | Custo |
|------------|---------|-------|
| 40 URLs Haiku (input) | 40 x 4.000 x USD 0,80/Mtok | USD 0,128 |
| 40 URLs Haiku (output) | 40 x 1.500 x USD 4,00/Mtok | USD 0,240 |
| 10 URLs Sonnet (input) | 10 x 4.000 x USD 3,00/Mtok | USD 0,120 |
| 10 URLs Sonnet (output) | 10 x 1.500 x USD 15,00/Mtok | USD 0,225 |
| **Total por execução** | | **USD 0,71 a 0,90** |

12 execuções por ano = USD 8,50 a 10,80. Estimativa conservadora: USD 9,66.

Com cache de hash (páginas que não mudaram não chamam o LLM): custo cai para USD 3,86 por ano.

Detalhe por cenário em `docs/cost-and-billing.md`.

## Cache por hash de conteúdo

Para evitar re-extrair quando a página não mudou:

1. Calcular hash SHA-256 do HTML limpo
2. Verificar se já temos esse hash em `data/cache/{hash}.json`
3. Se sim, reutilizar o resultado e pular a chamada do LLM
4. Se não, chamar o LLM e salvar com o hash

Implementação fica em `src/extractors/cache.ts`. Cache é tratado como conveniência, não como correção. Se mudar o schema, invalidar tudo (deletar `data/cache/`).

## Lidando com PDFs

Algumas páginas (especialmente no Espanha) servem PDF como conteúdo principal. O fetcher detecta `Content-Type: application/pdf` e usa `pdf-parse` para extrair texto antes de mandar pro LLM. O resto do pipeline é idêntico.

PDFs com tabelas formatadas podem ter texto mal extraído. Nesses casos, marcar o `extractionConfidence` como `medium` ou `low` no schema.

## Lidando com múltiplos idiomas

O LLM lida bem com texto em qualquer um dos 6 idiomas que aparecem nas fontes (inglês, holandês, alemão, espanhol, português, francês). A instrução é sempre "extrair em PT-BR independente do idioma do source".

Para termos técnicos sem tradução boa em PT-BR (Aufenthaltstitel, Tarjeta TIE, etc.), manter o termo original e adicionar contexto entre parênteses na primeira menção.

## O prompt

Estrutura padrão (versão simplificada):

```
SYSTEM:
Voce extrai dados oficiais de imigracao de paginas de governo.
Sua saida deve sempre vir como chamada da tool submit_extraction.
Nunca invente dados. Se um campo nao esta na pagina, deixe null ou
array vazio. Traduza textos para portugues brasileiro mantendo termos
tecnicos no idioma original quando nao houver traducao consagrada.

USER:
Pais: Holanda (codigo nl)
Tipo de conteudo desta pagina: visa-overview
Idioma do conteudo: ingles
URL: https://ind.nl/en/work

Extraia os tipos de visto relevantes para alguem que pretende trabalhar
no pais. Foque em trabalhadores assalariados ou em busca de emprego.
Ignore vistos de estudante, investidor de alto valor, refugiado e
diplomata.

Conteudo da pagina:

{conteudo limpo aqui}

Use a tool submit_extraction para retornar os dados estruturados.
```

A versão real está parametrizada em `src/extractors/prompts.ts`.

## Quando o LLM erra

Casos que vimos em desenvolvimento:

- **Confusão entre vistos similares** (Skilled Worker vs Highly Skilled Migrant). Mitigação: anotar no prompt as diferenças críticas.
- **Inventar valores quando a página fala em "varia"**. Mitigação: instruir explicitamente "se o valor varia, retornar null e mover para notes".
- **Ignorar mudanças recentes que estão em destaque visual**. Mitigação: pedir explicitamente para escanear seções de "news", "updates", "what's new".
- **Traduções literais ruins**. Mitigação: glossário de termos no prompt.

Cada caso descoberto vira uma linha no glossário ou no prompt. Não é regressão, é refinamento contínuo.

## Modo manual override

Para casos onde a extração automática repetidamente falha em campo crítico, podemos definir override manual em `src/sources/{cc}-overrides.ts`. O pipeline aplica overrides depois da extração, antes de salvar. Sempre logar quando override é aplicado, para não esquecer que existe.

Override é último recurso. Preferir ajustar prompt sempre que possível.
