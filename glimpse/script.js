'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  // Catch duplicate instances
  const scriptName = 'Glimpse';
  if ((window.GLANCE_ADDON_SCRIPTS ??= {})[scriptName] === true) {
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { type: 'error' });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  // Catch Missing Dependencies
  const createElementFn = window.CREATE_ELEMENT;
  if (typeof createElementFn !== 'function') {
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';

    if (typeof window.showToast === 'function') window.showToast?.(msg, { title: 'CUSTOM SETTINGS', type: 'error' });
    else alert(msg);

    console.error('CREATE_ELEMENT not found');
    return;
  }

  const glimpseConfig = {
    glanceSearch: {
      searchUrl: 'https://duckduckgo.com/?q={QUERY}',
      target: '_blank',
      placeholder: 'Type here to search…',
      bangs: [
        { title: 'DuckDuckGo', shortcut: '!ddg', url: 'https://duckduckgo.com/?q={QUERY}', rawQuery: false }, // duplicate as needed
      ],
    },
    showBangSuggest: true, // Suggests the search bang list
    searchSuggestEndpoint: '',
    pagesSlug: [
      // Other page search may or may not work due to limitations, and can be slow
      // 'home-page',
      // 'page-1',
      // 'page-2',
    ],
    cleanupOtherPages: true, // Warning: setting this to false is like having (# of pagesSlug) tabs opened all at once
    glimpseKey: '',
    waitForGlance: true,
    detectUrl: true, // Make sure to set to false if https://github.com/glanceapp/glance/issues/229 is addressed.
    mobileBottomSearch: true,
    resizeOnSoftKeyboardOpen: false, // Read Glimpse's README
    autoClose: false, // Closes Glimpse on search submit
    preserveQuery: true, // Preserves search query
  };

  const configPathKey = 'glimpse-config-path-url';
  const configKey = 'glimpse-search-config';
  // localStorage.setItem(configKey, ''); // uncomment once to Restore to default. Useful on mobile browsers
  const glimpseConfigCopy = !!localStorage.getItem(configKey) ? JSON.parse(localStorage.getItem(configKey)) : glimpseConfig;
  glimpseConfigCopy.glanceSearch.target = glimpseConfigCopy.glanceSearch.target ?? '_blank';

  const replaceBraces = str => str.replace(/[{}]/g, '!');
  const newTab = glimpseConfigCopy.glanceSearch.target === '_blank';
  const glanceSearchWidget = `
    <div class="widget widget-type-search">
      <div class="widget-header">
        <h2 class="uppercase">Search</h2>
      </div>
      <div class="widget-content widget-content-frameless">
        <div class="search widget-content-frame padding-inline-widget flex gap-15 items-center"
          data-default-search-url="${replaceBraces(glimpseConfigCopy.glanceSearch.searchUrl)}" data-new-tab="${newTab}" data-target="${glimpseConfigCopy.glanceSearch.target}">
          <div class="search-bangs">
            ${glimpseConfigCopy.glanceSearch.bangs.map(b => `<input type="hidden" data-shortcut="${b.shortcut}" data-title="${b.title}" data-url="${replaceBraces(b.url)}">`)}
          </div>
          <div class="search-icon-container">
            <svg class="search-icon" stroke="var(--color-text-subdue)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
            </svg>
          </div>
          <input class="search-input" type="text" placeholder="${glimpseConfigCopy.glanceSearch.placeholder}" autocomplete="off" autofocus>
          <div class="search-bang"></div>
          <kbd class="hide-on-mobile" title="Press [S] to focus the search input">S</kbd>
        </div>
      </div>
    </div>
  `;

  const parseGlanceSearch = new DOMParser();
  const doc = parseGlanceSearch.parseFromString(glanceSearchWidget, 'text/html');
  const search = doc.body.firstElementChild;

  if (!search) return;

  const showSearchSuggest = !!glimpseConfigCopy.searchSuggestEndpoint;
  const uniqueStore = [];

  const loadingAnimationElement = createElementFn({
    classes: 'custom-page-loading-container',
    children: [
      { classes: 'visually-hidden', textContent: 'Loading' },
      { classes: 'loading-icon', ariaHidden: true },
    ],
  });

  if (glimpseConfigCopy.resizeOnSoftKeyboardOpen) {
    const meta = createElementFn({
      tag: 'meta',
      attrs: {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, interactive-widget=resizes-content',
      },
    });
    document.head.appendChild(meta);
  }

  const mainPagePath = Array.from(document.querySelectorAll('.nav a')).map(a => a.getAttribute('href'))?.[0];
  const windowPathname = window.location.pathname;
  const currentPathList = windowPathname.split('/').filter(p => p !== '');

  const glimpse = createElementFn({
    id: 'glimpse',
    classes: 'widget-exclude-swipe',
    style: { display: 'none' },
    children: [
      {
        classes: 'glimpse-wrapper',
        children: [
          { classes: 'glimpse-search widget widget-type-search' },
          { classes: 'glimpse-result' }
        ]
      }
    ],
    events: {
      ...(glimpseConfigCopy.autoClose &&
        {
          click: e => {
            if (!e.target.closest('a')) return;
            closeGlimpse();
          }
        }
      )
    }
  });
  document.body.appendChild(glimpse);

  const bodyOverflowState = document.body.style.overflow;
  const glimpseSearch = document.querySelector('#glimpse .glimpse-search');
  [...search.childNodes].forEach(child => glimpseSearch.appendChild(child.cloneNode(true)));

  const glimpseSearchSuggestContainer = createElementFn({
    classes: 'glimpse-search-suggest-container flex flex-column'
  });
  glimpseSearch.appendChild(glimpseSearchSuggestContainer);

  const closeBtnElement = createElementFn({
    tag: 'span',
    classes: 'close',
    events: {
      click: () => closeGlimpse()
    }
  });
  glimpseSearch.querySelector('.widget-header').appendChild(closeBtnElement);

  const searchInput = glimpse.querySelector('.search-input');
  const glimpseWrapper = glimpse.querySelector('.glimpse-wrapper');
  const glimpseResult = glimpse.querySelector('.glimpse-result');
  const glanceBang = glimpse.querySelector('.search-bang');
  const glanceContent = document.querySelector('#page-content');
  const glancePageTitle = document.querySelector('#page>h1')?.innerText || '';
  const iframeBySlug = {};

  glimpseResult.addEventListener('scroll', () => glimpseResult.classList.toggle('is-scrolled', glimpseResult.scrollTop > 0));
  if (glimpseConfigCopy.mobileBottomSearch) glimpseWrapper.classList.add('bottom-search');
  const getBangRegExp = new RegExp(glimpseConfigCopy.glanceSearch.bangs.map(b => '\\' + b.shortcut).join(' |'), 'g');

  if (glimpseConfigCopy.showBangSuggest) {
    const searchBangContainer = createElementFn({
      classes: 'glimpse-bang-suggest',
      style: { display: 'none' }
    });

    glimpseSearchSuggestContainer.appendChild(searchBangContainer);
    if (glimpseConfigCopy.glanceSearch?.bangs.length > 0) {
      searchBangContainer.style.display = 'flex';

      const searchBangItems = createElementFn({
        tag: 'ul',
        events: {
          click: (e, thisEl) => {
            const targetElement = e.target.closest('.glimpse-bang-item');
            if (!targetElement || !thisEl.contains(targetElement)) return;
            searchInput.value = searchInput.value.replace(getBangRegExp, '');
            searchInput.value = targetElement.dataset.shortcut + ' ' + searchInput.value.trim();
            glanceBang.textContent = targetElement.dataset.title;
            searchInput.focus();
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        },
        children: [
          ...(glimpseConfigCopy.glanceSearch.bangs.map(b => (
            {
              tag: 'li',
              children: [
                {
                  tag: 'span',
                  classes: 'glimpse-bang-item',
                  datasets: {
                    shortcut: b.shortcut,
                    title: b.title
                  },
                  htmlContent: `${b.shortcut} <span class="color-subdue">(${b.title})</span>`
                }
              ]
            }
          )))
        ]
      });

      searchBangContainer.replaceChildren(searchBangItems);
    }
  }

  const emptySearchSuggest = msg => `<span style="padding: 3px 15px; margin: 3px 0;">${msg ?? 'No suggestions…'}</span>`;
  const searchSuggestContainer = createElementFn({
    classes: 'glimpse-search-suggest',
    htmlContent: emptySearchSuggest(),
    style: { display: showSearchSuggest ? 'flex' : 'none' }
  });
  glimpseSearchSuggestContainer.appendChild(searchSuggestContainer);

  function isValidUrl(str) {
    const domainPattern = /^([a-z0-9-]{1,63}\.)+[a-z]{2,}$/i;
    try {
      const url = new URL(str);
      const { protocol, hostname } = url;
      if (protocol !== 'http:' && protocol !== 'https:') return false;

      if (hostname === 'localhost') return true;
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true; // IPv4
      if (/^[a-f0-9:]+$/i.test(hostname) && hostname.includes(':')) return true; // IPv6

      return domainPattern.test(hostname);
    } catch {
      const domain = str.split('/')[0];
      return domainPattern.test(domain);
    }
  }

  function toUrl(link) {
    return /^https?:\/\//.test(link) ? link : 'http://' + link;
  }

  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  const specialKeyMap = {
    ' ': 'Space',
    ';': 'Semicolon',
    ',': 'Comma',
    '.': 'Period',
    '/': 'Slash',
    '\\': 'Backslash',
    '\'': 'Quote',
    '[': 'BracketLeft',
    ']': 'BracketRight',
    '-': 'Minus',
    '=': 'Equal',
    '`': 'Backquote',
  };
  const widgetClasses = [
    '.widget-type-reddit',
    '.widget-type-rss',
    '.widget-type-monitor',
    '.widget-type-docker-containers',
    '.widget-type-videos',
    '.widget-type-bookmarks',
  ].map(c => `${c}:not(.glimpsable-hidden)`)
    .concat('.glimpsable')
    .join(', ');

  let controller;
  let lastCallId = 0;
  const handleInput = debounce(async (e) => {
    const callId = ++lastCallId;
    if (controller) controller.abort();
    controller = new AbortController();

    glimpseResult.innerHTML = '';
    searchSuggestContainer.innerHTML = emptySearchSuggest();
    const query = (e.target.value || '')
      .replace(getBangRegExp, '')
      .trim()
      .toLowerCase();
    if (query.length < 1) {
      loadingAnimationElement.remove();
      return;
    }

    if (glimpseConfigCopy.detectUrl && isValidUrl(query)) glanceBang.innerText = 'URL';

    glimpseWrapper.appendChild(loadingAnimationElement);
    try {
      await searchScrape({ contentElement: glanceContent, query, callId });
      const [suggestionResult] = await Promise.allSettled([
        showSearchSuggestion({ query, controller }),
        ...glimpseConfigCopy.pagesSlug.map(slug => otherPageScrape({ slug, query, callId }))
      ]);
      if (suggestionResult?.status === 'rejected') throw new Error(suggestionResult?.reason.message);
      uniqueStore.length = 0;
      if (callId !== lastCallId) return;
      if (glimpseResult.innerHTML == '') glimpseResult.innerHTML = 'No widget found…';
    } catch (err) {
      if (err?.name !== 'AbortError') {
        loadingAnimationElement.remove();
        console.error(`Glimpse Error: ${err}`);
        window.showToast?.(`Glimpse Error, see logs for more info.`, { type: 'error' });
        searchSuggestContainer.innerHTML = emptySearchSuggest('Search suggestion API failed to respond…')
      }
    } finally {
      if (callId === lastCallId) loadingAnimationElement.remove();
    }

  }, 300);

  const openUrl = url => window.open(url, glimpseConfigCopy.glanceSearch.target, 'noopener,noreferrer');
  const handleKeydown = e => {
    const query = (e.target.value || '').trim();
    if (query.length < 1) return;
    if (e.key === 'Enter') {
      const currentBangString = query.match(getBangRegExp)?.[0]?.trim();
      const currentBangObject = glimpseConfigCopy.glanceSearch.bangs.find(b => b.shortcut === currentBangString);

      if (currentBangObject?.rawQuery) {
        e.stopImmediatePropagation();
        openUrl(currentBangObject.url.replace('{QUERY}', query.replace(getBangRegExp, '')));
      } else if (glimpseConfigCopy.detectUrl && isValidUrl(query)) {
        e.stopImmediatePropagation();
        openUrl(toUrl(query));
      }

      setTimeout(() => {
        if (glimpseConfigCopy.autoClose) closeGlimpse();
        if (glimpseConfigCopy.preserveQuery) searchInput.value = query;
      }, 50);
    }
  }

  searchInput.addEventListener('focus', () => {
    searchInput.addEventListener('input', handleInput);
    searchInput.addEventListener('keydown', handleKeydown);
  });

  searchInput.addEventListener('blur', () => {
    searchInput.removeEventListener('input', handleInput);
    searchInput.removeEventListener('keydown', handleKeydown);
  });

  document.addEventListener('keydown', event => {
    const activeElement = document.activeElement;
    const modalElement = document.getElementById('modal');

    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) ||
      activeElement.isContentEditable ||
      activeElement.closest('#glimpse')) {
      return;
    }

    const hasActiveModal = !!(modalElement && getComputedStyle(modalElement).display !== 'none');
    if (glimpseConfigCopy.glimpseKey &&
      event.code === keyToCode(glimpseConfigCopy.glimpseKey) &&
      activeElement !== searchInput &&
      !hasActiveModal) {
        event.preventDefault();
        if ((glimpseConfigCopy.waitForGlance && document.body.classList.contains('page-columns-transitioned')) || !glimpseConfigCopy.waitForGlance) spawnGlimpse();
    }

    if (event.key === 'Escape') closeGlimpse();
  });

  function keyToCode(key) {
    if (key.length === 1 && /[a-zA-Z]/.test(key)) return "Key" + key.toUpperCase();
    if (key.length === 1 && /[0-9]/.test(key)) return "Digit" + key;
    return specialKeyMap[key] || null;
  }

  function spawnGlimpse() {
    glimpse.style.display = 'flex';
    glimpse.classList.add('fade-in', 'show');
    document.body.style.overflow = 'hidden';
    searchInput.focus();
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.select();
  }

  function closeGlimpse() {
    if (!glimpse.classList.contains('show')) return;
    cleanupAllIframes();
    glimpse.style.display = 'none';
    glimpse.classList.remove('show', 'fade-in');
    document.body.style.overflow = bodyOverflowState;
    searchInput.blur();
  }

  async function searchScrape({ contentElement, query, callId, pageTitle = glancePageTitle }) {
    if (callId !== lastCallId) return;
    const columns = contentElement?.querySelectorAll('.page-columns');
    if (!columns?.length) return;

    await Promise.allSettled(
      Array.from(columns).flatMap(column => [
        ...Array.from(column.querySelectorAll(widgetClasses)).flatMap(widget => [
          createWidgetResult({ widget, query, callId, pageTitle, listSelector: 'ul.list', itemSelector: ':scope > li' }),
          createWidgetResult({ widget, query, callId, pageTitle, listSelector: 'ul.dynamic-columns', itemSelector: ':scope > .monitor-site, .docker-container, .flex' }),
          createWidgetResult({ widget, query, callId, pageTitle, listSelector: '.cards-horizontal', itemSelector: ':scope > .card' }),
          createWidgetResult({ widget, query, callId, pageTitle, listSelector: '.cards-vertical', itemSelector: ':scope > .widget-content-frame' }),
        ]),
        ...Array.from(column.querySelectorAll('.glimpsable-custom')).map(widget =>
          createWidgetResult({ widget, query, callId, pageTitle, listSelector: '[glimpse-list]' })
        ),
        ...Array.from(column.querySelectorAll('.glimpsable-custom-list')).map(widget =>
          createWidgetResult({ widget, query, callId, pageTitle, listSelector: '[glimpse-list]', itemSelector: '[glimpse-item]' })
        )
      ])
    );
  }


  async function otherPageScrape({ slug, query, callId }) {
    return new Promise(async (resolve) => {
      if (callId !== lastCallId) return resolve();

      const targetPathname = `/${slug}`;
      if (windowPathname === '/' && mainPagePath === targetPathname) return resolve();
      if (targetPathname === '/' + currentPathList[currentPathList.length - 1]) return resolve();

      const existingIframe = iframeBySlug[slug];
      if (existingIframe) {
        await docSearch(existingIframe.contentDocument, slug);
        return resolve();
      }

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = targetPathname;
      glimpse.appendChild(iframe);
      iframeBySlug[slug] = iframe;

      iframe.onerror = () => {
        delete iframeBySlug[slug];
        resolve();
      };

      iframe.onload = async () => {
        await docSearch(iframe.contentDocument, slug);
        resolve();
      };
    });

    async function docSearch(doc, s) {
      if (doc.title.includes('404') || !doc.querySelector('#page-content')) {
        delete iframeBySlug[s];
        return;
      }

      while (!doc.body.classList.contains('page-columns-transitioned')) {
        if (callId !== lastCallId) return;
        await new Promise(r => setTimeout(r, 50));
        if (!iframeBySlug[s]) break;
      }

      await searchScrape({ contentElement: doc.querySelector('#page-content'), query, callId, pageTitle: doc.querySelector('#page>h1')?.innerText || '' });
    }
  }

  function cleanupAllIframes() {
    if (!glimpseConfigCopy.cleanupOtherPages) return;
    glimpseConfigCopy.pagesSlug.forEach(slug => {
      const iframe = iframeBySlug[slug];
      if (!iframe) return;
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      delete iframeBySlug[slug];
    });
  }

  async function showSearchSuggestion({ query, controller }) {
    if (!glimpseConfigCopy.searchSuggestEndpoint) return;

    const loadingAnimationClone = loadingAnimationElement.cloneNode(true);
    loadingAnimationClone.style.flex = 1;
    searchSuggestContainer.innerHTML = '';
    searchSuggestContainer.appendChild(loadingAnimationClone);

    try {
      const getSuggestion = await fetch(glimpseConfigCopy.searchSuggestEndpoint + encodeURIComponent(query), { signal: controller.signal });
      const result = await getSuggestion.json();
      if (!result?.[1].length) return;
      const searchEngine = glimpseConfigCopy.glanceSearch.searchUrl.replace('!QUERY!', '').replace('{QUERY}', '');
      const searchSuggestList = document.createElement('ul');
      searchSuggestList.innerHTML = `
        ${result[1].map(r => {
        const suggestLink = searchEngine ? searchEngine + encodeURIComponent(r) : '#';
        const target = searchEngine ? '_blank' : '';
        return `
            <li>
              <a href="${suggestLink}" target="${target}" rel="noreferrer">${r}</a>
            </li>`}).join('')
        }
      `;
      searchSuggestContainer.replaceChildren(searchSuggestList);
    } catch (e) {
      window.showToast?.(`Glimpse search suggest error, see logs for more info`, { type: 'error' });
      console.error(e);
      controller.abort();
      return new Promise.reject();
    }
  }

  async function createWidgetResult({ widget, query, callId, pageTitle, listSelector, itemSelector }) {
    return new Promise((resolve) => {
      if (callId !== lastCallId) return resolve();
      const headerSource = widget.querySelector('.widget-header > h2')?.innerText;
      const widgetContent = widget.querySelector('.widget-content');
      const widgetContentClone = sanitizeWidgetContent(widgetContent);
      const ulLists = widgetContentClone.querySelectorAll(listSelector);
      if (!ulLists.length) return resolve();

      const resultSearch = [...ulLists].flatMap(ul => {
        const items = itemSelector ? ul.querySelectorAll(itemSelector) : [ul];
        return [...items].filter(el =>
          (el?.innerText || '')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            .includes(query)
        );
      });
      if (!resultSearch.length) return resolve();

      const newTitle = headerSource
        ?? document.getElementById(widgetContent.closest('.widget-group-content')?.getAttribute('aria-labelledby'))?.innerText
        ?? '';

      const newWidget = createElementFn({
        classes: 'widget',
        children:[
          {
            classes: 'widget-header',
            children: [
              {
                tag: 'h2',
                classes: 'uppercase',
                htmlContent: newTitle ? `${pageTitle} <span class="color-primary">→</span> ${newTitle}`: pageTitle
              }
            ]
          }
        ]
      });

      widgetContentClone.innerHTML = '';
      newWidget.appendChild(widgetContentClone);

      const ulClone = ulLists[0].cloneNode(true);
      ulClone.innerHTML = '';
      ulClone.removeAttribute('data-collapse-after');
      ulClone.classList.add('container-expanded');
      ulClone.classList.remove('widget-content');
      ulClone.classList.remove('widget-content-frame');
      ulClone.style.display = getComputedStyle(ulClone).display === 'none' ? 'block' : getComputedStyle(ulClone).display;
      if (ulClone.hasAttribute('responsive-table')) {
        ulClone.style.display = 'block';
        ulClone.style.setProperty('--table-columns', ulClone.firstElementChild.children.length);
      }
      newWidget.querySelector('.widget-content').appendChild(ulClone);
      if (widget.classList.contains('privacy-overlay')) newWidget.querySelector('.widget-content').classList.add('privacy-overlay');

      resultSearch.forEach((el, i) => {
        const clone = el.cloneNode(true);
        clone.classList.add('collapsible-item');
        clone.style.setProperty('animation-delay', `${i * 20}ms`);
        clone.querySelectorAll('img').forEach(img => {
          img.removeAttribute('loading');
          if (!!window.lazyUnloaderInit) window.lazyUnloaderInit(img);
        });
        ulClone.appendChild(clone);
      });

      const uniqueWidget = Array.from(widget.classList).find(cls => cls.startsWith('glimpse-unique-'));
      if (uniqueWidget) {
        if (!uniqueStore.some(u => u === uniqueWidget)) {
          uniqueStore.push(uniqueWidget);
          glimpseResult.appendChild(newWidget);
        }
      } else {
        glimpseResult.appendChild(newWidget);
      }
      resolve();
    });
  }

  function sanitizeWidgetContent(element) {
    const newElement = element.cloneNode(true);
    newElement.querySelectorAll('div[data-popover-type]').forEach(e => {
      const fragment = document.createDocumentFragment();
      [...e.children].forEach(child => {
        if (!child.hasAttribute('data-popover-html')) fragment.appendChild(child);
      });
      e.replaceWith(fragment);
    });
    newElement.querySelectorAll('[custom-modal]').forEach(e => {
      const fragment = document.createDocumentFragment();
      [...e.children].forEach(child => {
        if (!child.hasAttribute('modal-header') && !child.hasAttribute('modal-body') && !child.hasAttribute('modal-footer')) {
          fragment.appendChild(child);
        }
      });
      e.replaceWith(fragment);
    });
    return newElement;
  }

  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));

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
      actionFn: () => spawnGlimpse(),
      order: 1,
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
    if (!localStorage.getItem(configKey)) {
      localStorage.setItem(configKey, JSON.stringify(glimpseConfig));
      console.info('Glimpse Local Storage configuration initialized.');
    }
    const storedGlimpseConfig = JSON.parse(localStorage.getItem(configKey));
    customSettingsFunctions.createCustomSettingsItem?.({
      name: 'Glimpse',
      order: 1,
      contentObject: [
        { type: 'text', name: 'Load configuration from Path/URL', key: 'glimpse-configuration-url', value: localStorage.getItem(configPathKey) || '', colOffset: 1,
          icon: `
            <svg viewBox="0 0 24 24" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12ZM12 6.25C12.4142 6.25 12.75 6.58579 12.75 7V12.1893L14.4697 10.4697C14.7626 10.1768 15.2374 10.1768 15.5303 10.4697C15.8232 10.7626 15.8232 11.2374 15.5303 11.5303L12.5303 14.5303C12.3897 14.671 12.1989 14.75 12 14.75C11.8011 14.75 11.6103 14.671 11.4697 14.5303L8.46967 11.5303C8.17678 11.2374 8.17678 10.7626 8.46967 10.4697C8.76256 10.1768 9.23744 10.1768 9.53033 10.4697L11.25 12.1893V7C11.25 6.58579 11.5858 6.25 12 6.25ZM8 16.25C7.58579 16.25 7.25 16.5858 7.25 17C7.25 17.4142 7.58579 17.75 8 17.75H16C16.4142 17.75 16.75 17.4142 16.75 17C16.75 16.5858 16.4142 16.25 16 16.25H8Z" fill="fillColor"></path> </g></svg>
          `,
        },
        { type: 'text', name: 'Search URL', key: 'glanceSearch.searchUrl', value: storedGlimpseConfig.glanceSearch.searchUrl, colOffset: 1 },
        { type: 'text', name: 'Search Suggest Endpoint', key: 'searchSuggestEndpoint', value: storedGlimpseConfig.searchSuggestEndpoint, colOffset: 1,
          tooltip: 'Search Suggest/Autocomplete endpoint. May not work most of the time, only tested with Whoogle https://your-whoogle-domain.com/autocomplete?q='
        },
        { type: 'text', name: 'Search Placeholder', key: 'glanceSearch.placeholder', value: storedGlimpseConfig.glanceSearch.placeholder, colOffset: 2 },
        { type: 'dropdown', name: 'Search Target', key: 'glanceSearch.target', value: storedGlimpseConfig.glanceSearch.target, options: ['_blank', '_self', '_parent', '_top'] },
        { type: 'text', name: 'Shortcut Key', key: 'glimpseKey', value: storedGlimpseConfig.glimpseKey, maxLength: 1 },
        { type: 'toggle', name: 'Show Bang Suggestions', key: 'showBangSuggest', value: storedGlimpseConfig.showBangSuggest },
        { type: 'toggle', name: 'Cleanup Other Pages', key: 'cleanupOtherPages', value: storedGlimpseConfig.cleanupOtherPages, tooltip: 'Cleans other page search on Glimpse close. High resource usage if false.' },
        { type: 'multi-text', name: 'Other Page Search (Slug)', key: 'pagesSlug', value: storedGlimpseConfig.pagesSlug, colOffset: 1, tooltip: 'By default, Glimpse searches only the currently loaded page. To include other pages, set this and include your primary page\'s slug and any additional pages. Slugs are used instead of titles or page names since they can be custom-defined.' },
        { type: 'toggle', name: 'Wait For Glance', key: 'waitForGlance', value: storedGlimpseConfig.waitForGlance },
        { type: 'toggle', name: 'Detect URL', key: 'detectUrl', value: storedGlimpseConfig.detectUrl },
        { type: 'toggle', name: 'Mobile Bottom Search', key: 'mobileBottomSearch', value: storedGlimpseConfig.mobileBottomSearch, tooltip: 'Repositions the search bar and the suggestions to the bottom in mobile view for ease of access.' },
        { type: 'toggle', name: 'Resize On Keyboard', key: 'resizeOnSoftKeyboardOpen', value: storedGlimpseConfig.resizeOnSoftKeyboardOpen, tooltip: 'On most mobile browsers, when a soft keyboard is present, the page will just overlay making the entire content scrollable. This will result in disabled horizontal scroll of content near the soft keyboard. This attempts to fix that by making the content resized instead.' },
        { type: 'toggle', name: 'Auto Close', key: 'autoClose', value: storedGlimpseConfig.autoClose },
        { type: 'toggle', name: 'Preserve Search Query', key: 'preserveQuery', value: storedGlimpseConfig.preserveQuery, tooltip: 'Preserves Query on search.' },
        { type: 'textarea', name: 'Search Bangs (json)', key: 'glanceSearch.bangs', value: JSON.stringify(storedGlimpseConfig.glanceSearch.bangs, null, 2).trim(), colOffset: 1 },
        { type: 'buttons', buttons: [
          { name: 'Restore Defaults', key: 'restore-defaults', negative: true },
          { name: 'Reload Page', key: 'reload-page' },
        ], colOffset: 2 },
        { type: 'custom-html', contentHTML: `
          <div class="flex-1">
            <a class="color-primary visited-indicator" target="_blank" rel="noreferrer" href="https://github.com/ralphocdol/glance-addon-scripts/tree/main/glimpse">
              Project Repository
            </a>
          </div>
          <div class="flex-1">
            <a class="color-primary visited-indicator" target="_blank" rel="noreferrer" href="https://github.com/ralphocdol/glance-addon-scripts">
              Glance Addon Scripts
            </a>
          </div>
        `,
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
          },
        },
      ],
      contentEventListener: {
        setup: () => {
          const toastNotification = typeof window.showToast === 'function' ? window.showToast : (msg => alert(msg));
          const confirmDialog = typeof window.customDialog === 'function' ? msg => window.customDialog(msg, { type: 'confirm' }) : msg => window.confirm(msg);
          const glimpseEl = document.getElementById('glimpse');

          const configPathKey = 'glimpse-config-path-url';
          const configKey = 'glimpse-search-config';
          const storedGlimpseConfig = JSON.parse(localStorage.getItem(configKey));
          const getKeyedElement = key => _SETTING_ELEMENT_.querySelector(`[name="${key}"]`);

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

          async function saveAndReload(config, name, value) {
            if (await confirmDialog('Save changes and reload?')) {
              setAndSave(config, name, value);
              location.reload();
            } else {
              setValuesWithConfig(storedGlimpseConfig);
            }
          }

          const cardElement = type => Array.from(_SETTING_ELEMENT_.childNodes).filter(e => e.classList.contains(type));
          const findElementByCardAndName = (card, name) => cardElement(card).find(e => e.querySelector(`[name="${name}"]`));

          function setValuesWithConfig(config) {
            getKeyedElement('glanceSearch.searchUrl').value = config.glanceSearch.searchUrl;
            getKeyedElement('searchSuggestEndpoint').value = config.searchSuggestEndpoint;
            getKeyedElement('glanceSearch.target').value = config.glanceSearch.target;
            getKeyedElement('glanceSearch.placeholder').value = config.glanceSearch.placeholder;
            getKeyedElement('glimpseKey').value = config.glimpseKey;
            getKeyedElement('showBangSuggest').checked = config.showBangSuggest;
            getKeyedElement('cleanupOtherPages').checked = config.cleanupOtherPages;
            getKeyedElement('pagesSlug').value = config.pagesSlug;
            getKeyedElement('waitForGlance').checked = config.waitForGlance;
            getKeyedElement('detectUrl').checked = config.detectUrl;
            getKeyedElement('mobileBottomSearch').checked = config.mobileBottomSearch;
            getKeyedElement('resizeOnSoftKeyboardOpen').checked = config.resizeOnSoftKeyboardOpen;
            getKeyedElement('autoClose').checked = config.autoClose;
            getKeyedElement('preserveQuery').checked = config.preserveQuery;
            getKeyedElement('glanceSearch.bangs').value = JSON.stringify(config.glanceSearch.bangs, null, 2).trim();
          }
        },
        ready: () => {
          setValuesWithConfig(storedGlimpseConfig);
        },
        click: async e => {
          const target = e.target;
          const keyEl = getKeyedElement(target.dataset.key);

          if (target.dataset.key === 'glimpse-configuration-url') {
            if (keyEl.value && await confirmDialog('Downloading configuration, this will replace your existing one, proceed?')) {
              try {
                localStorage.setItem(configPathKey, keyEl.value);
                const getUrlConfig = await fetch(customSettingsFunctions.buildFetchUrl(keyEl.value));
                const urlConfig = await getUrlConfig.json();
                localStorage.setItem(configKey, JSON.stringify(urlConfig));
                window.showToast?.('Glimpse Configuration successfully loaded.', { type: 'success' });
                setTimeout(() => location.reload(), 1000);
              } catch (err) {
                window.showToast?.('Failed to fetch configuration, see logs.', { type: 'error' });
                console.error(err);
              }
              return;
            }
          }

          if (target.dataset.key === 'glanceSearch.searchUrl') {
            const targetEl = glimpseEl.querySelector('.glimpse-search .search');
            targetEl.dataset.defaultSearchUrl = keyEl?.value;
            setAndSave(storedGlimpseConfig, keyEl?.name, keyEl?.value);
            return;
          }

          if (target.dataset.key === 'glanceSearch.placeholder') {
            const targetEl = glimpseEl.querySelector('.glimpse-search .search-input');
            targetEl.placeholder = keyEl?.value;
            setAndSave(storedGlimpseConfig, keyEl?.name, keyEl?.value);
            return;
          }

          if (target.dataset.key === 'mobileBottomSearch') {
            const targetEl = glimpseEl.querySelector('.glimpse-wrapper');
            targetEl.classList.toggle('bottom-search', keyEl?.checked);
            setAndSave(storedGlimpseConfig, keyEl?.name, keyEl?.checked);
            return;
          }

          try {
            if (findElementByCardAndName('card-toggle', keyEl?.name) !== undefined) {
              saveAndReload(storedGlimpseConfig, keyEl?.name, keyEl?.checked);
            }
            if (findElementByCardAndName('card-text', keyEl?.name)) {
              saveAndReload(storedGlimpseConfig, keyEl?.name, keyEl?.value);
            }

            if (findElementByCardAndName('card-multi-text', keyEl?.name)) {
              saveAndReload(storedGlimpseConfig, keyEl?.name, keyEl?.value?.split(','));
            }

            if (keyEl?.name === 'glanceSearch.bangs') {
              saveAndReload(storedGlimpseConfig, keyEl?.name, JSON.parse(keyEl?.value));
            }

            if (target.dataset.key === 'restore-defaults') {
              if (await confirmDialog('Restoring configuration to default, are you sure about this?')) {
                localStorage.removeItem(configKey);
                location.reload();
              }
            }

            if (target.dataset.key === 'reload-page') {
              if (await confirmDialog('Reload page?')) location.reload();
            }
          } catch(e) {
            toastNotification('Error in configuration: ' + keyEl?.name + ', see logs for more info.`', { type: 'error' });
            console.error(e);
          }
        },
        change: async e => {
          const target = e.target;
          const keyEl = getKeyedElement(target.dataset.key);

          if (target.dataset.key === 'glanceSearch.target') {
            saveAndReload(storedGlimpseConfig, keyEl?.name, keyEl?.value);
            return;
          }
        }
      }
    });
  }

  function createNavElement() {
    return createElementFn({
      attrs: { title: 'Launch Glimpse' },
      htmlContent: icon,
      events: {
        click: () => spawnGlimpse()
      }
    });
  }
});