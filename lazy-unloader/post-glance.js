(() => {
  const className = 'lazy-unloader-parent';
  document.querySelectorAll(className ? `.${className} img` : 'img').forEach(window.lazyUnloaderInit);
})();