'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  var _window, _window$GLANCE_ADDON_;
  // Catch duplicate instances
  const scriptName = 'HTML Script Loader';
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
  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));
  document.querySelectorAll('script[html-script]').forEach((s, i) => {
    var _find, _s$closest;
    const widgetSrc = ((_find = [...(((_s$closest = s.closest) === null || _s$closest === void 0 || (_s$closest = _s$closest.call(s, '.widget')) === null || _s$closest === void 0 ? void 0 : _s$closest.classList) || [])].find(c => c.startsWith('widget-type-'))) === null || _find === void 0 ? void 0 : _find.slice(12)) || 'html';
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