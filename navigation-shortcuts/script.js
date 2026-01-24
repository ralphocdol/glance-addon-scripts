'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));

  const navItems = Array.from(document.querySelectorAll('nav.desktop-navigation .nav-item'));
  if (navItems.length <= 1) return;

  const keyCodeMap = {
    'Digit1': 1, 'Digit2': 2, 'Digit3': 3, 'Digit4': 4, 'Digit5': 5,
    'Digit6': 6, 'Digit7': 7, 'Digit8': 8, 'Digit9': 9, 'Digit0': 10
  };

  document.addEventListener("keydown", (event) => {
    if (!event.ctrlKey || !event.shiftKey || !(event.code in keyCodeMap)) return;

    const keyNum = keyCodeMap[event.code];
    if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= navItems.length) {
      const targetHref = navItems[keyNum - 1].getAttribute('href');
      if (targetHref !== window.location.pathname) window.location.href = targetHref;
    }
  });
});