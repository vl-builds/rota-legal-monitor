# Auditoria de atualização 2026

> Data da auditoria: 2026-06-02. Método: comparação dos valores em `data/current/{cc}.json` contra fontes oficiais 2026 (portais de governo + `verificationUrls` de cada país), via pesquisa dirigida por país. Regra do projeto aplicada: divergência > 5% é registrada em `reliability.knownIssues` (ver CLAUDE.md, "Verificação cruzada na extração mensal").

## Veredito por país

| País | Freshness | Principais pendências |
|---|---|---|
| DE Alemanha | **Atualizado 2026** | Só higiene de dados (precisão decimal 45.934,20). |
| IE Irlanda | **Atualizado 2026** (valores são de 01/03/2026) | Metadados/recentChanges defasados; CSEP alto-salário e setor baixa-remuneração errados; falta Seasonal Permit. |
| AU Austrália | **Atual no ciclo** (até 30/06/2026) | Taxas 189/190 e 462 defasadas; indexação 01/07/2026 a aplicar; nome TSS→Skills in Demand. |
| NL Holanda | **Parcialmente desatualizado** | Salário mínimo OK; **todos os limiares de visto e taxas IND são de 2024/2025**. |
| PT Portugal | **Parcialmente desatualizado** | Salário mínimo e D8 OK; **Lei 61/2025 e taxas AIMA 2026 não refletidas**; visto procura de trabalho mudou. |
| ES Espanha | **Parcialmente desatualizado** | SMI OK; nômade digital, altamente qualificado e taxas defasados; RD 1155/2024 não refletido. |
| FR França | **Parcialmente desatualizado** | Talent OK; SMIC e renda dos vistos salarié de 2024; taxas subiram em 01/05/2026. |
| AT Áustria | **Desatualizado** | proofOfFunds conceitualmente errado; startup, taxas e minimumWage incorretos. |
| BE Bélgica | **Desatualizado** | Limiares por região não refletidos; falta EU Blue Card; taxas erradas. |
| IT Itália | **Desatualizado** | EU Blue Card com regime antigo; minimumWage inválido; falta Decreto Flussi 2026. |

## Holanda (NL)

- minimumWage **2303,59 EUR/mês** (01/01/2026) e proofOfFunds: **CURRENT**.
- highly-skilled-migrant 30+: armazenado 5688 → **5942 EUR/mês** (2026). <30: 4171 → **4357**. Critério reduzido pós-zoekjaar: **3122**.
- european-blue-card: 5331 → **5942** (padrão) + reduzido recém-graduado **4754**.
- intra-corporate-transferee: 5688 → **5942** (30+) / **4357** (<30).
- paid-employment (gvva/no-gvva/seasonal): 1934 → **2294,40 EUR/mês**.
- researcher: 1606,08 EUR/mês é o limiar legal IND (na prática segue CAO-NU, maior) — armazenado 2835 não bate; revisar com nota.
- Taxas IND: 345 → **423 EUR** (HSM/Blue Card/ICT/single permit/self-employed/startup); researcher e orientation year **254 EUR**; taxa MVV de 225 EUR é obsoleta no modelo TEV (aplicação única).
- self-employed (1400) e start-up-founder (13000): sem limiar fixo IND — UNVERIFIED.
- Estrutural: Blue Card alinhou o limiar padrão ao HSM (transposição da nova diretiva); taxas reindexadas +4,4%.
- Fontes: ind.nl/en/required-amounts-income-requirements, ind.nl/en/fees-costs-of-an-application, government.nl/minimum-wage.

## Alemanha (DE) — atualizado

Todos os valores conferem com 2026: Mindestlohn 13,90/h (~2.409/mês), Sperrkonto/Chancenkarte 1.091/mês, EU Blue Card geral **50.700/ano**, reduzida **45.934,20/ano**, §19c experientes **45.630**, TI sem diploma **45.934,20**, +45 anos **55.770**, taxas 75/100/147. Único ajuste: gravar precisão decimal 45.934,20 e alinhar a nota de proofOfFunds (€3.828/mês). Fontes: make-it-in-germany.com, ey.com/tax-alerts EU Blue Card 2026.

## Portugal (PT)

- minimumWage **920 EUR/mês** (DL 139/2025) e proofOfFunds (1x RMMG): **CURRENT**.
- work-digital-nomad D8: **3680 EUR/mês** (4x RMMG 2026): **CURRENT** (corrigir notas que dizem "4x SMN de 2024" e o erro "3.480").
- work-job-search 760 EUR: **modalidade genérica SUSPENSA desde 23/10/2025** (Lei 61/2025), substituída por "Procura de Trabalho Qualificado" com meios ~**3x RMMG (2760)** e regra dos 120 dias + bloqueio de 1 ano.
- Taxa visto D consular: 90 → **110 EUR**.
- Taxa AIMA atividade profissional (receção): 83 → **~99,80 EUR** (tabela AIMA 01/03/2026, Portaria 307/2023; confirmar PDF para concessão ~307,20).
- Taxas AR D8 (320) e renovação (28): **UNVERIFIED** (tabela AIMA mudou; confirmar PDF oficial).
- Estrutural: **Lei 61/2025** (23/10/2025) acabou com a manifestação de interesse e endureceu reagrupamento/procura de trabalho; nova tabela de taxas AIMA (01/03/2026); via CPLP não coberta. Fontes: vistos.mne.gov.pt, aima.gov.pt, portugal.gov.pt.

## Irlanda (IE) — valores são de 01/03/2026

- National Minimum Wage **14,15/h** (01/01/2026): **CURRENT**.
- Critical Skills **40.904/ano**, General **36.605**, ICT **49.523**: **CURRENT** (entraram em vigor 01/03/2026).
- CSEP rota salário alto (fora da CSOL): armazenado 64.000 → **68.911/ano**.
- Setores de baixa remuneração: 30.000 → **32.691/ano**.
- Contract for Services: confirmar se é 40.904 ou alinhado ao ICT 49.523.
- sport-cultural (30.000) e internship (22.920): **UNVERIFIED** (provável desatualizado).
- Estrutural: **roadmap de aumentos faseados até 2030** (anúncio 02/12/2025, 1ª fase 01/03/2026); **Seasonal Employment Permit** novo (fev/2025) ausente do JSON; corrigir data do Employment Permits Act para 2024-09-02. Fontes: enterprise.gov.ie, mrci.ie.

## Austrália (AU) — atual no ciclo, vira em 01/07/2026

- minimumWage 24,95/h (948/sem): **CURRENT** até 30/06/2026 (Fair Work revê em 01/07).
- TSS/Skills in Demand 482 — Core Skills Income Threshold: **76.515/ano** até 30/06/2026 → **79.499** a partir de 01/07/2026. Specialist Skills: 141.210 → **146.717** (01/07/2026).
- 189/190 taxa cônjuge adulto: 2455 → **2320**; dependente menor: 1230 → **1160**.
- 485 taxa principal **4600** (desde 01/03/2026): CURRENT.
- 462 (Working Holiday) taxa: 635 → **~670**; fundos ~5.000 + passagem de saída: CURRENT.
- Estrutural: TSS→**Skills in Demand** (07/12/2024) já na prosa; atualizar `nameOriginal` para "Skills in Demand visa (subclass 482)"; glossário falta CSIT/SSIT/CSOL. Fontes: immi.homeaffairs.gov.au, fairwork.gov.au, bakermckenzie 2026.

## Áustria (AT)

- minimumWage 1900: **inválido** (Áustria não tem mínimo legal; é por Kollektivvertrag) — remover número.
- proofOfFunds 3465: **incorreto** (repete o salário RWR) → Ausgleichszulagenrichtsatz **1.308,39 EUR/mês** (solteiro, 01/01/2026) / 2.064,12 (casal).
- rwr-other-key-workers **3465 EUR/mês** (2026): **CURRENT** (subiu de 3.225).
- startup-founders 50000 → **30.000 EUR** de capital (50.000 é bônus de pontos, não requisito).
- job-seeker 7200: **UNVERIFIED** (sem montante fixo oficial; é 70 pontos).
- Taxas RWR 160+20 → **120+20 EUR** (total prático ~218); job-seeker 150 → **195 EUR**. Fonte: migration.gv.at.

## Bélgica (BE)

- minimumWage (RMMMG) **2.189,81 EUR/mês** (01/04/2026): **CURRENT**.
- single-permit altamente qualificado 3703 EUR/mês: é o de **Bruxelas 2026** (correto por coincidência), mas o JSON trata como média/2024. Por região: Bruxelas **3.703,44/mês**, Valônia **53.220/ano**, Flandres **48.912/ano**.
- **EU Blue Card ausente** (gap): Bruxelas **4.748/mês**, Valônia **68.815/ano**, Flandres **63.586/ano**.
- Taxas single permit 215 → redevance federal **152 EUR** (2026) + nova taxa regional flamenga (~200-250).
- professional-card 26087: sem piso de renda fixo (avaliação de viabilidade) — UNVERIFIED. Fontes: economy-employment.brussels, dofi.ibz.be, kpmg flash 2026-018.

## Espanha (ES)

- SMI **1.221 EUR/mês** (RD 126/2026) e proofOfFunds (200% SMI) **2.849**: **CURRENT**.
- telework-nomad-visa: 2646 → **2.849 EUR/mês** (200% SMI 2026; dependentes +916/+305).
- highly-qualified-worker-visa: 40.077 → **~39.270 EUR/ano** (Orden PJC/44/2026); reduzido ~31.416.
- Taxas 18/64/73: não casam com trâmites atuais → mapear (tasa 052 residencia 10,94/prórroga 16,40; tasa 062 trabajo 203,84 ou 407,71; TIE 16,08).
- Estrutural: **RD 1155/2024** (novo Reglamento, vigente 20/05/2025) reformou arraigos/vistos; busca de emprego ampliada para 1 ano; conteúdo pode refletir o regulamento antigo. Fontes: boe.es, inclusion.gob.es.

## França (FR)

- SMIC: 1868 → **1.867,02 EUR/mês** (01/06/2026; revalorização excepcional); anual 22.404,24.
- vls-ts-salarie / vls-carte-travailleur / carte-sejour-temporaire-salarie: 1801 → **1.867,02 EUR/mês**.
- Carte Talent salarié qualifié **39.582/ano** e Carte Bleue **59.373/ano**: **CURRENT** (fixados por arrêté, já não atrelados ao SMIC).
- Taxas: OFII validação 269 → **200 EUR**; primeira carte de séjour 225 → **350 EUR** (300 taxa + 50 timbre, desde 01/05/2026).
- PVT/Working Holiday (2500): **UNVERIFIED** no sentido Brasil→França.
- Estrutural: Passeport Talent → **"Carte Talent"**; limiares Talent desindexados do SMIC (decreto jun/2025); taxas subiram 01/05/2026. Fontes: service-public.gouv.fr, travail-emploi.gouv.fr.

## Itália (IT)

- minimumWage 1100: **inválido** (Itália não tem mínimo legal; CCNL) — remover número.
- eu-blue-card: 35.000 (e nota contraditória 43.056) → **~27.000 EUR/ano** (D.Lgs 152/2023: ≥ CCNL e ≥ média ISTAT; sem múltiplo fixo). Validade 2 anos; mobilidade UE **12 meses** (não 18).
- lavoro-autonomo / proofOfFunds: 8500 → **~8.400 EUR/ano** (isenção spesa sanitaria; borderline, <5%).
- Taxas: visto D ~116 e correio ~30 CURRENT; "permesso 200" → compor marca da bollo **16** + bollettino 30,46 + contributo 40-100; adicionar a marca da bollo de 16.
- Estrutural: **Decreto Flussi 2026** ausente: total **164.850** (76.200 subordinado não sazonal, 13.600 colf/badanti, 650 autônomo, 88.000 sazonal); click days 09/16/18 de fevereiro 2026; moldura trienal 2026-2028. Fontes: lavoro.gov.it, vistoperitalia.esteri.it, home-affairs.ec.europa.eu.

## Ações

1. Corrigir os limiares de renda e taxas de alta confiança nos `data/current/{cc}.json` (NL, FR, ES, AT, AU, IE, PT, IT, BE).
2. Registrar todas as divergências e itens UNVERIFIED em `reliability.knownIssues` de cada país (regra de verificação cruzada).
3. Itens estruturais (Lei 61/2025 PT, RD 1155/2024 ES, Skills in Demand AU, Decreto Flussi IT, EU Blue Card BE) entram em `recentChanges`/notas e exigem revisão de conteúdo, não só de número.
4. Para persistir entre ciclos do cron, sincronizar `scripts/patches/{cc}.json` com os valores corrigidos.
