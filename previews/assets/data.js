/* Carregador de dados compartilhado das paginas dinamicas.
 *
 * Em producao le do GitHub Pages (a fonte que o cron mensal atualiza sozinho),
 * com /data local como fallback. Em dev (localhost) usa /data local primeiro.
 * Valida que o content-type e JSON antes de parsear, para nunca quebrar no HTML
 * de fallback que o Cloudflare serve com 200 quando o arquivo nao existe.
 */
(function () {
  const GH = 'https://vl-builds.github.io/rota-legal-monitor';
  const LOCAL = '/data';
  const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const bases = isDev ? [LOCAL, GH] : [GH, LOCAL];

  async function json(file) {
    const errs = [];
    for (const base of bases) {
      try {
        const r = await fetch(`${base}/${file}`, { cache: 'no-store' });
        if (!r.ok) { errs.push(`${base} ${r.status}`); continue; }
        const ct = r.headers.get('content-type') || '';
        if (!ct.includes('json')) { errs.push(`${base} content-type ${ct}`); continue; }
        return await r.json();
      } catch (e) {
        errs.push(`${base} ${e.message}`);
      }
    }
    throw new Error(`Falha ao carregar ${file}: ${errs.join(' | ')}`);
  }

  window.RotaData = {
    json,
    country: (cc) => json(`${cc}.json`),
    index: () => json('index.json'),
  };

  // Escapa texto vindo de dados antes de injetar via innerHTML (defesa contra XSS).
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  window.escHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
})();
