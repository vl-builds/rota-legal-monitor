# spec.md

Especificação técnica do **Rota Legal Monitor**. Este é o documento de fonte da verdade. Mudanças aqui ditam mudanças no código.

## 1. Objetivo

Manter um conjunto de arquivos JSON estruturados, atualizados mensalmente, com as condições oficiais de imigração legal de 10 países (9 europeus e Austrália) na perspectiva de um cidadão brasileiro que pretende trabalhar como entregador de delivery.

Os dados servem dois consumidores:

1. **Ferramenta web Rota Legal:** consome via fetch HTTPS para popular checklists, calculadora de reserva e plano de ação personalizado
2. **E-book Rota Holanda:** referencia o repositório como fonte sempre atual ("para ver os valores deste mês, consulte rotalegal.app")

## 2. Não-objetivos

Para evitar escopo solto, isto **não** é parte do projeto:

- Não somos consultoria de imigração. Não damos parecer jurídico personalizado.
- Não rastreamos vistos para outros propósitos (estudo, investidor, aposentado) que não sirvam ao caso "trabalhar como entregador".
- Não cobrimos países fora dos 10 listados na v1.0 (lista completa: nl, pt, de, es, ie, it, fr, be, at, au).
- Não armazenamos dados pessoais de usuários. O sistema só lida com dados públicos de governos.
- Não fazemos tradução de páginas inteiras. Extraímos campos específicos.
- Não substituímos o site oficial. Linkamos para ele em todo lugar.

## 3. Histórias de usuário

**Como brasileiro pensando em ir para a Holanda**, eu quero saber qual é o valor mínimo de renda para ser considerado trabalhador qualificado em 2026, sem precisar caçar no site da IND em holandês.

**Como brasileiro com cidadania portuguesa em vista**, eu quero entender se a CPLP me dá vantagem real para trabalhar em Portugal e em quanto tempo.

**Como autor do e-book HenryZuka**, eu quero referenciar valores no texto sem que eles fiquem desatualizados em 6 meses.

**Como desenvolvedor da ferramenta web Rota Legal**, eu quero consumir um JSON estável com schema previsível para popular a interface sem precisar fazer scraping no frontend.

**Como leitor que comprou o e-book há 8 meses**, eu quero abrir a ferramenta web e ver "atualizado há 12 dias" para confiar no que estou lendo.

## 4. Schema de dados

Definição completa em [`docs/data-schema.md`](docs/data-schema.md). Resumo aqui para contexto.

Cada país produz um arquivo `data/current/{cc}.json` com a forma:

```typescript
interface CountryData {
  meta: {
    country: string              // codigo ISO alpha-2
    countryName: string          // nome em PT-BR
    lastUpdated: string          // ISO 8601
    schemaVersion: string        // semver
    sources: SourceRef[]         // urls verificadas nesta extracao
  }

  forBrazilians: {
    schengenVisaFree: boolean
    maxStayDaysAsTourist: number
    workPermitNeeded: boolean
    specialAgreements: string[]   // ex: 'CPLP', 'Tratado de Amizade'
    notes: string
  }

  visaTypes: VisaType[]

  generalRequirements: {
    passportValidity: string
    proofOfFunds: MoneyAmount | null
    healthInsurance: string
    cleanCriminalRecord: boolean
  }

  recentChanges: PolicyChange[]   // mudancas dos ultimos 6 meses

  reliability: {
    extractedBy: 'llm' | 'manual'
    extractionConfidence: 'high' | 'medium' | 'low'
    humanReviewedAt: string | null
  }
}
```

## 5. Fontes de dados

Lista completa em [`docs/sources.md`](docs/sources.md). Princípios:

- Apenas fontes oficiais do governo (sufixos `.gov`, `.gob`, `.ie`, `.nl`, etc.)
- Fontes não-oficiais (blogs de advogados, sites de mudança) **nunca** entram como fonte primária
- Sites informativos oficiais (make-it-in-germany.com, irishimmigration.ie) são aceitos como fonte secundária
- Sempre que possível, baixamos a versão em inglês ou no idioma original, não a tradução

## 6. Estratégia de extração

Detalhe em [`docs/extraction-strategy.md`](docs/extraction-strategy.md). Resumo:

1. Para cada URL configurada em `src/sources/{cc}.ts`:
2. Fazer GET com fetch nativo. Se retornar HTML válido com conteúdo, ir para passo 4. Senão, passo 3.
3. Tentar com Playwright (browser headless). Se ainda falhar, registrar erro e seguir.
4. Passar HTML pelo `@mozilla/readability` para extrair só o conteúdo principal.
5. Decidir o modelo a usar: `haiku` por padrão ou `sonnet` se a URL está marcada como crítica no source config. Ver `docs/model-routing.md`.
6. Mandar para a API da Anthropic com instrução estruturada e schema esperado.
7. Receber JSON, validar com Zod, fazer merge no objeto consolidado do país.
8. Salvar `data/current/{cc}.json` formatado com 2 espaços de indentação.

## 7. Estratégia de armazenamento

- **Sem banco de dados.** Tudo em arquivos JSON no Git.
- `data/current/{cc}.json`: snapshot mais recente de cada país. Sobrescrito a cada execução.
- `data/history/{cc}/{YYYY-MM-DD}.json`: arquivo só de leitura, nunca apagado.
- Toda execução do cron faz: copia `current` para `history` com data, depois sobrescreve `current`.
- Git mantém histórico completo, então `data/history/` é redundância intencional para facilitar diff sem precisar de comandos git.

## 8. Cadência de atualização

- **Execução automática:** dia 1 de cada mês às 06:00 UTC via GitHub Actions, totalizando 12 execuções por ano.
- **Trigger manual:** disponível via `workflow_dispatch` no GitHub.
- **Trigger por mudança de schema:** se `schema.ts` mudar, a próxima execução é forçada a re-extrair tudo do zero (sem cache).

## 9. Detecção de mudanças

Após cada execução:

1. Compara `data/current/{cc}.json` antes e depois
2. Classifica cada mudança em alta, média ou baixa relevância
3. Se houver mudança de relevância alta, abre issue automática no GitHub com diff resumido
4. Sempre comita o snapshot novo, mesmo sem mudanças (timestamp do `lastUpdated` muda)

Critérios de relevância em [`docs/architecture.md`](docs/architecture.md).

## 10. Quality gates

Antes de comitar um snapshot novo, o pipeline verifica:

- JSON válido sintaticamente
- Validação Zod passa em todos os campos obrigatórios
- `lastUpdated` está dentro de 24h da execução atual
- Nenhuma string crítica está vazia (countryName, visaTypes[].name)
- Não houve regressão crítica (ex: lista de visaTypes não pode encolher mais de 50% de uma execução para outra sem flag explícita)

Se algum gate falhar, o pipeline **não** comita e abre issue de erro.

## 11. Segurança e ToS

- User-Agent identifica o projeto e linka para o repositório
- Rate limit de no mínimo 2 segundos por request no mesmo domínio
- Respeita `robots.txt` quando presente
- Nenhum dado de usuário é coletado, armazenado ou logado
- API key da Anthropic vive como GitHub Secret, nunca no código
- `data/` é público porque os dados de origem são públicos

## 12. Decisões de design relevantes

Lista de decisões já tomadas para evitar relitígio:

- **TypeScript em vez de Python:** consistência com o resto do ecossistema HenryZuka, melhor suporte do Claude Code, npm é ágil para scraping.
- **Bun em vez de Node:** mais rápido, instalação trivial, fetch nativo, runtime de testes embutido.
- **JSON em Git em vez de banco de dados:** zero infraestrutura, histórico grátis, diff visual no GitHub, fácil para terceiros consumirem.
- **LLM extraction em vez de scrapers rígidos:** sobrevive a redesigns, mais barato a longo prazo do que manter seletores CSS quebrados.
- **GitHub Actions em vez de servidor próprio:** zero custo de hospedagem para o cron, integração nativa com PRs e issues.
- **Sem painel administrativo:** se precisar editar manualmente, faça PR. Manter simples.
- **Sem versionamento por país:** todos os países seguem o mesmo `schemaVersion`. Migrar é tarefa coordenada.
- **Haiku como padrão, Sonnet em URLs críticas:** 80% das páginas têm estrutura previsível e não precisam do modelo maior. Reduz custo de USD 21 para USD 9,66 por ano sem sacrificar qualidade.

## 13. Métricas de sucesso

A v1.0 está bem-sucedida quando:

- 10 países atualizam sozinhos por pelo menos 4 execuções seguidas (4 meses) sem manutenção
- Custo mensal abaixo de USD 1 (ver `docs/cost-and-billing.md`)
- Frontend Rota Legal consome os dados em produção
- Pelo menos 1 mudança real foi detectada e o sistema notificou corretamente
- Zero incidentes de chave de API exposta ou dados pessoais coletados

## 14. Próximas evoluções não-prioritárias

Anotadas para não esquecer, mas fora do escopo da v1.0:

- Adicionar mais países além dos 10 da v1.0
- Suporte a múltiplos idiomas no output (PT-BR já existe, adicionar EN para o público bilíngue)
- Webhook em vez de só GitHub issue para notificações
- Snapshot mensal consolidado em PDF para arquivo histórico
- Painel público em rotalegal.app mostrando "última verificação" de cada país
