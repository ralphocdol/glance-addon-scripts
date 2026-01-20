'use strict';
document.addEventListener('DOMContentLoaded', async () => {
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