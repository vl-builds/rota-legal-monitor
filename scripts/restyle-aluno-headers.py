import os

# Migracao leve de cabecalho: alinha o header das paginas estaticas da Area do
# Aluno a tipografia do Hub (hub-eyebrow / hub-title / hub-lede), preservando
# todo o corpo funcional (forms, guide-body, JS). Idempotente: rodar de novo nao
# muda nada (as strings antigas ja terao sumido). O index de guias usa o layout
# bento proprio e nao depende deste script.

BASE = r"d:/PROJETO - Renda extra online/henryzuca/ferramentas site/rota-legal-monitor/rota-legal-monitor/previews/area-aluno"

PAGES = [
    "checklist.html",
    "calculadora-pro.html",
    "comparar-pro.html",
    "alertas.html",
    "guias/apostila-haia.html",
    "guias/agendamento-vfs.html",
    "guias/traducao-juramentada.html",
]

REPLACEMENTS = [
    ('<div class="eyebrow"><span class="dot"></span>',
     '<div class="hub-eyebrow"><span class="sdot"></span>'),
    ('<div class="eyebrow no-print"><span class="dot"></span>',
     '<div class="hub-eyebrow no-print"><span class="sdot"></span>'),
    ('<h1 class="display-md">', '<h1 class="hub-title">'),
    ('<p class="lede no-print">', '<p class="hub-lede no-print">'),
    ('<p class="lede">', '<p class="hub-lede">'),
]

for rel in PAGES:
    fp = os.path.join(BASE, rel.replace("/", os.sep))
    if not os.path.exists(fp):
        print(f"SKIP (not found): {rel}")
        continue
    with open(fp, encoding="utf-8") as f:
        html = f.read()
    before = html
    for old, new in REPLACEMENTS:
        html = html.replace(old, new)
    if html != before:
        with open(fp, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"OK: {rel}")
    else:
        print(f"unchanged: {rel}")
