
(() => {
  // -------------------------------- USER DEFINED ----------------------------------
  const glanceSearch = { 
    searchUrl: 'https://duckduckgo.com/?q={QUERY}',
    newTab: false,
    autofocus: false,
    target: '_blank',
    placeholder: 'Type here to search…',
    bangs: [
      { title: '', shortcut: '', url: '' }, // duplicate as needed
    ]
  };
  const showBangSuggest = true; // Suggests the search bang list
  const searchSuggestEndpoint = '';
  const pagesSlug = [ // Other page search may or may not work due to limitations, and can be slow
    // 'home-page',
    // 'page-1',
    // 'page-2',
  ];
  const cleanupOtherPages = true; // Warning: setting this to false is like having (# of pagesSlug) tabs opened all at once
  const glimpseKey = '';
  const waitForGlance = true;
  const detectUrl = true; // Make sure to set to false if https://github.com/glanceapp/glance/issues/229 is addressed.
  // --------------------------------------------------------------------------------

  const replaceBraces = str => str.replace(/[{}]/g, '!');
  const glanceSearchWidget = `
    <div class="widget widget-type-search">
      <div class="widget-header">
        <h2 class="uppercase">Search</h2>
      </div>
      <div class="widget-content widget-content-frameless">
        <div class="search widget-content-frame padding-inline-widget flex gap-15 items-center" 
          data-default-search-url="${replaceBraces(glanceSearch.searchUrl)}" data-new-tab="${glanceSearch.newTab}" data-target="${glanceSearch.target}">
          <div class="search-bangs">
            ${glanceSearch.bangs.map(b => `<input type="hidden" data-shortcut="${b.shortcut}" data-title="${b.title}" data-url="${replaceBraces(b.url)}">`)}
          </div>
          <div class="search-icon-container">
            <svg class="search-icon" stroke="var(--color-text-subdue)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
            </svg>
          </div>
          <input class="search-input" type="text" placeholder="${glanceSearch.placeholder}" autocomplete="off" autofocus="${glanceSearch.autofocus}">
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

  const uniqueStore = [];

  const loadingAnimationElement = document.createElement('div');
  loadingAnimationElement.className = 'custom-page-loading-container';
  loadingAnimationElement.innerHTML = `
    <div class="visually-hidden">Loading</div>
    <div class="loading-icon" aria-hidden="true"></div>
  `;

  const mainPagePath = Array.from(document.querySelectorAll('.nav a')).map(a => a.getAttribute('href'))?.[0];
  const windowPathname = window.location.pathname;
  const currentPathList = windowPathname.split('/').filter(p => p !== '');

  const glimpse = document.createElement('div');
  glimpse.id = 'glimpse';
  glimpse.className = 'widget-exclude-swipe';
  glimpse.innerHTML = `
    <div class="glimpse-wrapper">
      <div class="glimpse-search widget widget-type-search"></div>
      <div class="glimpse-result"></div>
    </div>
  `;
  document.body.appendChild(glimpse);

  const bodyOverflowState = document.body.style.overflow;
  const glimpseSearch = document.querySelector('#glimpse .glimpse-search');
  [...search.childNodes].forEach(child => glimpseSearch.appendChild(child.cloneNode(true)));

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

  if (showBangSuggest) {
    const searchBangContainer = document.createElement('div');
    searchBangContainer.className = 'glimpse-bang-suggest';
    searchBangContainer.innerHTML = ``;
    glimpseSearch.appendChild(searchBangContainer);
    const searchBangListContainer = glimpseSearch.querySelector('.glimpse-bang-suggest');
    searchBangListContainer.style.display = 'none';
    if (glanceSearch?.bangs.length > 0) {
      searchBangListContainer.style.display = 'flex';
      const searchBangItems = document.createElement('ul');

      searchBangItems.addEventListener('click', e => {
        const targetElement = e.target.closest('.glimpse-bang-item');
        if (!targetElement || !searchBangItems.contains(targetElement)) return;
        searchInput.value = searchInput.value.replace(new RegExp(glanceSearch.bangs.map(b => '\\' + b.shortcut).join(' |'), 'g'), '');
        searchInput.value = targetElement.dataset.shortcut + ' ' + searchInput.value.trim();
        glanceBang.textContent = targetElement.dataset.title;
        searchInput.focus();
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      });

      searchBangItems.innerHTML = glanceSearch.bangs
        .map(b => `<li>
            <span class="glimpse-bang-item" data-shortcut="${b.shortcut}" data-title="${b.title}">
              ${b.shortcut} <span class="color-subdue">(${b.title})</span>
            </span>
        </li>`)
        .join('');

      searchBangListContainer.replaceChildren(searchBangItems);
    }
  }

  const searchSuggestContainer = document.createElement('div');
  searchSuggestContainer.className = 'glimpse-search-suggest';
  searchSuggestContainer.innerHTML = ``;
  glimpseSearch.appendChild(searchSuggestContainer);
  const searchSuggestListContainer = glimpseSearch.querySelector('.glimpse-search-suggest');
  searchSuggestListContainer.style.display = 'none';

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
    const signal = controller.signal;

    glimpseResult.innerHTML = '';
    if (searchSuggestEndpoint) {
      searchSuggestListContainer.innerHTML = '';
      searchSuggestListContainer.style.display = 'none';
    }
    const query = (e.target.value || '')
      .replace(new RegExp(glanceSearch.bangs.map(b => '\\' + b.shortcut).join(' |'), 'g'), '')
      .trim()
      .toLowerCase();
    if (query.length < 1) {
      loadingAnimationElement.remove();
      return;
    }

    if (detectUrl && isValidUrl(query)) glanceBang.innerText = 'URL';

    glimpseWrapper.appendChild(loadingAnimationElement);
    try {
      await searchScrape({ contentElement: glanceContent, query, callId });
      await Promise.allSettled([
        showSearchSuggestion({ query, signal }),
        ...pagesSlug.map(slug => otherPageScrape({ slug, query, callId }))
      ]);
      uniqueStore.length = 0;
      if (callId !== lastCallId) return;
      if (glimpseResult.innerHTML == '') glimpseResult.innerText = 'No widget found...';
    } catch (err) {
      if (err.name !== 'AbortError') console.error(`Glimpse Error: ${err}`);
    } finally {
      if (callId === lastCallId) loadingAnimationElement.remove();
    }

  }, 300);

  const handleKeydown = e => {
    const query = (e.target.value || '').trim();
    if (query.length < 1) return;
    if (e.key === 'Enter' && isValidUrl(query)) {
      e.stopImmediatePropagation();
      e.target.value = '';
      if (glanceSearch.newTab && !e.ctrlKey || !glanceSearch.newTab && e.ctrlKey) {
        window.open(toUrl(query), '_blank', 'noopener,noreferrer').focus();
      } else {
        window.location.href = toUrl(query);
      }
    }
  }

  searchInput.addEventListener('input', handleInput);
  if (detectUrl) searchInput.addEventListener('keydown', handleKeydown);

  document.addEventListener('keydown', event => {
    const activeElement = document.activeElement;

    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) ||
      activeElement.isContentEditable ||
      activeElement.closest('#glimpse')) {
      return;
    }

    if (glimpseKey && event.code === keyToCode(glimpseKey) && activeElement !== searchInput) {
      event.preventDefault();
      if ((waitForGlance && document.body.classList.contains('page-columns-transitioned')) || !waitForGlance) spawnGlimpse();
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
          createWidgetResult({ widget, query, callId, pageTitle, listSelector: 'ul.list-with-separator', itemSelector: ':scope > .monitor-site, .docker-container' }),
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
    if (!cleanupOtherPages) return;
    pagesSlug.forEach(slug => {
      const iframe = iframeBySlug[slug];
      if (!iframe) return;
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      delete iframeBySlug[slug];
    });
  }

  async function showSearchSuggestion({ query, signal }) {
    if (!searchSuggestEndpoint) return;

    searchSuggestListContainer.style.display = 'flex';
    const loadingAnimationClone = loadingAnimationElement.cloneNode(true);
    loadingAnimationClone.style.flex = 1;
    searchSuggestListContainer.appendChild(loadingAnimationClone);

    const getSuggestion = await fetch(searchSuggestEndpoint + encodeURIComponent(query), { signal });
    const result = await getSuggestion.json();
    if (!result?.[1].length) {
      searchSuggestListContainer.innerHTML = '<span style="padding: 2px 15px;">No suggestion...</span>';
      return;
    }
    const searchEngine = glanceSearch.searchUrl.replace('!QUERY!', '').replace('{QUERY}', '');
    const newWidget = document.createElement('ul');
    newWidget.innerHTML = `
      ${result[1].map(r => {
      const suggestLink = searchEngine ? searchEngine + encodeURIComponent(r) : '#';
      const target = searchEngine ? '_blank' : '';
      return `
          <li>
            <a href="${suggestLink}" target="${target}" rel="noreferrer">${r}</a>
          </li>`}).join('')
      }
    `;
    searchSuggestListContainer.replaceChildren(newWidget);
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
      ulClone.style.display = ulClone.style.display !== 'none' ? ulClone.style.display : 'block';
      newWidget.querySelector('.widget-content').appendChild(ulClone);

      resultSearch.forEach((el, i) => {
        const clone = el.cloneNode(true);
        clone.classList.add('collapsible-item');
        clone.style.setProperty('animation-delay', `${i * 20}ms`);
        clone.querySelectorAll('img').forEach(img => img.removeAttribute('loading'));
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