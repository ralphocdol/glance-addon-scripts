'use strict';
const CURRENT_SCRIPT_TIMESTAMP = new URL(import.meta.url).searchParams.get('v') || '';

document.addEventListener('DOMContentLoaded', async () => {
  // Catch duplicate instances
  const scriptName = 'Responsive Table';
  if ((window.GLANCE_ADDON_SCRIPTS ??= {})[scriptName] === true) {
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { type: 'error' });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  // Catch Missing Dependencies
  const { default: createElementFn } = await import(`../global-functions/CREATE_ELEMENT.js?v=${CURRENT_SCRIPT_TIMESTAMP}`);
  if (typeof createElementFn !== 'function') {
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';

    if (typeof window.showToast === 'function') window.showToast?.(msg, { title: 'CUSTOM SETTINGS', type: 'error' });
    else alert(msg);

    console.error('CREATE_ELEMENT not found');
    return;
  }

  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));

  const maxWidthMedia = window.matchMedia('(max-width: 768px)');
  let restoreAttachedElements = [];

  document.querySelectorAll('template[responsive-table]').forEach((t, t_index) => {
    const templateContent = t.content;
    if (!templateContent) return console.error('Missing Required: template content');

    const headerElement = templateContent.querySelector('[table-header]');
    if (!headerElement) return console.error('Missing Required: table-header');

    const bodyElement = templateContent.querySelector('[table-body]');
    if (!bodyElement) return console.error('Missing Required: table-body');

    const paginationOptions = templateContent.querySelector('[table-pagination-options]');
    if (!paginationOptions) return console.error('Missing Required: table-pagination-options');

    const minHeight = +paginationOptions.getAttribute('min-height') || 120;
    const minHeightMobile = +paginationOptions.getAttribute('min-height-mobile') || 276;
    const newMinHeight = !maxWidthMedia.matches ? minHeight : minHeightMobile;

    const pageSize = +paginationOptions.getAttribute('page-size');
    const pageSizeMobile = +paginationOptions.getAttribute('page-size-mobile') || pageSize;
    const newPageSize = !maxWidthMedia.matches ? pageSize : pageSizeMobile;

    const totalEntries = +paginationOptions.getAttribute('total-entries');
    const totalPage = Math.ceil(totalEntries / pageSize);
    const totalPageMobile = Math.ceil(totalEntries / pageSizeMobile);
    paginationOptions.setAttribute('total-page', totalPage);
    paginationOptions.setAttribute('total-page-mobile', totalPageMobile);
    paginationOptions.setAttribute('current-page', 1);

    const targetPages = { start: 0, end: newPageSize - 1 };
    const tableEl = createElementFn({
      attrs: {
        role: 'table',
        ...inheritAttributes(t)
      },
      style: { minHeight: newMinHeight + 'px' },
    });

    const templateStyle = headerElement.children.map(h => (h.dataset.width || '1') + 'fr').join(' ');
    headerElement.style.setProperty('--table-template', templateStyle);
    headerElement.setAttribute('role', 'rowgroup');
    const headerElementColumns = Array.from(headerElement.children);
    headerElementColumns.forEach(c => c.setAttribute('role', 'columnheader'));

    const tableBody = createElementFn({
      attrs: {
        role: 'rowgroup',
        ...inheritAttributes(bodyElement)
      },
      classes: bodyElement.className || '',
      style: inheritStyles(bodyElement),
    });


    headerElement.addEventListener('click', e => {
      const h = e.target.closest('[sortable]');
      if (!h) return;
      const newPageSize = !maxWidthMedia.matches ? pageSize : pageSizeMobile;
      const targetPages = { start: 0, end: newPageSize - 1 };
      const commonParameters = { headerElement, bodyElement, tableBody, templateStyle, targetPages };
      const direction = h.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
      headerElementColumns.forEach(c => delete c.dataset.sortDirection);

      tableEl.querySelector('.table-sort-direction').dataset.sortDirection = direction;
      h.dataset.sortDirection = direction;
      sortTableDataset(
        commonParameters,
        [...h.parentElement.children].indexOf(h),
        direction
      );
    });

    tableEl.appendChild(headerElement);

    const isSorted = c => c.hasAttribute('sortable') && c.hasAttribute('data-sort-direction');
    const sortedHeader = headerElementColumns.find(isSorted);
    const sortedHeaderIndex = headerElementColumns.findIndex(isSorted);

    tableEl.appendChild(tableBody);

    const currentPage = +paginationOptions.getAttribute('current-page');

    const footer = createElementFn({
      classes: 'pagination-container',
      children: [
        {
          classes: 'pagination-summary',
          htmlContent: `Showing <span summary-current>${currentPage}</span> to <span summary-size>${pageSize}</span> of ${totalEntries} entries`
        },
        {
          classes: 'pagination-buttons',
          events: {
            click: e => {
              if (!e.target.classList.contains('page-btn')) return;
              const page = e.target.textContent;
              const newPageSize = !maxWidthMedia.matches ? pageSize : pageSizeMobile;
              const newTotalPage = !maxWidthMedia.matches ? totalPage : totalPageMobile;
              if (!isNaN(page)) {
                const start = (+page - 1) * newPageSize;
                const targetPages = { start, end: start + newPageSize - 1 };
                updatePagination({ footer, paginationOptions, currentPage: +page, targetPages });
                updateRowPage({ headerElement, bodyElement, tableBody, templateStyle, targetPages });
              } else {
                const currentPage = +paginationOptions.getAttribute('current-page');
                let start = 1;
                let newCurrentPage;

                if (page === '←' && currentPage > 1) {
                  start = (currentPage - 2) * newPageSize;
                  newCurrentPage = currentPage - 1;
                } else if (page === '→' && currentPage < newTotalPage) {
                  start = currentPage * newPageSize;
                  newCurrentPage = currentPage + 1;
                } else {
                  return;
                }

                const targetPages = { start, end: start + newPageSize - 1 };
                updatePagination({ footer, paginationOptions, currentPage: newCurrentPage, targetPages });
                updateRowPage({ headerElement, bodyElement, tableBody, templateStyle, targetPages });
              }
            }
          }
        }
      ]
    });

    updatePagination({ footer, paginationOptions, currentPage, targetPages });
    tableEl.appendChild(footer);

    function displayChange(e) {
      let targetPages = { start: 0, end: pageSize - 1 };
      let newMinHeight = minHeight;

      if (e.matches) {
        targetPages = { start: 0, end: pageSizeMobile - 1 };
        newMinHeight = minHeightMobile;
      }
      tableEl.style.minHeight = newMinHeight + 'px';

      const commonParameters = { headerElement, bodyElement, tableBody, templateStyle, targetPages };
      updatePagination({ footer, paginationOptions, currentPage, targetPages });
      sortTableDataset(commonParameters, sortedHeaderIndex, sortedHeader?.dataset.sortDirection || 'asc');
    }
    maxWidthMedia.addEventListener('change', displayChange);
    displayChange(maxWidthMedia);

    const mobileSortContainer = createElementFn({
      classes: 'table-sort',
      children: [
        {
          tag: 'label',
          textContent: 'Sort by:',
          props: { htmlFor: 'responsive-table-mobile-sort-select-' + t_index },
          children: [
            {
              tag: 'select',
              classes: 'table-sort-option',
              id: 'responsive-table-mobile-sort-select-' + t_index,
              htmlContent: `
                <option disabled selected>Sort by...</option>
                ${[...headerElement.children]
                  .filter(c => !c.hasAttribute('data-as-collapsed-header') && c.hasAttribute('sortable'))
                  .map((c, i) => {
                    return `<option value="${i}"
                      ${sortedHeaderIndex === i ? 'selected' : ''}>${c.innerText.trim()}
                    </option>`
                  })
                  .join('')
                }
              `,
              events: {
                change: (e, thisEl) => {
                  const selectedHeaderIndex = e.target.value;
                  const selectedHeader = headerElementColumns[selectedHeaderIndex];
                  const direction = selectedHeader.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
                  headerElementColumns.forEach(c => delete c.dataset.sortDirection);

                  thisEl.parentElement.querySelector('.table-sort-direction').disabled = isNaN(selectedHeaderIndex);
                  selectedHeader.dataset.sortDirection = direction;
                  sortTableDataset(
                    { headerElement, bodyElement, tableBody, templateStyle, targetPages },
                    selectedHeaderIndex,
                    direction
                  );
                }
              }
            },
            {
              tag: 'button',
              classes: 'table-sort-direction',
              id: 'table-sort-direction-' + t_index,
              datasets: { sortDirection: sortedHeader?.dataset.sortDirection || 'asc' },
              props: { disabled: !sortedHeader },
              events: {
                click: (_, thisEl) => {
                  thisEl.disabled = true;
                  const sortedHeader = headerElementColumns.find(isSorted);
                  const sortedHeaderIndex = headerElementColumns.findIndex(isSorted);
                  if (sortedHeader) {
                    const newPageSize = !maxWidthMedia.matches ? pageSize : pageSizeMobile;
                    const targetPages = { start: 0, end: newPageSize - 1 };
                    const commonParameters = { headerElement, bodyElement, tableBody, templateStyle, targetPages };
                    const direction = sortedHeader?.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
                    headerElementColumns.forEach(c => delete c.dataset.sortDirection);

                    thisEl.dataset.sortDirection = direction;
                    sortedHeader.dataset.sortDirection = direction;
                    sortTableDataset(
                      commonParameters,
                      sortedHeaderIndex,
                      direction
                    );
                  }
                  setTimeout(() => thisEl.disabled = false, 100); // prevent spam click glitch
                }
              }
            }
          ]
        },
      ]
    });
    tableEl.prepend(mobileSortContainer);

    t.insertAdjacentElement('afterend', tableEl);
  });

  function sortTableDataset(params, columnIndex, direction = 'asc') {
    const { bodyElement, tableBody } = params;

    restoreAllAttachedElements(tableBody);
    const rows = Array.from(bodyElement.children);

    rows
      .sort((a, b) => {
        const x = a.children[columnIndex]?.dataset.toSort || a.children[columnIndex]?.innerText.trim() || '';
        const y = b.children[columnIndex]?.dataset.toSort || b.children[columnIndex]?.innerText.trim() || '';
        const nx = isNaN(x) ? x.toLowerCase() : +x;
        const ny = isNaN(y) ? y.toLowerCase() : +y;
        return nx > ny ? (direction === 'asc' ? 1 : -1) : nx < ny ? (direction === 'asc' ? -1 : 1) : 0;
      })
      .map((el, i) => el.setAttribute('table-row', i));

    bodyElement.append(...rows);
    updateRowPage(params);
  }

  function updateRowPage(params) {
    const { headerElement, bodyElement, tableBody, templateStyle, targetPages } = params;
    const { start, end } = targetPages;

    restoreAllAttachedElements(tableBody);

    // Select the rows for the current page
    const sliceRows = Array.from(bodyElement.children).filter(row => {
      const tableRow = row.getAttribute('table-row');
      return tableRow >= start && tableRow <= end;
    });

    if (!sliceRows.length) return;

    // Apply styles and roles once per row
    sliceRows.forEach(row => {
      const currentTemplate = row.style.getPropertyValue('--table-template').trim();
      if (!currentTemplate || currentTemplate === 'repeat(10, 1fr)')
        row.style.setProperty('--table-template', templateStyle);

      mobileCollapseRows({ row, headerElement, templateStyle });

      if (row.getAttribute('role') !== 'row') row.setAttribute('role', 'row');
      for (const cell of row.children) {
        if (cell.getAttribute('role') !== 'cell') cell.setAttribute('role', 'cell');
      }
    });

    // Create a single placeholder before the first row
    const placeholder = document.createComment('page-slice');
    sliceRows[0].before(placeholder);

    // Move all rows at once using a DocumentFragment
    const fragment = document.createDocumentFragment();
    sliceRows.forEach(row => fragment.appendChild(row));
    tableBody.replaceChildren(fragment);

    // Store a single restore function for the entire slice
    restoreAttachedElements.push({
      tableBody,
      restore() {
        placeholder.replaceWith(...sliceRows);
        placeholder.remove();
      }
    });
  }

  function restoreAllAttachedElements(tableBody) {
    restoreAttachedElements = restoreAttachedElements.filter(entry => {
      if (entry.tableBody === tableBody) {
        entry.restore();
        return false;
      }
      return true;
    });
  }

  function mobileCollapseRows(params) {
    const { row, headerElement, templateStyle } = params;
    const cells = row.children;
    const headerList = Array.from(headerElement.children).map(h => h.innerText.trim());
    const template = templateStyle.split(' ');

    // only one 'data-as-mobile-title'
    const withTitle = [...cells].filter(c => c.hasAttribute('data-as-mobile-title'));
    if (withTitle.length > 1) {
      withTitle.slice(1).forEach(c => c.removeAttribute('data-as-mobile-title'));
    } else if (withTitle.length === 0 && cells.length > 0) {
      cells[0].dataset.asMobileTitle = '';
    }

    // mobile detail summary
    if (!row.querySelector('.responsive-table-details')) {
      const details = createElementFn({
        tag: 'details',
        classes: 'details margin-top-5 responsive-table-details',
        children: [
          {
            tag: 'ul',
            classes: 'list list-with-transition size-h5',
            children: Array.from(cells)
              .filter(c => !c.hasAttribute('data-show-on-mobile') && !c.hasAttribute('data-as-mobile-title'))
              .map((c, i) => {
                return {
                  tag: 'li',
                  classes: 'flex justify-between gap-55',
                  children: [
                    {
                      classes: 'rtl color-highlight nowrap',
                      textContent: c.dataset.label || headerList[i] || ''
                    },
                    {
                      classes: 'text-right text-truncate',
                      attrs: { title: c.innerText.trim().replace(/\s+/g, ' ') },
                      textContent: c.innerText.trim(),
                    }
                  ]
                }
              })
          },
          {
            tag: 'summary',
            classes: 'summary',
            textContent: 'More',
          }
        ]
      });
      row.appendChild(details);
    }

    // collapsed-column-details
    if (!row.querySelector('.collapsed-column-details')) {
      let hasCollapsed = false;

      const collapseContainer = createElementFn({
        attrs: {
          ...Array.from(cells[0].attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {})
        }
      });
      if (!collapseContainer.hasAttribute('data-to-sort')) collapseContainer.dataset.toSort = cells[0].innerText.trim();

      const details = createElementFn({
        tag: 'details',
        classes: 'details collapsed-column-details'
      });

      const summary = createElementFn({
        tag: 'summary',
        classes: 'text-truncate',
        props: { title: cells[0].innerText.trim().replace(/\s+/g, ' ') },
        textContent: cells[0].textContent.trim(),
      });

      const ul = createElementFn({
        tag: 'ul',
        classes: 'list list-with-transition size-h5'
      });

      Array.from(cells).forEach((c, i) => {
        c.dataset.label = c.dataset.label || headerList[i] || '';
        if (!c.hasAttribute('data-as-collapsed-column')) return;

        hasCollapsed = true;

        const li = createElementFn({
          tag: 'li',
          classes: 'flex justify-between gap-55',
          children: [
            {
              classes: 'rtl color-highlight nowrap',
              textContent: c.dataset.label,
            },
            {
              classes: `text-right text-truncate ${c.className || ''}`,
              attrs: {
                title: c.innerText.trim().replace(/\s+/g, ' '), // workaround text-truncate
              },
              style: inheritStyles(c),
            }
          ]
        });
        li.children[1].innerHTML = c.innerHTML;

        ul.appendChild(li);
        headerElement.children[i].dataset.asCollapsedHeader = '';
        template[i] = '0fr';
      });

      if (hasCollapsed) {
        details.appendChild(ul);
        details.appendChild(summary);
        collapseContainer.appendChild(details);
        row.replaceChild(collapseContainer, cells[0]);

        const sanitizedTemplate = template.filter(v => v !== '0fr');
        headerElement.style.setProperty('--table-template', sanitizedTemplate.join(' '));
        row.style.setProperty('--table-template', sanitizedTemplate.join(' '));
      }
    }
  }

  function createPaginationButton(page, isActive = false) {
    return createElementFn({
      tag: 'button',
      textContent: page,
      classes: `page-btn${isActive ? ' active' : ''}`,
    });
  }

  function createPaginationEllipsis() {
    return createElementFn({
      tag: 'span',
      textContent: '...',
      classes: 'ellipses'
    })
  }

  function updatePagination(params) {
    const { footer, paginationOptions, currentPage, targetPages } = params;
    const { start, end } = targetPages;
    paginationOptions.setAttribute('current-page', currentPage);

    const totalPage = !maxWidthMedia.matches ? +paginationOptions.getAttribute('total-page') : +paginationOptions.getAttribute('total-page-mobile');

    const paginationButtons = footer.querySelector('.pagination-buttons');
    paginationButtons.innerHTML = '';

    const paginationSummary = footer.querySelector('.pagination-summary');
    paginationSummary.querySelector('[summary-current]').textContent = start + 1;
    const summarySize = totalPage === currentPage
      ? +paginationOptions.getAttribute('total-entries')
      : end + 1;
    paginationSummary.querySelector('[summary-size]').textContent = summarySize;

    if (totalPage === 1) return;

    const backButton = createElementFn({
      tag: 'button',
      textContent: '←',
      classes: 'page-btn',
      props: { disabled: currentPage === 1 }
    });
    paginationButtons.appendChild(backButton);

    const pages = [];

    if (totalPage <= 7) for (let i = 1; i <= totalPage; i++) pages.push(i);
    else if (currentPage <= 4) pages.push(1, 2, 3, 4, 5, '...', totalPage);
      else if (currentPage >= totalPage - 3) pages.push(1, '...', totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage);
        else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPage);

    for (const p of pages) {
      if (p === '...') paginationButtons.appendChild(createPaginationEllipsis());
      else paginationButtons.appendChild(createPaginationButton(p, p === currentPage));
    }

    const nextButton = createElementFn({
      tag: 'button',
      textContent: '→',
      classes: 'page-btn',
      props: { disabled: currentPage === totalPage }
    });
    paginationButtons.appendChild(nextButton);
  }

  function inheritAttributes(el) {
    return Object.fromEntries(
      [...el.attributes]
        .filter(a => !['class', 'style'].includes(a.name))
        .map(a => [a.name, a.value])
    );
  }

  function inheritStyles(el) {
    return Object.fromEntries(
      [...el.style].map(p => [p, el.style[p]])
    )
  }
});