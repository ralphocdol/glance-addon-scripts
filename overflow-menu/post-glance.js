(() => {
  const overflowMenus = document.querySelectorAll('.overflow-menu');
  if (!overflowMenus) return;

  overflowMenus.forEach(overflowMenu => {
    const overflowMenuItems = overflowMenu.querySelectorAll('.overflow-menu-item');
    const columns = Array.from(overflowMenuItems).length;
    overflowMenu.style.display = columns > 0 ? 'flex' : 'none';
    overflowMenu.querySelector('.overflow-menu-items').style.setProperty('--overflow-columns', columns >= 3 ? 3 : columns)
  })
})();