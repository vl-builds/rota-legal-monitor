// Mobile drawer / hamburger menu
(function () {
  const drawer = document.getElementById('mobile-drawer');
  if (!drawer) return;

  const openBtn  = document.getElementById('nav-hamburger-btn');
  const closeBtn = drawer.querySelector('.mobile-drawer-close');
  const backdrop = drawer.querySelector('.mobile-drawer-backdrop');
  const links    = drawer.querySelectorAll('a, button[data-close]');

  function open() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('drawer-open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('drawer-open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  }

  if (openBtn)  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  links.forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
  });

  // highlight active link based on current page
  const currentPath = (window.location.pathname.split('/').pop() || 'home.html').toLowerCase();
  drawer.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href').toLowerCase();
    if (href === currentPath) a.classList.add('is-active');
    if (currentPath.startsWith('pais-') && href === 'paises.html') a.classList.add('is-active');
  });
})();
