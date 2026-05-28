// Mobile drawer / hamburger menu
(function () {
  const drawer = document.getElementById('mobile-drawer');
  if (!drawer) return;

  const openBtn  = document.getElementById('nav-hamburger-btn');
  const closeBtn = drawer.querySelector('.mobile-drawer-close');
  const backdrop = drawer.querySelector('.mobile-drawer-backdrop');
  const links    = drawer.querySelectorAll('a');

  // Fechado no carregamento: inert remove o subtree da navegacao por foco e da
  // arvore de acessibilidade. Usar inert (em vez de so aria-hidden) evita o aviso
  // "aria-hidden on an element because its descendant retained focus".
  drawer.inert = true;

  function open() {
    drawer.inert = false;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('drawer-open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    if (closeBtn) closeBtn.focus();
  }
  function close(returnFocus) {
    drawer.inert = true; // tira o foco de dentro antes de esconder da a11y
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('drawer-open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus && openBtn) openBtn.focus();
  }

  if (openBtn)  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', () => close(true));
  if (backdrop) backdrop.addEventListener('click', () => close(true));
  links.forEach(l => l.addEventListener('click', () => close(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) close(true);
  });

  // highlight active link based on current page
  const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  drawer.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href').toLowerCase();
    if (href === currentPath) a.classList.add('is-active');
    if (currentPath.startsWith('pais-') && href === 'paises.html') a.classList.add('is-active');
  });
})();
