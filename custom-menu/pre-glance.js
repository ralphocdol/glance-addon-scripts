(() => {
  const createElementFn = window.CREATE_ELEMENT;
  if (typeof createElementFn !== 'function') {
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';
    if (typeof window.showToast === 'function') {
      window.showToast?.(msg, { title: 'CUSTOM MENU', type: 'error' });
    } else {
      alert(msg);
    }
    console.error('CREATE_ELEMENT not found');
    return;
  }
  const headerNav = document.querySelector('.header-container > .header');
  const mobileNav = document.querySelector('.mobile-navigation > .mobile-navigation-icons');
  if (!headerNav || !mobileNav) return;

  const navElement = headerNav.querySelector(':scope > nav');
  if (!navElement) return;

  const headerCustomMenu = createCustomMenuElement();
  navElement.parentNode.insertBefore(headerCustomMenu, navElement.nextSibling);

  const mobileSearchNav = createCustomMenuElement();
  mobileSearchNav.classList.add('mobile-navigation-label');

  const newCustomMenuItem = document.createElement('div');
  newCustomMenuItem.classList.add('custom-menu-item');
  newCustomMenuItem.innerHTML = `
    <a href="#top" class="custom-menu-top">
      <svg class="custom-menu-item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 20L12 4M12 4L18 10M12 4L6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    </a>
  `;

  mobileSearchNav.querySelector('.custom-menu-items').appendChild(newCustomMenuItem);
  mobileNav.prepend(mobileSearchNav);
  mobileNav.querySelector('a[href="#top"]:not(.custom-menu-top)').remove(); // This removes the scroll to top

  function createCustomMenuElement() {
    const newElement = document.createElement('div');
    newElement.classList.add('custom-menu');
    newElement.innerHTML = `
      <div class="custom-menu-popover" data-popover-type="html" data-popover-position="below" data-popover-show-delay="0">
        <div data-popover-html>
          <div class="custom-menu-items"></div>
        </div>
        <div class="custom-menu-button">
          <svg fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 489 489" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M339.4,102c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V102z"></path> <path d="M488.9,102c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V102z"></path> <path d="M339.4,251.5c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V251.5z"></path> <path d="M488.9,251.5c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V251.5z"></path> <path d="M189.9,251.5c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V251.5z"></path> <path d="M321.3,382.9h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9c10,0,18.1-8.1,18.1-18.1V401 C339.4,391,331.3,382.9,321.3,382.9z"></path> <path d="M400.9,489h69.9c10,0,18.1-8.1,18.1-18.1V401c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9 C382.8,480.9,390.9,489,400.9,489z"></path> <path d="M171.8,382.9h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9c10,0,18.1-8.1,18.1-18.1V401 C189.9,391,181.8,382.9,171.8,382.9z"></path> <path d="M145,45.3v99.6H45.4V45.3H145 M162.2,0h-134C12.7,0,0.1,12.6,0.1,28.1v137.3c0,13.7,11.1,24.8,24.8,24.8h137.3 c15.5,0,28.1-12.6,28.1-28.1v-134C190.3,12.6,177.7,0,162.2,0L162.2,0z"></path> </g> </g> </g></svg>
        </div>
      </div>
    `;
    return newElement;
  }

  function createCustomMenuItemContainerElement(appendElement) {
    const newElement = createElementFn({ classes: 'custom-menu-item' });
    newElement.append(appendElement);
    return newElement;
  }

  function createCustomMenuItemElement({ className, tooltip, icon, actionFn, status }) {
    if (!className || !tooltip || !icon || !actionFn) {
      window.showToast?.('Missing required parameters, see logs.', { title: 'CUSTOM MENU', type: 'error' })
      console.error('Missing required parameters:', { className, tooltip, icon, actionFn });
      return;
    }

    const newStatus = typeof status === 'boolean' ? (status ? ' active' : ' inactive') : '';
    const navElement = createElementFn({
      classes: `${className}${newStatus}`,
      props: { title: tooltip },
      htmlContent: icon,
    });

    const customMenuDesktopElement = headerNav.querySelector('.custom-menu .custom-menu-items');
    const customMenuMobileElement = mobileNav.querySelector('.custom-menu .custom-menu-items');

    if (customMenuDesktopElement) {
      const customMenuDesktopItem = createCustomMenuItemContainerElement(navElement);
      customMenuDesktopItem.addEventListener('click', actionFn);
      customMenuDesktopElement.append(customMenuDesktopItem);
    }

    if (customMenuMobileElement) {
      const customMenuMobileItem = createCustomMenuItemContainerElement(navElement.cloneNode(true));
      customMenuMobileItem.addEventListener('click', actionFn);
      customMenuMobileElement.append(customMenuMobileItem);
    }
  }

  window.createCustomMenuItemElement = createCustomMenuItemElement;
})();