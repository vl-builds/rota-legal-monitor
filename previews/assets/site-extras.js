// Chrome global do site público: aviso de cookies (transparente) + mini-form de captacao
// de leads no rodape. Carregado em todas as paginas publicas via <script defer>.
// Reusa o endpoint /api/alertas (double opt-in do Kit) e o Turnstile sob demanda.
(function () {
  'use strict';

  var COOKIE_KEY = 'rota-legal:cookie-aviso:v1';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---- estilos escopados (prefixo rl-), usando os tokens do design-system ----
  var css = [
    '.rl-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:720px;margin:0 auto;',
      'display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:space-between;',
      'background:var(--glass-bg-elevated,rgba(36,36,36,.92));backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
      'border:1px solid var(--glass-border,#2a2a2a);border-radius:var(--r-lg,12px);padding:14px 18px;box-shadow:0 8px 30px rgba(0,0,0,.4);}',
    '.rl-cookie p{margin:0;font-size:13px;line-height:1.5;color:var(--body,#ccc);flex:1;min-width:220px;}',
    '.rl-cookie a{color:var(--primary,#f0b429);}',
    '.rl-cookie-btn{flex-shrink:0;min-height:40px;padding:8px 18px;border:none;border-radius:var(--r-md,8px);',
      'background:var(--primary,#f0b429);color:var(--on-primary,#0a0a0a);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;}',
    '.rl-cookie-btn:hover{filter:brightness(1.05);}',
    '.rl-lead{border-top:1px solid var(--hairline,#2a2a2a);margin-top:var(--s-xl,32px);padding-top:var(--s-xl,32px);',
      'display:grid;grid-template-columns:1fr minmax(280px,420px);gap:var(--s-lg,24px);align-items:center;}',
    '.rl-lead-title{font-size:16px;font-weight:700;color:var(--on-dark,#fff);margin:0 0 6px;letter-spacing:-.3px;}',
    '.rl-lead-sub{font-size:14px;color:var(--muted,#888);margin:0;line-height:1.5;max-width:420px;}',
    '.rl-lead-form{display:flex;gap:8px;}',
    '.rl-lead-email{flex:1;min-height:44px;padding:10px 14px;background:var(--surface-elevated,#242424);',
      'border:1px solid var(--hairline,#2a2a2a);border-radius:var(--r-md,8px);color:var(--on-dark,#fff);font-family:inherit;font-size:14px;}',
    '.rl-lead-email::placeholder{color:var(--muted,#888);}',
    '.rl-lead-email:focus{outline:none;border-color:var(--primary,#f0b429);}',
    '.rl-lead-btn{flex-shrink:0;min-height:44px;white-space:nowrap;}',
    '.rl-turnstile{margin-top:10px;}',
    '.rl-lead-feedback{font-size:13px;line-height:1.5;margin:10px 0 0;}',
    '.rl-lead-feedback.is-ok{color:var(--accent-emerald,#22c55e);}',
    '.rl-lead-feedback.is-err{color:var(--accent-rose,#ef4444);}',
    '.rl-lead-note{font-size:11px;color:var(--muted,#888);margin:8px 0 0;font-family:"JetBrains Mono",monospace;}',
    '.rl-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0;}',
    '@media (max-width:760px){.rl-lead{grid-template-columns:1fr;}}',
    '@media (max-width:480px){.rl-lead-form{flex-direction:column;}.rl-lead-btn{width:100%;}}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ===================== AVISO DE COOKIES =====================
  function mountCookieNotice() {
    var dismissed = false;
    try { dismissed = localStorage.getItem(COOKIE_KEY) === '1'; } catch (_) {}
    if (dismissed) return;

    var box = document.createElement('div');
    box.className = 'rl-cookie';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Aviso de cookies');
    box.innerHTML =
      '<p>Usamos apenas cookies essenciais de sessao e guardamos preferencias no seu navegador. ' +
      'Nao rastreamos voce. <a href="/politica-cookies">Saiba mais</a>.</p>' +
      '<button class="rl-cookie-btn" type="button">Entendi</button>';
    box.querySelector('.rl-cookie-btn').addEventListener('click', function () {
      try { localStorage.setItem(COOKIE_KEY, '1'); } catch (_) {}
      box.remove();
    });
    document.body.appendChild(box);
  }

  // ===================== TURNSTILE SOB DEMANDA =====================
  var siteKey = null, tsWidgetId = null, tsState = 'idle'; // idle | loading | ready | off
  var tsBoxEl = null;

  function loadScript(src) {
    return new Promise(function (res) {
      var s = document.createElement('script');
      s.src = src; s.async = true; s.defer = true;
      s.onload = function () { res(true); };
      s.onerror = function () { res(false); };
      document.head.appendChild(s);
    });
  }
  function waitForTurnstile() {
    return new Promise(function (res) {
      if (window.turnstile) return res(true);
      var t = setInterval(function () { if (window.turnstile) { clearInterval(t); res(true); } }, 50);
      setTimeout(function () { clearInterval(t); res(!!window.turnstile); }, 6000);
    });
  }
  async function ensureTurnstile() {
    if (tsState !== 'idle') return;
    tsState = 'loading';
    try {
      var r = await fetch('/api/turnstile', { cache: 'no-store' });
      if (r.ok) siteKey = (await r.json()).siteKey;
    } catch (_) {}
    if (!siteKey) { tsState = 'off'; return; } // captcha nao configurado: segue sem
    if (!window.turnstile) {
      await loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit');
      await waitForTurnstile();
    }
    if (window.turnstile && tsBoxEl) {
      try { tsWidgetId = window.turnstile.render(tsBoxEl, { sitekey: siteKey }); tsState = 'ready'; }
      catch (_) { tsState = 'off'; }
    } else {
      tsState = 'off';
    }
  }
  function turnstileToken() {
    if (tsState === 'ready' && tsWidgetId !== null && window.turnstile) {
      return window.turnstile.getResponse(tsWidgetId) || '';
    }
    return '';
  }
  function turnstileReset() {
    if (tsState === 'ready' && tsWidgetId !== null && window.turnstile) {
      try { window.turnstile.reset(tsWidgetId); } catch (_) {}
    }
  }

  // ===================== MINI-FORM DE CAPTACAO NO RODAPE =====================
  function mountLeadForm() {
    var footerEl = document.querySelector('footer');
    if (!footerEl) return; // pagina sem rodape: nao injeta
    if (footerEl.querySelector('.rl-lead')) return; // ja injetado

    var container = footerEl.querySelector('.container') || footerEl;
    var bottom = footerEl.querySelector('.footer-bottom');
    var lead = document.createElement('div');
    lead.className = 'rl-lead';
    lead.innerHTML =
      '<div class="rl-lead-text">' +
        '<p class="rl-lead-title">Receba o guia gratuito</p>' +
        '<p class="rl-lead-sub">As mudancas nas regras de imigracao no seu email, todo mes. E o guia de inicio, gratis.</p>' +
      '</div>' +
      '<div>' +
        '<form class="rl-lead-form" novalidate>' +
          '<input type="text" class="rl-hp" tabindex="-1" autocomplete="off" aria-hidden="true" placeholder="Nao preencha" />' +
          '<input type="email" class="rl-lead-email" placeholder="seu@email.com" autocomplete="email" required aria-label="Seu email" />' +
          '<button type="submit" class="rl-lead-btn btn btn-primary">Quero receber</button>' +
        '</form>' +
        '<div class="rl-turnstile"></div>' +
        '<p class="rl-lead-feedback" role="status" aria-live="polite" hidden></p>' +
        '<p class="rl-lead-note">Confirmacao dupla. Sem spam, cancele quando quiser.</p>' +
      '</div>';

    if (bottom && bottom.parentNode) bottom.parentNode.insertBefore(lead, bottom);
    else container.appendChild(lead);

    var form = lead.querySelector('.rl-lead-form');
    var email = lead.querySelector('.rl-lead-email');
    var honeypot = lead.querySelector('.rl-hp');
    var btn = lead.querySelector('.rl-lead-btn');
    var feedback = lead.querySelector('.rl-lead-feedback');
    tsBoxEl = lead.querySelector('.rl-turnstile');

    email.addEventListener('focus', function () { ensureTurnstile(); }, { once: true });

    function showFeedback(msg, ok) {
      feedback.textContent = msg;
      feedback.classList.toggle('is-ok', ok);
      feedback.classList.toggle('is-err', !ok);
      feedback.hidden = false;
    }

    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      feedback.hidden = true;
      feedback.classList.remove('is-ok', 'is-err');

      // honeypot: bot preencheu -> finge sucesso sem enviar
      if (honeypot.value) { form.hidden = true; showFeedback('Confira seu email para confirmar a inscricao.', true); return; }

      var value = email.value.trim().toLowerCase();
      if (!EMAIL_RE.test(value)) { showFeedback('Informe um email valido.', false); email.focus(); return; }

      await ensureTurnstile();
      var token = turnstileToken();
      if (tsState === 'ready' && !token) { showFeedback('Confirme que voce nao e um robo.', false); return; }

      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'Enviando...';
      try {
        var res = await fetch('/api/alertas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value, consent: true, turnstileToken: token })
        });
        if (res.ok) {
          form.hidden = true;
          tsBoxEl.hidden = true;
          showFeedback('Quase la: enviamos um email de confirmacao para ' + value + '. Confirme para receber o guia e as atualizacoes.', true);
          return;
        }
        turnstileReset();
        var msg = 'Nao foi possivel inscrever agora. Tente mais tarde.';
        try { var d = await res.json(); if (d && d.error) msg = d.error; } catch (_) {}
        showFeedback(msg, false);
      } catch (err) {
        turnstileReset();
        showFeedback('Erro de conexao. Verifique sua internet e tente de novo.', false);
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  function init() {
    mountCookieNotice();
    mountLeadForm();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
