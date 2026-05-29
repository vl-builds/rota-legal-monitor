import os, re, glob

BASE = r"d:/PROJETO - Renda extra online/henryzuca/ferramentas site/rota-legal-monitor/rota-legal-monitor/previews/area-aluno"

# Pula apenas o Hub raiz e o login raiz (design proprio). Compara pelo CAMINHO
# relativo, nao pelo basename: senao guias/index.html e cenarios/index.html
# (que precisam do shell) seriam pulados por engano.
SKIP = {"login.html", "index.html"}

pages = []
for fp in glob.glob(os.path.join(BASE, "**", "*.html"), recursive=True):
    rel = os.path.relpath(fp, BASE).replace("\\", "/")
    if rel not in SKIP:
        pages.append((fp, rel))

for fp, rel in sorted(pages):
    with open(fp, encoding="utf-8") as f:
        html = f.read()

    changed = False

    # 1. Determine depth-based prefix for assets
    depth = rel.count("/")  # 0 = root, 1 = subdir
    asset_prefix = "../" * depth  # "" for root, "../" for subdir

    # 2. Inject hub-theme.css link after design-system.css if not already present
    hub_link = f'<link rel="stylesheet" href="{asset_prefix}assets/hub-theme.css" />'
    if "hub-theme.css" not in html:
        # Insert after design-system.css link
        ds_pattern = r'(<link rel="stylesheet" href="[^"]*design-system\.css"[^/]*/?>)'
        if re.search(ds_pattern, html):
            html = re.sub(ds_pattern, r'\1\n' + hub_link, html)
        else:
            html = html.replace("</head>", f"{hub_link}\n</head>")
        changed = True

    # 3. Fix auth-guard path — some pages have wrong path
    # Root pages need "assets/auth-guard.js"
    # Subdir pages need "../assets/auth-guard.js"
    correct_guard = f'<script src="{asset_prefix}assets/auth-guard.js"></script>'
    # Replace any wrong auth-guard path
    html = re.sub(
        r'<script src="[^"]*auth-guard\.js"></script>',
        correct_guard,
        html
    )

    # 4. Remove redundant hub-nav CSS <style> block that was injected last pass
    # (we now use hub-theme.css instead — remove the inline block to avoid duplication)
    # Pattern: <style>\n/* ── Hub-nav (design premium) ... */\n...one </style>
    # Cobre as duas variantes legadas: "Hub-nav (design premium)" e "Hub nav layout".
    inline_hub = re.search(
        r'<style>\s*/\* ── Hub[- ]nav',
        html
    )
    if inline_hub:
        # Find the matching </style>
        start = inline_hub.start()
        end_tag = html.find("</style>", start)
        if end_tag != -1:
            html = html[:start] + html[end_tag + len("</style>"):]
            changed = True

    # 5. (Removido) O CSS estrutural da navbar agora vive em hub-theme.css,
    # linkado no passo 2. Nao re-injetamos CSS inline de nav (evita a duplicacao
    # tripla que existia antes). O passo 4 ja limpa blocos inline legados.

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"{'UPDATED' if changed else 'checked'}: {rel}")
