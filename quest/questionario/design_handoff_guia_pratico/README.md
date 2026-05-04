# Handoff — Guia Prático (Rota Legal)

## Visão geral

Redesign da seção **Guia Prático** da página de país no **Rota Legal** (ex.: `/portugal#guia-pratico`). O guia atual é um acordeão sóbrio, plano e pouco engajante. O redesign aplica uma metáfora de **Quest/RPG** para tornar o conteúdo mais fácil de visualizar e percorrer:

- A jornada de legalização vira uma **série de fases (quests)** com objetivos numerados.
- Cada fase tem **XP, dificuldade, duração** e progresso visível.
- O usuário pode marcar etapas como concluídas (visual; **sem persistência** nesta versão — opção de adicionar `localStorage` no futuro).
- Ao completar todos os objetivos de uma fase, há **confetti** de celebração (apenas na variação 1).

> **Observação importante:** os dados do Portugal usados nos mocks são placeholders realistas. Ao implementar, **plugue os dados reais** que você já extrai mensalmente — passaporte, NIF, AIMA, vistos D7/D8/D2, EUR 9.840 etc. já estão estruturados no formato esperado.

---

## Sobre os arquivos deste bundle

Os arquivos HTML/JSX nesta pasta são **referências de design criadas em HTML+React via CDN (Babel inline)** — protótipos mostrando aparência e comportamento desejados, **não código de produção para copiar diretamente**.

A tarefa do desenvolvedor é **recriar esses designs no ambiente atual do site** (Next.js / React / Tailwind / shadcn / outro stack que você esteja usando) seguindo os padrões e bibliotecas já estabelecidos. Os arquivos JSX usam apenas inline styles para simplicidade do mock — no projeto real, usar o sistema de styling do codebase (Tailwind, CSS Modules, styled-components, etc).

## Fidelidade

**Alta fidelidade (hi-fi).** Cores, tipografia, espaçamento e interações estão finalizados. O desenvolvedor deve reproduzir pixel-a-pixel usando as bibliotecas do codebase. As variações foram pensadas para serem **escolhidas (uma) ou combinadas** — não para coexistirem todas em produção.

---

## Variações entregues

São **três direções divergentes**. O cliente escolhe uma (ou pede um híbrido) antes de implementar. Todas usam a mesma paleta dark+dourado existente no Rota Legal.

### Variação 1 — Quest Log (`variation-quest-log.jsx`)
- Layout vertical, fases empilhadas como cards expansíveis.
- Tipografia serif (`Instrument Serif`) para títulos grandes, mono (`JetBrains Mono`) para metadados.
- Emblema hexagonal por fase, dial circular de progresso, chip-nav de fases no topo.
- Confetti animado ao completar todos objetivos de uma fase.
- Ornamento decorativo sutil de círculos concêntricos no canto superior direito.

### Variação 2 — Mission Briefing (`variation-mission-brief.jsx`)
- Layout em **2 colunas**: sidebar (mission deck) + briefing principal.
- Estilo terminal/dossiê: brackets de canto, scanlines sutis, tipografia mono presente.
- Status por fase: `STANDBY` / `ACTIVE` / `CLEARED`.
- Hero com `PORTUGAL` em uppercase serif-pesado, código `OP-001`, telemetria.

### Variação 3 — Skill Tree (`variation-skill-tree.jsx`)
- **SVG-based** — árvore de habilidades com nós conectados.
- Cada objetivo é um nó circular; bloqueado até o anterior ser completo (gating sequencial).
- Painel lateral fixo com detalhe da skill selecionada.
- Recompensa final no fim da árvore: cidadania PT/passaporte UE.
- Legenda de estados (disponível/concluído/bloqueado).

---

## Layout & estrutura (recomendação geral, aplicável a qualquer variação)

A página de país já tem topbar + país hero + tabs (Vistos, Para Brasileiros, Requisitos Gerais, Mudanças Recentes, Fontes, Guia Prático). **O redesign substitui apenas o conteúdo da tab "Guia Prático"** — não toca em outras partes.

Estrutura sugerida da tab:

1. **Hero do guia** (~ 200px de altura)
   - Eyebrow: "GUIA PRÁTICO PARA BRASILEIROS"
   - H1: `Como se legalizar em <País>`
   - Subtítulo de 1 linha
   - **Stats row** (4 stats — XP total, tempo estimado, dificuldade, número de fases)
   - CTA `Iniciar jornada` (opcional — pode rolar até a primeira fase)

2. **Chip-nav de fases** (sticky no scroll, opcional)
   - Pílulas com `01 — Documentação Essencial`, `02 — Processo do Visto`, `03 — Chegada e Regularização`
   - Clicar rola até a fase

3. **Lista de fases** (cards expansíveis)
   - Por fase: emblema + nome + meta (duração/XP) + dial de progresso + objetivos numerados

4. **Disclaimer no rodapé** (já existe, manter)

---

## Componentes — especificação detalhada

### `<PhaseCard>`

| Prop | Tipo | Descrição |
|---|---|---|
| `phase` | `Phase` | Dados da fase (ver seção Dados) |
| `defaultOpen` | `boolean` | Se começa expandido |
| `onObjectiveToggle?` | `(id) => void` | Callback ao marcar/desmarcar objetivo |

**Aparência (Quest Log variant):**
- Container: `border-radius: 16px`, `border: 1px solid rgba(255,255,255,0.06)`, `background: linear-gradient(180deg, #15151a 0%, #111114 100%)`, sombra `0 20px 60px rgba(0,0,0,0.4)`.
- Header (clicável para expand/collapse): padding `24px 28px`, gap `24px`, contém:
  - Emblema hexagonal (72×72px, SVG inline com `<polygon>`s)
  - Bloco de texto (eyebrow mono dourado + título serif 38px + subtítulo itálico)
  - Dial circular de progresso (64×64, stroke-dasharray animado, % no centro)
  - Chevron rotacionando 180° quando aberto
- Body (animado com `max-height` + `opacity`): lista de `<ObjectiveRow>`.

### `<ObjectiveRow>`

| Prop | Tipo | Descrição |
|---|---|---|
| `obj` | `Objective` | Dados do objetivo |
| `idx` | `number` | Índice 0-based, mostrado como `01`, `02`... |
| `done` | `boolean` | Estado de conclusão |
| `onToggle` | `() => void` | Toggle do done |

**Aparência:**
- Container: `border-radius: 12px`, padding `18px 20px`, hover sutil.
- Checkbox custom à esquerda (28×28, mostra número se não-marcado, ✓ verde se marcado). Cor de borda muda: dourado → verde.
- Título: `font-size: 16px`, `font-weight: 600`, dourado quando ativo / verde + line-through quando completo.
- Tags chips inline: `font-size: 10px`, mono, uppercase, padding `2px 8px`, border `1px solid rgba(255,255,255,0.08)`.
- `summary` em parágrafo `font-size: 14px`, `color: #c0c0c8`.
- Botão "Detalhes →" expande bloco com `obj.detail` + `obj.tip` (border-left dourado, background levemente colorido).

### `<HeroStats>`

Linha de 4 KPIs separados por divisores verticais. Cada stat: ícone + label uppercase mono pequeno + valor grande (serif para Quest Log, mono para Mission Brief).

### `<ChipNav>`

Pílulas 8/14 padding, border `1px solid`, gap separador (em em-dash `—`). Estado ativo: `background: rgba(245,180,37,0.1)`, `border-color: rgba(245,180,37,0.4)`, `color: #f5b425`.

### `<DifficultyMeter>`

5 pequenos diamantes (`width: 10px, height: 10px, transform: rotate(45deg)`). Os primeiros `level` ficam dourados com `box-shadow` glow; os restantes ficam `rgba(255,255,255,0.1)`.

---

## Interações & Behavior

| Ação | Comportamento |
|---|---|
| Clicar header da fase | Toggle `expanded`. Animação 500ms `max-height` + 300ms `opacity`. |
| Clicar checkbox/número | Toggle `done` do objetivo. Cor da row muda; título recebe line-through. |
| Clicar "Detalhes →" | Toggle `expanded` do objetivo. Animação 300ms. |
| Completar todos objetivos da fase | Disparar confetti (variation 1) — 30 partículas, `position: absolute`, animação `fall` 1–1.8s, cleanup em 1800ms. |
| Clicar chip-nav de fase | Scroll suave até a fase E expand dela. |
| Hover em qualquer botão | Não há hover states distintos — design é dark e o foco é cor de borda/fundo. Adicionar `transition: all 0.2s` em propriedades relevantes. |

**Importante:** sem persistência nesta versão. Estado vive em React state local. Se o cliente quiser persistir, usar `localStorage` com chave `rotalegal:guia:<countryCode>:progress` armazenando um Set de IDs concluídos.

---

## State management

Estado por página (todos client-side):

```ts
type GuideState = {
  expandedPhase: string | null;       // id da fase aberta (ou null se múltiplas, depende da variação)
  completedObjectives: Set<string>;   // ids dos objetivos marcados
  selectedSkill?: string;             // (Skill Tree apenas) id do nó selecionado
};
```

Não há fetching — os dados vêm do mesmo endpoint que já alimenta a página de país atual.

---

## Design tokens

### Cores (já alinhadas com o site existente)

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#07070a` | Fundo da página |
| `bg-2` | `#0c0c10` / `#0d0d11` | Fundo do canvas da skill tree, panels |
| `panel` | `#15151a` | Cards de fase (Quest Log) |
| `panel-2` | `#111114` | Gradiente bottom dos cards |
| `panel-mission` | `#0d0d10` | Panels Mission Brief (mais frio) |
| `line` | `rgba(255,255,255,0.06)` | Bordas padrão |
| `line-2` | `rgba(255,255,255,0.14)` | Bordas com mais peso |
| `text` | `#f3f3f4` | Texto principal |
| `text-dim` | `#a0a0a8` | Texto secundário |
| `text-mute` | `#6c6c75` | Labels, metadados |
| `gold` | `#f5b425` | **Accent principal** (já é do site) |
| `gold-glow` | `rgba(245,180,37,0.18)` | Sombras/glows dourados |
| `green` | `#4ade80` | Sucesso, "concluído" |
| `red` | `#ef4444` | (Não usado, reservado para erros) |

Gradientes usados:
- Card de fase: `linear-gradient(180deg, #15151a 0%, #111114 100%)`
- Hero meta strip: `linear-gradient(180deg, rgba(245,180,37,0.04), rgba(245,180,37,0.01))`
- Progress bar Skill Tree: `linear-gradient(90deg, #f5b425, #4ade80)`
- Background radial Skill Tree: `radial-gradient(1400px 800px at 50% -10%, rgba(245,180,37,0.06), transparent 60%)`

### Tipografia

| Família | Quando usar | Pesos |
|---|---|---|
| **Inter** | Texto base, UI, labels | 400, 500, 600, 700 |
| **Instrument Serif** | Títulos grandes (Quest Log apenas) | 400 (regular + italic) |
| **JetBrains Mono** | Códigos, eyebrows, metadados, tags | 400, 500, 600 |

Carregar via Google Fonts. Se o site já usa Inter, **manter**.

Escala (Quest Log):
- H1: `72px / line-height 1.1 / weight 400 (serif)` — italic só na palavra do país.
- H2 fase: `38px / line-height 1.1 / weight 400 (serif)`.
- Subtítulo da fase: `14px italic`.
- Título objetivo: `16px / weight 600`.
- Body: `14px / line-height 1.55`.
- Detalhe expandido: `13px / line-height 1.6`.
- Eyebrows mono: `11px / letter-spacing 2 / uppercase / weight 600`.
- Tags: `10px mono uppercase`.

### Espaçamento

Múltiplos de 4. Padding interno típico: `24px 28px` em cards, `18px 20px` em rows. Gap entre fases: `24px`. Margem hero → primeira fase: `40px`.

### Border radius

| Elemento | Radius |
|---|---|
| Cards de fase | 16px |
| Rows de objetivo | 12px |
| Checkbox custom | 8px |
| Pílulas/chips | 999px (full round) |
| Mission Brief panels | 4px (mais "tactical") |
| Tags mono | 2–4px |

### Sombras

- Card de fase: `0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.4)`.
- Botão CTA dourado: `0 6px 24px rgba(245,180,37,0.35)`.
- Glow em dot de status: `0 0 12px #f5b425`.

---

## Dados — schema esperado

`data.jsx` já mostra a estrutura completa. Schema TS:

```ts
type Phase = {
  id: string;             // 'p1', 'p2'...
  number: number;         // 1, 2, 3
  title: string;          // 'Documentação Essencial'
  subtitle: string;       // tagline narrativa, aparece em itálico
  xp: number;             // ex. 800 — soma dos objetivos
  duration: string;       // '2-4 semanas'
  difficulty: 1|2|3|4|5;
  icon: 'scroll'|'stamp'|'key'|'shield'|'compass'|'map'|'trophy';
  color: 'gold';          // expandir se quiser fases coloridas distintas
  objectives: Objective[];
};

type Objective = {
  id: string;
  title: string;          // 'Passaporte válido'
  summary: string;        // 1 linha
  detail: string;         // parágrafo expandido
  tip?: string;           // dica destacada (opcional)
  tags?: string[];        // ['Obrigatório', 'Brasil']
};

type CountryGuide = {
  country: string;
  flag: string;           // emoji ou path para SVG
  flagColors: [string, string];
  trust: 'Confiança alta' | 'Confiança média' | 'Confiança baixa';
  schengen: boolean;
  updated: string;        // 'mai/2026'
  totalXP: number;        // soma dos xp das fases
  estimatedTime: string;  // '3-6 meses'
  difficulty: 1|2|3|4|5;
  phases: Phase[];
  stats: { label: string; value: string; note: string; tone: 'green'|'gold'|'neutral' }[];
};
```

**XP** pode ser calculado server-side com base no número/peso dos documentos da fase. **Dificuldade** idem. Se preferir não inventar esses números, é OK escondê-los no MVP — o componente aceita props opcionais.

---

## Iconografia

Todos os ícones são **Lucide-style line icons** desenhados em SVG inline em `icons.jsx`. No projeto real, **substituir por `lucide-react`**:

```bash
npm install lucide-react
```

Mapeamento:

| Nome custom | Lucide equivalente |
|---|---|
| `scroll` | `Scroll` |
| `stamp` | `Stamp` |
| `key` | `Key` |
| `check` | `Check` |
| `lock` | `Lock` |
| `chevron-down` | `ChevronDown` |
| `trophy` | `Trophy` |
| `clock` | `Clock` |
| `flame` | `Flame` |
| `star` | `Star` |
| `info` | `Info` |
| `alert` | `AlertTriangle` |
| `compass` | `Compass` |
| `map` | `Map` |
| `play` | `Play` |
| `external` | `ExternalLink` |
| `zap` | `Zap` |
| `circle-dot` | `CircleDot` |

---

## Responsividade

Os mocks foram feitos em **1280px**. No site real:

- **≥1024px**: layout como nos mocks (2 colunas para Mission Brief / Skill Tree).
- **768–1023px**: Mission Brief vira sidebar collapse-to-top; Skill Tree perde o painel lateral (vira modal ao clicar nó).
- **<768px**: Quest Log é a melhor opção — já é vertical. Reduzir H1 para `48px`, esconder dial de progresso (mostrar só `%`), tags em segunda linha. Chip-nav vira scroll horizontal.

Recomendação: **escolher Quest Log como única variação se mobile for prioridade**. Skill Tree é desktop-first.

---

## Assets

- **Bandeira de Portugal**: SVG inline simples (`<rect>` verde + `<rect>` vermelho + brasão simplificado em `<circle>`). No projeto real, usar a biblioteca de bandeiras que você já usa no site (vi nos prints que existe).
- **Sem imagens externas.** Tudo é SVG inline ou tipografia.

---

## Files

| Arquivo | Função |
|---|---|
| `Guia Pratico.html` | Entry point; carrega React/Babel via CDN e renderiza o canvas com as 3 variações |
| `data.jsx` | Dados de exemplo (Portugal). Schema completo a ser plugado no backend |
| `icons.jsx` | Componente `<Icon>` com SVGs inline (substituir por lucide-react no projeto) |
| `variation-quest-log.jsx` | **Variação 1** — Quest Log (recomendada como default) |
| `variation-mission-brief.jsx` | **Variação 2** — Mission Briefing (terminal/tactical) |
| `variation-skill-tree.jsx` | **Variação 3** — Skill Tree (visual, desktop-only) |
| `design-canvas.jsx` | Wrapper de apresentação (não vai para produção) |

---

## Como implementar — checklist

1. [ ] Confirmar com o cliente **qual variação** (ou híbrido) implementar.
2. [ ] Criar componentes no design system existente: `<PhaseCard>`, `<ObjectiveRow>`, `<HeroStats>`, `<ChipNav>`, `<DifficultyMeter>`, `<ProgressDial>`.
3. [ ] Adicionar fontes (Instrument Serif + JetBrains Mono) ao `_app.tsx` / `layout.tsx` se ainda não estiverem.
4. [ ] Estender o schema do guia no backend para incluir `xp`, `difficulty`, `duration` por fase. Pode começar com valores padrão se for muito custoso.
5. [ ] Substituir `icons.jsx` por `lucide-react`.
6. [ ] Implementar a tab "Guia Prático" do componente de país consumindo o novo componente.
7. [ ] Adicionar `localStorage` opcionalmente para persistir progresso por país.
8. [ ] Testar mobile (especialmente <768px) — possivelmente forçar Quest Log nesse breakpoint.
9. [ ] A11y: garantir `aria-expanded` nos toggles, `role="button"` onde aplicável, foco visível em todos os controles, redução de movimento via `prefers-reduced-motion` (desligar confetti).

---

## Dúvidas durante implementação?

Os dados nos mocks são placeholders mas plausíveis — passaporte, NIF, AIMA, valores em EUR, prazos VFS. Sinta-se livre para ajustar para os dados reais. Os componentes são agnósticos a conteúdo, contanto que o schema seja respeitado.
