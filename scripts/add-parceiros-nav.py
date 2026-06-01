"""
Adiciona o link "Parceiros" (entre Histórico e Sobre) na nav de todo o site:
no nav-links (desktop) e no mobile-drawer-nav, nas 8 páginas estáticas e nos dois
geradores (visa-page.ts / country-page.ts). Idempotente: roda de novo sem duplicar.

O drawer é escopado ao bloco <nav class="mobile-drawer-nav"> para não casar com o
link "Histórico" que também existe no rodapé. O prefixo (../ nas páginas de visto)
é capturado do próprio link de Histórico e reaplicado a Parceiros.
"""

import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
PREVIEWS = ROOT / "previews"
SRC_SITE = ROOT / "src" / "site"

FILES = [
    PREVIEWS / "index.html",
    PREVIEWS / "paises.html",
    PREVIEWS / "comparar.html",
    PREVIEWS / "qual-pais.html",
    PREVIEWS / "calculadora.html",
    PREVIEWS / "historico.html",
    PREVIEWS / "sobre.html",
    PREVIEWS / "guia-pratico.html",
    SRC_SITE / "visa-page.ts",
    SRC_SITE / "country-page.ts",
]

NAVLINK_RE = re.compile(
    r'([ \t]*)(<a class="nav-link" href="((?:\.\./)?)historico\.html"[^>]*>Histórico</a>)'
)
DRAWER_BLOCK_RE = re.compile(r'(<nav class="mobile-drawer-nav">)(.*?)(</nav>)', re.DOTALL)
DRAWER_HIST_RE = re.compile(r'([ \t]*)(<a href="((?:\.\./)?)historico\.html">Histórico</a>)')


def add_navlink(content: str) -> tuple[str, int]:
    if re.search(r'class="nav-link" href="(?:\.\./)?parceiros\.html"', content):
        return content, 0

    def repl(m: re.Match) -> str:
        indent, link, prefix = m.group(1), m.group(2), m.group(3)
        return f'{indent}{link}\n{indent}<a class="nav-link" href="{prefix}parceiros.html">Parceiros</a>'

    return NAVLINK_RE.subn(repl, content, count=1)


def add_drawer(content: str) -> str:
    def block_repl(bm: re.Match) -> str:
        block = bm.group(2)
        if "parceiros.html" in block:
            return bm.group(0)

        def hrepl(m: re.Match) -> str:
            indent, link, prefix = m.group(1), m.group(2), m.group(3)
            return f'{indent}{link}\n{indent}<a href="{prefix}parceiros.html">Parceiros</a>'

        new_block, _ = DRAWER_HIST_RE.subn(hrepl, block, count=1)
        return bm.group(1) + new_block + bm.group(3)

    return DRAWER_BLOCK_RE.sub(block_repl, content, count=1)


for path in FILES:
    content = path.read_text(encoding="utf-8")
    original = content
    content, n1 = add_navlink(content)
    content = add_drawer(content)
    if content != original:
        path.write_text(content, encoding="utf-8")
        print(f"[ok] {path.name} (navlink={n1})")
    else:
        print(f"[skip] {path.name} (ja tem ou sem ancora)")
