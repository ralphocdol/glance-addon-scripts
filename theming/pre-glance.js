(() => {
  const createElementFn = window.CREATE_ELEMENT;
  if (typeof createElementFn !== 'function') {
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';
    if (typeof window.showToast === 'function') {
      window.showToast?.(msg, { title: 'THEMING', type: 'error' });
    } else {
      alert(msg);
    }
    console.error('CREATE_ELEMENT not found');
    return;
  }

  const configKey = 'glance-theme-storage';
  // localStorage.setItem(configKey, ''); // uncomment once to Restore to default. Useful on mobile browsers
  const { themeProperties, setAll } = newThemePropertiesManager();
  const glanceThemeConfig = !!localStorage.getItem(configKey) ? JSON.parse(localStorage.getItem(configKey)) : { themeProperties };

  if (glanceThemeConfig?.overrideTheming) followSystemSchemeFn(glanceThemeConfig?.followSystemScheme);

  function newThemePropertiesManager() {
    const root = document.querySelector(':root');
    const style = getComputedStyle(root);
    const documentRoot = document.documentElement;

    let styleElement = document.querySelector('#theming-root-style');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theming-root-style';
      document.head.appendChild(styleElement);
    }

    let backgroundHue = parseFloat(style.getPropertyValue('--bgh'));
    let [backgroundSaturation] = extractDigitsFromString(
      style.getPropertyValue('--bgs'),
    );
    let [backgroundLightness] = extractDigitsFromString(
      style.getPropertyValue('--bgl'),
    );

    const limitValue = (value, min, max) => {
      const floatValue = parseFloat(value);
      if (isNaN(floatValue)) throw new TypeError('Expected a number.');
      if (floatValue < min) return min;
      if (floatValue > max) return max;
      return value;
    }

    const setRootVars = vars => {
      const currentVars = {};
      (styleElement.textContent.match(/--[\w-]+:\s*[^;]+;/g) || []).forEach(line => {
        const match = line.match(/(--[\w-]+):\s*([^;]+);/);
        if (match) currentVars[match[1]] = match[2];
      });
      for (const [key, value] of Object.entries(vars)) {
        currentVars[key] = value;
      }
      styleElement.textContent = `:root { ${Object.entries(currentVars).map(([k, v]) => `${k}: ${v};`).join(' ')} }`;
    }

    const applyBackgroundImage = (fadeImage = true) => {
      const isValid = themeProperties.backgroundImage !== '' || isUrlOrPath(themeProperties.backgroundImage);
      if (fadeImage) document.body.classList.remove('bg-img-visible');
      setRootVars({
        '--background-gradient-overlay': isValid
          ? `linear-gradient(hsla(var(--bghs), var(--bgl), var(--background-image-url-alpha, 1)),
            hsla(var(--bghs), var(--bgl), var(--background-image-url-alpha, 1)))`
          : 'none'
      });
      setTimeout(() => {
        setRootVars({
          '--background-image-url-body': isValid ? `url(${themeProperties.backgroundImage})` : 'var(--color-background)'
        });
        document.body.classList.add('bg-img-visible');
      }, 1000);
    }

    const themeProperties = {
      themeName: documentRoot.dataset.theme,
      isDefault: documentRoot.dataset.defaultTheme === 'true',
      isLight: documentRoot.dataset.scheme === 'light',
      backgroundColor: [
        backgroundHue,
        backgroundSaturation,
        backgroundLightness,
      ],
      primaryColor: extractValuesFromHslString(
        style.getPropertyValue('--color-primary'),
      ),
      positiveColor: extractValuesFromHslString(
        style.getPropertyValue('--color-positive'),
      ),
      negativeColor: extractValuesFromHslString(
        style.getPropertyValue('--color-negative'),
      ),
      contrastMultiplier: style.getPropertyValue('--cm'),
      textSaturationMultiplier: style.getPropertyValue('--tsm'),
      backgroundImage: style.getPropertyValue('--background-image-url') || '',
      backgroundImageAlpha: style.getPropertyValue('--background-image-url-alpha') || 1,
      colorWidgetBackgroundAlpha: style.getPropertyValue('--color-widget-background-alpha') || 1,
      colorPopoverBackgroundAlpha: style.getPropertyValue('--color-popover-background-alpha') || 1,
      borderRadius: style.getPropertyValue('--border-radius'),
    };

    const obj = {
      themeProperties,
      setThemeName: function (value) {
        documentRoot.dataset.theme = value;
        documentRoot.dataset.theming = '';
      },
      setIsDefault: function (value = false) {
        themeProperties.isDefault = value;
        documentRoot.dataset.defaultTheme = value;
      },
      setIsLight: function (value) {
        themeProperties.isLight = value;
        documentRoot.dataset.scheme = value ? 'light' : 'dark';
      },
      setBackgroundColor: function ([h, s, l]) {
        themeProperties.backgroundColor = [h, s, l];
        setRootVars({
          '--bgh': h,
          '--bgs': s + '%',
          '--bgl': l + '%'
        });
      },
      setPrimaryColor: function (value) {
        themeProperties.primaryColor = value;
        setRootVars({ '--color-primary': hslValuesToCSSString(value) });
      },
      setSecondaryColor: function (value) {
        themeProperties.secondaryColor = value;
        setRootVars({ '--color-secondary': hslValuesToCSSString(value) });
      },
      setPositiveColor: function (value) {
        themeProperties.positiveColor = value;
        setRootVars({ '--color-positive': hslValuesToCSSString(value) });
      },
      setNegativeColor: function (value) {
        themeProperties.negativeColor = value;
        setRootVars({ '--color-negative': hslValuesToCSSString(value) });
      },
      setContrastMultiplier: function (value) {
        const newValue = limitValue(value, 0.3, 2);
        themeProperties.contrastMultiplier = newValue;
        setRootVars({ '--cm': newValue });
      },
      setTextSaturationMultiplier: function (value) {
        const newValue = limitValue(value, 0.3, 5);
        themeProperties.textSaturationMultiplier = newValue;
        setRootVars({ '--tsm': newValue });
      },
      setBackgroundImage: function (value = '') {
        const fadeImage = themeProperties.backgroundImage !== value;
        themeProperties.backgroundImage = value;
        setRootVars({ '--background-image-url': value });
        applyBackgroundImage(fadeImage);
      },
      setBackgroundImageAlpha: function (value = 1) {
        const newValue = limitValue(value, 0, 1);
        themeProperties.backgroundImageAlpha = newValue;
        setRootVars({ '--background-image-url-alpha': newValue });
      },
      setColorWidgetBackgroundAlpha: function (value = 1) {
        const newValue = limitValue(value, 0.1, 1);
        themeProperties.colorWidgetBackgroundAlpha = newValue;
        setRootVars({ '--color-widget-background-alpha': newValue });
        setRootVars({ '--color-widget-background': `hsla(var(--color-widget-background-hsl-values), var(--color-widget-background-alpha, 1))` });
        setRootVars({ '--color-widget-background-highlight': `hsla(var(--bghs), calc(var(--scheme) (var(--scheme) var(--bgl) + 4%)), var(--color-widget-background-alpha, 1))` });
      },
      setColorPopoverBackgroundAlpha: function (value = 1) {
        const newValue = limitValue(value, 0.1, 1);
        themeProperties.colorPopoverBackgroundAlpha = newValue;
        setRootVars({ '--color-popover-background-alpha': newValue });
        setRootVars({ '--color-popover-background': `hsla(var(--bgh), calc(var(--bgs) + 3%), calc(var(--bgl) + 3%), var(--color-popover-background-alpha))` });
      },
      setBorderRadius: function (value = '5px') {
        themeProperties.borderRadius = value;
        setRootVars({ '--border-radius': value });
      },
    };

    obj.setAll = function (values) {
      for (const [key, value] of Object.entries(values)) {
        const setterName = 'set' + key[0].toUpperCase() + key.slice(1);
        if (typeof obj[setterName] === 'function') obj[setterName](value);
      }
    };

    return obj;
  }

  function isUrlOrPath(input) {
    try {
      new URL(input);
      return true;
    } catch {
      return input.startsWith('/');
    }
  }

  function hslValuesToThemeString([h, s, l]) {
    return `${h} ${s} ${l}`;
  }

  function hslValuesToCSSString([h, s, l]) {
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  function extractDigitsFromString(str) {
    return str?.match(/\d+(\.\d+)?/g)?.map(parseFloat) || [];
  }

  function extractValuesFromHslString(hslString) {
    const [h, s, l] = extractDigitsFromString(hslString);
    return [h, s, l];
  }

  function hslToHex(value) {
    let [h, s, l] = value;

    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function hexToHsl(H) {
    let r = 0,
      g = 0,
      b = 0;
    if (H.length == 4) {
      r = '0x' + H[1] + H[1];
      g = '0x' + H[2] + H[2];
      b = '0x' + H[3] + H[3];
    } else if (H.length == 7) {
      r = '0x' + H[1] + H[2];
      g = '0x' + H[3] + H[4];
      b = '0x' + H[5] + H[6];
    }

    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [Math.round(h), Math.round(s), Math.round(l)];
  }

  function updateConfiguration() {
    const { themeProperties } = newThemePropertiesManager();
    const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
    const presets = storedThemesConfig?.preset;

    const current = presets?.find(p => p.themeName === themeProperties.themeName);
    if (current) Object.assign(current, themeProperties);

    [true, false].forEach(isLight => {
      const group = presets?.filter(p => p.isLight === isLight);
      if (!group) return;
      if (current && current.isLight === isLight && current.isDefault) {
        group.forEach(p => (p.isDefault = p === current));
        return;
      }

      if (!group?.some(p => p.isDefault) && group.length) group[0].isDefault = true;
    });

    const syncedPreset = presets?.find(p => p.themeName === themeProperties.themeName);
    if (syncedPreset) Object.assign(themeProperties, syncedPreset);

    const newConfig = { ...storedThemesConfig, themeProperties };
    localStorage.setItem(configKey, JSON.stringify(newConfig));
    return newConfig;
  }

  function prefersColorSchemeChange(callback = null) {
    const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
    const preset = storedThemesConfig?.preset || [];

    const currentThemeIsLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const selectedTheme = preset.find(p => p?.isLight === currentThemeIsLight && p?.isDefault);

    if (storedThemesConfig.followSystemScheme && selectedTheme) {
      const newConfig = {...storedThemesConfig, themeProperties: selectedTheme };
      localStorage.setItem(configKey, JSON.stringify(newConfig));
      setAll(selectedTheme);
      regenerateThemePicker(newConfig);
    } else {
      setAll(storedThemesConfig.themeProperties);
    }
    if (typeof callback === 'function') callback();
  }

  function followSystemSchemeFn(enabled, callback) {
    const matchScheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (!matchScheme._listener) matchScheme._listener = () => prefersColorSchemeChange(callback);
    if (typeof matchScheme._listener === 'function') matchScheme._listener();

    if (enabled && !matchScheme._hasChangeListener) {
      matchScheme.addEventListener('change', matchScheme._listener);
      matchScheme._hasChangeListener = true;
    } else if (!enabled && matchScheme._hasChangeListener) {
      matchScheme.removeEventListener('change', matchScheme._listener);
      matchScheme._hasChangeListener = false;
    }
  }

  function regenerateThemePicker(config) {
    if (!config?.overrideTheming) return;
    document.querySelectorAll('.theme-picker').forEach(t => {
      generateThemeChoices({ el: t, config });
      attachAutoThemeToggle({ el: t, config });
    });
  }
  regenerateThemePicker(glanceThemeConfig);

  function attachAutoThemeToggle({ el, config } = {}) {
    let popoverEl = el?.querySelector('[data-popover-html]');
    if (!popoverEl) popoverEl = document.querySelector('.popover-content:has(.auto-theme-toggle-container)');
    if (!popoverEl) return;

    if (!popoverEl.querySelector('.theme-choices:has(.theme-preset-light):has(.theme-preset-dark)')) return;

    const toggleElFrag = createElementFn({ isFragment: true });
    const toggleContainer = createElementFn({ classes: 'auto-theme-toggle-container' });
    const toggleLabel = createElementFn({ tag: 'label', textContent: 'FOLLOW SYSTEM' });

    const toggleEl = createElementFn({ tag: 'label', classes: 'toggle' });
    const toggleSwitch = createElementFn({ tag: 'span', classes: 'toggle-switch' });
    const toggleInput = createElementFn({
      tag: 'input',
      props: { type: 'checkbox', name: 'auto-follow-system', checked: config?.followSystemScheme },
    });

    const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
    const eventFn = e => {
      storedThemesConfig.followSystemScheme = e.target.checked;
      localStorage.setItem(configKey, JSON.stringify(storedThemesConfig));
      regenerateThemePicker(storedThemesConfig);
      followSystemSchemeFn(e.target.checked);
    }

    toggleInput.removeEventListener('click', eventFn);
    toggleInput.addEventListener('click', eventFn);

    toggleEl.appendChild(toggleInput);
    toggleEl.appendChild(toggleSwitch);

    if (popoverEl.querySelector('.auto-theme-toggle-container')) {
      toggleElFrag.appendChild(toggleLabel);
      toggleElFrag.appendChild(toggleEl);
      toggleContainer.replaceChildren(toggleElFrag);
    } else {
      toggleContainer.appendChild(toggleLabel);
      toggleContainer.appendChild(toggleEl);
      popoverEl.prepend(toggleContainer);
    }
  }

  function generateThemeChoices({ el, config } = {}) {
    let themeChoices = el.querySelector('.theme-choices');
    if (!themeChoices) themeChoices = document.querySelector('.popover-content .theme-choices');
    if (!themeChoices) return;

    const themePreview = el.querySelector('.current-theme-preview');
    const newPresetFragment = createElementFn({ isFragment: true });
    const newProperties = config?.themeProperties;
    if (!newProperties) return;

    const resetCurrentClasses = () => themeChoices.childNodes.forEach(presetEl => presetEl.classList.remove('current'));

    const themePresetContent = p => `
      <div class="theme-color" style="--color: ${hslValuesToCSSString(p.primaryColor)}"></div>
      <div class="theme-color" style="--color: ${hslValuesToCSSString(p.positiveColor)}"></div>
      <div class="theme-color" style="--color: ${hslValuesToCSSString(p.negativeColor)}"></div>
    `;

    const themePreviewHTML = `
      <button class="theme-preset current theme-preset-${newProperties.isLight ? 'light' : 'dark'}"
        style="--color: ${hslValuesToCSSString(newProperties.backgroundColor)}" data-key="${newProperties.themeName}" title="${newProperties.themeName}">
          ${themePresetContent(newProperties)}
      </button>
    `;

    const createPresetEl = p => {
      const presetEl = createElementFn({
        tag: 'button',
        classes: `theme-preset theme-preset-${p.isLight ? 'light' : 'dark'}${newProperties.themeName === p.themeName ? ' current' : ''}`,
        datasets: { key: p.themeName },
        attrs: { title: p.themeName },
        htmlContent: themePresetContent(p),
        events: {
          click: () => {
            const newTheme = p;
            config.themeProperties = newTheme;
            localStorage.setItem(configKey, JSON.stringify(config));
            setAll(newTheme);
            resetCurrentClasses();
            presetEl.classList.add('current');
            themePreview.innerHTML = presetEl.outerHTML;
          }
        }
      });
      return presetEl;
    }

    const configThemePresets = config?.preset;
    if (configThemePresets) {
      configThemePresets
        ?.filter(p => !config?.followSystemScheme || p.isLight === config.themeProperties.isLight)
        ?.forEach(p => {
          if (newProperties?.themeName === p.themeName) themePreview.innerHTML = themePreviewHTML;
          const presetEl = createPresetEl(p);
          presetEl.style.setProperty('--color', hslValuesToCSSString(p.backgroundColor));
          newPresetFragment.appendChild(presetEl);
      });
    } else {
      themePreview.innerHTML = themePreviewHTML;
      const presetEl = createPresetEl(newProperties);
      presetEl.style.setProperty('--color', hslValuesToCSSString(newProperties.backgroundColor));
      newPresetFragment.appendChild(presetEl);
    }

    themeChoices.replaceChildren(newPresetFragment);
  }

  window.glanceTheming = {
    newThemePropertiesManager,
    hexToHsl,
    hslToHex,
    hslValuesToThemeString,
    hslValuesToCSSString,
    regenerateThemePicker,
    updateConfiguration,
    followSystemSchemeFn,
  };
})();