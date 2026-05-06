# Handoff: "Qual país combina com você?" — Country-Match Quiz (Rota Legal)

## Overview

Redesign of the existing **/qual-pais** section of the Rota Legal site. The current implementation is a generic 6-step radio-button form. This redesign turns it into a **gamified visual journey**: each of the 6 questions becomes its own "scene" with a distinct visual treatment, a live partial ranking of the top-3 countries appears as a side rail, and the final result is presented as an opened passport spread (cover page with flag + data page with monospaced fields and an animated approval stamp).

Brand-respecting: keeps the existing Rota Legal palette (rich black + golden yellow accent) and the official type stack (Inter + JetBrains Mono).

## About the Design Files

The files in this bundle are **design references created in HTML/JSX**. They are interactive prototypes showing the intended look, motion, and behavior — not production code to be shipped as-is. The Babel-in-the-browser setup, the inline `style={{}}` objects, and the multi-file `<script type="text/babel">` loading pattern are all prototype affordances.

**The task is to recreate these designs in the Rota Legal codebase's existing environment** (likely Next.js / React + Tailwind or whatever stack is already in use) following its established patterns: real CSS-modules / Tailwind / styled-components / etc., real component boundaries, real routing for `/qual-pais`, real persistence for answers, real API calls for the country dataset.

If no frontend environment exists yet for this section, pick the framework that best fits the rest of the site and port the designs there.

## Fidelity

**High-fidelity (hifi).** Final colors, typography scale, spacing, motion timings, and interaction states are all decided. The developer should reproduce the UI pixel-perfectly, using the codebase's existing component primitives (Button, Card, etc.) where they already exist and matching the visual specs below where they don't.

## Screens / Views

The flow has **3 macro-states**: Hero → Question (×6, one scene per question) → Result (passport).

---

### 1. Hero / Landing (`step === 0`)

**Purpose**: Sell the quiz and set expectations (6 questions, ~2 minutes, top-3 result).

**Layout**: Two-column grid, max-width `1280px`, padding `120px 64px 60px`. Left column: copy + CTA + stats. Right column: decorative orbital visual.

**Components**:
- **Eyebrow**: `mono`, 11px, letter-spacing `0.18em`, color `var(--gold)`. Prefixed with a 24×1px gold rule. Text: `DESCUBRA · 6 PERGUNTAS · 2 MINUTOS`.
- **Headline**: `Inter 800`, `clamp(48px, 6vw, 88px)`, line-height `1.0`, letter-spacing `-0.035em`. Three lines: "Qual país / combina com / **você?**" — last word in `var(--gold)`.
- **Subcopy**: `Inter 400`, 17px, color `var(--ink-dim)`, max-width 480px, line-height 1.55.
- **Primary CTA**: pill button, `var(--gold)` bg, `#0a0908` text, padding `16px 32px`, border-radius `999px`, 15px / weight 600. Box-shadow `0 8px 32px rgba(251,191,36,0.3)`. Hover: `translateY(-2px)`, 200ms ease.
- **Stats row** (3 mini-stats): mono numbers (28px, 600), mono labels (10px, letter-spacing `0.14em`, uppercase, color `var(--ink-faint)`).
- **Hero visual** (right column): centered 220×220 gold disc with radial gradient `radial-gradient(circle at 35% 30%, var(--gold), var(--gold-deep))`, glow shadow `0 0 80px rgba(251,191,36,0.35)`. Inner mono caption "Match / ?% / aguardando". Around it, two orbit guide rings (460×460 dashed gold, 320×320 solid faint white) and 10 tiny flag chips (36×48, 3-stripe SVG-free div construction) positioned on a 230px-radius circle, animating with a 60s `orbit` keyframe. Inner counter-rotation cancels out so flags stay upright.

---

### 2. Question Scenes (`step 1..6`)

All six scenes share a wrapper:

**Wrapper layout**: full-viewport flex column centered, max-width `1100px`, padding `140px 64px 100px` (or `110/60` in compact mode).
- **Eyebrow**: `PERGUNTA 0X DE 06`, mono, gold, with prefix rule.
- **Title**: `Inter 800`, `clamp(40px, 5.4vw, 72px)`, line-height `1.02`, letter-spacing `-0.03em`, max-width 900, `text-wrap: balance`.
- **Subtitle**: `Inter 400`, 17px, color `var(--ink-dim)`, max-width 560.
- **Scene body**: 44px below subtitle.
- **Footer** (48px below body): `← Voltar` (transparent button, ink-dim) — center mono hint "SELECIONAR AVANÇA AUTOMATICAMENTE" — `Próxima →` pill button (gold when enabled, transparent + ink-faint border when disabled).

**Top progress bar**: fixed, full-width, 3px tall, `rgba(255,255,255,0.04)` track, gold gradient fill `linear-gradient(90deg, var(--gold-deep), var(--gold))` with `0 0 18px rgba(251,191,36,0.4)` glow. Width transitions `600ms cubic-bezier(0.65, 0, 0.35, 1)`.

**Top nav**: fixed, padding `20px 32px`. Logo dot (28px circle, gold, contains `◐` glyph) + "Rota Legal" wordmark. Centered: mono `0X / 06` slide counter. Right: pill "Sair ✕" outlined button.

**Live preview rail**: fixed right, vertically centered, `right: 28px`. Vertical mono caption "MATCH PARCIAL ↓" (writing-mode: vertical-rl). Below: 3 stacked flag chips (44×56 px, rounded-4 corners, drop shadow), each with a tiny gold rank badge (18×18 circle, `1`/`2`/`3`) overlapping top-right. Mono caption below each chip with country code + match score. Animation: each chip enters with `flagIn` keyframe (8px translateY, 600ms cubic-bezier, staggered 80ms each).

**Scene atmosphere**: a fixed full-viewport radial gradient that changes per-scene (positioned in different quadrants — top-left, top-right, bottom-center, etc.). Color `rgba(251,191,36,0.07–0.10)` over transparent. Transitions `1200ms ease`.

#### 2.1 Scene "shapes" — Q1 Profissão
Grid 2×2, 16px gap, max-width 820. Each cell is a 180px-tall card.
- Card bg (idle): `var(--bg-2)` (`#131110`), 1px `var(--line)` border, radius 14.
- Card bg (selected): `linear-gradient(180deg, rgba(251,191,36,0.14), rgba(251,191,36,0.04))`, gold border, `translateY(-2px)`, shadow `0 12px 36px rgba(251,191,36,0.18)` + inset gold ring.
- Top-left: 48×48 SVG glyph (1.5px stroke, currentColor). Idle: `var(--ink-dim)`. Selected: `var(--gold)`.
  - `employed`: gridded square (rect + cross-rules)
  - `freelance`: bullseye (3 concentric circles)
  - `founder`: triangle with vertical mast
  - `student`: shield outline
- Bottom: 18px / 600 label + 13px / faint hint.

#### 2.2 Scene "sectors" — Q2 Área
Grid 3×2, 14px gap, max-width 900. Each cell 150px tall.
- Top: large mono glyph (`{ }`, `✚`, `▲`, `◖`, `§`, `◇`), 32px / 500, ink-dim → gold when selected.
- Bottom: 15px / 600 label.

#### 2.3 Scene "fluency" — Q3 Inglês
- Above the options: a horizontal **level meter**, 56px tall, `var(--bg-2)` background, 14px radius, padding 8. Inside: 4 segments in a flex row with 8px gap. Inactive segment: `rgba(255,255,255,0.03)`, radius 8. Active: `linear-gradient(180deg, var(--gold), var(--gold-deep))` + `0 0 18px rgba(251,191,36,0.25)` glow. Activates left-to-right based on selected level. Transition `360ms cubic-bezier(0.22, 1, 0.36, 1)`.
- Below: 4-column grid of compact buttons, `padding: 16px 14px`, 10px radius. Mono eyebrow `NÍVEL 0X` (10px, letter-spacing `0.12em`) in faint ink → gold when selected. 14px / 600 label.

#### 2.4 Scene "horizon" — Q4 Objetivo
Stacked list (4 wide rows, 12px gap, max-width 820). Each row 92px tall.
- 24px horizontal padding, three-column flex: mono index `01`/`02`/… (12px, ink-faint, 32px wide), 18px / 600 label (flex 1), large arrow glyph (28px, serif, ink-faint → gold). On select, arrow translates `+6px` in X over 240ms ease.

#### 2.5 Scene "company" — Q5 Família
Grid 1×3, 16px gap, max-width 780. Each card 200px tall.
- Top: 64px-tall row with circles representing people (`solo` = one 24px circle, `couple` = two, `kids` = two adults + 18px child + tiny 14px child at 0.7 opacity). Color `var(--ink-dim)` → `var(--gold)` when selected.
- Bottom: mono caption "0X PESSOA(S)+", 17px / 600 label.

#### 2.6 Scene "balance" — Q6 Dinheiro
- Top: 80px-tall horizontal "scale" visual. 1px line at 50% across full width; mono labels `← CUSTO BAIXO` (left) and `SALÁRIO ALTO →` (right) on 10px / letter-spacing `0.12em` / ink-faint, with bg-color background to mask the line behind. A 36×36 gold knob with `0 0 32px rgba(251,191,36,0.4)` glow positions at `0% / 50% / 100%` based on selection. Transition: `left 480ms cubic-bezier(0.22, 1, 0.36, 1)`.
- Bottom: 3-column grid of 120px-tall option cards. Label only, anchored to bottom (15px / 600).

---

### 3. Result — Passport (`step === 7`)

**Purpose**: Reveal top-3 countries; the #1 dramatized as an opened passport.

**Header**:
- Eyebrow: `RESULTADO · MATCH XX%`.
- Headline (clamp 40–64px, 800): "Seu destino é / **{Country}.**" — country in gold.
- Subcopy: country tagline.

**Passport (the showpiece)**:
- Container: 460px tall, `perspective: 1600px`. Inside, two-column grid (1fr 1fr), single shadow `0 32px 80px rgba(0,0,0,0.6)`, 8px radius, full overflow hidden. The two pages live as siblings inside it.
- **Left page (cover)**: dark gradient `linear-gradient(135deg, #1a1816 0%, #0f0e0c 100%)`, padding 36, flex-column space-between.
  - Background security pattern: two `repeating-linear-gradient`s at 45° / -45°, gold lines every 14px, `opacity: 0.04`.
  - Top: mono `· PASSAPORTE / PASSPORT ·` in gold, then "REPÚBLICA DE OPORTUNIDADES" caption.
  - Center: large country flag, max-height 200, aspect 3:2, 4px radius, drop shadow. Built as stacked stripe `<div>`s using the country's `flag` array.
  - Bottom: mono "CÓDIGO ISO" + the 2-letter code at 56px / 800 / `-0.04em`.
- **Right page (data)**: cream gradient `linear-gradient(135deg, #f4f1eb 0%, #e8e4dc 100%)`, dark text `#1a1816`, padding 36.
  - Paper grain: `repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 4px)`, opacity 0.03.
  - Header: mono MRZ-style line "P<{CC}{NAME}" left + "N° RL-{4digits}" right, both 9px / letter-spacing `0.2em` / 50% opacity.
  - Body: 6 rows in a `120px 1fr` grid, separated by `1px solid rgba(26,24,22,0.08)`. Rows: NOME, CAPITAL, VISTO REC., CIDADANIA, MATCH, EMITIDO. Labels mono 9px / letter-spacing `0.14em` / 45% opacity. Values mono 13px / 500 / letter-spacing `0.02em`. Each row enters with translateY(8px)→0 + opacity 0→1 over 420ms `cubic-bezier(0.22, 1, 0.36, 1)`, staggered 80ms each, starting at 300ms.
  - Bottom-right corner: **APROVADO stamp**. 2.5px solid border in `country.accent` color (each country has its own accent), 4px radius, 8px×14px padding. Mono "APROVADO / · XX% ·" in same accent. Animation `stampDrop` at 1100ms: from `rotate(-8deg) scale(2) opacity(0)` to `rotate(-12deg) scale(1) opacity(0.92)`, with overshoot.

**Runners-up section** (after passport, 64px above):
- Eyebrow `OUTROS BONS MATCHES` (ink-faint).
- 2-column grid, 16px gap. Each card: bg-2, 1px line, 14 radius, 22 padding, flex row 18 gap. Left: 52×68 stripe-flag. Right: mono `XX% MATCH` (10px, gold) → 18 / 600 country name → 13 / ink-dim tagline.

**Actions row** (56px below):
- Primary pill: `Refazer o teste →` (gold).
- Secondary pills (transparent + line-2 border): `Ver guia prático {CODE} →` and `Comparar com outros`.

---

## Interactions & Behavior

- **Auto-advance**: when a question is answered, after a 420ms delay the flow auto-advances to the next step. Toggle-able (Tweaks panel).
- **Back button** on Q1 returns to the hero.
- **Live preview**: `partialRanking(answers)` recomputes after every answer; the rail re-renders top-3 with their match score (or hides scores if no answers yet, showing 3 default popular countries: NL/PT/DE).
- **Scene transitions**: every scene root has class `scene-in` → keyframe `sceneIn` (12px translateY + opacity, 700ms `cubic-bezier(0.22, 1, 0.36, 1)`).
- **Selected card pop**: keyframe `selectedPop` (1 → 1.04 → 1.02), 320ms ease.
- **Card hover** (idle): border-color `var(--line)` → `var(--line-2)`, no transform.
- **Hero CTA hover**: `translateY(-2px)`, 200ms ease.
- **Scene atmosphere transition**: `1200ms ease` background swap on the fixed gradient layer.
- **Orbital ring**: `orbit` keyframe, 60s linear infinite. Inner counter-rotation on each flag wrapper cancels rotation so flags stay upright while orbiting.

## State Management

```
state:
  step: number             // 0 = hero, 1..6 = questions, 7 = result
  answers: Record<qid, optionId>   // 6 keys: situation, field, english, goal, family, money
  tweaks: { showLivePreview, autoAdvance, atmosphere, sceneDensity, passportTone }

derived:
  currentQ        = step in [1..6] ? QUESTIONS[step-1] : null
  ranking         = partialRanking(answers)   // length 3, for the rail
  finalRanking    = scoreCountries(answers)   // length 10, for the passport screen
```

Persist `answers` to URL hash or session storage so a refresh mid-quiz doesn't lose progress (current prototype does not — please add).

The scoring function (`scoreCountries`) is in `quiz-data.jsx`. Each country has a `profile` object (jobs / freelance / startup / english / cost / salary / family / residency / stay, all 1–5) plus a `sectors` map. The function adds weighted contributions per question and normalizes to a 20–99 match band. **Re-implement this function on the server** (or a typed shared package) — do not ship the synthetic dataset embedded in the bundle as production data; replace with the real Rota Legal country dataset.

## Design Tokens

```
--bg          #0a0908   page background (warm black)
--bg-2        #131110   card background
--ink         #f4f1eb   primary text
--ink-dim     #a8a39a   secondary text
--ink-faint   #6a655d   tertiary / mono labels
--line        #25221f   subtle borders
--line-2      #322e2a   stronger borders / outline buttons
--gold        #fbbf24   primary accent
--gold-deep   #d99e0a   accent gradient stop
--gold-soft   rgba(251,191,36,0.12)   selected card tint base
--danger      #f87171
--ok          #86efac

Typography:
  Inter        400/500/600/700/800/900   body + display
  JetBrains Mono 400/500/600              eyebrows, codes, passport data, labels
  feature settings: ss01, cv11

Spacing:
  card padding 18–22 / section gap 14–16 / scene paddings 64 horizontal, 100–140 top
  border-radius scale: 4 (flag), 8/10 (small chips), 14 (cards), 999 (pills)

Shadows:
  cta gold       0 8px 32px rgba(251,191,36,0.3)
  selected card  0 12px 36px rgba(251,191,36,0.18)
  flag chip      0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)
  passport       0 32px 80px rgba(0,0,0,0.6)
  knob glow      0 0 32px rgba(251,191,36,0.4)

Motion:
  primary ease   cubic-bezier(0.22, 1, 0.36, 1)
  pop ease       cubic-bezier(0.34, 1.56, 0.64, 1)
  durations      200 (hover) / 320 (pop) / 420 (auto-advance) / 600 (progress) / 700 (sceneIn) / 1200 (atmosphere)
```

## Assets

**No image assets** — every flag is built from stacked `<div>` stripes using the `flag` color array per country. Glyphs are inline SVG (4 simple shapes) or Unicode mono characters (`{ }`, `✚`, `▲`, `◖`, `§`, `◇`, arrows). The hero "match disc" is a CSS radial gradient. When porting, keep the flags built from CSS — it scales perfectly and avoids a 10-image roundtrip — unless your CMS already serves canonical SVG flags.

The orbital animation in the hero uses Unicode `◐` for the logo dot. If the brand has a real mark, swap it in.

## Files

Inside this handoff folder:

```
quiz.html             # entry; loads React, Babel, and the .jsx files in order
quiz-data.jsx         # countries dataset + scoring functions
quiz-shared.jsx       # ProgressBar, TopNav, Eyebrow, SceneTitle/Subtitle/Footer,
                      # LivePreviewRail, FlagChip, SceneAtmosphere, sharedKeyframes
quiz-scenes.jsx       # the 6 scene components + OptionCard primitive + SVG glyphs
quiz-passport.jsx     # PassportResult, Passport, PassportLeft, PassportRight, RunnerUpCard
quiz-app.jsx          # App shell, Hero, HeroVisual, QuestionScene wrapper, root render
tweaks-panel.jsx      # in-design tweaks controls (prototype-only — delete on implementation)
README.md             # this file
```

To run the prototype: open `quiz.html` directly in a browser (no build step — uses Babel-in-the-browser).

## Implementation Notes for the Developer

1. **Don't port the inline-style approach.** Move to the codebase's existing CSS solution (CSS modules / Tailwind / styled). The CSS custom properties listed above can be lifted straight into a `:root` block.
2. **Don't port `useTweaks` or `tweaks-panel.jsx`.** That panel is a prototype affordance for design exploration — production should pick one canonical configuration (the current defaults: `showLivePreview: true, autoAdvance: true, atmosphere: warm, sceneDensity: spacious, passportTone: cream`).
3. **Replace the country dataset.** `quiz-data.jsx` ships synthetic 1–5 ratings. Use the real Rota Legal country profiles. Keep the question→weight mapping in `scoreCountries` as a starting point and tune with real data.
4. **Add persistence.** Save `answers` to session storage / URL params so refresh doesn't reset progress.
5. **Accessibility**:
   - Ensure each option button has a clear focus ring (currently relies on selected state — add `:focus-visible` outline at gold).
   - The level meter and balance scale should be exposed as proper `<input type="radio">` groups visually styled, with `aria-label` per option.
   - Stamp animation needs `prefers-reduced-motion` guard.
   - Live preview rail should have `aria-live="polite"` so screen readers announce ranking changes.
6. **Mobile**: this prototype is desktop-first. The hero's two-column grid, the rail (which sits at right: 28px), and the passport's two-page spread all need responsive treatments. Suggested breakpoints:
   - `< 1024px`: hide live preview rail; passport becomes single column (stack cover above data); hero becomes single column with visual on top, scaled down.
   - `< 640px`: scene paddings drop to `96px 20px 60px`; scene titles use the lower clamp bound; option cards become full-width.
7. **i18n**: copy is currently in pt-BR and embedded inline. Hoist all strings into the i18n layer.
8. **Analytics**: instrument `step_advanced`, `option_selected` (with question_id + option_id), `quiz_completed` (with top-3 country codes).
