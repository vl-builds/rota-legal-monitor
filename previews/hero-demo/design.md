---
name: Rota Legal
mode: dark
---

## Colors

| Token         | Hex      | Use                        |
|---------------|----------|----------------------------|
| canvas        | #0a0a0a  | background                 |
| surface-card  | #1a1a1a  | cards                      |
| surface-bar   | #131313  | card header bars           |
| primary       | #ff6b00  | accent, CTA, highlight     |
| on-dark       | #ffffff  | primary text               |
| body          | #cccccc  | running text               |
| body-strong   | #e6e6e6  | secondary headings         |
| muted         | #888888  | labels, captions           |
| hairline      | #2a2a2a  | borders                    |
| hairline-str  | #3a3a3a  | stronger borders           |
| emerald       | #22c55e  | success, checkmarks        |
| rose          | #ef4444  | error, cross marks         |

## Typography

- Display / UI: Inter — weights 400, 500, 600, 700
- Code / Data: JetBrains Mono — weights 400, 500, 700
- Pairing rationale: sans + mono — data voice vs interface voice

## Corners

- Cards: 12px
- Buttons: 8px
- Badges: 9999px (pill)
- Flags: 4px

## What NOT to do

- No box-shadow (depth comes from surface contrast)
- No inline hex values (always use tokens)
- Orange is scarce: max one accent use per section
- No emoji in UI text
- No semicolons in prose
