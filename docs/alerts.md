# Alertas por email

Avisa por email os alunos quando o ciclo mensal detecta uma mudança de alta relevância nos países que cada um acompanha. Esta é a Fase 4 da Área Aluno. Custo recorrente próximo de zero: o envio usa o free tier do Resend e a lista de assinantes é um JSON versionado no Git, sem banco de dados nem backend próprio.

## Fluxo de inscrição (automatizado, sem backend)

1. O aluno abre `previews/area-aluno/alertas.html` e clica em "Abrir formulário de inscrição".
2. O link leva ao Issue Form do GitHub (`.github/ISSUE_TEMPLATE/alerta-inscricao.yml`), que coleta email, países desejados e o aceite de consentimento. Se a sessão do aluno tiver email, ele já vem preenchido.
3. A issue criada recebe o label `alerta-inscricao`, que dispara o workflow `.github/workflows/alerta-inscricao.yml`.
4. O workflow roda `src/alerts/add-subscriber.ts`, que faz parse do corpo da issue, valida com o `SubscriberSchema`, deduplica por email e grava em `data/subscribers.json`.
5. Em caso de sucesso: comita o JSON atualizado, comenta a confirmação, remove o email do corpo da issue e fecha. Em caso de dados inválidos: comenta o motivo e aplica o label `inscricao-invalida` sem fechar, para o aluno corrigir editando a issue.

Países vazios no formulário significam "todos os países".

## Fluxo de envio (mensal)

Roda dentro de `.github/workflows/monthly-update.yml`, no step "Send email alerts to subscribers", logo após a detecção de mudanças e apenas quando `has_high_relevance == 'true'`.

1. `src/alerts/send-email.ts` recalcula o diff via `diffAllCountries()` (de `src/diff/run.ts`, a mesma função usada pela CLI `bun run diff`).
2. Para cada assinante, cruza os países que ele acompanha com os países que tiveram mudança de alta relevância.
3. Monta um email HTML com o resumo legível das mudanças e envia via Resend, com pausa entre envios para respeitar o rate limit.
4. Assinantes sem mudança relevante no ciclo não recebem nada.

Teste local sem enviar:

```bash
bun run alerts:send --dry-run
```

O dry-run não exige `RESEND_API_KEY` e apenas registra no log para quem enviaria e quais países.

## Variáveis de ambiente

| Nome | Onde | Para que |
|------|------|----------|
| `RESEND_API_KEY` | Secret do repositório (Actions) | Autenticar no Resend. Free tier: 3000 emails/mês. |
| `ALERTS_FROM` | Variável do repositório (Actions) | Remetente, no formato `Rota Legal <alertas@seudominio>`. Padrão: `Rota Legal <onboarding@resend.dev>`. |

## Bloqueio de produção do Resend

Sem um domínio verificado no Resend, a conta só consegue enviar para o seu próprio endereço de teste, a partir de `onboarding@resend.dev`. Para enviar a emails reais de alunos é obrigatório verificar um domínio no painel do Resend e apontar `ALERTS_FROM` para ele. Enquanto isso não acontece, o sistema funciona ponta a ponta apenas em dry-run ou para o email verificado do dono da conta.

## Limitações conhecidas

- O email do aluno fica no histórico de edição da issue mesmo depois que o corpo é redigido. Quem não quiser expor o email em página pública pode pedir a inscrição direto no Discord.
- Issues são públicas, então qualquer pessoa poderia abrir uma inscrição com um email de terceiro. O impacto é baixo, já que o alerta é um resumo mensal. Mitigação futura, se o volume justificar: double opt-in via Cloudflare Worker.

## Arquivos

| Arquivo | Papel |
|---------|-------|
| `data/subscribers.json` | Lista de assinantes (`email`, `countries`, `subscribedAt`). |
| `src/alerts/subscribers.ts` | Schema Zod, loader e resolução de países por assinante. |
| `src/alerts/add-subscriber.ts` | Parser do Issue Form que grava o assinante. |
| `src/alerts/send-email.ts` | CLI de envio mensal via Resend. |
| `src/diff/run.ts` | `diffCountry()` e `diffAllCountries()` reutilizados pela CLI e pelo envio. |
| `.github/ISSUE_TEMPLATE/alerta-inscricao.yml` | Formulário de inscrição. |
| `.github/workflows/alerta-inscricao.yml` | Processa a inscrição. |
| `.github/workflows/monthly-update.yml` | Dispara o envio mensal. |
| `previews/area-aluno/alertas.html` | Página da Área Aluno. |
