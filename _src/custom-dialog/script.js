'use strict';

document.addEventListener('DOMContentLoaded', () => {
  var _window, _window$GLANCE_ADDON_;
  // Catch duplicate instances
  const scriptName = 'Custom Dialog';
  if (((_window$GLANCE_ADDON_ = (_window = window).GLANCE_ADDON_SCRIPTS) !== null && _window$GLANCE_ADDON_ !== void 0 ? _window$GLANCE_ADDON_ : _window.GLANCE_ADDON_SCRIPTS = {})[scriptName] === true) {
    var _window$showToast, _window2;
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') (_window$showToast = (_window2 = window).showToast) === null || _window$showToast === void 0 || _window$showToast.call(_window2, msg, {
      type: 'error'
    });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  // Catch Missing Dependencies
  const createElementFn = window.CREATE_ELEMENT;
  if (typeof createElementFn !== 'function') {
    var _window$showToast2, _window3;
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';
    if (typeof window.showToast === 'function') (_window$showToast2 = (_window3 = window).showToast) === null || _window$showToast2 === void 0 || _window$showToast2.call(_window3, msg, {
      title: 'CUSTOM DIALOG',
      type: 'error'
    });
    console.error('CREATE_ELEMENT not found');
    window.customDialog = message => window.confirm(message);
    return;
  }
  const dialog = createElementFn({
    tag: 'dialog',
    id: 'dialog'
  });
  document.body.appendChild(dialog);
  async function customDialog(message, config = {}) {
    return new Promise(resolve => {
      const {
        type = 'confirm',
        cancelText = 'CANCEL',
        confirmText = 'CONFIRM'
      } = config;
      const container = createElementFn({
        tag: 'form',
        attrs: {
          method: 'dialog'
        }
      });
      const containerFrag = createElementFn({
        isFragment: true
      });
      switch (type) {
        case 'confirm':
          {
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
            `
            });
            containerFrag.appendChild(dialogButtons);
            break;
          }
        case 'info':
          {
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
            `
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
      }, {
        once: true
      });
      dialog.appendChild(container);
      dialog.style.display = 'flex';
      setTimeout(() => dialog.classList.add('show'), 50);
      dialog.showModal();
    });
  }
  window.customDialog = customDialog;
});