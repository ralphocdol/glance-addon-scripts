'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  // Catch duplicate instances
  const scriptName = 'Tab Notification';
  if ((window.GLANCE_ADDON_SCRIPTS ??= {})[scriptName] === true) {
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { type: 'error' });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));

  const tabNotificationClass = 'tab-notification';
  const tabNotificationCountAttribute = `${tabNotificationClass}-count`;
  const tabNotificationErrorAttribute = `${tabNotificationClass}-error`
  const tabNotificationStyleAttribute = `${tabNotificationClass}-style`

  document.querySelectorAll('.' + tabNotificationClass).forEach((e, i) => {
    const count = e.getAttribute(tabNotificationCountAttribute);
    const isError = e.getAttribute(tabNotificationErrorAttribute) === '';
    const overrideStyle = e.getAttribute(tabNotificationStyleAttribute) ?? '';

    if (count && +count === 0) return e.remove();
    let glanceWidgetContainer = e.closest(`.widget-group-content`);

    let glanceWidgetTabTarget, glanceWidgetTab;
    if (glanceWidgetContainer) {
      glanceWidgetTabTarget = `#${glanceWidgetContainer.getAttribute('aria-labelledby')}`;
      glanceWidgetTab = document.querySelector(glanceWidgetTabTarget);
    } else {
      glanceWidgetContainer = e.closest(`.widget`);
      glanceWidgetTab = glanceWidgetContainer.querySelector('.widget-header h2 a');
      glanceWidgetTab?.classList.add(`${tabNotificationClass}-${i}`)
      glanceWidgetTabTarget = `.${tabNotificationClass}-${i}`;
    }

    if (!glanceWidgetTab) return e.remove();
    const tabTitle = e.getAttribute('tab-title');
    if (tabTitle) glanceWidgetTab.setAttribute('title', tabTitle);

    const style = document.createElement('style');
    style.innerHTML = `
      ${glanceWidgetTabTarget}::after {
        content: '${count}';
        display: inline-flex;
        vertical-align: top;
        margin-left: 2px;
        background-color: var(${isError ? '--color-negative' : '--color-primary'});
        color: var(--color-background);
        border-radius: var(--border-radius);
        padding: 0 5px;
        font-size: 1rem;
        white-space: nowrap;
        line-height: 1.5rem;
        ${overrideStyle}
      }`;
    document.head.appendChild(style);
    e.remove();
  });
});