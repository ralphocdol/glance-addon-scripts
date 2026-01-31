'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  // Catch duplicate instances
  const scriptName = 'Lazy Unloader';
  if ((window.GLANCE_ADDON_SCRIPTS ??= {})[scriptName] === true) {
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { type: 'error' });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  const className = 'lazy-unloader-parent';

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const img = e.target;
      if (e.isIntersecting) {
        img.src = img.dataset.src;
        img.classList.add('lazy-unloader-loaded');
      } else {
        img.classList.remove('lazy-unloader-loaded');
        img.removeAttribute('src');
      }
    });
  });

  window.lazyUnloader = obs;
  window.lazyUnloaderInit = img => {
    if (img.src) {
      img.dataset.src = img.src;
      img.removeAttribute('src');
    }
    obs.observe(img);
  }

  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));

  document.querySelectorAll(className ? `.${className} img` : 'img').forEach(window.lazyUnloaderInit);
});