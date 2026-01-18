(() => {
  setTimeout(() => {
    let customMenuItems = document.querySelectorAll('.custom-menu-items');
    if (!customMenuItems) return;

    let hasColumns = false;
    customMenuItems.forEach(menu => {
      let columns = menu.style.getPropertyValue('--custom-menu-columns');
      if (columns === '' || isNaN(columns)) columns = 0;
      if (!hasColumns) hasColumns = Number(columns) > 0;
      Object.assign(menu.closest('.custom-menu').style, {
        pointerEvents: '',
        display: hasColumns ? 'flex' : 'none'
      });

    });
    const glanceNativeToTopEl = document.querySelector('a[href="#top"]:not(.custom-menu-top)');
    if (hasColumns) {
      glanceNativeToTopEl.remove();
    } else {
      glanceNativeToTopEl.style.display = 'flex';
    }
  }, 100);
})();