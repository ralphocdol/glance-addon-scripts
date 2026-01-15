(() => {
  $include: config.js
  const configKey = 'glimpse-search-config';
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
          <input class="search-input" type="text" placeholder="${glimpseConfigCopy.glanceSearch.placeholder}" autocomplete="off" autofocus="${glimpseConfigCopy.glanceSearch.autofocus}">
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

  const loadingAnimationElement = document.createElement('div');
  loadingAnimationElement.className = 'custom-page-loading-container';
  loadingAnimationElement.innerHTML = `
    <div class="visually-hidden">Loading</div>
    <div class="loading-icon" aria-hidden="true"></div>
  `;

  if (glimpseConfigCopy.resizeOnSoftKeyboardOpen) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, interactive-widget=resizes-content';
    document.head.appendChild(meta);
  }

  const mainPagePath = Array.from(document.querySelectorAll('.nav a')).map(a => a.getAttribute('href'))?.[0];
  const windowPathname = window.location.pathname;
  const currentPathList = windowPathname.split('/').filter(p => p !== '');

  const glimpse = document.createElement('div');
  glimpse.id = 'glimpse';
  glimpse.className = 'widget-exclude-swipe';
  glimpse.style.display = 'none';
  glimpse.innerHTML = `
    <div class="glimpse-wrapper">
      <div class="glimpse-search widget widget-type-search"></div>
      <div class="glimpse-result"></div>
    </div>
  `;
  document.body.appendChild(glimpse);

  if (glimpseConfigCopy.autoClose) {
    glimpse.addEventListener('click', e => {
      if (!e.target.closest('a')) return;
      closeGlimpse();
    });
  }

  const bodyOverflowState = document.body.style.overflow;
  const glimpseSearch = document.querySelector('#glimpse .glimpse-search');
  [...search.childNodes].forEach(child => glimpseSearch.appendChild(child.cloneNode(true)));

  const glimpseSearchSuggestContainer = document.createElement('div');
  glimpseSearchSuggestContainer.classList.add('glimpse-search-suggest-container', 'flex', 'flex-column');
  glimpseSearch.appendChild(glimpseSearchSuggestContainer);

  const closeBtnElement = document.createElement('span');
  closeBtnElement.className = 'close';
  closeBtnElement.addEventListener('click', e => closeGlimpse());
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
    const searchBangContainer = document.createElement('div');
    searchBangContainer.className = 'glimpse-bang-suggest';
    searchBangContainer.innerHTML = ``;
    glimpseSearchSuggestContainer.appendChild(searchBangContainer);
    searchBangContainer.style.display = 'none';
    if (glimpseConfigCopy.glanceSearch?.bangs.length > 0) {
      searchBangContainer.style.display = 'flex';
      const searchBangItems = document.createElement('ul');

      searchBangItems.addEventListener('click', e => {
        const targetElement = e.target.closest('.glimpse-bang-item');
        if (!targetElement || !searchBangItems.contains(targetElement)) return;
        searchInput.value = searchInput.value.replace(getBangRegExp, '');
        searchInput.value = targetElement.dataset.shortcut + ' ' + searchInput.value.trim();
        glanceBang.textContent = targetElement.dataset.title;
        searchInput.focus();
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      });

      searchBangItems.innerHTML = glimpseConfigCopy.glanceSearch.bangs
        .map(b => `<li>
            <span class="glimpse-bang-item" data-shortcut="${b.shortcut}" data-title="${b.title}">
              ${b.shortcut} <span class="color-subdue">(${b.title})</span>
            </span>
        </li>`)
        .join('');

      searchBangContainer.replaceChildren(searchBangItems);
    }
  }

  const emptySearchSuggest = msg => `<span style="padding: 3px 15px; margin: 3px 0;">${msg ?? 'No suggestions…'}</span>`;
  const searchSuggestContainer = document.createElement('div');
  searchSuggestContainer.className = 'glimpse-search-suggest';
  searchSuggestContainer.innerHTML = emptySearchSuggest();
  glimpseSearchSuggestContainer.appendChild(searchSuggestContainer);
  searchSuggestContainer.style.display = showSearchSuggest ? 'flex' : 'none';

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

  $include: spawn.js

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

      const newWidget = document.createElement('div');
      newWidget.className = 'widget';
      newWidget.innerHTML = `<div class="widget-header"><h2 class="uppercase"></h2></div>`;

      const header = newWidget.querySelector('h2');
      const newTitle = headerSource
        ?? document.getElementById(widgetContent.closest('.widget-group-content')?.getAttribute('aria-labelledby'))?.innerText
        ?? '';

      header.innerHTML = newTitle ? `${pageTitle} <span class="color-primary">→</span> ${newTitle}`: pageTitle;

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
})();