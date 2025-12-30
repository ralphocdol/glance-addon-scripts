(() => {
  const headerNav = document.querySelector('.header-container > .header');
  const mobileNav = document.querySelector('.mobile-navigation > .mobile-navigation-icons');
  if (!headerNav || !mobileNav) return;

  const navElement = headerNav.querySelector(':scope > nav');
  if (!navElement) return;

  const headerOverflowMenu = createOverflowMenuElement();
  navElement.parentNode.insertBefore(headerOverflowMenu, navElement.nextSibling);

  const mobileSearchNav = createOverflowMenuElement();
  mobileSearchNav.classList.add('mobile-navigation-label');

  mobileNav.querySelector('a[href="#top"]').remove(); // This removes the scroll to top

  const newOverflowItem = document.createElement('div');
  newOverflowItem.classList.add('overflow-menu-item');
  newOverflowItem.innerHTML = '<a href="#top">↑</a>'; // This adds a new scroll to top inside the overflow menu

  mobileSearchNav.querySelector('.overflow-menu-items').appendChild(newOverflowItem);
  mobileNav.prepend(mobileSearchNav);

  function createOverflowMenuElement() {
    const newElement = document.createElement('div');
    newElement.classList.add('overflow-menu');
    newElement.innerHTML = `
      <div class="overflow-menu-popover" data-popover-type="html" data-popover-position="below" data-popover-show-delay="0">
        <div data-popover-html>
          <div class="overflow-menu-items"></div>
        </div>
        <div class="overflow-menu-button">
          <svg fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 489 489" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M339.4,102c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V102z"></path> <path d="M488.9,102c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V102z"></path> <path d="M339.4,251.5c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V251.5z"></path> <path d="M488.9,251.5c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V251.5z"></path> <path d="M189.9,251.5c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V251.5z"></path> <path d="M321.3,382.9h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9c10,0,18.1-8.1,18.1-18.1V401 C339.4,391,331.3,382.9,321.3,382.9z"></path> <path d="M400.9,489h69.9c10,0,18.1-8.1,18.1-18.1V401c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9 C382.8,480.9,390.9,489,400.9,489z"></path> <path d="M171.8,382.9h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9c10,0,18.1-8.1,18.1-18.1V401 C189.9,391,181.8,382.9,171.8,382.9z"></path> <path d="M145,45.3v99.6H45.4V45.3H145 M162.2,0h-134C12.7,0,0.1,12.6,0.1,28.1v137.3c0,13.7,11.1,24.8,24.8,24.8h137.3 c15.5,0,28.1-12.6,28.1-28.1v-134C190.3,12.6,177.7,0,162.2,0L162.2,0z"></path> </g> </g> </g></svg>
        </div>
      </div>
    `;
    return newElement;
  }

  function createOverflowItemElement(appendElement) {
    const newElement = document.createElement('div');
    newElement.classList.add('overflow-menu-item');
    newElement.append(appendElement);
    return newElement;
  }

  window.createOverflowItemElement = createOverflowItemElement;
})();