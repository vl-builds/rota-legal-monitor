// Guard de autenticacao client-side para a area aluno.
// Inclua em todas as paginas protegidas como:
//   <script src="assets/auth-guard.js"></script>
// O script redireciona pro login se nao houver sessao valida.

(function () {
  'use strict';
  const SESSION_KEY = 'rota-legal:aluno-session';
  const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias

  // Pula guard se ja estiver na pagina de login.
  if (window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/area-aluno/login.html')) {
    return;
  }

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) throw new Error('no-session');
    const sess = JSON.parse(raw);
    // nome e opcional: credenciais criadas via add-aluno.ts nao tem nome.
    // Sem fallback aqui o guard rejeitava a sessao e criava loop com o login.
    if (!sess || !sess.email || !sess.loggedAt) throw new Error('invalid');
    if (Date.now() - sess.loggedAt > SESSION_TTL_MS) throw new Error('expired');
    if (!sess.nome) sess.nome = sess.email.split('@')[0];
    // Sessao valida, expoe no window pra uso das paginas.
    window.alunoSession = sess;
  } catch (_err) {
    const target = window.location.pathname.includes('/area-aluno/')
      ? 'login.html'
      : 'area-aluno/login.html';
    window.location.replace(target);
  }
})();

window.alunoLogout = function () {
  localStorage.removeItem('rota-legal:aluno-session');
  window.location.replace('login.html');
};
