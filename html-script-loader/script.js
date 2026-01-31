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

  document.querySelectorAll('script[html-script]').forEach((s, i) => {
    const widgetSrc = [...s.closest?.('.widget')?.classList || []].find(c => c.startsWith('widget-type-'))?.slice(12) || 'html';
    const newFunctionName = `scriptLoad_${i}`;
    const htmlScript = document.createElement('script');
    htmlScript.setAttribute('widget-src', widgetSrc);
    htmlScript.setAttribute('script-id', `${i}`);
    htmlScript.textContent = `const ${newFunctionName} = () => { ${s.textContent} }`;
    document.head.appendChild(htmlScript);
    setTimeout(() => eval(newFunctionName)(), 0);
    s.remove();
  });
});