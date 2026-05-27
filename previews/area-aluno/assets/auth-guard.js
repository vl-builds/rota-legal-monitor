// Guard de autenticacao da area aluno. A sessao e validada no servidor
// (cookie httpOnly + JWT) via GET /api/aluno/session. Inclua em paginas
// protegidas como: <script src="assets/auth-guard.js"></script>
//
// Expõe:
//   window.alunoReady   -> Promise que resolve com {email, nome} quando a
//                          sessao e valida (ou nunca, se redirecionar pro login).
//   window.alunoSession -> {email, nome} apos alunoReady resolver.
//   window.alunoLogout() -> encerra a sessao no servidor e volta pro login.

(function () {
  'use strict';
  const path = window.location.pathname;
  // Na propria pagina de login nao guardamos nada.
  if (path.endsWith('/login.html')) {
    window.alunoReady = Promise.resolve(null);
    return;
  }

  const CACHE_KEY = 'rota-legal:session-cache';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min: evita um fetch por pagina.

  function loginUrl() {
    return path.includes('/area-aluno/') ? 'login.html' : 'area-aluno/login.html';
  }

  window.alunoReady = (async function () {
    // Cache curto em sessionStorage (nunca guarda token, so nome/email).
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const c = JSON.parse(raw);
        if (c && c.email && (Date.now() - c.checkedAt) < CACHE_TTL_MS) {
          window.alunoSession = { email: c.email, nome: c.nome };
          return window.alunoSession;
        }
      }
    } catch (_) { /* ignora cache corrompido */ }

    try {
      const r = await fetch('/api/aluno/session', { credentials: 'include' });
      if (!r.ok) throw new Error('sem sessao');
      const sess = await r.json();
      window.alunoSession = { email: sess.email, nome: sess.nome };
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ email: sess.email, nome: sess.nome, checkedAt: Date.now() }));
      } catch (_) { /* sessionStorage indisponivel: segue sem cache */ }
      return window.alunoSession;
    } catch (_) {
      window.location.replace(loginUrl());
      // Promise pendente pra nao executar o codigo da pagina antes do redirect.
      return new Promise(function () {});
    }
  })();

  window.alunoLogout = function () {
    try { sessionStorage.removeItem(CACHE_KEY); } catch (_) {}
    fetch('/api/aluno/logout', { method: 'POST', credentials: 'include' })
      .catch(function () {})
      .finally(function () { window.location.replace(loginUrl()); });
  };
})();
