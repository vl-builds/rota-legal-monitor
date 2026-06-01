"""
Padroniza o nav das 10 paginas de pais (pais-XX.html) com o resto do site.

Antes (so nas paginas de pais):
- nav-links tinha "Qual pais?" e "Area do Aluno" duplicados
- nav-right era "<- Todos os paises" + "Comparar"

Depois (igual a paises.html e demais paginas top-level):
- nav-links: Paises, Comparar, Guia Pratico, Calculadora, Historico, Sobre
- nav-right: btn-secondary "Area do Aluno" + btn-primary "Qual pais e o meu?"

O mobile drawer ja esta no padrao canonico, nao e tocado.
"""

import re
from pathlib import Path

PREVIEWS_DIR = Path(__file__).parent.parent / "previews"

# Linhas de nav-link extras a remover (apenas dentro de nav-links, identificadas
# pela classe nav-link; o link do mobile drawer nao tem essa classe).
REMOVE_LINES = [
    re.compile(r'^[ \t]*<a class="nav-link" href="qual-pais\.html">Qual país\?</a>\r?\n', re.MULTILINE),
    re.compile(r'^[ \t]*<a class="nav-link" href="area-aluno/login\.html">Área do Aluno</a>\r?\n', re.MULTILINE),
]

# O regex casa a partir de `<div`, entao o whitespace original antes da tag
# permanece. Por isso a primeira linha aqui NAO leva indentacao (evita duplicar).
NAV_RIGHT_NEW = """\
<div class="nav-right">
      <a class="btn btn-secondary" href="area-aluno/login.html">Área do Aluno</a>
      <a class="btn btn-primary" href="qual-pais.html">Qual país é o meu?</a>
    </div>\
"""

NAV_RIGHT_PATTERN = re.compile(
    r'<div class="nav-right">.*?</div>',
    re.DOTALL,
)

files = sorted(PREVIEWS_DIR.glob("pais-*.html"))
fixed = 0
errors = []

for path in files:
    content = path.read_text(encoding="utf-8")
    original = content

    removed = 0
    for pat in REMOVE_LINES:
        content, n = pat.subn("", content, count=1)
        removed += n

    content, n_right = NAV_RIGHT_PATTERN.subn(NAV_RIGHT_NEW, content, count=1)

    if removed != 2 or n_right == 0:
        errors.append(f"  AVISO: {path.name} — removidos={removed}/2, nav_right={n_right}")

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
