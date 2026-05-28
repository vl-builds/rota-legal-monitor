// Integra o Cloudflare Turnstile nos logins.
// So renderiza o widget quando ha site key configurada (vinda de /api/turnstile).
// Sem configuracao (dev / nao ativado), nao mostra nada e o login segue normal.
// Expoe window.RotaTurnstile: ready(), enabled(), token(), reset().
(function () {
  let widgetId = null;
  const ready = (async () => {
    let siteKey = null;
    try {
      const r = await fetch('/api/turnstile', { cache: 'no-store' });
      if (r.ok) siteKey = (await r.json()).siteKey;
    } catch (_) { /* sem backend: sem captcha */ }
    if (!siteKey) return;
    // espera o script global do turnstile carregar (api.js e async)
    await new Promise((res) => {
      if (window.turnstile) return res();
      const t = setInterval(() => { if (window.turnstile) { clearInterval(t); res(); } }, 50);
      setTimeout(() => { clearInterval(t); res(); }, 6000);
    });
    const box = document.getElementById('turnstile-box');
    try {
      if (window.turnstile && box) widgetId = window.turnstile.render(box, { sitekey: siteKey });
    } catch (_) { widgetId = null; }
  })();
  window.RotaTurnstile = {
    ready: () => ready,
    enabled: () => widgetId !== null,
    token: () => (widgetId !== null && window.turnstile) ? window.turnstile.getResponse(widgetId) : '',
    reset: () => { if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId); },
  };
})();
