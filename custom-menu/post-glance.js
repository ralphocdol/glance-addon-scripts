(() => {
  const customMenus = document.querySelectorAll('.custom-menu');
  if (!customMenus) return;

  customMenus.forEach(customMenu => {
    const customMenuItems = customMenu.querySelectorAll('.custom-menu-item');
    const columns = Array.from(customMenuItems).length;
    customMenu.style.display = columns > 0 ? 'flex' : 'none';
    customMenu.querySelector('.custom-menu-items').style.setProperty('--custom-menu-columns', columns >= 3 ? 3 : columns)
  })
})();