(() => {
  const glimpse = document.getElementById('glimpse');
  if (!glimpse) return;

  const icon = `
    <svg class="search-icon" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
    </svg>
  `;

  if (typeof window.createCustomMenuItemElement === 'function') {
    window.createCustomMenuItemElement?.({
      className: 'search-icon-container',
      tooltip: 'Launch Glimpse',
      icon,
      actionFn: () => spawnGlimpse()
    });
  } else {
    const headerNav = document.querySelector('.header-container > .header');
    const mobileNav = document.querySelector('.mobile-navigation > .mobile-navigation-icons');
    if (!headerNav || !mobileNav) return;

    if (headerNav) {
      const headerSearchNav = createNavElement();
      headerSearchNav.classList.add('search-icon-container');
      const navElement = headerNav.querySelector(':scope > nav');
      if (navElement) {
        headerSearchNav.classList.add('glimpse-search-nav');
        navElement.parentNode.insertBefore(headerSearchNav, navElement.nextSibling);
      }
    }

    if (mobileNav) {
      const mobileSearchNav = createNavElement();
      mobileNav.classList.add('glimpse-search-mobile-nav');
      mobileNav.prepend(mobileSearchNav);
    }
  }

  const customSettingsFunctions = window.customSettingsFunctions;
  if (customSettingsFunctions && typeof customSettingsFunctions === 'object') {
    $include: config.js
    const configKey = 'glimpse-search-config';
    if (!localStorage.getItem(configKey)) {
      localStorage.setItem(configKey, JSON.stringify(glimpseConfig));
      console.info('Glimpse Local Storage configuration initialized.');
    }
    const storedGlimpseConfig = JSON.parse(localStorage.getItem(configKey));
    customSettingsFunctions.createCustomSettingsItem?.({
      nameHTML: 'Glimpse',
      contentObject: [
        { type: 'custom-html', frameless: true, contentHTML: `
          <div style="color: var(--color-negative);">
            NOTE: <span style="font-style: italic;">Reload the page after every change.</span>
          </div>`
        },
        { type: 'text', name: 'Search URL', key: 'glanceSearch.searchUrl', value: storedGlimpseConfig.glanceSearch.searchUrl, columnsUsed: 1 },
        { type: 'text', name: 'Search Suggest Endpoint', key: 'searchSuggestEndpoint', value: storedGlimpseConfig.searchSuggestEndpoint, columnsUsed: 1, tooltip: 'Search Suggest/Autocomplete endpoint. May not work most of the time, only tested with Whoogle https://your-whoogle-domain.com/autocomplete?q=' },
        { type: 'dropdown', name: 'Search Target', key: 'glanceSearch.target', value: storedGlimpseConfig.glanceSearch.target, options: ['_blank', '_self', '_parent', '_top'] },
        { type: 'text', name: 'Search Placeholder', key: 'glanceSearch.placeholder', value: storedGlimpseConfig.glanceSearch.placeholder },
        { type: 'text', name: 'Shortcut Key', key: 'glimpseKey', value: storedGlimpseConfig.glimpseKey, maxLength: 1 },
        { type: 'toggle', name: 'Search Auto Focus', key: 'glanceSearch.autofocus', value: storedGlimpseConfig.glanceSearch.autofocus },
        { type: 'toggle', name: 'Show Bang Suggestions', key: 'showBangSuggest', value: storedGlimpseConfig.showBangSuggest },
        { type: 'toggle', name: 'Cleanup Other Pages', key: 'cleanupOtherPages', value: storedGlimpseConfig.cleanupOtherPages, tooltip: 'Cleans other page search on Glimpse close. High resource usage if false.' },
        { type: 'multi-text', name: 'Other Page Search (Slug)', key: 'pagesSlug', value: storedGlimpseConfig.pagesSlug, columnsUsed: 1, tooltip: 'By default, Glimpse searches only the currently loaded page. To include other pages, set this and include your primary page\'s slug and any additional pages. Slugs are used instead of titles or page names since they can be custom-defined.' },
        { type: 'toggle', name: 'Wait For Glance', key: 'waitForGlance', value: storedGlimpseConfig.waitForGlance },
        { type: 'toggle', name: 'Detect URL', key: 'detectUrl', value: storedGlimpseConfig.detectUrl },
        { type: 'toggle', name: 'Mobile Bottom Search', key: 'mobileBottomSearch', value: storedGlimpseConfig.mobileBottomSearch, tooltip: 'Repositions the search bar and the suggestions to the bottom in mobile view for ease of access.' },
        { type: 'toggle', name: 'Resize On Keyboard', key: 'resizeOnSoftKeyboardOpen', value: storedGlimpseConfig.resizeOnSoftKeyboardOpen, tooltip: 'On most mobile browsers, when a soft keyboard is present, the page will just overlay making the entire content scrollable. This will result in disabled horizontal scroll of content near the soft keyboard. This attempts to fix that by making the content resized instead.' },
        { type: 'toggle', name: 'Auto Close', key: 'autoClose', value: storedGlimpseConfig.autoClose },
        { type: 'toggle', name: 'Preserve Search Query', key: 'preserveQuery', value: storedGlimpseConfig.preserveQuery, tooltip: 'Preserves Query on search.' },
        { type: 'textarea', name: 'Search Bangs (json)', key: 'glanceSearch.bangs', value: JSON.stringify(storedGlimpseConfig.glanceSearch.bangs, null, 2).trim(), columnsUsed: 1 },
        { type: 'custom-html', contentHTML: `
          <div style="width: 100%;">
            <a class="color-primary visited-indicator" target="_blank" rel="noreferrer" href="https://github.com/ralphocdol/glance-micro-scripts/tree/main/glimpse">
              Project Repository
            </a>
          </div>
          <div style="width: 100%;">
            <a class="color-primary visited-indicator" target="_blank" rel="noreferrer" href="https://github.com/ralphocdol/glance-micro-scripts/tree/main/glimpse/README.md">
              Project README.md
            </a>
          </div>
        `,
          style: {
            display: 'flex',
            flexDirection: 'column'
          },
        },
        { type: 'buttons', buttons: [
          { name: 'Restore Defaults', key: 'restore-defaults', negative: true },
          { name: 'Reload Page', key: 'reload-page' },
        ], columnsUsed: 2 },
      ],
      contentEventListener: {
        setup: () => {
          const toastNotification = typeof window.showToast === 'function' ? window.showToast : (msg => alert(msg));
          const configKey = 'glimpse-search-config';
          const storedGlimpseConfig = JSON.parse(localStorage.getItem(configKey));
          const getKeyedElement = key => _PARENT_ELEMENT_.querySelector(`[name="${key}"]`);

          function setAndSave(config, name, value) {
            try {
              customSettingsFunctions.setValueByPath(config, name, value);
              localStorage.setItem(configKey, JSON.stringify(config));
              toastNotification(`Glimpse configuration successfully updated.`, { type: 'success' });
            } catch (e) {
              toastNotification(`Glimpse configuration failed to update, see logs for more info.`, { type: 'error' });
              console.error(e);
            }
          }

          const cardElement = type => Array.from(_PARENT_ELEMENT_.childNodes).filter(e => e.classList.contains(type));
          const findElementByCardAndName = (card, name) => cardElement(card).find(e => e.querySelector(`[name="${name}"]`));
        },
        onload: () => {
          getKeyedElement('glanceSearch.searchUrl').value = storedGlimpseConfig.glanceSearch.searchUrl;
          getKeyedElement('searchSuggestEndpoint').value = storedGlimpseConfig.searchSuggestEndpoint;
          getKeyedElement('glanceSearch.target').value = storedGlimpseConfig.glanceSearch.target;
          getKeyedElement('glanceSearch.placeholder').value = storedGlimpseConfig.glanceSearch.placeholder;
          getKeyedElement('glimpseKey').value = storedGlimpseConfig.glimpseKey;
          getKeyedElement('glanceSearch.autofocus').checked = storedGlimpseConfig.glanceSearch.autofocus;
          getKeyedElement('showBangSuggest').checked = storedGlimpseConfig.showBangSuggest;
          getKeyedElement('cleanupOtherPages').checked = storedGlimpseConfig.cleanupOtherPages;
          getKeyedElement('pagesSlug').value = storedGlimpseConfig.pagesSlug;
          getKeyedElement('waitForGlance').checked = storedGlimpseConfig.waitForGlance;
          getKeyedElement('detectUrl').checked = storedGlimpseConfig.detectUrl;
          getKeyedElement('mobileBottomSearch').checked = storedGlimpseConfig.mobileBottomSearch;
          getKeyedElement('resizeOnSoftKeyboardOpen').checked = storedGlimpseConfig.resizeOnSoftKeyboardOpen;
          getKeyedElement('autoClose').checked = storedGlimpseConfig.autoClose;
          getKeyedElement('preserveQuery').checked = storedGlimpseConfig.preserveQuery;
          getKeyedElement('glanceSearch.bangs').value = JSON.stringify(storedGlimpseConfig.glanceSearch.bangs, null, 2).trim();
        },
        click: async e => {
          const target = e.target;
          const keyEl = getKeyedElement(target.dataset.key);

          try {
            if (findElementByCardAndName('card-toggle', keyEl?.name) !== undefined) {
              setAndSave(storedGlimpseConfig, keyEl?.name, keyEl?.checked);
            }
            if (findElementByCardAndName('card-text', keyEl?.name)) {
              setAndSave(storedGlimpseConfig, keyEl?.name, keyEl?.value);
            }

            if (findElementByCardAndName('card-multi-text', keyEl?.name)) {
              setAndSave(storedGlimpseConfig, keyEl?.name, keyEl?.value?.split(','));
            }

            if (keyEl?.name === 'glanceSearch.bangs') {
              setAndSave(storedGlimpseConfig, keyEl?.name, JSON.parse(keyEl?.value));
            }

            if (target.dataset.key === 'restore-defaults') {
              if (await customSettingsFunctions.ask('Restoring configuration to default, are you sure about this?')) {
                localStorage.removeItem(configKey);
                location.reload();
              }
            }

            if (target.dataset.key === 'reload-page') {
              if (await customSettingsFunctions.ask('Reload page?')) location.reload();
            }
          } catch(e) {
            toastNotification('Error in configuration: ' + keyEl?.name + ', see logs for more info.`', { type: 'error' });
            console.error(e);
          }
        },
        change: e => {
          const target = e.target;
          const keyEl = getKeyedElement(target.dataset.key);
          if (target.dataset.key === 'glanceSearch.target') {
            setAndSave(storedGlimpseConfig, keyEl?.name, keyEl?.value);
          }
        }
      }
    });
  }

  const searchInput = glimpse.querySelector('.search-input');

  $include: spawn.js

  function createNavElement() {
    const newElement = document.createElement('div');
    newElement.setAttribute('title', 'Launch Glimpse');
    newElement.innerHTML = icon;
    newElement.addEventListener('click', () => spawnGlimpse());
    return newElement;
  }
})();