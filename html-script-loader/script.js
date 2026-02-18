'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  // Catch duplicate instances
  const scriptName = 'HTML Script Loader';
  if ((window.GLANCE_ADDON_SCRIPTS ??= {})[scriptName] === true) {
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { type: 'error' });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));

  const configKey = 'html-script-loader-interval-running';
  if (localStorage.getItem(configKey) === null) localStorage.setItem(configKey, false);

  const icons = {
    active: `<svg version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st1{fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round;stroke-miterlimit:10;} </style> <circle class="st0" cx="24" cy="23" r="7"></circle> <line class="st0" x1="24" y1="20" x2="24" y2="26"></line> <line class="st0" x1="21" y1="23" x2="27" y2="23"></line> <path class="st0" d="M26.5,3c0.2,0,0.3,0,0.5,0c2.6,0.3,3.9,3.4,2.4,5.6L24.5,16"></path> <line class="st0" x1="26" y1="3" x2="9.5" y2="3"></line> <path class="st0" d="M11.3,10.3l-8.7,13C1.2,25.5,2.4,28.7,5,29c0.2,0,0.3,0,0.5,0h14.9"></path> <path class="st0" d="M9,3C6.8,3,5,4.8,5,7c0,0.5,0.2,1,0.4,1.4c0.6,1,1.8,1.6,3,1.6H24c-1,0-3.1-2.8-0.9-5.5C23.8,3.6,24.9,3,26,3 c2.2,0,4,1.8,4,4"></path> <line class="st0" x1="13" y1="15" x2="18" y2="15"></line> <line class="st0" x1="11" y1="18" x2="14" y2="18"></line> </g></svg>`,
    inactive: `<svg version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st1{fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round;stroke-miterlimit:10;} </style> <circle class="st0" cx="24" cy="23" r="7"></circle> <line class="st0" x1="21.9" y1="20.9" x2="26.1" y2="25.1"></line> <line class="st0" x1="21.9" y1="25.1" x2="26.1" y2="20.9"></line> <path class="st0" d="M26.5,3c0.2,0,0.3,0,0.5,0c2.6,0.3,3.9,3.4,2.4,5.6L24.5,16"></path> <line class="st0" x1="26" y1="3" x2="9.5" y2="3"></line> <path class="st0" d="M11.3,10.3l-8.7,13C1.2,25.5,2.4,28.7,5,29c0.2,0,0.3,0,0.5,0h14.9"></path> <path class="st0" d="M9,3C6.8,3,5,4.8,5,7c0,0.5,0.2,1,0.4,1.4c0.6,1,1.8,1.6,3,1.6H24c-1,0-3.1-2.8-0.9-5.5C23.8,3.6,24.9,3,26,3 c2.2,0,4,1.8,4,4"></path> <line class="st0" x1="13" y1="15" x2="18" y2="15"></line> <line class="st0" x1="11" y1="18" x2="14" y2="18"></line> </g></svg>`,
  };

  window.createCustomMenuItemElement?.({
    className: configKey,
    label: 'Script Loader',
    tooltip: 'HTML Script Loader Interval',
    icon: localStorage.getItem(configKey) === 'true' ? icons.active : icons.inactive,
    actionFn: () => {
      const status = localStorage.getItem(configKey) !== 'true';
      localStorage.setItem(configKey, status);

      const icon = status ? icons.active : icons.inactive;
      document.querySelectorAll('.' + configKey).forEach(e => {
        e.innerHTML = icon;
        e.classList[status ? 'add' : 'remove']('active');
        e.classList[!status ? 'add' : 'remove']('inactive');
      });
    },
    status: localStorage.getItem(configKey) === 'true',
    dismissOnClick: false,
  });

  // Custom function inside html-script
  const setPausableInterval = (fn, delay) => {
    setInterval(() => {
      const currentStatus = localStorage.getItem('html-script-loader-interval-running');
      if (currentStatus === 'false' || currentStatus === null) return;
      fn();
    }, delay);
  };

  const targetTag = 'script[html-script]';
  const targetElements = [
    `.widget-type-html ${targetTag}`,
    `.widget-type-custom-api ${targetTag}`,
  ].join(', ');

  document.querySelectorAll(targetElements).forEach((s, i) => {
    const widgetSrc = [...s.closest?.('.widget')?.classList || []].find(c => c.startsWith('widget-type-'))?.slice(12) || 'html';
    const htmlScript = document.createElement('script');
    htmlScript.setAttribute('widget-src', widgetSrc);
    htmlScript.setAttribute('script-id', `${i}`);
    htmlScript.textContent = `
      (() => {
        const setPausableInterval = (${setPausableInterval.toString()});
        ${s.textContent}
      })();
    `;
    document.head.appendChild(htmlScript);
    s.remove();
  });
});