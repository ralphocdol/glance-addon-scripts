'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  const createElementFn = window.CREATE_ELEMENT;
  if (typeof createElementFn !== 'function') {
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';

    if (typeof window.showToast === 'function') window.showToast?.(msg, { title: 'CUSTOM SETTINGS', type: 'error' });
    else alert(msg);

    console.error('CREATE_ELEMENT not found');
    return;
  }

  const settingsElement = createElementFn({
    tag: 'template',
    classes: 'custom-settings',
    attrs: {
      'custom-modal': 'custom-settings',
      'modal-no-background': '',
      'no-dismiss-on-escape-key': '',
      'width': 'medium',
      'height': 'medium',
    }
  });

  const settingsElementHeader = createElementFn({
    attrs: { 'modal-header': '' }
  });
  settingsElement.appendChild(settingsElementHeader);

  const navBottom = createElementFn({ classes: 'nav-bottom' });

  const aboutButton = createElementFn({
    attrs: { role: 'button' },
    datasets: { target: 'about' },
    classes: 'active',
    innerText: 'About'
  });
  navBottom.appendChild(aboutButton);

  const closeButton = createElementFn({
    attrs: { role: 'button' },
    classes: 'exit-btn',
    innerText: 'Exit',
  });
  navBottom.appendChild(closeButton);

  const settingsElementBody = createElementFn({
    attrs: { 'modal-body': '' }
  });
  settingsElement.appendChild(settingsElementBody);

  const sidebarElement = createElementFn({
    tag: 'nav',
    htmlContent: `<div class="nav-top"></div>`,
  });
  sidebarElement.appendChild(navBottom);
  settingsElementBody.appendChild(sidebarElement);

  const contentElement = createElementFn({ tag: 'main' });
  contentElement.id = 'custom-settings';
  contentElement.innerHTML = `
    <div data-content="about" class="show">
      <div style="display: block;">
        See the <a class="color-primary visited-indicator" href="https://github.com/ralphocdol/glance-micro-scripts/tree/main/custom-settings" target="_blank">Repository</a>
      </div>
      <div style="display: block;">
        Vectors and icons by <a class="color-primary visited-indicator" href="https://www.svgrepo.com" target="_blank">SVG Repo</a>
      </div>
    </div>`,
  settingsElementBody.appendChild(contentElement);

  const btnSaveSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M21,20V8.414a1,1,0,0,0-.293-.707L16.293,3.293A1,1,0,0,0,15.586,3H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20A1,1,0,0,0,21,20ZM9,8h4a1,1,0,0,1,0,2H9A1,1,0,0,1,9,8Zm7,11H8V15a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1Z"></path></g></svg>`;

  document.body.appendChild(settingsElement);

  function generateTemplateFunction(events) {
    const replaceHeaderFn = fn => fn.toString().replace(/^\s*(?:function\s*\(\s*\)\s*|(?:async\s*)?\(\s*\)\s*=>\s*)\s*{/, '').replace(/\}$/, '');
    const body = [];
    const cleanupBody = [];
    for (const [event, handler] of Object.entries(events)) {
      if (event === 'setup') {
        body.push(replaceHeaderFn(handler));
        continue;
      }

      if (event === 'cleanup') {
        cleanupBody.push(replaceHeaderFn(handler));
        continue;
      }

      if (event === 'ready') {
        body.push(`(${handler.toString()})(_SETTING_ELEMENT_);`);
        continue;
      }

      body.push(`
        if (!_SETTING_ELEMENT_.dataset['has_${event}']) {
          _SETTING_ELEMENT_.dataset['has_${event}'] = '1';
          const _LISTENER_${event}_ = e => {
            if (e.target.dataset['${event}'] === undefined) return;
            (${handler.toString()})(e);
          }
          _SETTING_ELEMENT_.addEventListener('${event}', _LISTENER_${event}_);
          _CLEANUP_LISTENER_.push(['${event}', _LISTENER_${event}_]);
        }
      `);
    }

    return function (_KEY_) {
      const _SETTING_ELEMENT_ = _KEY_ && document.querySelector('#custom-settings .'+ _KEY_);
      if (!_SETTING_ELEMENT_) return;
      const _CLEANUP_LISTENER_ = [];

      /*__BODY__*/

      return () => {
        /*__CLEANUP_BODY__*/
        _CLEANUP_LISTENER_.forEach(([ev, fn]) => {
          delete _SETTING_ELEMENT_.dataset['has_' + ev];
          _SETTING_ELEMENT_.removeEventListener(ev, fn)
        });
      };
    }
    .toString()
    .replace('/*__BODY__*/', body.join('\n'))
    .replace('/*__CLEANUP_BODY__*/', cleanupBody.join('\n'));
  }

  // Updates an object's value by path
  function setValueByPath(obj, path, value) {
    return path.split('.').reduce(function(o, k, i, arr) {
      o[k] = i === arr.length - 1 ? value : (o[k] || {});
      return o[k];
    }, obj);
  }

  function customJSONStringify(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/\[\s*([\d\s,]+?)\s*\]/g, (_, p1) => {
      const compact = p1.split(/\s*,\s*|\s+/).filter(Boolean).join(',');
      return `[${compact}]`;
    });
  }

  function buildFetchUrl(target) {
    try {
      const isFullUrl = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(target);
      return isFullUrl ? new URL(target).href : new URL(target, window.location.origin).href;
    } catch (e) {
      window?.showToast('Invalid URL, see logs.', { title: 'Theming', type: 'error' });
      console.error('Invalid URL:', e);
      return null;
    }
  }

  let settingsList = [];
  function createCustomSettingsItem(params) {
    settingsList.push(params)
  }

  window.customSettingsFunctions = {
    createCustomSettingsItem, setValueByPath,
    customJSONStringify, buildFetchUrl,
  }

  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));

  setTimeout(() => {
    settingsList
      .sort((a, b) => (Number.isFinite(a.order) ? a.order : Infinity) - (Number.isFinite(b.order) ? b.order : Infinity) || a.name.localeCompare(b.name))
      .forEach(s => {
        const { name = '', contentObject = {}, contentEventListener = {} } = s;
        const settingsElement = document.querySelector('[custom-modal="custom-settings"]');
        const settingsElementBody = settingsElement.querySelector('[modal-body]');
        const navTop = settingsElementBody.querySelector('.nav-top');
        const mainElement = settingsElementBody.querySelector('main');

        const contentPair = 'custom-settings-menu-' + Array.from(navTop.children).length;

        const btn = createElementFn({
          attrs: { role: 'button' },
          datasets: { target: contentPair },
          textContent: name
        });

        const templateScript = createElementFn({
          tag: 'template',
          datasets: { scriptId: contentPair },
        });
        templateScript.content.appendChild(document.createTextNode(
          generateTemplateFunction(contentEventListener)
        ));

        const contentElement = createElementFn({ datasets: { content: contentPair } });
        contentElement.appendChild(templateScript);
        contentElement.appendChild(generateSettingsWidgets({ key: contentPair, contentObject }));

        navTop.appendChild(btn);
        mainElement.appendChild(contentElement);
      });
  }, 500);

  function generateSettingsWidgets({
    key = '',
    contentObject = [],
  }) {
    const widgetContainer = createElementFn({ classes: key });

    contentObject.forEach(widget => {
      widget.maxLength = widget.maxLength || null;
      const widgetElement = createElementFn({ classes: 'custom-settings-content-card' });
      if (widget?.style) Object.assign(widgetElement.style, widget.style);
      if (widget?.colOffset) widgetElement.style.gridColumn = `1 / -${widget.colOffset}`;

      const toolTipEl = widget.tooltip ? createElementFn({
        tag: 'span',
        classes: 'info',
        attrs: { title: widget.tooltip },
        textContent: 'ⓘ',
      }) : createElementFn({ isFragment : true});
      widgetElement.appendChild(toolTipEl);

      const labelEl = createElementFn({ tag: 'label', textContent: widget.name });

      const buttonEl = createElementFn({
        tag: 'button',
        classes: 'btn btn-float',
        datasets: { click: '', key: widget.key },
        htmlContent: widget?.icon || btnSaveSvg,
      });

      switch (widget.type){
        case 'toggle': {
          widgetElement.classList.add('card-toggle');

          const toggleEl = createElementFn({ tag: 'label', classes: 'toggle' });
          const toggleSwitch = createElementFn({ tag: 'span', classes: 'toggle-switch' });
          const toggleInput = createElementFn({
            tag: 'input',
            props: { type: 'checkbox', name: widget.key, checked: !!widget.value, disabled: widget.disabled || false },
            datasets: { click: '', key: widget.key },
          });
          toggleEl.appendChild(toggleInput);
          toggleEl.appendChild(toggleSwitch);

          widgetElement.appendChild(labelEl);
          widgetElement.appendChild(toggleEl);
          break;
        }
        case 'text': {
          widgetElement.classList.add('card-text');
          widgetElement.style.gap = '1rem';

          const inputGroup = createElementFn({ classes: 'input-group' });
          const inputText = createElementFn({
            tag: 'input',
            props: { type: 'text', name: widget.key,
              placeholder: ' ', value: widget.value,
              maxlength: widget.maxLength,
              disabled: widget.disabled || false,
            }
          });
          inputGroup.appendChild(inputText);
          inputGroup.appendChild(labelEl);
          inputGroup.appendChild(buttonEl);

          widgetElement.appendChild(inputGroup);
          break;
        }
        case 'dropdown': {
          widgetElement.classList.add('card-dropdown');
          widgetElement.style.gap = '1rem';

          const selectGroupEl = createElementFn({ classes: 'select-group' });
          const selectEl = createElementFn({
            tag: 'select',
            props: { name: widget.key, disabled: widget.disabled || false },
            datasets: { change: '', key: widget.key }
          });
          widget.options.forEach(o => {
            const optionEl = createElementFn({
              tag: 'option',
              props: { value: o, selected: o === widget.value, disabled: widget.disabled || false },
              textContent: o
            });
            selectEl.appendChild(optionEl);
          });
          selectGroupEl.appendChild(selectEl);
          selectGroupEl.appendChild(labelEl);

          widgetElement.appendChild(selectGroupEl);
          break;
        }
        case 'multi-text': {
          widgetElement.classList.add('card-multi-text');
          widgetElement.style.gap = '1rem';

          const inputGroup = createElementFn({ classes: 'input-group' });

          const inputEl = createElementFn({
            tag: 'input',
            props: {
              type: 'text',
              name: widget.key,
              placeholder: ' ',
              value: (widget.value || []).join(','),
              maxlength: widget.maxLength,
              disabled: widget.disabled || false,
            }
          });
          inputGroup.appendChild(inputEl);
          inputGroup.appendChild(labelEl);
          inputGroup.appendChild(buttonEl);

          widgetElement.appendChild(inputGroup);
          break;
        }
        case 'textarea': {
          widgetElement.classList.add('card-textarea');
          widgetElement.style.gap = '1rem';

          const inputGroup = createElementFn({ classes: 'input-group' });

          const textareaEl = createElementFn({
            tag: 'textarea',
            props: {
              name: widget.key,
              placeholder: ' ',
              spellcheck: widget.spellcheck || false,
              disabled: widget.disabled || false,
            },
            style: { height: widget?.height || '300px' }
          });
          inputGroup.appendChild(textareaEl);
          inputGroup.appendChild(labelEl);

          const textareaActions = createElementFn({ classes: 'textarea-actions' });

          const textareaAdditionInfo = createElementFn({ tag:'div', htmlContent: widget?.additionalInfo || '' });
          textareaActions.appendChild(textareaAdditionInfo);

          const btnContainer = createElementFn({ classes: 'more-btns' });
          widget.moreButtons && widget.moreButtons.forEach(b => {
            const moreButtons = createElementFn({
              tag: 'button',
              classes: 'btn',
              attrs: { title: b.tooltip },
              props: { disabled: b.disabled || false },
              datasets: { click: '', key: b.key },
              htmlContent: b.name,
            });
            btnContainer.appendChild(moreButtons);
          });

          const btnEl = createElementFn({
            tag: 'button',
            classes: 'btn',
            props: { disabled: widget.disabled || false },
            datasets: { click: '', key: widget.key },
            htmlContent: widget?.customButton || `${btnSaveSvg} SAVE`,
          });
          btnContainer.appendChild(btnEl);

          textareaActions.appendChild(btnContainer);

          widgetElement.appendChild(inputGroup);
          widgetElement.appendChild(textareaActions);
          break;
        }
        case 'custom-html':
          widgetElement.classList.add('card-html');
          widgetElement.classList.add('frameless');
          widgetElement.style.gridColumn = '1 / -1'
          widgetElement.innerHTML = widget.contentHTML;
          break;
        case 'buttons': {
          widgetElement.classList.add('card-buttons');
          widgetElement.classList.add('frameless');
          widget.buttons.forEach(b => {
            const btn = createElementFn({
              tag: 'button',
              classes: 'btn',
              props: { disabled: widget.disabled || false },
              attrs: { title: b.tooltip },
              datasets: { click: '', key: b.key },
              style: { background: b.negative ? 'var(--color-negative)' : '' },
              textContent: b.name
            });
            widgetElement.appendChild(btn);
          });
          break;
        }
        case 'color': {
          widgetElement.classList.add('card-color');
          const colorEl = createElementFn({
            tag: 'input',
            datasets: { change: '', key: widget.key },
            attrs: {
              name: widget.key,
              type: 'color',
              placeholder: ' ',
              value: widget.value
            },
            props: { disabled: widget.disabled || false },
          });
          widgetElement.appendChild(labelEl);
          widgetElement.appendChild(colorEl);
          break;
        }
        case 'slider': {
          widgetElement.classList.add('card-slider');
          Object.assign(widgetElement.style, {
            flexDirection: 'column',
            alignItems: 'unset',
            gap: '0.5rem',
          });
          const sliderLabelEl = createElementFn({ classes: 'slider-label' });
          const sliderValueEl = createElementFn({
            tag: 'label',
            datasets: { sliderLabel: widget.key },
            textContent: widget.value || 0,
          });
          sliderLabelEl.appendChild(labelEl);
          sliderLabelEl.appendChild(sliderValueEl);

          const sliderEl = createElementFn({
            tag: 'input',
            datasets: { input: '', key: widget.key },
            attrs: {
              type: 'range',
              name: widget.key,
              placeholder: ' ',
              min: widget.min || 0,
              max: widget.max || 1,
              step: widget.step || 0.1,
              value: widget.value || 1,
            },
            props: { disabled: widget.disabled || false },
          });

          widgetElement.appendChild(sliderLabelEl);
          widgetElement.appendChild(sliderEl);
          break;
        }
        default:
          const noEl = widget.type + ' does not exist!';
          window.showToast?.(noEl, { type: 'error' });
          console.error(noEl)
      }

      widgetContainer.appendChild(widgetElement);
    });

    return widgetContainer;
  }

  const icon = `<svg fill="currentColor" version="1.1" id="Capa_1" viewBox="0 0 54.374 54.374" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M5.677,23.789v25.521c0,0.828,0.672,1.5,1.5,1.5h8.328c0.828,0,1.5-0.672,1.5-1.5V23.789 c3.479-2.012,5.678-5.765,5.678-9.815c0-4.376-2.567-8.406-6.542-10.267c-0.465-0.218-1.009-0.183-1.44,0.093 c-0.434,0.275-0.695,0.752-0.695,1.266v8.939H8.677V5.065c0-0.513-0.262-0.99-0.695-1.266c-0.433-0.276-0.977-0.311-1.44-0.093 C2.567,5.567,0,9.598,0,13.974C0,18.023,2.199,21.776,5.677,23.789z M5.677,7.865v7.64c0,0.829,0.672,1.5,1.5,1.5h8.328 c0.828,0,1.5-0.671,1.5-1.5v-7.64c1.675,1.556,2.678,3.765,2.678,6.108c0,3.217-1.89,6.181-4.813,7.55 c-0.527,0.247-0.864,0.776-0.864,1.358v24.927H8.677V22.881c0-0.582-0.337-1.112-0.864-1.358C4.889,20.155,3,17.19,3,13.974 C3,11.629,4.002,9.42,5.677,7.865z"></path> <path d="M27.072,13.475h8.124l-2.348,2.348c-0.586,0.585-0.586,1.536,0,2.121c0.293,0.293,0.676,0.439,1.061,0.439 c0.384,0,0.768-0.146,1.061-0.439l4.907-4.907c0.14-0.139,0.251-0.306,0.327-0.491c0.003-0.008,0.004-0.016,0.007-0.023 c0.065-0.169,0.106-0.354,0.106-0.547s-0.041-0.377-0.106-0.547c-0.003-0.008-0.004-0.016-0.007-0.023 c-0.076-0.185-0.188-0.352-0.327-0.491l-4.748-4.748c-0.586-0.586-1.535-0.586-2.121,0c-0.586,0.585-0.586,1.536,0,2.121 l2.188,2.188h-8.124c-0.828,0-1.5,0.671-1.5,1.5S26.244,13.475,27.072,13.475z"></path> <path d="M27.072,25.235h16.309l-2.348,2.348c-0.586,0.585-0.586,1.536,0,2.121c0.293,0.293,0.677,0.438,1.061,0.438 c0.385,0,0.768-0.146,1.061-0.438l4.908-4.907c0.14-0.139,0.25-0.306,0.326-0.491c0.004-0.008,0.004-0.016,0.008-0.023 c0.065-0.169,0.105-0.354,0.105-0.547c0-0.193-0.04-0.377-0.105-0.547c-0.004-0.008-0.004-0.016-0.008-0.023 c-0.076-0.185-0.188-0.352-0.326-0.491l-4.748-4.748c-0.586-0.586-1.535-0.586-2.121,0c-0.586,0.585-0.586,1.536,0,2.121 l2.188,2.188H27.072c-0.828,0-1.5,0.671-1.5,1.5C25.572,24.565,26.244,25.235,27.072,25.235z"></path> <path d="M27.072,37.725h22.182l-2.348,2.348c-0.586,0.586-0.586,1.535,0,2.121c0.293,0.293,0.677,0.438,1.061,0.438 c0.385,0,0.768-0.146,1.061-0.438l4.906-4.907c0.141-0.14,0.252-0.306,0.328-0.491c0.002-0.008,0.004-0.016,0.006-0.023 c0.066-0.168,0.106-0.354,0.106-0.547l0,0l0,0c0-0.192-0.04-0.377-0.106-0.545c-0.002-0.009-0.004-0.017-0.006-0.023 c-0.078-0.186-0.188-0.352-0.328-0.491l-4.748-4.748c-0.586-0.586-1.535-0.586-2.121,0c-0.586,0.585-0.586,1.536,0,2.121 l2.188,2.188H27.072c-0.828,0-1.5,0.67-1.5,1.5C25.572,37.055,26.244,37.725,27.072,37.725z"></path> </g> </g> </g></svg>`;

  window.createCustomMenuItemElement?.({
    className: 'custom-settings-button',
    tooltip: 'Custom Settings',
    icon,
    actionFn: () => openSettingsGUI(),
    order: 2,
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

      const resetElementData = () => {
        navItems.forEach(e => {
          e.classList[e.dataset.target === 'about' ? 'add' : 'remove']('active');
        });
        mainItems.forEach(e => {
          const isAbout = e.dataset.content === 'about';
          e.style.display = isAbout ? 'block' : 'none';
          e.classList[isAbout ? 'add' : 'remove']('show');
        });
      }

      let activeScriptCleanup = null;
      const triggerCleanup = () => {
        if (activeScriptCleanup) {
          activeScriptCleanup();
          activeScriptCleanup = null;
        }
      }

      function handler(e) {
        if (e.target.closest('div[role="button"].exit-btn')) {
          e.currentTarget.removeEventListener('click', handler);
          triggerCleanup();
          resetElementData();
          window.closeModal();
          return;
        }

        const el = e.target.closest('div[role="button"][data-target]');
        if (!el) return;

        triggerCleanup();

        navItems.forEach(b => b.classList.toggle('active', b === el));
        mainItems.forEach(c => {
          c.classList.remove('show')
          setTimeout(() => c.style.display = 'none', 300);
        });

        const keyTarget = el.dataset.target;
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
      }

      nav.addEventListener('click', handler);
    }, 100);
  }
});