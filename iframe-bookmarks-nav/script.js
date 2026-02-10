'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  // Catch duplicate instances
  const scriptName = 'Iframe Bookmark Nav';
  if ((window.GLANCE_ADDON_SCRIPTS ??= {})[scriptName] === true) {
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { type: 'error' });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));

  const iframePage = { links: 'iframe-links-', page: 'iframe-page-' };
  document.querySelectorAll(`[class^="${iframePage.links}"], [class*=" ${iframePage.links}"]`).forEach(el => {
    const className = [...el.classList].find(c => c.startsWith(iframePage.links));
    const classId = className.replace(iframePage.links, '');
    const pageClass = `${iframePage.page}${classId}`;

    const bookmarksLists = el.querySelectorAll('li');
    bookmarksLists.forEach((li, index) => {
      if (index === 0) li.classList.add('active');
      else li.classList.remove('active');
      li.querySelector('a.bookmarks-link').classList.add('flex-1');
    });

    const iframeContainer = document.querySelector(`.${pageClass}`);
    if (!iframeContainer) throw new Error(`No iframe container found for class ${pageClass}`);
    const iframeHeader = iframeContainer.querySelector('.widget-header h2');
    const iframeHeaderLink = iframeHeader?.querySelector('a') || null;
    const iframe = iframeContainer.querySelector('iframe');
    if (!iframe) throw new Error(`No iframe found for class ${pageClass}`);

    el.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (!link) return;

      bookmarksLists.forEach(li => li.classList.remove('active'));
      link.closest('li').classList.add('active');

      iframe.contentWindow.location.href = link.href;
      if (iframeHeaderLink) {
        iframeHeaderLink.textContent = link.textContent;
        iframeHeaderLink.href = link.href;
      } else if (iframeHeader) {
        iframeHeader.textContent = link.textContent;
      }
      e.preventDefault();
    });
  });
});