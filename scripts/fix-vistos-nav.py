"""
Corrige o nav das 83 páginas de vistos para o padrão das outras páginas do site.

Padrão correto:
- Links: Países, Comparar, Guia Prático, Calculadora, Histórico, Sobre
- Botões direita: btn-secondary "Área do Aluno" + btn-primary "Qual país é o meu?"
"""

import re
from pathlib import Path

VISTOS_DIR = Path(__file__).parent.parent / "previews" / "vistos"

# Nota: o regex casa a partir de `<div`, entao o whitespace original antes da tag
# permanece. Por isso a primeira linha aqui NAO leva indentacao (evita duplicar).
NAV_LINKS_NEW = """\
<div class="nav-links">
      <a class="nav-link" href="../paises.html">Países</a>
      <a class="nav-link" href="../comparar.html">Comparar</a>
      <a class="nav-link" href="../guia-pratico.html">Guia Prático</a>
      <a class="nav-link" href="../calculadora.html">Calculadora</a>
      <a class="nav-link" href="../historico.html">Histórico</a>
      <a class="nav-link" href="../sobre.html">Sobre</a>
    </div>
    <div class="nav-right">
      <a class="btn btn-secondary" href="../area-aluno/login.html">Área do Aluno</a>
      <a class="btn btn-primary" href="../qual-pais.html">Qual país é o meu?</a>
    </div>\
"""

MOBILE_DRAWER_CTA_NEW = """\
<div class="mobile-drawer-cta">
      <a class="btn btn-primary" href="../qual-pais.html">Qual país é o meu?</a>
      <a class="btn btn-secondary" href="../area-aluno/login.html">Área do Aluno</a>
    </div>\
"""

# Matches the nav-links block (including Qual país? and Área do Aluno) + nav-right
NAV_BLOCK_PATTERN = re.compile(
    r'<div class="nav-links">.*?</div>\s*<div class="nav-right">.*?</div>',
    re.DOTALL,
)

# Matches the mobile drawer CTA block
MOBILE_CTA_PATTERN = re.compile(
    r'<div class="mobile-drawer-cta">.*?</div>',
    re.DOTALL,
)

files = sorted(VISTOS_DIR.glob("*.html"))
fixed = 0
errors = []

for path in files:
    content = path.read_text(encoding="utf-8")
    original = content

    # Fix nav-links + nav-right
    content, n1 = NAV_BLOCK_PATTERN.subn(NAV_LINKS_NEW, content, count=1)

    # Fix mobile drawer CTA
    content, n2 = MOBILE_CTA_PATTERN.subn(MOBILE_DRAWER_CTA_NEW, content, count=1)

    if n1 == 0 or n2 == 0:
        errors.append(f"  AVISO: {path.name} — nav_block={n1}, mobile_cta={n2}")

    if content != original:
        path.write_text(content, encoding="utf-8")
        fixed += 1

print(f"Corrigidos: {fixed}/{len(files)}")
if errors:
    print("Problemas encontrados:")
    for e in errors:
        print(e)
else:
    print("Sem erros.")
