# CLAUDE.md (escopo: previews/)

Instruções para o Claude Code trabalhando dentro da pasta `previews/`. Este ficheiro é carregado automaticamente quando alterares qualquer coisa daqui para baixo. Para regras gerais do projeto, lê o `CLAUDE.md` da raiz.

## O que existe nesta pasta

```
previews/
├── assets/
│   └── design-system.css     fonte única de tokens e componentes
├── clickhouse-style.html     exemplo completo, referência viva de uso
├── template.html             boilerplate para páginas novas
└── CLAUDE.md                 este ficheiro
```

A estética é baseada no sistema visual da ClickHouse: canvas preto, accent âmbar dourado, tipografia Inter weight 700 com letter-spacing negativo, código em JetBrains Mono. Todos os tokens estão em `assets/design-system.css`.

## Como criar uma página nova (passo a passo)

1. Copia `template.html` e renomeia para o slug da página (ex: `paises.html`, `historico.html`, `diff.html`).
2. Atualiza a tag `<title>` no `<head>`.
3. Substitui o conteúdo dentro de `<main>` mantendo as secções com a classe `section` ou `section-tight`.
4. Usa apenas as classes documentadas em `assets/design-system.css`. Não escrevas CSS inline ou novos `<style>` blocks.
5. Se precisares de um componente que não existe, abre `assets/design-system.css` e adiciona-o seguindo o padrão dos outros (variável de cor via `var(--token)`, raio em `--r-md` ou `--r-lg`, espaçamento em `--s-*`).
6. Para verificar visualmente, abre a página no servidor estático que está documentado em `.claude/launch.json` na raiz do projeto. O Claude Code consegue inspecionar o resultado via `mcp__Claude_Preview__*`.

## Componentes prontos a usar

Lista de classes documentadas, todas presentes em `assets/design-system.css` e usadas em `clickhouse-style.html`.

### Layout
- `container`: largura máxima de 1280px, centrada, padding lateral `--s-lg`.
- `top-nav`: barra de navegação fixa no topo, 64px.
- `section`: padding vertical `--s-section` (96px).
- `section-tight`: padding vertical `--s-xxl` (48px).

### Tipografia
- `display-xl`: 72px / weight 700 / letter-spacing -2.5px. Reserva para o h1 da hero.
- `display-lg`: 56px. Heads de secção grandes.
- `display-md`: 40px. Subsecções, CTA bands.
- `display-sm`: 32px. Títulos de cards maiores.
- `title-lg`: 24px / weight 700.
- `title-md`: 18px / weight 600.
- `body-md`: 16px running text.
- `body-sm`: 14px footer e fine print.
- `caption-up`: 12px uppercase, letter-spacing 1.5px. Rótulos de secção.
- `stat-display`: 56px amarelo. Apenas para números de credibilidade (contagens, métricas).

### Botões e links
- `btn btn-primary`: CTA amarelo. Sempre 40px de altura.
- `btn btn-secondary`: superfície dark com hairline.
- `btn btn-on-yellow`: botão preto sobre superfície amarela.
- `text-link`: link inline em amarelo, sublinhado.

### Cards e superfícies
- `feature-card-dark`: card padrão, fundo `--surface-card`, padding `--s-xl`.
- `feature-card-yellow`: card amarelo full-bleed, ocupa 3 colunas no grid de features.
- `code-window-card`: janela de código com header de dots e corpo monoespaçado.
- `data-table-card`: tabela de dados com filtros em chips.
- `cta-band-yellow`: banner CTA amarelo, normalmente antes do footer.
- `pricing-tier-card`: tier de preço escuro.

### Badges e indicadores
- `badge`: pill cinzento.
- `badge new`: pill amarelo (destaque).
- `badge up`: status verde.
- `badge down`: status vermelho.
- `delta-up` / `delta-down`: número de delta em verde ou vermelho.
- `chip`: filtro pill cinzento. Variantes: `chip active`, `chip yellow`.

### Hero e código
- `hero`: secção de hero com `padding-top: --s-xxl`.
- `hero-grid`: grelha 7-5 (texto à esquerda, mockup à direita).
- `code-window`, `code-bar`, `code-body`: estrutura da janela de código com syntax highlighting via spans (`kw`, `fn`, `str`, `com`, `num`, `pl`).

## Tokens de design

Todos definidos em `:root` no início de `assets/design-system.css`. Sempre usa `var(--token)`, nunca um hex inline.

### Cores
| Token | Hex | Uso |
|---|---|---|
| `--canvas` | #0a0a0a | fundo principal |
| `--surface-card` | #1a1a1a | cards |
| `--surface-elevated` | #242424 | cards aninhados |
| `--primary` | #f0b429 | accent âmbar, CTAs, stats |
| `--on-primary` | #0a0a0a | texto sobre amarelo |
| `--hairline` | #2a2a2a | bordas finas de cards |
| `--on-dark` | #ffffff | texto principal |
| `--body` | #cccccc | running text |
| `--muted` | #888888 | captions, links de footer |
| `--accent-emerald` | #22c55e | sucesso |
| `--accent-rose` | #ef4444 | erro |
| `--accent-blue` | #3b82f6 | info |

### Raios
`--r-md` 8px (botões, inputs), `--r-lg` 12px (cards), `--r-pill` 9999px (badges).

### Espaçamento (base 4px)
`--s-xxs` 4, `--s-xs` 8, `--s-sm` 12, `--s-md` 16, `--s-lg` 24, `--s-xl` 32, `--s-xxl` 48, `--s-section` 96.

## Regras (importante)

1. **Nunca introduzas uma segunda cor de marca.** O sistema é monocromo preto + amarelo. Verde, vermelho e azul são apenas para estados semânticos (success, error, info), nunca decorativos.
2. **Nunca uses peso de fonte diferente de 400, 500, 600, 700.** A hierarquia depende de tamanho, não de peso fracionário.
3. **Letter-spacing negativo é obrigatório nos displays** (-1 a -2.5px). Inter sem tracking apertado lê marketing-soft.
4. **O amarelo (`--primary`) é escasso a nível de elemento, abundante a nível de banda.** Bom: um botão amarelo numa hero. Mau: três badges amarelas e um botão amarelo na mesma vista.
5. **Não uses sombras (`box-shadow`).** A profundidade vem do contraste entre `--canvas` e `--surface-card`.
6. **Não substituas blocos de código por ilustrações.** Quando mostrares como o sistema funciona, mostra o código real (TypeScript, JSON, output de CLI), nunca uma imagem decorativa.
7. **Não dupliques o mesmo modo de superfície em duas bandas consecutivas.** Alterna canvas, dark card, yellow card, code window.
8. **Não toques nos tokens em `:root` sem motivo claro.** Se mudares uma cor, propaga em todo o site. Documenta a razão.

## Regras de prosa (herdadas da raiz)

Para qualquer texto que escrevas no HTML:

- Português brasileiro.
- Nunca usar travessão. Substituir por dois pontos, vírgula, parênteses ou frase nova.
- Sem ponto e vírgula em texto corrido.
- Sem emojis.
- Não citar ZZP nem a Diretiva 2024/1233 da UE no conteúdo direcionado ao usuário final.

## Como verificar uma alteração

O ficheiro `.claude/launch.json` na raiz tem a configuração do servidor estático que serve esta pasta na porta 5173. Para verificar:

1. Confirma que o servidor está a correr (`mcp__Claude_Preview__preview_list`).
2. Navega para a página em causa (`window.location.href = '/nome-da-pagina.html'` via `preview_eval`).
3. Inspeciona elementos-chave com `preview_inspect` para validar que os tokens correctos estão aplicados (ex: `.btn-primary` deve ter `background-color: rgb(250, 255, 105)`).
4. Se algo parecer estranho mas o screenshot falhar, recorre sempre ao `preview_inspect`. É mais fiável que o screenshot para verificar cores e tamanhos.

## Tarefas típicas que vais receber

### "Cria a página de detalhe de um país"
1. Copia `template.html` para `pais-{cc}.html` (ex: `pais-nl.html`).
2. Hero com `display-xl` mostrando "Países Baixos" + bandeira via `flag flag-nl`.
3. `stats` com 4 callouts (regras totais, alteradas no último ciclo, fonte, última extração).
4. `code-window-card` com o JSON real de `data/current/nl.json`.
5. `data-table-card` listando as regras com colunas: nome, tipo, última alteração, ação.
6. Footer padrão.

### "Cria a página de diff entre snapshots"
1. Hero curto com `display-md`.
2. Selector de país e datas (input com classe `text-input`, botão `btn-primary`).
3. Lado a lado em grid 2 colunas: snapshot anterior à esquerda, atual à direita, ambos em `code-window-card`.
4. Linhas adicionadas com `var(--accent-emerald)`, removidas com `var(--accent-rose)`.

### "Adiciona um componente novo"
1. Lê `clickhouse-style.html` para confirmar que o componente realmente não existe.
2. Se for variante de algo existente (ex: `feature-card-emerald`), adiciona apenas a regra extra no CSS, herdando do componente base.
3. Se for genuinamente novo, adiciona o bloco no fim de `assets/design-system.css` com comentário-cabeçalho identificando a secção.
4. Documenta a classe nesta lista, na secção "Componentes prontos a usar".

## Quando estiver em dúvida

- Se não souberes que classe usar, abre `clickhouse-style.html`, procura um exemplo análogo, copia.
- Se nenhuma classe encaixa, prefere adicionar uma classe nova ao `design-system.css` em vez de inline styles.
- Se a página parece monótona, alterna superfícies (canvas, dark card, yellow card, code window) entre bandas consecutivas.
- Se quiseres mudar a paleta, mexe só nos tokens em `:root`. Não procures `#f0b429` no resto do CSS, ele está só lá uma vez.
