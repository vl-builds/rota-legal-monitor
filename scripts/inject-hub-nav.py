import re, os

# Injeta o "shell" da Area do Aluno (navbar desktop + menu mobile + script) em
# todas as paginas internas. O CSS do shell vive em assets/hub-theme.css (fonte
# unica); este script injeta apenas ESTRUTURA (HTML + JS minimo).
#
# Idempotente-com-update: a nav, o menu mobile e o script ficam entre marcadores
# HTML. Re-rodar SUBSTITUI o bloco entre marcadores (nao pula), entao mudar os
# links/labels aqui e re-rodar propaga para todas as paginas.
#
# Pareie com inject-hub-theme.py (garante o <link> do hub-theme.css e remove CSS
# de nav inline antigo). Cenarios sao gerados por src/site/scenario-page.ts, que
# emite o mesmo shell nativamente.

BASE = r"d:/PROJETO - Renda extra online/henryzuca/ferramentas site/rota-legal-monitor/rota-legal-monitor/previews/area-aluno"

NAV_S, NAV_E = "<!-- hub-shell:nav:start -->", "<!-- hub-shell:nav:end -->"
MOB_S, MOB_E = "<!-- hub-shell:mobile:start -->", "<!-- hub-shell:mobile:end -->"
SCR_S, SCR_E = "<!-- hub-shell:script:start -->", "<!-- hub-shell:script:end -->"

GEIST_LINK = '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet" />'

# Destinos canonicos da navbar desktop (label, href relativo a area-aluno).
NAV_LINKS = [
    ("Hub",            "index.html"),
    ("Checklist",      "checklist.html"),
    ("Calculadora Pro", "calculadora-pro.html"),
    ("Comparador Pro",  "comparar-pro.html"),
    ("Cenários",        "cenarios/index.html"),
    ("Guias",           "guias/index.html"),
    ("Alertas",         "alertas.html"),
]

# Icones (SVG) reutilizados pela tab bar e pelo sheet "Mais".
ICONS = {
    "hub":    '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    "check":  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><path d="M5 6.5L6.2 7.7L8 5.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M5 17.5L6.2 18.7L8 16.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 6H21" stroke-linecap="round"/><path d="M13 17H21" stroke-linecap="round"/>',
    "compare":'<path d="M7 4V20" stroke-linecap="round"/><path d="M17 4V20" stroke-linecap="round"/><path d="M3 8L7 4L11 8" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 16L17 20L21 16" stroke-linecap="round" stroke-linejoin="round"/>',
    "book":   '<path d="M4 4H10C11.1 4 12 4.9 12 6V20C12 19 11 18 10 18H4V4Z" stroke-linejoin="round"/><path d="M20 4H14C12.9 4 12 4.9 12 6V20C12 19 13 18 14 18H20V4Z" stroke-linejoin="round"/>',
    "more":   '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    "calc":   '<rect x="4" y="3" width="16" height="18" rx="2"/><rect x="7" y="6" width="10" height="3" rx="0.5"/><circle cx="8.5" cy="13" r="0.8" fill="currentColor"/><circle cx="12" cy="13" r="0.8" fill="currentColor"/><circle cx="15.5" cy="13" r="0.8" fill="currentColor"/><circle cx="8.5" cy="17" r="0.8" fill="currentColor"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/><circle cx="15.5" cy="17" r="0.8" fill="currentColor"/>',
    "library":'<rect x="3" y="3" width="4" height="18" rx="1"/><rect x="9" y="3" width="4" height="18" rx="1"/><path d="M15.5 4.5L19.5 5.5L17 21L13 20L15.5 4.5Z"/>',
    "bell":   '<path d="M6 8C6 4.7 8.7 2 12 2C15.3 2 18 4.7 18 8V13L20 16H4L6 13V8Z" stroke-linejoin="round"/><path d="M10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19" stroke-linecap="round"/>',
    "globe":  '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12H21"/>',
    "logout": '<path d="M9 21H6C4.9 21 4 20.1 4 19V5C4 3.9 4.9 3 6 3H9" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17L21 12L16 7" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H9" stroke-linecap="round"/>',
}

def svg(name, size=22, sw=1.6):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" '
            f'stroke="currentColor" stroke-width="{sw}">{ICONS[name]}</svg>')

USERNAME_AND_SHEET_SCRIPT = """<script>
(async function () {
  // Nome do aluno na navbar
  const sess = await window.alunoReady;
  if (sess) {
    const nome = sess.nome || (sess.email ? sess.email.split('@')[0] : 'Aluno');
    const el = document.getElementById('nav-username');
    if (el) el.textContent = nome.split(' ')[0].toUpperCase();
  }
})();
(function () {
  // Sheet "Mais" do menu mobile
  const btn = document.getElementById('hub-more-btn');
  const sheet = document.getElementById('hub-more-sheet');
  if (!btn || !sheet) return;
  const setOpen = (open) => {
    sheet.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  btn.addEventListener('click', () => setOpen(!sheet.classList.contains('open')));
  sheet.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();
</script>"""


def build_nav(prefix, active_label):
    links_html = "\n      ".join(
        f'<a class="hub-nav-link{" active" if lbl == active_label else ""}" href="{prefix}{href}">{lbl}</a>'
        for lbl, href in NAV_LINKS
    )
    public_href = f"{prefix}../index.html"
    return f"""{NAV_S}
<nav class="hub-nav">
  <div class="hub-nav-left">
    <a class="hub-logo" href="{public_href}">
      <div class="hub-logo-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a1503"><path d="M12 2L4 8V20H10V14H14V20H20V8L12 2Z"/></svg>
      </div>
      <span class="hub-logo-name">rota-legal-monitor</span>
    </a>
    <div class="hub-nav-links">
      {links_html}
    </div>
  </div>
  <div class="hub-nav-right">
    <span class="hub-nav-user" id="nav-username">carregando</span>
    <button class="hub-btn-sair" onclick="window.alunoLogout()">Sair</button>
  </div>
</nav>
{NAV_E}"""


def build_mobile(prefix, active_label):
    # Tab bar: 4 destinos principais + "Mais". "Mais" fica ativo quando a pagina
    # atual e um dos destinos do sheet (Calculadora, Cenários, Alertas).
    in_more = active_label in ("Calculadora Pro", "Cenários", "Alertas")
    tabs = [
        ("Hub",       "index.html",         "hub",     active_label == "Hub"),
        ("Checklist", "checklist.html",     "check",   active_label == "Checklist"),
        ("Comparar",  "comparar-pro.html",  "compare", active_label == "Comparador Pro"),
        ("Guias",     "guias/index.html",   "book",    active_label == "Guias"),
    ]
    tabs_html = "\n  ".join(
        f'<button class="mobile-tab{" active" if act else ""}" '
        f'onclick="window.location.href=\'{prefix}{href}\'">{svg(ic, 22, 2 if act else 1.6)}'
        f'<span class="mobile-tab-label">{lbl}</span></button>'
        for lbl, href, ic, act in tabs
    )
    more_active = " active" if in_more else ""
    more_btn = (
        f'<button class="mobile-tab{more_active}" id="hub-more-btn" type="button" '
        f'aria-expanded="false" aria-controls="hub-more-sheet">'
        f'{svg("more", 22, 2)}<span class="mobile-tab-label">Mais</span></button>'
    )

    # Sheet "Mais": destinos restantes + Sair.
    sheet_links = [
        ("Calculadora Pro", "calculadora-pro.html", "calc"),
        ("Cenários",        "cenarios/index.html",  "library"),
        ("Alertas",         "alertas.html",         "bell"),
        ("Países",          "../index.html",        "globe"),
    ]
    items = "\n    ".join(
        f'<a class="hub-more-item" href="{prefix}{href}">'
        f'<span class="hub-more-ico">{svg(ic, 18, 1.6)}</span>{lbl}</a>'
        for lbl, href, ic in sheet_links
    )
    return f"""{MOB_S}
<nav class="mobile-tabbar">
  {tabs_html}
  {more_btn}
</nav>
<div class="hub-more-sheet" id="hub-more-sheet">
  <div class="hub-more-backdrop" data-close></div>
  <div class="hub-more-panel" role="dialog" aria-label="Mais opções">
    <div class="hub-more-handle"></div>
    <div class="hub-more-title">Mais opções</div>
    {items}
    <button class="hub-more-item danger" type="button" onclick="window.alunoLogout()">
      <span class="hub-more-ico">{svg("logout", 18, 1.8)}</span>Sair
    </button>
  </div>
</div>
{MOB_E}"""


def upsert(html, start, end, block, fallbacks):
    """Substitui o bloco entre [start,end] se existir; senao usa o primeiro
    fallback (pattern, repl_func) que casar; senao retorna None (sem ancora)."""
    if start in html and end in html:
        return html[:html.index(start)] + block + html[html.index(end) + len(end):]
    for pattern, replace in fallbacks:
        m = re.search(pattern, html, re.DOTALL)
        if m:
            return replace(html, m, block)
    return None


# (caminho relativo, prefixo de link, label ativo)
PAGES = [
    ("alertas.html",                        "",    "Alertas"),
    ("checklist.html",                      "",    "Checklist"),
    ("comparar-pro.html",                   "",    "Comparador Pro"),
    ("calculadora-pro.html",                "",    "Calculadora Pro"),
    ("guias/index.html",                    "../", "Guias"),
    ("guias/apostila-haia.html",            "../", "Guias"),
    ("guias/agendamento-vfs.html",          "../", "Guias"),
    ("guias/traducao-juramentada.html",     "../", "Guias"),
    ("cenarios/index.html",                 "../", "Cenários"),
    ("cenarios/aposentado-casal-pt.html",   "../", "Cenários"),
    ("cenarios/designer-remoto-es.html",    "../", "Cenários"),
    ("cenarios/dev-solo-es.html",           "../", "Cenários"),
    ("cenarios/dev-solo-nl.html",           "../", "Cenários"),
    ("cenarios/dev-solo-pt.html",           "../", "Cenários"),
    ("cenarios/estudante-solo-ie.html",     "../", "Cenários"),
    ("cenarios/familia-3-de.html",          "../", "Cenários"),
    ("cenarios/familia-4-es.html",          "../", "Cenários"),
    ("cenarios/familia-4-pt.html",          "../", "Cenários"),
    ("cenarios/freelancer-solo-nl.html",    "../", "Cenários"),
]

for rel_path, prefix, active in PAGES:
    fp = os.path.join(BASE, rel_path.replace("/", os.sep))
    if not os.path.exists(fp):
        print(f"SKIP (not found): {rel_path}")
        continue

    with open(fp, encoding="utf-8") as f:
        html = f.read()

    # 0. Limpa um </div> orfao logo apos <body> (lixo de paginas antigas).
    html = re.sub(r'(<body[^>]*>)\s*</div>\s*', r'\1\n', html, count=1)

    # 1. Fonte Geist (idempotente)
    if "family=Geist" not in html:
        if 'rel="preconnect" href="https://fonts.googleapis.com"' in html:
            html = html.replace(
                '<link rel="preconnect" href="https://fonts.googleapis.com" />',
                f'<link rel="preconnect" href="https://fonts.googleapis.com" />\n{GEIST_LINK}', 1)
        else:
            html = html.replace("</head>", f"{GEIST_LINK}\n</head>", 1)

    # 2. Navbar: marcadores > <nav class="hub-nav"> > qualquer <nav> > apos <body>
    nav = build_nav(prefix, active)
    new_html = upsert(html, NAV_S, NAV_E, nav, [
        (r'<nav\b[^>]*\bclass="[^"]*hub-nav[^"]*"[^>]*>.*?</nav>',
         lambda h, m, b: h[:m.start()] + b + h[m.end():]),
        (r'<nav\b[^>]*>.*?</nav>',
         lambda h, m, b: h[:m.start()] + b + h[m.end():]),
        (r'<body[^>]*>',
         lambda h, m, b: h[:m.end()] + "\n" + b + h[m.end():]),
    ])
    if new_html is None:
        print(f"SKIP (sem ancora de nav): {rel_path}")
        continue
    html = new_html

    # 3. Menu mobile: marcadores > tabbar antiga > antes de </body>
    mobile = build_mobile(prefix, active)
    html = upsert(html, MOB_S, MOB_E, mobile, [
        (r'<nav\b[^>]*\bclass="[^"]*mobile-tabbar[^"]*"[^>]*>.*?</nav>',
         lambda h, m, b: h[:m.start()] + b + h[m.end():]),
        (r'</body>',
         lambda h, m, b: h[:m.start()] + b + "\n" + h[m.start():]),
    ]) or html

    # 4. Script (username + sheet). Remove o bloco marcado anterior E qualquer
    #    script "nav-username" sem marcador (de injecoes antigas), depois insere
    #    fresco antes de </body>. Mantem idempotente sem acumular duplicatas.
    html = re.sub(re.escape(SCR_S) + r".*?" + re.escape(SCR_E), "", html, flags=re.DOTALL)
    html = re.sub(r"<script>(?:(?!</script>).)*?nav-username(?:(?!</script>).)*?</script>",
                  "", html, flags=re.DOTALL)
    html = re.sub(r"\n{3,}", "\n\n", html)
    script_block = f"{SCR_S}\n{USERNAME_AND_SHEET_SCRIPT}\n{SCR_E}"
    if "</body>" in html:
        html = html.replace("</body>", f"{script_block}\n</body>", 1)
    else:
        html = html + "\n" + script_block

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"OK: {rel_path}")
