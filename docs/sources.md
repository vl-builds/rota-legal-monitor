# Sources

Registro central das fontes de dados oficiais por país. Este documento é a fonte de verdade humana. Os arquivos `src/sources/{cc}.ts` refletem o que está aqui.

## Princípios

- Apenas fontes governamentais ou oficiais reconhecidas pelo governo
- Preferir páginas em inglês quando o site oferece (mais estável que tradução automatizada)
- Documentar em qual idioma original o LLM vai trabalhar
- Anotar quando a fonte é particularmente sensível a redesign

## Holanda (`nl`)

Idiomas: holandês e inglês. Vamos consumir as versões em inglês.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://ind.nl/en/residence-permits/work` | Hub com todos os tipos de visto de trabalho | Quinzenal |
| `https://ind.nl/en/residence-permits/work/highly-skilled-migrant` | Trabalhador altamente qualificado, valores de renda | Quinzenal |
| `https://ind.nl/en/residence-permits/work/residence-permit-for-orientation-year` | Visto de orientação pós-graduação | Mensal |
| `https://ind.nl/en/fees-costs-of-an-application` | Tabela de taxas oficiais | Quinzenal |
| `https://ind.nl/en/work` | Visão geral e requisitos gerais | Mensal |

**Notas:**

- URLs atualizadas em abril de 2026: o IND reorganizou subpáginas de `/en/{tipo}` para `/en/residence-permits/work/{tipo}`. Verificar redirecionamentos em futuras execuções.
- A página de "Highly Skilled Migrant" é a mais crítica. É onde mudanças de salário mínimo aparecem.
- A tabela de taxas ficou em URL própria (`/en/fees-costs-of-an-application`), separada das páginas de formulários.
- Não usar `expatica.com` ou `iamsterdam.com`. São agregadores, não oficiais.

## Portugal (`pt`)

Idiomas: português. O conteúdo já está em PT-PT, próximo o suficiente do PT-BR para uso direto.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://aima.gov.pt/pt/trabalhar` | Hub com todos os tipos de autorização para trabalho | Quinzenal |
| `https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-exercicio-de-atividade-profissional-subordinada-com-visto-de-residencia-art-88-o-n-o-1` | Autorização subordinada (empregado) com visto | Quinzenal |
| `https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-exercicio-de-atividade-profissional-subordinada-com-dispensa-de-visto-de-residencia-art-88-o-n-o-` | Autorização subordinada SEM visto (relevante para brasileiros via Estatuto de Igualdade) | Quinzenal |
| `https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-atividade-altamente-qualificada-art-90-o` | Altamente qualificado (EU Blue Card) | Quinzenal |
| `https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-o-exercicio-de-atividade-profissional-prestada-de-forma-remota-com-visto-de-residencia-para-o-exe` | Nômade digital (trabalho remoto) | Quinzenal |

**Notas:**

- AIMA substituiu o antigo SEF em 2023. URLs no formato `/pt/area-do-cidadao/` foram descontinuadas.
- `vistos.mne.gov.pt` e `portaldascomunidades.mne.gov.pt` bloqueiam IPs do GitHub Actions. Não usar.
- A "dispensa de visto" é o benefício mais importante para brasileiros: permite pedir a AR diretamente sem obter visto consular antes, graças ao Tratado de Amizade Luso-Brasileiro.
- Conteúdo em PT-PT pode usar "autorização de residência" em vez de "visto". Garantir que o LLM normalize.

## Alemanha (`de`)

Idiomas: alemão e inglês. Vamos consumir versões em inglês.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://www.make-it-in-germany.com/en` | Portal oficial para profissionais estrangeiros | Quinzenal |
| `https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Migrathek/Erwerbstaetigkeit/erwerbstaetigkeit-node.html` | BAMF, autoridade federal de migração | Quinzenal |
| `https://www.auswaertiges-amt.de/en/visa-service` | Ministério das Relações Exteriores, vistos | Mensal |
| `https://www.make-it-in-germany.com/en/visa-residence/types/employment` | Visto de emprego e variantes | Quinzenal |

**Notas:**

- A Alemanha tem uma estrutura de visto bastante segmentada. O schema precisa lidar com pelo menos: Skilled Worker Visa, Job Seeker Visa, Opportunity Card.
- "Make it in Germany" é oficial do governo federal e a fonte mais legível.
- Cuidado com mistura de regras estaduais (Bundesländer) que aparecem em algumas páginas. O monitor cobre só nível federal.

## Espanha (`es`)

Idiomas: espanhol e inglês. Inglês quando disponível, espanhol nos fallbacks.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://www.inclusion.gob.es/web/migraciones/inicio` | Ministério de Inclusão, área de migrações | Quinzenal |
| `https://www.exteriores.gob.es/Consulados/saopaulo/pt/ServiciosConsulares/Paginas/Visados.aspx` | Consulado em São Paulo, lista de vistos | Mensal |
| `https://extranjeros.inclusion.gob.es/es/InformacionInteres/InformacionProcedimientos/index.html` | Procedimentos detalhados | Quinzenal |

**Notas:**

- Páginas espanholas são frequentemente PDF anexos em vez de HTML. Fetcher precisa lidar com `application/pdf`.
- Há diferença significativa entre "visado nacional" e "autorización de residencia". O LLM deve distinguir.

## Irlanda (`ie`)

Idiomas: inglês.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://www.irishimmigration.ie/coming-to-work-in-ireland/` | Trabalho na Irlanda, visão geral | Quinzenal |
| `https://www.irishimmigration.ie/visa-required-countries/` | Lista de países que precisam de visto | Mensal |
| `https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/` | Tipos de permissão de trabalho | Quinzenal |

**Notas:**

- Brasil está na lista de "visa-required countries" da Irlanda, então o caminho não é tão direto quanto na Holanda. Importante deixar isso explícito no campo `forBrazilians`.
- Critical Skills Employment Permit e General Employment Permit são as duas categorias relevantes.

## Como adicionar novas fontes

Antes de adicionar:

1. Confirmar que é fonte oficial. Em caso de dúvida, é não.
2. Confirmar que o conteúdo cobre algum aspecto que ainda não temos.
3. Ler `adding-countries.md` para o processo completo se for país novo.
4. Adicionar entrada nesta tabela primeiro, depois no código.

Para registrar:

- URL exata, sem parâmetros de tracking
- Tipo de conteúdo da lista padronizada (`overview`, `requirements`, `fees`, `news`, `agreements`)
- Frequência (quinzenal, mensal)
- Observações sobre quirks (JS pesado, PDF, idioma do conteúdo)

## Fontes que NÃO usamos

Para evitar tentação de incluir:

- Sites de blog de imigração comercial (mesmo que tenham info correta, não são fonte primária)
- Wikipédia (referência inicial OK, fonte de extração não)
- Reddit, fóruns, grupos de Facebook
- IA chat assistants de terceiros
- Sites de "expatriate communities" que não têm chancela oficial
- Embaixadas em outros países que não Brasil (informação pode diferir)
