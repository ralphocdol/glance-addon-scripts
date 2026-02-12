'use strict';
const CURRENT_SCRIPT_TIMESTAMP = new URL(import.meta.url).searchParams.get('v') || '';

document.addEventListener('DOMContentLoaded', async () => {
  // Catch duplicate instances
  const scriptName = 'Custom Dialog';
  if ((window.GLANCE_ADDON_SCRIPTS ??= {})[scriptName] === true) {
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { type: 'error' });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }
  // Catch Missing Dependencies
  const { default: createElementFn } = await import(`../global-functions/CREATE_ELEMENT.js?v=${CURRENT_SCRIPT_TIMESTAMP}`);
  if (typeof createElementFn !== 'function') {
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { title: 'CUSTOM DIALOG', type: 'error' });

    console.error('CREATE_ELEMENT not found');
    window.customDialog = message => window.confirm(message);
    return;
  }

  const dialog = createElementFn({
    tag: 'dialog',
    id: 'dialog',
  });

  document.body.appendChild(dialog);

  async function customDialog(message, config = {}) {
    return new Promise(resolve => {
      const {
        type = 'confirm',
        cancelText = 'CANCEL',
        confirmText = 'CONFIRM',
      } = config;

      const container = createElementFn({
        tag: 'form',
        attrs: { method: 'dialog' },
      });

      const containerFrag = createElementFn({ isFragment: true });
      switch (type) {
        case 'confirm': {
          container.setAttribute('dialog-confirm', '');
          const messageEl = createElementFn({
            tag: 'p',
            textContent: message
          });
          containerFrag.appendChild(messageEl);

          const dialogButtons = createElementFn({
            classes: 'dialog-buttons',
            htmlContent: `
              <button value="no">${cancelText}</button>
              <button value="yes" autofocus>${confirmText}</button>
            `,
          });

          containerFrag.appendChild(dialogButtons);
          break;
        }
        case 'info': {
          container.setAttribute('dialog-info', '');
          const messageEl = createElementFn({
            tag: 'p',
            textContent: message
          });
          containerFrag.appendChild(messageEl);

          const dialogButtons = createElementFn({
            classes: 'dialog-buttons',
            htmlContent: `
              <button value="no">${confirmText}</button>
            `,
          });

          containerFrag.appendChild(dialogButtons);
          break;
        }
      }
      container.appendChild(containerFrag);

      dialog.addEventListener('close', () => {
        resolve(dialog.returnValue === 'yes');
        setTimeout(() => {
          dialog.style.display = 'none';
          container.remove();
          dialog.close();
        }, 50);
        dialog.classList.remove('show');
      }, { once: true });

      dialog.appendChild(container);
      dialog.style.display = 'flex';
      setTimeout(() => dialog.classList.add('show'), 50);
      dialog.showModal();
    });
  }

  window.customDialog = customDialog;
});