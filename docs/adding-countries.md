# Adding a new country

Guia passo a passo para adicionar suporte a um novo país no monitor. Use este checklist para garantir que nada essencial fica de fora.

## Pré-requisitos

Antes de começar, confirme que vale a pena adicionar:

- O país é relevante para o público-alvo (brasileiros que querem trabalhar como entregadores na Europa)
- Existem fontes oficiais em formato consultável (HTML ou PDF, não vídeos ou áudios)
- O país não está em situação política instável que mude regras a cada mês (essa volatilidade quebra o pressuposto de update mensal)

## Passos

### 1. Documentar as fontes em `docs/sources.md`

Antes de tocar em código, adicione uma seção nova em `sources.md` listando:

- URLs oficiais que vamos consultar
- Tipo de conteúdo de cada uma
- Frequência sugerida
- Notas sobre quirks do site

Pelo menos 3 URLs e no máximo 8 por país. Mais que isso vira manutenção pesada.

### 2. Criar `src/sources/{cc}.ts`

Onde `{cc}` é o código ISO alpha-2 minúsculo. Por exemplo: `be.ts` para Bélgica, `at.ts` para Áustria.

Exporte um objeto seguindo o formato dos países existentes:

```typescript
import { SourceConfig } from '../types'

export const beSource: SourceConfig = {
  countryCode: 'be',
  countryName: 'Belgica',
  primaryLanguage: 'nl',  // ou 'fr', dependendo da regiao
  acceptableLanguages: ['en', 'nl', 'fr'],
  
  urls: [
    {
      url: 'https://...',
      contentType: 'visa-overview',
      promptHint: 'foco em trabalhadores assalariados',
      fetchFrequency: 'monthly',
      model: 'haiku',  // 'sonnet' para URLs com alta ambiguidade semântica
    },
    // mais urls aqui
  ],
  
  glossary: {
    // termos especificos do pais que merecem traducao consistente
    'Aanvraagformulier': 'Formulario de pedido',
  },
}
```

#### Haiku vs Sonnet por URL

Por padrão, use `model: 'haiku'` em todas as URLs. Mude para `model: 'sonnet'` apenas quando a URL contiver:

- Múltiplos vistos com nomes parecidos na mesma página (ex: Skilled Worker e Highly Skilled Migrant)
- Valores monetários com condicionais complexas ("varia conforme idade" ou "depende de qualificação")
- Seção de mudanças recentes ou terminologia jurídica densa (títulos de permissão, decretos)
- Qualquer URL onde a primeira extração com Haiku gerou `extractionConfidence: 'low'`

Para detalhes e exemplos concretos, ver `docs/model-routing.md`.

### 3. Adicionar entrada no registro de países

Em `src/sources/index.ts`, importar e adicionar ao mapa central:

```typescript
import { beSource } from './be'

export const sources = {
  nl: nlSource,
  pt: ptSource,
  de: deSource,
  es: esSource,
  ie: ieSource,
  be: beSource,  // novo
}
```

### 4. Considerar acordos especiais

Se o país tem acordo bilateral com o Brasil que afeta imigração (visto humanitário, programa de mobilidade jovem, acordo CPLP), documentar no campo `forBrazilians.specialAgreements` quando criar o JSON.

Para a Bélgica especificamente: existe acordo de mobilidade jovem que pode interessar. Para a França: visto talento, alguns programas. Pesquisar antes.

### 5. Rodar extração local

```bash
bun run extract --country=be
```

A primeira vez vai ser instrutiva. Provavelmente algum prompt precisa ajuste, alguma URL precisa Playwright, etc. Iterar até gerar JSON válido.

### 6. Validar manualmente

Abrir o `data/current/be.json` gerado e conferir contra a fonte original em pelo menos 5 campos críticos:

- Tipos de visto listados batem com a fonte
- Valores monetários batem
- Prazos batem
- Requisitos não inventados
- Traduções fazem sentido

Anotar no campo `reliability.knownIssues` qualquer coisa que ficou meia-boca.

### 7. Adicionar ao workflow do GitHub Actions

Em `.github/workflows/monthly-update.yml`, garantir que o novo país é coberto. Se o workflow itera sobre `Object.keys(sources)`, nenhuma mudança necessária. Se está hardcoded, adicionar.

### 8. Atualizar README

Na tabela de status dos países no `README.md`, adicionar a linha do novo país. Marcar como "em desenvolvimento" até completar pelo menos 4 semanas de updates automáticos sem intervenção.

### 9. Atualizar `docs/sources.md` se ainda não fez

Se você seguiu o passo 1 corretamente, isso já está feito. Confira.

### 10. Abrir PR

Título: `feat(country): adicionar suporte para {country-name}`

Descrição inclui:

- Lista das URLs novas
- Quais campos do schema foram preenchidos
- Quaisquer issues conhecidas
- Link para o JSON gerado pela primeira execução

## Critério de aceite

Um país está "pronto" para entrar no monitor automatizado quando:

- Pelo menos 3 fontes funcionam (fetch + extract + validate)
- O JSON gerado tem `extractionConfidence: 'high'` ou `'medium'`
- Ao menos um humano leu e conferiu contra as fontes
- O custo de extração do país é menor que USD 1 por execução
- O tempo de execução do país é menor que 8 minutos

## Países que NÃO devem entrar

Para evitar discussão futura:

- **Países sem relevância para o público-alvo** (brasileiros que querem trabalhar como entregadores): avaliar audiência antes de propor
- **Países sem fonte oficial em idioma que o LLM domina** (digamos, só em húngaro com transliteração esquisita)
- **Países onde brasileiros raramente vão como entregador** (Suíça, Liechtenstein, Andorra)
- **Países com situação política tornando regras erráticas** (avaliar caso a caso)

## Manutenção contínua

Adicionar país é o começo. Manter funcionando exige:

- Revisar logs de erro do workflow nas primeiras 8 execuções
- Atualizar prompts se o LLM começa a errar campos novos
- Atualizar URLs se o site oficial reorganizar
- Aposentar fontes que ficaram obsoletas

Se um país fica 4 semanas seguidas com `extractionConfidence: 'low'`, considerar removê-lo até resolver.
