(() => {
  const createElementFn = window.CREATE_ELEMENT;
  if (typeof createElementFn !== 'function') {
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';
    if (typeof window.showToast === 'function') {
      window.showToast?.(msg, { title: 'CUSTOM SETTINGS', type: 'error' });
    } else {
      alert(msg);
    }
    console.error('CREATE_ELEMENT not found');
    return;
  }

  const settingsElement = createElementFn({
    tag: 'template',
    classes: 'custom-settings',
    attrs: {
      'custom-modal': 'custom-settings',
      'modal-no-background': '',
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
    attrs: {
      role: 'button',
      onClick: 'window.closeModal();'
    },
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

  const contentElement = createElementFn({
    tag: 'main',
    htmlContent: `
      <div data-content="about" class="show">
        <div style="display: block;">
          See the <a class="color-primary visited-indicator" href="https://github.com/ralphocdol/glance-micro-scripts/tree/main/custom-settings" target="_blank">Repository</a>
        </div>
        <div style="display: block;">
          Vectors and icons by <a class="color-primary visited-indicator" href="https://www.svgrepo.com" target="_blank">SVG Repo</a>
        </div>
      </div>`,
  });
  settingsElementBody.appendChild(contentElement);

  const svgSaveElement = createElementFn({
    tag: 'svg',
    style: { display: 'none' },
    htmlContent: `
      <symbol id="svg-icon-save" viewBox="0 0 24 24">
        <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zM12 19a3 3 0 1 1 0-6zM6 5h9v4H6z"/>
      </symbol>`
  });
  settingsElementBody.appendChild(svgSaveElement);

  document.body.appendChild(settingsElement);

  function generateTemplateFunction(events) {
    const body = [];
    for (const [event, handler] of Object.entries(events)) {
      if (['key'].includes(event)) {
        console.error(`Reserved function: ${event}`);
        continue;
      }

      if (event === 'setup') {
        body.push(
          handler.toString()
            .replace(/^\s*(?:function\s*\(\s*\)\s*|(?:async\s*)?\(\s*\)\s*=>\s*)\s*{/, '')
            .replace(/\}$/, '')
        );
        continue;
      }

      if (event === 'onload') {
        body.push(`(${handler.toString()})(_PARENT_ELEMENT_);`);
        continue;
      }

      const domEvent = event.startsWith('on') ? event.slice(2).toLowerCase() : event;
      body.push(`
        if (!_PARENT_ELEMENT_.dataset['has_${domEvent}']) {
          _PARENT_ELEMENT_.dataset['has_${domEvent}'] = '1';
          _PARENT_ELEMENT_.addEventListener('${domEvent}', e => {
            if (e.target.dataset['${domEvent}'] === undefined) return;
            (${handler.toString()})(e);
          });
        }
      `);
    }

    return function (key) {
      const _PARENT_ELEMENT_ = key && document.querySelector('.' + key);
      if (!_PARENT_ELEMENT_) return;
      /*__BODY__*/
    }
    .toString()
    .replace('/*__BODY__*/', body.join('\n'));
  }


  function createCustomSettingsItem({
    nameHTML = '',
    contentObject = {},
    contentEventListener = {},
  }) {
    const settingsElement = document.querySelector('[custom-modal="custom-settings"]');
    const settingsElementBody = settingsElement.querySelector('[modal-body]');
    const navTop = settingsElementBody.querySelector('.nav-top');
    const mainElement = settingsElementBody.querySelector('main');

    const contentPair = 'custom-settings-menu-' + Array.from(navTop.children).length;

    const btn = createElementFn({
      attrs: { role: 'button' },
      datasets: { target: contentPair },
      htmlContent: nameHTML
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
  }

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
        htmlContent: widget?.icon || '<svg><use href="#svg-icon-save"></use></svg>',
      });

      switch (widget.type){
        case 'toggle': {
          widgetElement.classList.add('card-toggle');

          const toggleEl = createElementFn({ tag: 'label', classes: 'toggle' });
          const toggleSwitch = createElementFn({ tag: 'span', classes: 'toggle-switch' });
          const toggleInput = createElementFn({
            tag: 'input',
            props: { type: 'checkbox', name: widget.key, checked: !!widget.value },
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
            props: { name: widget.key },
            datasets: { change: '', key: widget.key }
          });
          widget.options.forEach(o => {
            const optionEl = createElementFn({
              tag: 'option',
              props: { value: o, selected: o === widget.value },
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
              maxlength: widget.maxLength
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
              classes: 'flex btn',
              attrs: { title: b.tooltip },
              datasets: { click: '', key: b.key },
              htmlContent: b.name,
            });
            btnContainer.appendChild(moreButtons);
          });

          const btnEl = createElementFn({
            tag: 'button',
            classes: 'flex btn',
            datasets: { click: '', key: widget.key },
            htmlContent: widget?.customButton || `<svg><use href="#svg-icon-save"></use></svg> SAVE`,
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
            }
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
            }
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

  // Updates an object's value by path
  function setValueByPath(obj, path, value) {
    return path.split('.').reduce(function(o, k, i, arr) {
      o[k] = i === arr.length - 1 ? value : (o[k] || {});
      return o[k];
    }, obj);
  }

  // Just a simple dialog box
  function ask(message) {
    return new Promise(resolve => {
      const overlay = createElementFn({
        style: {
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,.4)',
          zIndex: 9999
        },
        events: {
          click: e => { if (e.target === overlay) close(false); }
        }
      });

      const box = createElementFn({
        style: {
          background: 'var(--color-popover-background)',
          color: 'var(--color-text-paragraph)',
          padding: '1rem',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--color-popover-border)',
          maxWidth: '40vw',
          minWidth: '280px',
          boxSizing: 'border-box',
          boxShadow: '0px 3px 0px 0px hsl(var(--bghs), calc(var(--scheme) (var(--scheme) var(--bgl)) - 0.5%))',
        },
        htmlContent: `
          <p style="margin:0 0 1rem">${message}</p>
          <div style="display:flex;gap:1rem;justify-content:flex-end">
            <button data-v="no" style="background:var(--color-negative);color:var(--color-separator);padding:.2rem 1rem;border-radius:var(--border-radius);">CANCEL</button>
            <button data-v="yes" autofocus style="background:var(--color-positive);color:var(--color-separator);padding:.2rem 1rem;border-radius:var(--border-radius);" autofocus>CONFIRM</button>
          </div>
        `,
      });

      box.querySelectorAll('button').forEach(b => {
        b.onclick = () => close(b.dataset.v === 'yes')
      });

      function close(val) {
        resolve(val);
        overlay.remove();
      }

      overlay.appendChild(box);
      document.getElementById('modal').appendChild(overlay);
      box.querySelector('button[data-v="yes"]').focus();
    });
  }

  window.customSettingsFunctions = {
    ask, createCustomSettingsItem, setValueByPath
  }
})();