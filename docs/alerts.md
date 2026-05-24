# Alertas por email

Avisa por email os alunos quando o ciclo mensal detecta uma mudança de alta relevância nos países que cada um acompanha. A captura e o armazenamento dos leads ficam no Kit (ConvertKit), nunca no repositório, por dois motivos: segurança do utilizador e LGPD (o repo é público para servir o GitHub Pages, então emails versionados ficariam expostos). O Kit também serve de base de leads reutilizável para o marketing do curso.

## Por que Kit e não JSON no repo

A primeira versão guardava assinantes em `data/subscribers.json` e coletava email por uma issue pública do GitHub. Isso expunha os emails e não tinha double opt-in. Trocamos por um provedor gerenciado (Kit), que resolve consentimento, confirmação em duas etapas, cancelamento e armazenamento privado, com free tier folgado (10.000 contatos, emails ilimitados).

## Fluxo de inscrição (captura de lead, sem backend)

1. O aluno abre `previews/area-aluno/alertas.html`, marca os países e envia o formulário.
2. O JS da página faz um POST (modo `no-cors`, sucesso otimista) direto para o endpoint público do Kit `https://app.convertkit.com/forms/{FORM_ID}/subscriptions`, com `email_address` e o campo personalizado `fields[paises]` (códigos separados por vírgula, ex: `pt,es`). Nenhuma chave secreta vai para o cliente.
3. O Kit dispara o **double opt-in**: o aluno confirma pelo email e só então vira contato ativo.
4. O lead fica no Kit, disponível para o Vitor usar em campanhas do curso.

Países vazios no formulário significam "todos os países".

## Fluxo de envio (mensal)

Roda dentro de `.github/workflows/monthly-update.yml`, no step "Send email alerts to subscribers", após a detecção de mudanças e apenas quando `has_high_relevance == 'true'`.

`src/alerts/send-email.ts`:

1. Recalcula o diff via `diffAllCountries()` (de `src/diff/run.ts`, a mesma função da CLI `bun run diff`) e separa os países com `high.length > 0`.
2. Para cada país que mudou no ciclo, garante a tag `pais-<cc>` no Kit (`ensureTag`).
3. Lê os assinantes ativos (confirmados) e, para cada um, aplica as tags dos países mudados que ele acompanha (campo `paises`). Só os países que mudaram são processados, então o número de chamadas fica baixo.
4. Para cada país que mudou, cria e dispara um **broadcast** com o HTML daquele país, mirando a tag `pais-<cc>` via `subscriber_filter`.

O cliente da API V4 do Kit está em `src/alerts/kit.ts` (auth por header `X-Kit-Api-Key`, base `https://api.kit.com/v4`).

Teste local sem enviar:

```bash
bun run alerts:send --dry-run
```

O dry-run não exige `KIT_API_KEY`: apenas registra, por país mudado, qual broadcast e qual tag seriam usados. Sem mudança de alta relevância, faz no-op.

## Variáveis de ambiente

| Nome | Onde | Para que |
|------|------|----------|
| `KIT_API_KEY` | Secret do repositório (Actions) | Autenticar na API V4 do Kit para criar tags e enviar broadcasts. |

## Setup manual no Kit (uma vez)

1. Criar conta no Kit e um formulário. Anotar o `FORM_ID` e colá-lo na constante `KIT_FORM_ID` em `previews/area-aluno/alertas.html`.
2. Ativar **double opt-in** no formulário.
3. Criar o campo personalizado `paises`.
4. Gerar uma **API key V4** (Settings, aba Developer) e salvá-la como secret `KIT_API_KEY` no repositório.

As tags `pais-<cc>` são criadas automaticamente pelo envio mensal, não precisa criá-las à mão.

## Detalhe de implementação a confirmar

O envio mira as tags `pais-<cc>` via `subscriber_filter` (caminho garantido). Como alternativa, o `create-broadcast` da V4 também aceita mirar **segmentos** (`type: segment`). Se preferir, dá para criar 10 segmentos no painel (`paises contém <cc>`) e mirar o segmento, dispensando a reconciliação de tags. O código atual usa tags por serem o alvo mais previsível pela API.

## Arquivos

| Arquivo | Papel |
|---------|-------|
| `src/alerts/kit.ts` | Cliente da API V4 do Kit (subscribers, tags, broadcasts). |
| `src/alerts/send-email.ts` | CLI de envio mensal: diff por país mudado, reconcilia tags e dispara broadcasts. |
| `src/diff/run.ts` | `diffCountry()` e `diffAllCountries()` reusados pela CLI e pelo envio. |
| `.github/workflows/monthly-update.yml` | Dispara o envio mensal. |
| `previews/area-aluno/alertas.html` | Página da Área Aluno com o formulário de captura. |
