'use strict';
(() => {
  // Catch duplicate instances
  const scriptName = 'Custom Menu';
  if ((window.GLANCE_ADDON_SCRIPTS ??= {})[scriptName] === true) {
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { type: 'error' });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  // Catch Missing Dependencies
  const createElementFn = window.CREATE_ELEMENT;
  if (typeof createElementFn !== 'function') {
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { title: 'CUSTOM MENU', type: 'error' });
    else alert(msg);

    console.error('CREATE_ELEMENT not found');
    return;
  }

  const headerNav = document.querySelector('.header-container > .header');
  const mobileNav = document.querySelector('.mobile-navigation > .mobile-navigation-icons');

  if (headerNav) {
    const navElement = headerNav.querySelector(':scope > nav');
    if (navElement) {
      const headerCustomMenu = createCustomMenuElement();
      navElement.parentNode.insertBefore(headerCustomMenu, navElement.nextSibling);
    }
  }

  if (mobileNav) {
    const mobileSearchNav = createCustomMenuElement(true);
    mobileSearchNav.classList.add('mobile-navigation-label');

    const newCustomMenuItem = createElementFn({
      classes: 'custom-menu-item',
      htmlContent: `
        <a href="#top" class="custom-menu-top">
          <svg class="custom-menu-item-icon" viewBox="0 0 24 24" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 20L12 4M12 4L18 10M12 4L6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        </a>
        <label>Top</label>
      `,
    });

    mobileSearchNav.querySelector('.custom-menu-items').appendChild(newCustomMenuItem);
    mobileNav.prepend(mobileSearchNav);
  }

  const nativeTop = document.querySelector('a[href="#top"]:not(.custom-menu-top)');
  if (nativeTop) nativeTop.style.display = 'none';

  function createCustomMenuElement(mobile = false) {
    return createElementFn({
      classes: 'custom-menu',
      styles: { cursor: 'progress' },
      children: [
        {
          classes: 'custom-menu-popover',
          datasets: {
            popoverType: 'html',
            popoverPosition: mobile ? 'above' : 'below',
            popoverShowDelay: '0',
            popoverHideDelay: '0',
            popoverMaxWidth: '500px',
            ...(mobile && { popoverPosition: 'above', popoverAnchor: '.custom-menu-button', popoverTrigger: 'click' })
          },
          children: [
            { datasets: { popoverHtml: '' }, children: [ { classes: 'custom-menu-items' } ] },
            {
              classes: mobile ? 'pointer-events-none' : null,
              children: [
                {
                  classes: 'custom-menu-button',
                  htmlContent: `
                    <svg fill="currentColor" version="1.1" viewBox="0 0 489 489" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M339.4,102c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V102z"></path> <path d="M488.9,102c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V102z"></path> <path d="M339.4,251.5c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V251.5z"></path> <path d="M488.9,251.5c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V251.5z"></path> <path d="M189.9,251.5c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9 c10,0,18.1-8.1,18.1-18.1V251.5z"></path> <path d="M321.3,382.9h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9c10,0,18.1-8.1,18.1-18.1V401 C339.4,391,331.3,382.9,321.3,382.9z"></path> <path d="M400.9,489h69.9c10,0,18.1-8.1,18.1-18.1V401c0-10-8.1-18.1-18.1-18.1h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9 C382.8,480.9,390.9,489,400.9,489z"></path> <path d="M171.8,382.9h-69.9c-10,0-18.1,8.1-18.1,18.1v69.9c0,10,8.1,18.1,18.1,18.1h69.9c10,0,18.1-8.1,18.1-18.1V401 C189.9,391,181.8,382.9,171.8,382.9z"></path> <path d="M145,45.3v99.6H45.4V45.3H145 M162.2,0h-134C12.7,0,0.1,12.6,0.1,28.1v137.3c0,13.7,11.1,24.8,24.8,24.8h137.3 c15.5,0,28.1-12.6,28.1-28.1v-134C190.3,12.6,177.7,0,162.2,0L162.2,0z" fill="var(--color-primary)"></path> </g> </g> </g></svg>
                  `,
                }
              ]
            }
          ]
        }
      ]
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    let menuList = [];
    function createCustomMenuItemElement(params) {
      const { className, tooltip, icon, actionFn } = params
      if (!className || !tooltip || !icon || !actionFn) {
        window.showToast?.('Missing required parameters, see logs.', { title: 'CUSTOM MENU', type: 'error' })
        console.error('Missing required parameters:', { className, tooltip, icon, actionFn });
        return;
      }

      menuList.push(params);
    }

    window.createCustomMenuItemElement = createCustomMenuItemElement;

    while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));

    function isImgOrSvg(str) {
      return /^\s*<\s*(img|svg)(\s|>)/i.test(str);
    }

    setTimeout(() => {
      const customMenuItems = document.querySelectorAll('.custom-menu-items');
      if (!customMenuItems) return;
      const customMenuPopover = document.querySelector('.popover-container');

      menuList
        .sort((a, b) => (Number.isFinite(a.order) ? a.order : Infinity) - (Number.isFinite(b.order) ? b.order : Infinity) || a.className.localeCompare(b.className))
        .forEach(({ className, tooltip, icon, actionFn, status, label, dismissOnClick = true }) => {
          const newStatus = typeof status === 'boolean' ? (status ? ' active' : ' inactive') : '';

          customMenuItems.forEach(menu => {
            const customItemEl = createElementFn({
              classes: 'custom-menu-item',
              props: { title: tooltip },
              children: [
                {
                  classes: `${className}${newStatus}`,
                  ...(isImgOrSvg(icon) ? {htmlContent: icon} : {textContent: icon})
                },
                { tag: 'label', htmlContent: label || tooltip },
              ],
              events: {
                click: e => {
                  if (dismissOnClick) customMenuPopover.dispatchEvent(new Event('mouseleave'));
                  actionFn(e);
                },
              }
            });
            menu.appendChild(customItemEl);

            const columns = Array.from(menu.querySelectorAll('.custom-menu-item')).length
            menu.style.setProperty('--custom-menu-columns', columns >= 3 ? 3 : columns);
          });
        });


      let hasColumns = false;
      customMenuItems.forEach(menu => {
        let columns = menu.style.getPropertyValue('--custom-menu-columns');
        if (columns === '' || isNaN(columns)) columns = 0;
        if (!hasColumns) hasColumns = Number(columns) > 0;
        Object.assign(menu.closest('.custom-menu').style, {
          cursor: 'pointer',
          display: hasColumns ? 'flex' : 'none'
        });
        Object.assign(menu.closest('.custom-menu-popover').style, {
          pointerEvents: 'inherit',
          color: 'inherit',
          opacity: 1,
        });
      });

      const glanceNativeToTopEl = document.querySelector('a[href="#top"]:not(.custom-menu-top)');
      if (hasColumns) glanceNativeToTopEl.remove();
      else glanceNativeToTopEl.style.display = 'flex';
    }, 500);
  });
})();