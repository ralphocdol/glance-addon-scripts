(() => {
  // Sort stuff
  const colSorted = [];
  const colSortedDirection = [];

  // Pagination stuff
  const data = [];
  const dataTable = [];
  const dataPage = [];
  const dataPageLimit = [];
  const isPaginate = [];

  document.querySelectorAll('[responsive-table]').forEach((t, t_index) => {
    const header = t.querySelector('[table-header]');
    if (!header) return console.error('Missing Required: table-header');
    const body = t.querySelector('[table-body]');
    if (!body) return console.error('Missing Required: table-body');
    const rows = body.querySelectorAll('[table-row]');
    if (!rows) return console.error('Missing Required: table-rows');

    data[t_index] = Array.from(rows, r => r.cloneNode(true));
    const rowsData = data[t_index];
    body.innerHTML = '';

    const headerCells = [...header.children];

    const totalColumns = headerCells.length;
    t.style.setProperty('--table-columns', totalColumns);

    const template = headerCells.map(h => (h.dataset.width || '1') + 'fr');
    header.style.setProperty('--table-template', template.join(' '));

    colSorted[t_index] = 0;
    colSortedDirection[t_index] = 'asc';

    const enablePaginate = true;
    isPaginate[t_index] = enablePaginate && t.hasAttribute('paginate');
    if (isPaginate[t_index]) {
      body.classList.remove('list', 'collapsible-container');
      delete body.dataset.collapseAfter;
      t.querySelector('button.expand-toggle-button')?.remove();

      data[t_index] = Array.from(rowsData, r => {
        r.classList.remove('collapsible-item');
        r.style.removeProperty('animation-delay');
        return r;
      });
      
      dataPageLimit[t_index] = t.getAttribute(window.matchMedia('(max-width: 768px)').matches ? 'row-limit-mobile' : 'row-limit') || t.getAttribute('row-limit') || 10;

      body.innerHTML = '';
      dataTable[t_index] = data[t_index].slice(0, dataPageLimit[t_index]);
      dataPage[t_index] = 1;

      createPagination({ t, t_index, header, headerCells, body, template })
    }
    setupTable({ t, t_index, header, headerCells, body, template });
    setupMobileSort({ headerCells, t, t_index, body });

    header.addEventListener('click', e => {
      const h = e.target.closest('[sortable]');
      if (!h) return;

      colSorted[t_index] = [...h.parentElement.children].indexOf(h);
      colSortedDirection[t_index] = h.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
      h.dataset.sortDirection = colSortedDirection[t_index];

      sortTable({ t, t_index, body });
    });

    t.style.display = 'block';
    t.classList.add('show');

    body.style.minHeight = body.offsetHeight + 'px';
  });

  function setupTable({ t, t_index, header, headerCells, body, template }) {
    updateRows({ t_index, header, headerCells, template });

    const sortable = header.querySelectorAll('[sortable]');
    const sorted = [...sortable].some(h => h.hasAttribute('data-sort-direction'));
    if (sorted) return sortTable({ t, t_index, body });

    for (const h of sortable) {
      const defaultDirection = h.hasAttribute('sort-default-asc') ? 'asc' :
        h.hasAttribute('sort-default-desc') ? 'desc' : 'none';
      h.dataset.sortDirection = defaultDirection;

      if (defaultDirection !== 'none') {
        colSorted[t_index] = [...h.parentElement.children].indexOf(h);
        colSortedDirection[t_index] = defaultDirection;
        sortTable({ t, t_index, body });
        break;
      }
    }
  }

  function updateRows({ t_index, header, headerCells, template }) {
    const headerList = headerCells.map(h => h.innerText.trim());
    data[t_index].forEach(r => {
      const children = r.children;
      const headerList = headerCells.map(h => h.innerText.trim());

      // only one 'data-as-mobile-title'
      const withTitle = [...children].filter(c => c.hasAttribute('data-as-mobile-title'));
      if (withTitle.length > 1) {
        withTitle.slice(1).forEach(c => c.removeAttribute('data-as-mobile-title'));
      } else if (withTitle.length === 0 && children.length > 0) {
        children[0].dataset.asMobileTitle = '';
      }

      // mobile detail summary
      if (!r.querySelector('.responsive-table-details')) {
        const details = document.createElement('details');
        details.className = 'details margin-top-5 responsive-table-details';

        const summary = document.createElement('summary');
        summary.className = 'summary';
        summary.innerText = 'More';

        const ul = document.createElement('ul');
        ul.className = 'list list-with-transition size-h5';
        r.style.setProperty('--table-template', template.join(' '));

        [...children].forEach((c, i) => {
          c.dataset.label = c.dataset.label || headerList[i] || '';
          if (c.hasAttribute('data-show-on-mobile') || c.hasAttribute('data-as-mobile-title')) return;

          const li = document.createElement('li');
          li.className = 'flex justify-between gap-55';
          li.innerHTML = `
            <div class="rtl color-highlight nowrap">${c.dataset.label}</div>
            <div class="text-right text-truncate" title="${c.innerText.trim().replace(/\s+/g, " ")}">
              ${c.innerText.trim()}
            </div>
          `;
          ul.appendChild(li);
        });

        details.appendChild(ul);
        details.appendChild(summary);
        r.appendChild(details);
      }

      // collapsed-column-details
      if (!r.querySelector('.collapsed-column-details')) {
        let hasCollapsed = false;

        const collapseContainer = document.createElement('div');
        [...children[0].attributes].forEach(attr => collapseContainer.setAttribute(attr.name, attr.value));
        if (!collapseContainer.hasAttribute('data-to-sort')) collapseContainer.dataset.toSort = children[0].innerText.trim();

        const details = document.createElement('details');
        details.className = 'details collapsed-column-details';

        const summary = document.createElement('summary');
        summary.classList.add('text-truncate');
        summary.title = children[0].innerText.trim().replace(/\s+/g, " ");
        summary.innerText = children[0].textContent.trim();

        const ul = document.createElement('ul');
        ul.className = 'list list-with-transition size-h5';

        let widest = '1fr';
        [...children].forEach((c, i) => {
          c.dataset.label = c.dataset.label || headerList[i] || '';
          if (!c.hasAttribute('data-as-collapsed-column')) return;

          hasCollapsed = true;

          const li = document.createElement('li');
          li.className = 'flex justify-between gap-55';

          const divLabel = document.createElement('div');
          divLabel.classList.add('rtl', 'color-highlight', 'nowrap');
          divLabel.textContent = c.dataset.label;
          li.appendChild(divLabel);

          const divContent = document.createElement('div');
          [...c.attributes].forEach(attr => {
            if (['style', 'class'].includes(attr.name)) {
              divContent.setAttribute(attr.name, attr.value)
            }
          });
          divContent.classList.add('text-right', 'text-truncate');
          divContent.title = c.innerText.trim().replace(/\s+/g, " "); // workaround text-truncate
          divContent.innerHTML = c.innerHTML;
          li.appendChild(divContent);

          ul.appendChild(li);
          headerCells[i].dataset.asCollapsedHeader = '';
          template[i] = '0fr';
        });
        
        if (hasCollapsed) {
          details.appendChild(ul);
          details.appendChild(summary);
          collapseContainer.appendChild(details);
          r.replaceChild(collapseContainer, children[0]);

          const sanitizedTemplate = template.filter(v => v !== '0fr');
          header.style.setProperty('--table-template', sanitizedTemplate.join(' '));
          r.style.setProperty('--table-template', sanitizedTemplate.join(' '));
        }
      }
    });
  }

  function sortTable({ t, t_index, body }) {
    const col = colSorted[t_index];
    const direction = colSortedDirection[t_index];
    const sorted = [...data[t_index]].sort((a, b) => {
      const x = a.children[col]?.dataset.toSort || a.children[col]?.innerText.trim() || '';
      const y = b.children[col]?.dataset.toSort || b.children[col]?.innerText.trim() || '';
      const nx = isNaN(x) ? x.toLowerCase() : +x;
      const ny = isNaN(y) ? y.toLowerCase() : +y;
      return nx > ny ? (direction === 'asc' ? 1 : -1) : nx < ny ? (direction === 'asc' ? -1 : 1) : 0;
    });

    const collapseAfter = body.dataset.collapseAfter;
    let delay = 0;
    sorted.forEach((r, i) => {
      if (i > collapseAfter - 1) {
        r.classList.add('collapsible-item');
        r.style.setProperty('animation-delay', `${delay}ms`);
        delay += 20;
      } else {
        r.classList.remove('collapsible-item');
        r.style.removeProperty('animation-delay');
      }
      body.appendChild(r);
    });

    data[t_index] = sorted;

    if (isPaginate[t_index]) {
      data[t_index] = Array.from(sorted, r => {
        r.classList.remove('collapsible-item');
        r.style.removeProperty('animation-delay');
        return r;
      });

      body.innerHTML = '';
      const start = (dataPage[t_index] - 1) * dataPageLimit[t_index];
      const end = start + +dataPageLimit[t_index];
      dataTable[t_index] = data[t_index].slice(start, end);
      dataTable[t_index].forEach(row => body.appendChild(row));
    }

    const mobileSortElement = document.getElementById('responsive-table-mobile-sort-select-' + t_index);
    const mobileSortDirectionElement = document.querySelector('#table-sort-direction-' + t_index);

    // Sync Sort
    t.querySelector('[table-header]').querySelectorAll('[sortable]').forEach((thead, i) => {
      thead.dataset.sortDirection = 'none';
      if (i === colSorted[t_index]) thead.dataset.sortDirection = colSortedDirection[t_index];

      if (mobileSortElement) mobileSortElement.querySelector(`option[value="${colSorted[t_index]}"]`).selected = true;
      if (mobileSortDirectionElement) mobileSortDirectionElement.dataset.sortDirection = colSortedDirection[t_index];
    });
  }

  function createMobileSortOption(text, value, selected) {
    const option = document.createElement('option');
    option.value = value;
    option.text = text;
    option.selected = selected;
    return option;
  }

  function createMobileSortBtn(direction, t_index, onClick) {
    const btn = document.createElement('div');
    btn.className = 'table-sort-direction'
    btn.id = 'table-sort-direction-' + t_index;
    btn.dataset.sortDirection = direction;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function setupMobileSort({ headerCells, t, t_index, body }) {
    const mobileSortContainer = document.createElement('div');
    mobileSortContainer.className = 'table-sort'

    const label = document.createElement('label');
    label.textContent = 'Sort by:';
    label.htmlFor = 'responsive-table-mobile-sort-select-' + t_index;

    let locked = false; // Just need to prevent spam glitches -_-
    const directionBtn = createMobileSortBtn(colSortedDirection[t_index], t_index, e => {
      if (locked) return;
      locked = true;
      const target = e.currentTarget;
      const direction = colSortedDirection[t_index] === 'asc' ? 'desc' : 'asc';
      colSortedDirection[t_index] = direction;
      directionBtn.dataset.sortDirection = direction;

      colSorted[t_index] = parseInt(mobileSort.value, 10);
      if (!isNaN(colSorted[t_index])) sortTable({ t, t_index, body });
      setTimeout(() => locked = false, 100);
    });

    const mobileSort = document.createElement('select');
    mobileSort.className = 'table-sort-option'
    mobileSort.id = 'responsive-table-mobile-sort-select-' + t_index;

    mobileSort.innerHTML = '<option disabled selected>Sort by...</option>';
    headerCells.forEach((c, i) => {
      if (c.hasAttribute('data-as-collapsed-header')) return;
      mobileSort.appendChild(createMobileSortOption(c.innerText.trim(), i, i === colSorted[t_index]));
    });

    label.appendChild(mobileSort);
    mobileSortContainer.prepend(label);
    mobileSortContainer.appendChild(directionBtn);
    t.prepend(mobileSortContainer);

    mobileSort.addEventListener('change', () => {
      colSorted[t_index] = parseInt(mobileSort.value, 10);
      sortTable({ t, t_index, body });
    });
  }

  // #region ----------------------------------- PAGINATION --------------------------------------
  function createPagination({ t, t_index, header, headerCells, body, template }) {
    const container = document.createElement('div');
    container.className = 'pagination-container';

    const summary = document.createElement('div');
    summary.className = 'pagination-summary';
    container.appendChild(summary);

    const pagination = document.createElement('div');
    pagination.className = 'pagination-buttons';
    container.appendChild(pagination);

    t.appendChild(container);

    updatePaginationSummary(summary, t_index);
    updatePaginationButtons(pagination, { t, t_index, header, headerCells, body, template });
  }

  function updatePage({ t, t_index, header, headerCells, body, template }) {
    const start = (dataPage[t_index] - 1) * dataPageLimit[t_index];
    const end = start + +dataPageLimit[t_index];
    dataTable[t_index] = data[t_index].slice(start, end);

    body.innerHTML = '';
    setupTable({ t, t_index, header, headerCells, body, template });

    const summary = t.querySelector('.pagination-summary');
    const pagination = t.querySelector('.pagination-buttons');
    updatePaginationSummary(summary, t_index);
    updatePaginationButtons(pagination, { t, t_index, header, headerCells, body, template });
  }

  function updatePaginationSummary(summaryEl, t_index) {
    const start = (dataPage[t_index] - 1) * dataPageLimit[t_index] + 1;
    const end = Math.min(dataPage[t_index] * dataPageLimit[t_index], data[t_index].length);
    summaryEl.textContent = `Showing ${start} to ${end} of ${data[t_index].length} entries`;
  }

  function updatePaginationButtons(container, { t, t_index, header, headerCells, body, template }) {
    container.innerHTML = '';
    const totalPages = Math.ceil(data[t_index].length / dataPageLimit[t_index]);
    const current = dataPage[t_index];

    if (totalPages <= 1) return;

    function createBtn(page, isActive = false) {
      const btn = document.createElement('button');
      btn.textContent = page;
      btn.className = 'page-btn';
      if (isActive) btn.classList.add('active');
      btn.addEventListener('click', () => {
        dataPage[t_index] = page;
        updatePage({ t, t_index, header, headerCells, body, template });
      });
      return btn;
    }

    function addEllipsis() {
      const span = document.createElement('span');
      span.className = 'page-ellipsis';
      span.textContent = '...';
      container.appendChild(span);
    }

    // Back Button
    const backBtn = document.createElement('button');
    backBtn.textContent = '←';
    backBtn.className = 'page-btn';
    backBtn.disabled = current === 1;
    backBtn.addEventListener('click', () => {
      if (current > 1) {
        dataPage[t_index]--;
        updatePage({ t, t_index, header, headerCells, body, template });
      }
    });
    container.appendChild(backBtn);

    // Page Buttons
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (current >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
    }

    for (const p of pages) {
      if (p === '...') addEllipsis();
      else container.appendChild(createBtn(p, p === current));
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.className = 'page-btn';
    nextBtn.disabled = current === totalPages;
    nextBtn.addEventListener('click', () => {
      if (current < totalPages) {
        dataPage[t_index]++;
        updatePage({ t, t_index, header, headerCells, body, template });
      }
    });
    container.appendChild(nextBtn);
  }
  // #endregion-----------------------------------------------------------------------------------
})();