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
| `https://ind.nl/en/residence-permits/work` | Hub com todos os tipos de visto de trabalho | Mensal |
| `https://ind.nl/en/residence-permits/work/highly-skilled-migrant` | Trabalhador altamente qualificado, valores de renda | Mensal |
| `https://ind.nl/en/residence-permits/work/residence-permit-for-orientation-year` | Visto de orientação pós-graduação | Mensal |
| `https://ind.nl/en/fees-costs-of-an-application` | Tabela de taxas oficiais | Mensal |
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
| `https://aima.gov.pt/pt/trabalhar` | Hub com todos os tipos de autorização para trabalho | Mensal |
| `https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-exercicio-de-atividade-profissional-subordinada-com-visto-de-residencia-art-88-o-n-o-1` | Autorização subordinada (empregado) com visto | Mensal |
| `https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-exercicio-de-atividade-profissional-subordinada-com-dispensa-de-visto-de-residencia-art-88-o-n-o-` | Autorização subordinada SEM visto (relevante para brasileiros via Estatuto de Igualdade) | Mensal |
| `https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-atividade-altamente-qualificada-art-90-o` | Altamente qualificado (EU Blue Card) | Mensal |
| `https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-o-exercicio-de-atividade-profissional-prestada-de-forma-remota-com-visto-de-residencia-para-o-exe` | Nômade digital (trabalho remoto) | Mensal |

**Notas:**

- AIMA substituiu o antigo SEF em 2023. URLs no formato `/pt/area-do-cidadao/` foram descontinuadas.
- `vistos.mne.gov.pt` e `portaldascomunidades.mne.gov.pt` bloqueiam IPs do GitHub Actions. Não usar.
- A "dispensa de visto" é o benefício mais importante para brasileiros: permite pedir a AR diretamente sem obter visto consular antes, graças ao Tratado de Amizade Luso-Brasileiro.
- Conteúdo em PT-PT pode usar "autorização de residência" em vez de "visto". Garantir que o LLM normalize.

## Alemanha (`de`)

Idiomas: alemão e inglês. Vamos consumir versões em inglês.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://www.make-it-in-germany.com/en` | Portal oficial para profissionais estrangeiros | Mensal |
| `https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Migrathek/Erwerbstaetigkeit/erwerbstaetigkeit-node.html` | BAMF, autoridade federal de migração | Mensal |
| `https://www.auswaertiges-amt.de/en/visa-service` | Ministério das Relações Exteriores, vistos | Mensal |
| `https://www.make-it-in-germany.com/en/visa-residence/types/employment` | Visto de emprego e variantes | Mensal |

**Notas:**

- A Alemanha tem uma estrutura de visto bastante segmentada. O schema precisa lidar com pelo menos: Skilled Worker Visa, Job Seeker Visa, Opportunity Card.
- "Make it in Germany" é oficial do governo federal e a fonte mais legível.
- Cuidado com mistura de regras estaduais (Bundesländer) que aparecem em algumas páginas. O monitor cobre só nível federal.

## Espanha (`es`)

Idiomas: espanhol e inglês. Inglês quando disponível, espanhol nos fallbacks.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://www.inclusion.gob.es/en/web/migraciones/tipos-de-autorizacion` | Tipos de autorização (inglês) | Mensal |
| `https://www.inclusion.gob.es/en/web/migraciones` | Portal principal de migrações (inglês) | Mensal |
| `https://www.inclusion.gob.es/web/migraciones/vivir-en-espana` | Viver na Espanha, requisitos | Mensal |
| `https://www.inclusion.gob.es/web/migraciones/tipos-de-autorizacion` | Tipos de autorização (espanhol) | Mensal |
| `https://www.inclusion.gob.es/web/migraciones/informacion-util` | Taxas e informações úteis | Mensal |

**Notas:**

- O portal `inclusion.gob.es` é Liferay com conteúdo renderizado via JS. Playwright obrigatório para obter conteúdo real.
- `extranjeros.inclusion.gob.es/en/*` foi descontinuado: redireciona para 404. Não usar.
- Há diferença entre "visado nacional" e "autorización de residencia". O LLM deve distinguir.
- ignoreSSL necessário: CA do governo espanhol não está no bundle do Bun/Node.

## Irlanda (`ie`)

Idiomas: inglês.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://www.irishimmigration.ie/coming-to-work-in-ireland/` | Trabalho na Irlanda, visão geral | Mensal |
| `https://www.irishimmigration.ie/visa-required-countries/` | Lista de países que precisam de visto | Mensal |
| `https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/` | Tipos de permissão de trabalho | Mensal |

**Notas:**

- Brasil está na lista de "visa-required countries" da Irlanda, então o caminho não é tão direto quanto na Holanda. Importante deixar isso explícito no campo `forBrazilians`.
- Critical Skills Employment Permit e General Employment Permit são as duas categorias relevantes.

## Itália (`it`)

Idiomas: italiano e inglês. Preferir inglês quando disponível.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://vistoperitalia.esteri.it/home/en` | Portal oficial de vistos do Ministério das Relações Exteriores | Mensal |
| `https://www.esteri.it/en/servizi-consolari-e-visti/visti/` | Tipos de visto (inglês) | Mensal |
| `https://integrazionemigranti.gov.it/en-gb/` | Portal de integração do Ministério do Trabalho | Mensal |
| `https://www.poliziadistato.it/articolo/permessi-di-soggiorno-per-cittadini-stranieri` | Permesso di soggiorno para cidadãos estrangeiros | Mensal |

**Notas:**

- Capturar o decreto flussi quando ativo: é o mecanismo de cotas anuais que define quantas autorizações de trabalho são emitidas. Tem datas específicas de abertura.
- "Permesso di soggiorno" (autorização de permanência) é distinto do visto de entrada. O visto abre a porta, o permesso regulariza a estadia. Garantir que o LLM não confunda os dois.
- Jure sanguinis (cidadania por descendência italiana) está fora do escopo do monitor.

## França (`fr`)

Idiomas: francês e inglês. Preferir inglês quando disponível.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://france-visas.gouv.fr/en/web/france-visas/` | Portal oficial de vistos (inglês) | Mensal |
| `https://www.service-public.fr/particuliers/vosdroits/N110` | Direitos de estrangeiros, portal de serviços públicos | Mensal |
| `https://www.immigration.interieur.gouv.fr/Immigration/L-immigration-en-France` | Ministério do Interior, imigração na França | Mensal |
| `https://www.ofii.fr/` | OFII, integração de imigrantes | Mensal |

**Notas:**

- O processo francês é em múltiplas etapas: visto consular no Brasil, validação pelo OFII ao chegar, depois solicitação de carte de séjour. O LLM deve capturar essa sequência.
- URLs do Ministério do Interior merecem o modelo Sonnet por terminologia jurídica densa (ex: "titre de séjour mention salarié", "autorisation de travail préfectorale").
- Não usar fontes de consulados brasileiros na França como fonte primária.

## Bélgica (`be`)

Idiomas: francês, holandês, alemão. Preferir inglês nos portais federais.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://dofi.ibz.be/en` | Office des Étrangers, portal federal de estrangeiros | Mensal |
| `https://diplomatie.belgium.be/en/services/services_abroad/visa_for_belgium` | Ministério das Relações Exteriores, vistos | Mensal |
| `https://emploi.belgique.be/en` | Ministério do Emprego, autorizações de trabalho | Mensal |

**Notas:**

- A Bélgica tem três regiões com competências distintas em matéria de trabalho (Flandres, Valônia, Bruxelas). O monitor cobre apenas o nível federal. Anotar essa limitação em `reliability.knownIssues`.
- Existe acordo de mobilidade jovem com o Brasil. Verificar se ainda está ativo e documentar em `forBrazilians.specialAgreements`.
- O Single Permit (autorização única de trabalho e residência) é o caminho mais comum para trabalhadores de fora da UE.

## Áustria (`at`)

Idiomas: alemão e inglês. Preferir inglês.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://www.migration.gv.at/en/` | Portal oficial de migração da Áustria | Mensal |
| `https://www.bmi.gv.at/302/Englisch/start.aspx` | Ministério do Interior, documentação de residência | Mensal |
| `https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/red-white-red-card/` | Red-White-Red Card, sistema de pontos | Mensal |

**Notas:**

- A Red-White-Red Card é o sistema de pontuação austríaco com várias subcategorias (Very Highly Qualified Workers, Skilled Workers in Shortage Occupations, Other Key Workers, etc.). O LLM deve listar as subcategorias relevantes separadamente.
- Algumas categorias da RWR Card exigem proficiência em alemão. Capturar o nível exigido por categoria.
- O mercado de delivery na Áustria é menor que nos países maiores. Considerar `audienceFit: 'narrow'` no source config.

## Austrália (`au`)

Idiomas: inglês.

| URL | Tipo de conteúdo | Frequência sugerida |
|-----|------------------|---------------------|
| `https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder` | Buscador oficial de vistos | Mensal |
| `https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462` | Working Holiday subclass 462 (principal caminho para brasileiros) | Mensal |
| `https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189` | Skilled Independent subclass 189 | Mensal |
| `https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-skill-shortage-482` | Temporary Skill Shortage subclass 482 | Mensal |

**Notas:**

- O Working Holiday Visa subclass 462 é o caminho mais acessível para brasileiros. Tem limite de idade (18 a 30 anos, até 35 em casos específicos) e cota anual limitada. Documentar essas condições em `forBrazilians.notes`.
- A Austrália não faz parte do Schengen. Qualquer entrada exige visto. Marcar `schengenVisaFree: false` e `maxStayDaysAsTourist: 0` (exige visto para turismo também).
- Marcar `audienceFit: 'narrow'` no source config: o mercado de delivery existe mas o público-alvo principal do projeto é Europa.

## Como adicionar novas fontes

Antes de adicionar:

1. Confirmar que é fonte oficial. Em caso de dúvida, é não.
2. Confirmar que o conteúdo cobre algum aspecto que ainda não temos.
3. Ler `adding-countries.md` para o processo completo se for país novo.
4. Adicionar entrada nesta tabela primeiro, depois no código.

Para registrar:

- URL exata, sem parâmetros de tracking
- Tipo de conteúdo da lista padronizada (`overview`, `requirements`, `fees`, `news`, `agreements`)
- Frequência (mensal, bimestral)
- Observações sobre quirks (JS pesado, PDF, idioma do conteúdo)

## Fontes que NÃO usamos

Para evitar tentação de incluir:

- Sites de blog de imigração comercial (mesmo que tenham info correta, não são fonte primária)
- Wikipédia (referência inicial OK, fonte de extração não)
- Reddit, fóruns, grupos de Facebook
- IA chat assistants de terceiros
- Sites de "expatriate communities" que não têm chancela oficial
- Embaixadas em outros países que não Brasil (informação pode diferir)
