(() => {
  const glimpse = document.getElementById('glimpse');
  if (!glimpse) return;

  const icon = `
    <svg class="search-icon" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
    </svg>
  `;

  const customMenu = window.createCustomMenuItemElement?.({
    className: 'search-icon-container',
    tooltip: 'Launch Glimpse',
    icon,
    actionFn: () => spawnGlimpse()
  });

  if (!customMenu?.customMenuDesktopElement) {
    const headerNav = document.querySelector('.header-container > .header');
    if (!headerNav) return;
    const headerSearchNav = createNavElement();
    headerSearchNav.classList.add('search-icon-container');
    const navElement = headerNav.querySelector(':scope > nav');
    if (navElement) {
      headerSearchNav.classList.add('glimpse-search-nav');
      navElement.parentNode.insertBefore(headerSearchNav, navElement.nextSibling);
    }
  }

  if (!customMenu?.customMenuMobileElement) {
    const mobileNav = document.querySelector('.mobile-navigation > .mobile-navigation-icons');
    const mobileSearchNav = createNavElement();
    mobileNav.classList.add('glimpse-search-mobile-nav');
    mobileNav.prepend(mobileSearchNav);
  }

  const searchInput = glimpse.querySelector('.search-input');

  $include: spawn.js

  function createNavElement() {
    const newElement = document.createElement('div');
    newElement.setAttribute('title', 'Launch Glimpse');
    newElement.innerHTML = icon;
    newElement.addEventListener('click', () => spawnGlimpse());
    return newElement;
  }
})();