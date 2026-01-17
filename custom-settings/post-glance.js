(() => {
  const icon = `<svg class="custom-menu-item-icon" fill="currentColor" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 54.374 54.374" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M5.677,23.789v25.521c0,0.828,0.672,1.5,1.5,1.5h8.328c0.828,0,1.5-0.672,1.5-1.5V23.789 c3.479-2.012,5.678-5.765,5.678-9.815c0-4.376-2.567-8.406-6.542-10.267c-0.465-0.218-1.009-0.183-1.44,0.093 c-0.434,0.275-0.695,0.752-0.695,1.266v8.939H8.677V5.065c0-0.513-0.262-0.99-0.695-1.266c-0.433-0.276-0.977-0.311-1.44-0.093 C2.567,5.567,0,9.598,0,13.974C0,18.023,2.199,21.776,5.677,23.789z M5.677,7.865v7.64c0,0.829,0.672,1.5,1.5,1.5h8.328 c0.828,0,1.5-0.671,1.5-1.5v-7.64c1.675,1.556,2.678,3.765,2.678,6.108c0,3.217-1.89,6.181-4.813,7.55 c-0.527,0.247-0.864,0.776-0.864,1.358v24.927H8.677V22.881c0-0.582-0.337-1.112-0.864-1.358C4.889,20.155,3,17.19,3,13.974 C3,11.629,4.002,9.42,5.677,7.865z"></path> <path d="M27.072,13.475h8.124l-2.348,2.348c-0.586,0.585-0.586,1.536,0,2.121c0.293,0.293,0.676,0.439,1.061,0.439 c0.384,0,0.768-0.146,1.061-0.439l4.907-4.907c0.14-0.139,0.251-0.306,0.327-0.491c0.003-0.008,0.004-0.016,0.007-0.023 c0.065-0.169,0.106-0.354,0.106-0.547s-0.041-0.377-0.106-0.547c-0.003-0.008-0.004-0.016-0.007-0.023 c-0.076-0.185-0.188-0.352-0.327-0.491l-4.748-4.748c-0.586-0.586-1.535-0.586-2.121,0c-0.586,0.585-0.586,1.536,0,2.121 l2.188,2.188h-8.124c-0.828,0-1.5,0.671-1.5,1.5S26.244,13.475,27.072,13.475z"></path> <path d="M27.072,25.235h16.309l-2.348,2.348c-0.586,0.585-0.586,1.536,0,2.121c0.293,0.293,0.677,0.438,1.061,0.438 c0.385,0,0.768-0.146,1.061-0.438l4.908-4.907c0.14-0.139,0.25-0.306,0.326-0.491c0.004-0.008,0.004-0.016,0.008-0.023 c0.065-0.169,0.105-0.354,0.105-0.547c0-0.193-0.04-0.377-0.105-0.547c-0.004-0.008-0.004-0.016-0.008-0.023 c-0.076-0.185-0.188-0.352-0.326-0.491l-4.748-4.748c-0.586-0.586-1.535-0.586-2.121,0c-0.586,0.585-0.586,1.536,0,2.121 l2.188,2.188H27.072c-0.828,0-1.5,0.671-1.5,1.5C25.572,24.565,26.244,25.235,27.072,25.235z"></path> <path d="M27.072,37.725h22.182l-2.348,2.348c-0.586,0.586-0.586,1.535,0,2.121c0.293,0.293,0.677,0.438,1.061,0.438 c0.385,0,0.768-0.146,1.061-0.438l4.906-4.907c0.141-0.14,0.252-0.306,0.328-0.491c0.002-0.008,0.004-0.016,0.006-0.023 c0.066-0.168,0.106-0.354,0.106-0.547l0,0l0,0c0-0.192-0.04-0.377-0.106-0.545c-0.002-0.009-0.004-0.017-0.006-0.023 c-0.078-0.186-0.188-0.352-0.328-0.491l-4.748-4.748c-0.586-0.586-1.535-0.586-2.121,0c-0.586,0.585-0.586,1.536,0,2.121 l2.188,2.188H27.072c-0.828,0-1.5,0.67-1.5,1.5C25.572,37.055,26.244,37.725,27.072,37.725z"></path> </g> </g> </g></svg>`;

  window.createCustomMenuItemElement?.({
    className: 'custom-settings-button',
    tooltip: 'Custom Settings',
    icon,
    actionFn: () => openSettingsGUI()
  });

  function openSettingsGUI() {
    window.launchModalByAttributeValue('custom-settings');
    setTimeout(() => {
      const container = document.querySelector('#modal.custom-settings .modal-body');
      const nav = container.querySelector('nav');
      const main = container.querySelector('main');

      const navItems = nav.querySelectorAll('div[role="button"]');
      const mainItems = main.querySelectorAll('div[data-content]');
      mainItems.forEach(c => c.style.display = c.classList.contains('show') ? 'block' : 'none');

      let activeScriptCleanup = null;
      const triggerCleanup = () => {
        if (activeScriptCleanup) {
          activeScriptCleanup();
          activeScriptCleanup = null;
        }
      }

      nav.addEventListener('click', e => {
        if (e.target.closest('div[role="button"].exit-btn')) {
          triggerCleanup();
          window.closeModal();
          return;
        }

        const el = e.target.closest('div[role="button"][data-target]');
        if (!el) return;

        triggerCleanup();

        const keyTarget = el.dataset.target;
        navItems.forEach(b => b.classList.toggle('active', b === el));
        mainItems.forEach(c => {
          c.classList.remove('show')
          setTimeout(() => c.style.display = 'none', 300);
        });

        const targetItem = Array.from(mainItems).find(c => c.dataset.content === keyTarget);
        if (!targetItem) return;
        setTimeout(() => {
          targetItem.style.display = 'block';
          targetItem.classList.add('show');
        }, 300);

        const scriptElement = targetItem.querySelector(`template[data-script-id="${keyTarget}"]`);
        if (!scriptElement) return;
        const scriptText = scriptElement.content.textContent.trim();
        if (!scriptText) return;
        const scriptFn = new Function(`return (${scriptText})`)();
        activeScriptCleanup = scriptFn(keyTarget);
      });
    }, 100);
  }
})();