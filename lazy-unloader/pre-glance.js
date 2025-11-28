(() => {
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
})();