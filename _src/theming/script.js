'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  var _window, _window$GLANCE_ADDON_, _customSettingsFuncti;
  // Catch duplicate instances
  const scriptName = 'Theming';
  if (((_window$GLANCE_ADDON_ = (_window = window).GLANCE_ADDON_SCRIPTS) !== null && _window$GLANCE_ADDON_ !== void 0 ? _window$GLANCE_ADDON_ : _window.GLANCE_ADDON_SCRIPTS = {})[scriptName] === true) {
    var _window$showToast, _window2;
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') (_window$showToast = (_window2 = window).showToast) === null || _window$showToast === void 0 || _window$showToast.call(_window2, msg, {
      type: 'error'
    });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  // Catch Missing Dependencies
  const createElementFn = window.CREATE_ELEMENT;
  if (typeof createElementFn !== 'function') {
    var _window$showToast2, _window3;
    const msg = 'The global-function CREATE_ELEMENT not found, read the dependency in the README.md of this script.';
    if (typeof window.showToast === 'function') (_window$showToast2 = (_window3 = window).showToast) === null || _window$showToast2 === void 0 || _window$showToast2.call(_window3, msg, {
      title: 'THEMING',
      type: 'error'
    });else alert(msg);
    console.error('CREATE_ELEMENT not found');
    return;
  }
  const configPathKey = 'glance-theme-config-path';
  const configKey = 'glance-theme-storage';
  // localStorage.setItem(configKey, ''); // uncomment once to Restore to default. Useful on mobile browsers
  const {
    themeProperties,
    setAll
  } = newThemePropertiesManager();
  if (!localStorage.getItem(configKey)) localStorage.setItem(configKey, JSON.stringify({
    themeProperties
  }));
  const glanceThemeConfig = JSON.parse(localStorage.getItem(configKey));
  if (glanceThemeConfig !== null && glanceThemeConfig !== void 0 && glanceThemeConfig.overrideTheming) followSystemSchemeFn(glanceThemeConfig === null || glanceThemeConfig === void 0 ? void 0 : glanceThemeConfig.followSystemScheme);
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
    let [backgroundSaturation] = extractDigitsFromString(style.getPropertyValue('--bgs'));
    let [backgroundLightness] = extractDigitsFromString(style.getPropertyValue('--bgl'));
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
    };
    const applyBackgroundImage = (fadeImage = true) => {
      const isValid = themeProperties.backgroundImage !== '' || isUrlOrPath(themeProperties.backgroundImage);
      if (fadeImage) document.body.setAttribute('theming-image', '');
      setRootVars({
        '--background-gradient-overlay': isValid ? `linear-gradient(hsla(var(--bghs), var(--bgl), var(--background-image-url-alpha, 1)),
            hsla(var(--bghs), var(--bgl), var(--background-image-url-alpha, 1)))` : 'none'
      });
      setTimeout(() => {
        setRootVars({
          '--background-image-url-body': isValid ? `url(${themeProperties.backgroundImage})` : 'var(--color-background)'
        });
        document.body.setAttribute('theming-image', 'visible');
      }, 500);
    };
    const themeProperties = {
      themeName: documentRoot.dataset.theme,
      isDefault: documentRoot.dataset.defaultTheme === 'true',
      isLight: documentRoot.dataset.scheme === 'light',
      backgroundColor: [backgroundHue, backgroundSaturation, backgroundLightness],
      primaryColor: extractValuesFromHslString(style.getPropertyValue('--color-primary')),
      positiveColor: extractValuesFromHslString(style.getPropertyValue('--color-positive')),
      negativeColor: extractValuesFromHslString(style.getPropertyValue('--color-negative')),
      contrastMultiplier: style.getPropertyValue('--cm'),
      textSaturationMultiplier: style.getPropertyValue('--tsm'),
      backgroundImage: style.getPropertyValue('--background-image-url') || '',
      backgroundImageAlpha: style.getPropertyValue('--background-image-url-alpha') || 1,
      colorWidgetBackgroundAlpha: style.getPropertyValue('--color-widget-background-alpha') || 1,
      widgetBackgroundBlur: style.getPropertyValue('--widget-background-blur-value') || 0,
      colorPopoverBackgroundAlpha: style.getPropertyValue('--color-popover-background-alpha') || 1,
      borderRadius: style.getPropertyValue('--border-radius')
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
        setRootVars({
          '--color-primary': hslValuesToCSSString(value)
        });
      },
      setSecondaryColor: function (value) {
        themeProperties.secondaryColor = value;
        setRootVars({
          '--color-secondary': hslValuesToCSSString(value)
        });
      },
      setPositiveColor: function (value) {
        themeProperties.positiveColor = value;
        setRootVars({
          '--color-positive': hslValuesToCSSString(value)
        });
      },
      setNegativeColor: function (value) {
        themeProperties.negativeColor = value;
        setRootVars({
          '--color-negative': hslValuesToCSSString(value)
        });
      },
      setContrastMultiplier: function (value) {
        const newValue = clamp(value, 0.3, 2);
        if (isNaN(newValue)) return errorMessage('Invalid contrast multiplier value:', value);
        themeProperties.contrastMultiplier = newValue;
        setRootVars({
          '--cm': newValue
        });
      },
      setTextSaturationMultiplier: function (value) {
        const newValue = clamp(value, 0.3, 5);
        if (isNaN(newValue)) return errorMessage('Invalid text saturation multiplier value:', value);
        themeProperties.textSaturationMultiplier = newValue;
        setRootVars({
          '--tsm': newValue
        });
      },
      setBackgroundImage: function (value = '') {
        const fadeImage = themeProperties.backgroundImage !== value;
        themeProperties.backgroundImage = value;
        setRootVars({
          '--background-image-url': value
        });
        applyBackgroundImage(fadeImage);
      },
      setBackgroundImageAlpha: function (value = 0.5) {
        const newValue = clamp(value, 0, 0.9);
        if (isNaN(newValue)) return errorMessage('Invalid background image alpha value:', value);
        themeProperties.backgroundImageAlpha = newValue;
        setRootVars({
          '--background-image-url-alpha': newValue
        });
      },
      setColorWidgetBackgroundAlpha: function (value = 1) {
        const newValue = clamp(value, 0.1, 1);
        if (isNaN(newValue)) return errorMessage('Invalid color widget background alpha value:', value);
        themeProperties.colorWidgetBackgroundAlpha = newValue;
        setRootVars({
          '--color-widget-background-alpha': newValue
        });
        setRootVars({
          '--color-widget-background': `hsla(var(--color-widget-background-hsl-values), var(--color-widget-background-alpha, 1))`
        });
        setRootVars({
          '--color-widget-background-highlight': `hsla(var(--bghs), calc(var(--scheme) (var(--scheme) var(--bgl) + 4%)), var(--color-widget-background-alpha, 1))`
        });
      },
      setWidgetBackgroundBlur: function (value = '0px') {
        const valueNumber = isNaN(value) ? Number(value.replace('px', '')) : value;
        if (isNaN(valueNumber)) return errorMessage('Invalid widget background blur value:', value);
        const newValue = clamp(valueNumber, 0, 12);
        themeProperties.widgetBackgroundBlur = newValue;
        setRootVars({
          '--widget-background-blur-value': newValue
        });
        setRootVars({
          '--widget-background-blur': newValue === 0 ? 'none' : `blur(${newValue}px)`
        });
      },
      setColorPopoverBackgroundAlpha: function (value = 1) {
        const newValue = clamp(value, 0.1, 1);
        if (isNaN(newValue)) return errorMessage('Invalid color popover background alpha value:', value);
        themeProperties.colorPopoverBackgroundAlpha = newValue;
        setRootVars({
          '--color-popover-background-alpha': newValue
        });
        setRootVars({
          '--color-popover-background': `hsla(var(--bgh), calc(var(--bgs) + 3%), calc(var(--bgl) + 3%), var(--color-popover-background-alpha))`
        });
      },
      setBorderRadius: function (value = '5px') {
        const valueNumber = Number(value.replace('px', ''));
        if (isNaN(valueNumber)) return errorMessage('Invalid border radius value:', value);
        const newValue = `${clamp(valueNumber, 0, 30)}px`;
        themeProperties.borderRadius = newValue;
        setRootVars({
          '--border-radius': newValue
        });
      }
    };
    obj.setAll = function (values) {
      for (const [key, value] of Object.entries(values)) {
        const setterName = 'set' + key[0].toUpperCase() + key.slice(1);
        if (typeof obj[setterName] === 'function') obj[setterName](value);
      }
    };
    return obj;
  }
  function clamp(value, min, max) {
    return Math.min(Math.max(parseFloat(value), min), max);
  }
  function errorMessage(msg) {
    var _window$showToast3, _window4;
    (_window$showToast3 = (_window4 = window).showToast) === null || _window$showToast3 === void 0 || _window$showToast3.call(_window4, msg, {
      type: 'error'
    });
    throw new Error(msg);
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
    var _str$match;
    return (str === null || str === void 0 || (_str$match = str.match(/\d+(\.\d+)?/g)) === null || _str$match === void 0 ? void 0 : _str$match.map(parseFloat)) || [];
  }
  function extractValuesFromHslString(hslString) {
    const [h, s, l] = extractDigitsFromString(hslString);
    return [h, s, l];
  }
  function hslToHex(value) {
    let [h, s, l] = value;
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
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
    if (delta == 0) h = 0;else if (cmax == r) h = (g - b) / delta % 6;else if (cmax == g) h = (b - r) / delta + 2;else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    return [Math.round(h), Math.round(s), Math.round(l)];
  }
  function updateConfiguration() {
    const {
      themeProperties
    } = newThemePropertiesManager();
    const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
    const presets = storedThemesConfig === null || storedThemesConfig === void 0 ? void 0 : storedThemesConfig.preset;
    const current = presets === null || presets === void 0 ? void 0 : presets.find(p => p.themeName === themeProperties.themeName);
    if (current) Object.assign(current, themeProperties);
    [true, false].forEach(isLight => {
      const group = presets === null || presets === void 0 ? void 0 : presets.filter(p => p.isLight === isLight);
      if (!group) return;
      if (current && current.isLight === isLight && current.isDefault) {
        group.forEach(p => p.isDefault = p === current);
        return;
      }
      if (!(group !== null && group !== void 0 && group.some(p => p.isDefault)) && group.length) {
        var _window$showToast4, _window5;
        group[0].isDefault = true;
        (_window$showToast4 = (_window5 = window).showToast) === null || _window$showToast4 === void 0 || _window$showToast4.call(_window5, 'No default theme for scheme set, falling back to the first one.');
      }
    });
    const syncedPreset = presets === null || presets === void 0 ? void 0 : presets.find(p => p.themeName === themeProperties.themeName);
    if (syncedPreset) Object.assign(themeProperties, syncedPreset);
    const newConfig = {
      ...storedThemesConfig,
      themeProperties
    };
    localStorage.setItem(configKey, JSON.stringify(newConfig));
    regenerateThemePicker(newConfig);
    return newConfig;
  }
  function prefersColorSchemeChange(callback = null) {
    const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
    const preset = (storedThemesConfig === null || storedThemesConfig === void 0 ? void 0 : storedThemesConfig.preset) || [];
    const currentThemeIsLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const selectedTheme = preset.find(p => (p === null || p === void 0 ? void 0 : p.isLight) === currentThemeIsLight && (p === null || p === void 0 ? void 0 : p.isDefault));
    if (storedThemesConfig.followSystemScheme && selectedTheme) {
      const newConfig = {
        ...storedThemesConfig,
        themeProperties: selectedTheme
      };
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
    if (!(config !== null && config !== void 0 && config.overrideTheming)) return;
    document.querySelectorAll('.theme-picker').forEach(el => {
      generateThemeChoices({
        el,
        config
      });
      attachAutoThemeToggle({
        el,
        config
      });
    });
  }
  regenerateThemePicker(glanceThemeConfig);
  function attachAutoThemeToggle({
    el,
    config
  } = {}) {
    let popoverEl = el === null || el === void 0 ? void 0 : el.querySelector('[data-popover-html]');
    if (popoverEl) popoverEl.classList.add('theme-choices-popover');
    if (!popoverEl) popoverEl = document.querySelector('.popover-content:has(.auto-theme-toggle-container)');
    if (!popoverEl) return;
    if (!popoverEl.querySelector('.theme-choices:has(.theme-preset-light):has(.theme-preset-dark)')) return;
    const toggleElFrag = createElementFn({
      isFragment: true
    });
    const toggleContainer = createElementFn({
      classes: 'auto-theme-toggle-container'
    });
    const toggleLabel = createElementFn({
      tag: 'label',
      textContent: 'FOLLOW SYSTEM'
    });
    const toggleEl = createElementFn({
      tag: 'label',
      classes: 'toggle'
    });
    const toggleSwitch = createElementFn({
      tag: 'span',
      classes: 'toggle-switch'
    });
    const toggleInput = createElementFn({
      tag: 'input',
      props: {
        type: 'checkbox',
        name: 'auto-follow-system',
        checked: config === null || config === void 0 ? void 0 : config.followSystemScheme
      }
    });
    const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
    const eventFn = e => {
      storedThemesConfig.followSystemScheme = e.target.checked;
      localStorage.setItem(configKey, JSON.stringify(storedThemesConfig));
      regenerateThemePicker(storedThemesConfig);
      followSystemSchemeFn(e.target.checked);
    };
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
  function generateThemeChoices({
    el,
    config
  } = {}) {
    let themeChoices = el.querySelector('.theme-choices');
    if (!themeChoices) themeChoices = document.querySelector('.popover-content .theme-choices');
    if (!themeChoices) return;
    const themePreview = el.querySelector('.current-theme-preview');
    const newPresetFragment = createElementFn({
      isFragment: true
    });
    const newProperties = config === null || config === void 0 ? void 0 : config.themeProperties;
    if (!newProperties) return;
    const resetCurrentClasses = () => themeChoices.childNodes.forEach(presetEl => presetEl.classList.remove('current'));
    const themePresetContent = p => {
      const borderRadiusIcon = `calc(${p.borderRadius} / 4)`;
      return `
        <div class="theme-color" style="--color: ${hslValuesToCSSString(p.primaryColor)}; border-radius: ${borderRadiusIcon};"></div>
        <div class="theme-color" style="--color: ${hslValuesToCSSString(p.positiveColor)}; border-radius: ${borderRadiusIcon};"></div>
        <div class="theme-color" style="--color: ${hslValuesToCSSString(p.negativeColor)}; border-radius: ${borderRadiusIcon};"></div>
      `;
    };
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
        datasets: {
          key: p.themeName
        },
        attrs: {
          title: p.themeName
        },
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
    };
    const configThemePresets = config === null || config === void 0 ? void 0 : config.preset;
    if (configThemePresets) {
      var _configThemePresets$f;
      configThemePresets === null || configThemePresets === void 0 || (_configThemePresets$f = configThemePresets.filter(p => !(config !== null && config !== void 0 && config.followSystemScheme) || p.isLight === config.themeProperties.isLight)) === null || _configThemePresets$f === void 0 || _configThemePresets$f.forEach(p => {
        if ((newProperties === null || newProperties === void 0 ? void 0 : newProperties.themeName) === p.themeName) themePreview.innerHTML = themePreviewHTML;
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
    followSystemSchemeFn
  };
  while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));
  const customSettingsFunctions = window.customSettingsFunctions;
  if (!(customSettingsFunctions && typeof customSettingsFunctions === 'object')) return;
  const glanceThemeConfigPresets = (glanceThemeConfig === null || glanceThemeConfig === void 0 ? void 0 : glanceThemeConfig.preset) || [];
  const glanceThemeConfigProperties = glanceThemeConfig.themeProperties;
  const configForOverride = glanceThemeConfig.overrideTheming ? [{
    type: 'toggle',
    name: 'Follow System Scheme',
    key: 'follow-system-scheme',
    value: glanceThemeConfig === null || glanceThemeConfig === void 0 ? void 0 : glanceThemeConfig.followSystemScheme,
    tooltip: 'Requires one of each scheme.'
  }, {
    type: 'text',
    name: 'Load Theme Config from Path/URL',
    key: 'theme-configuration-url',
    value: localStorage.getItem(configPathKey) || '',
    colOffset: 2,
    tooltip: 'A way to load theme in JSON format from either your assets-path or from a URL.',
    icon: `
        <svg viewBox="0 0 24 24" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12ZM12 6.25C12.4142 6.25 12.75 6.58579 12.75 7V12.1893L14.4697 10.4697C14.7626 10.1768 15.2374 10.1768 15.5303 10.4697C15.8232 10.7626 15.8232 11.2374 15.5303 11.5303L12.5303 14.5303C12.3897 14.671 12.1989 14.75 12 14.75C11.8011 14.75 11.6103 14.671 11.4697 14.5303L8.46967 11.5303C8.17678 11.2374 8.17678 10.7626 8.46967 10.4697C8.76256 10.1768 9.23744 10.1768 9.53033 10.4697L11.25 12.1893V7C11.25 6.58579 11.5858 6.25 12 6.25ZM8 16.25C7.58579 16.25 7.25 16.5858 7.25 17C7.25 17.4142 7.58579 17.75 8 17.75H16C16.4142 17.75 16.75 17.4142 16.75 17C16.75 16.5858 16.4142 16.25 16 16.25H8Z" fill="fillColor"></path> </g></svg>
      `
  }, {
    type: 'dropdown',
    name: 'Theme Preset',
    key: 'theme-preset',
    value: glanceThemeConfigProperties.themeName,
    options: glanceThemeConfigPresets.map(p => p.themeName) || [],
    disabled: glanceThemeConfigPresets.length === 0,
    tooltip: 'Can only be populated by loading a theme configuration from a Path/URL'
  }, {
    type: 'toggle',
    name: 'Default for Scheme',
    key: 'is-default',
    value: glanceThemeConfigProperties.isDefault,
    tooltip: 'Only one default per light and dark scheme, will automatically uncheck others.'
  }, {
    type: 'toggle',
    name: 'Light Scheme',
    key: 'is-light-scheme',
    value: glanceThemeConfigProperties.isLight,
    disabled: (glanceThemeConfig === null || glanceThemeConfig === void 0 ? void 0 : glanceThemeConfig.followSystemScheme) || false,
    tooltip: 'Set this theme a light theme. Follow System Scheme needs to be disabled.'
  }, {
    type: 'color',
    name: 'Background Color',
    key: 'background-color',
    value: hslToHex(glanceThemeConfigProperties.backgroundColor),
    title: `HSL: ${glanceThemeConfigProperties.backgroundColor}\nHEX: ${hslToHex(glanceThemeConfigProperties.backgroundColor)}`
  }, {
    type: 'color',
    name: 'Primary Color',
    key: 'primary-color',
    value: hslToHex(glanceThemeConfigProperties.primaryColor),
    title: `HSL: ${glanceThemeConfigProperties.primaryColor}\nHEX: ${hslToHex(glanceThemeConfigProperties.primaryColor)}`
  }, {
    type: 'color',
    name: 'Positive Color',
    key: 'positive-color',
    value: hslToHex(glanceThemeConfigProperties.positiveColor),
    title: `HSL: ${glanceThemeConfigProperties.positiveColor}\nHEX: ${hslToHex(glanceThemeConfigProperties.positiveColor)}`
  }, {
    type: 'color',
    name: 'Negative Color',
    key: 'negative-color',
    value: hslToHex(glanceThemeConfigProperties.negativeColor),
    title: `HSL: ${glanceThemeConfigProperties.negativeColor}\nHEX: ${hslToHex(glanceThemeConfigProperties.negativeColor)}`
  }, {
    type: 'slider',
    name: 'Contrast Multiplier',
    key: 'contrast-multiplier',
    min: 0.3,
    max: 2,
    step: 0.1,
    value: glanceThemeConfigProperties.contrastMultiplier
  }, {
    type: 'slider',
    name: 'Text Saturation Multiplier',
    key: 'text-saturation-multiplier',
    min: 0.3,
    max: 5,
    step: 0.1,
    value: glanceThemeConfigProperties.textSaturationMultiplier
  }, {
    type: 'slider',
    name: 'Border Radius',
    key: 'border-radius',
    min: 0,
    max: 30,
    step: 1,
    value: parseFloat(glanceThemeConfigProperties.borderRadius)
  }, {
    type: 'text',
    name: 'Background Image Path/URL',
    key: 'background-image-path',
    value: (glanceThemeConfigProperties === null || glanceThemeConfigProperties === void 0 ? void 0 : glanceThemeConfigProperties.backgroundImage) || '',
    colOffset: 2,
    tooltip: 'Recommended: Image should be under 1 MB. Beyond this may affect performance!'
  }, {
    type: 'slider',
    name: 'Background Image Alpha',
    key: 'background-image-url-alpha',
    min: 0,
    max: 0.9,
    step: 0.05,
    disabled: (glanceThemeConfigProperties === null || glanceThemeConfigProperties === void 0 ? void 0 : glanceThemeConfigProperties.backgroundImage) === '',
    value: glanceThemeConfigProperties.backgroundImageAlpha || 0.5
  }, {
    type: 'slider',
    name: 'Widget Background Alpha',
    key: 'color-widget-background-alpha',
    min: 0.1,
    max: 1,
    step: 0.05,
    value: glanceThemeConfigProperties.colorWidgetBackgroundAlpha
  }, {
    type: 'slider',
    name: 'Widget Background Blur',
    key: 'widget-background-blur',
    min: 0,
    max: 12,
    step: 1,
    value: glanceThemeConfigProperties.widgetBackgroundBlur,
    tooltip: 'WARNING! GPU-intensive, set to 0px to disable.'
  }, {
    type: 'slider',
    name: 'Color Popover Alpha',
    key: 'color-popover-background-alpha',
    min: 0.1,
    max: 1,
    step: 0.05,
    value: glanceThemeConfigProperties.colorPopoverBackgroundAlpha
  }, {
    type: 'textarea',
    name: 'Current JSON Configuration',
    key: 'current-configuration',
    value: JSON.stringify(glanceThemeConfigProperties, null, 2),
    colOffset: 1,
    height: '310px',
    moreButtons: [{
      name: 'Copy this configuration',
      key: 'copy-this-json-configuration'
    }]
  }, {
    type: 'buttons',
    buttons: [{
      name: 'Restore Defaults',
      key: 'restore-defaults',
      negative: true
    }, {
      name: 'Reload Page',
      key: 'reload-page'
    }, {
      name: 'Copy this YAML Config',
      key: 'copy-glance-theme-config',
      tooltip: 'This is for Glance default theme yaml properties.'
    }, {
      name: 'Copy ALL JSON Config',
      key: 'copy-all-json-configuration',
      tooltip: `If you want to store and host it somewhere, even in your Glance assets-path.`
    }],
    colOffset: 1
  }] : [{
    type: 'buttons',
    buttons: [{
      name: 'Restore Defaults',
      key: 'restore-defaults',
      negative: true
    }],
    colOffset: 1
  }];
  (_customSettingsFuncti = customSettingsFunctions.createCustomSettingsItem) === null || _customSettingsFuncti === void 0 || _customSettingsFuncti.call(customSettingsFunctions, {
    name: 'Theming',
    order: 2,
    contentObject: [{
      type: 'toggle',
      name: 'Override Theming',
      key: 'override-theming',
      value: glanceThemeConfig.overrideTheming,
      colOffset: 2,
      tooltip: 'This will disable the built-in Glance theme.'
    }, ...configForOverride, {
      type: 'custom-html',
      contentHTML: `
        <div class="flex-1">
          <a class="color-primary visited-indicator" target="_blank" rel="noreferrer" href="https://github.com/ralphocdol/glance-addon-scripts/tree/main/theming">
            Project Repository
          </a>
        </div>
        <div class="flex-1">
          <a class="color-primary visited-indicator" target="_blank" rel="noreferrer" href="https://github.com/ralphocdol/glance-addon-scripts">
            Glance Addon Scripts
          </a>
        </div>
        <div class="flex-1">
          Based on
          <a class="color-primary" target="_blank" rel="noreferrer" href="https://github.com/glanceapp/glance/discussions/184">
            Theme editor
          </a>
          by
          <a class="color-primary" target="_blank" rel="noreferrer" href="https://github.com/svilenmarkov">
            svilenmarkov
          </a>
        </div>
      `,
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start'
      }
    }],
    contentEventListener: {
      setup: () => {
        var _KEYED_ELEMENT_2;
        const configKey = 'glance-theme-storage';
        const configPathKey = 'glance-theme-config-path';
        const {
          hslToHex,
          hexToHsl,
          hslValuesToThemeString,
          newThemePropertiesManager,
          hslValuesToCSSString,
          regenerateThemePicker,
          updateConfiguration,
          followSystemSchemeFn
        } = window.glanceTheming;
        const {
          themeProperties,
          setIsDefault,
          setIsLight,
          setPrimaryColor,
          setPositiveColor,
          setNegativeColor,
          setBackgroundColor,
          setBackgroundImage,
          setAll,
          setContrastMultiplier,
          setTextSaturationMultiplier,
          setColorWidgetBackgroundAlpha,
          setBackgroundImageAlpha,
          setWidgetBackgroundBlur,
          setColorPopoverBackgroundAlpha,
          setBorderRadius
        } = newThemePropertiesManager();
        const confirmDialog = typeof window.customDialog === 'function' ? (msg, config) => window.customDialog(msg, config) : msg => window.confirm(msg);
        const followSystemIsChecked = ((_KEYED_ELEMENT_2 = _KEYED_ELEMENT_('follow-system-scheme')) === null || _KEYED_ELEMENT_2 === void 0 ? void 0 : _KEYED_ELEMENT_2.checked) || false;
        function setColorInputValue(el, color) {
          const colorHex = hslToHex(color);
          _SET_KEYED_ELEMENT_(el, {
            value: colorHex,
            title: `HSL: ${color}\nHEX: ${colorHex}`
          });
        }
        function setValuesWithConfig(config) {
          const configThemeProperties = config.themeProperties;
          const themePresetEl = _KEYED_ELEMENT_('theme-preset');
          const presets = (config === null || config === void 0 ? void 0 : config.preset) || [];
          _SET_KEYED_ELEMENT_('override-theming', {
            checked: config.overrideTheming
          });
          _SET_KEYED_ELEMENT_('follow-system-scheme', {
            checked: config === null || config === void 0 ? void 0 : config.followSystemScheme
          });
          themePresetEl.value = configThemeProperties.themeName;
          themePresetEl.replaceChildren(...(presets.filter(o => !(config !== null && config !== void 0 && config.followSystemScheme) || o.isLight === configThemeProperties.isLight).map(o => {
            const selected = o.themeName === configThemeProperties.themeName;
            return new Option(`${o.isLight ? '☀️' : '🌙'} ${o.themeName}`, o.themeName, selected, selected);
          }) || []));
          themePresetEl.disabled = presets.length === 0;
          _SET_KEYED_ELEMENT_('is-default', {
            checked: configThemeProperties.isDefault
          });
          _SET_KEYED_ELEMENT_('is-light-scheme', {
            checked: configThemeProperties.isLight,
            disabled: config.followSystemScheme
          });
          setColorInputValue('background-color', configThemeProperties.backgroundColor);
          setColorInputValue('primary-color', configThemeProperties.primaryColor);
          setColorInputValue('positive-color', configThemeProperties.positiveColor);
          setColorInputValue('negative-color', configThemeProperties.negativeColor);
          _SET_KEYED_ELEMENT_('contrast-multiplier', {
            value: configThemeProperties.contrastMultiplier
          });
          _SET_KEYED_ELEMENT_('text-saturation-multiplier', {
            value: configThemeProperties.textSaturationMultiplier
          });
          _SET_KEYED_ELEMENT_('border-radius', {
            value: parseFloat(configThemeProperties.borderRadius || '5')
          });
          _SET_KEYED_ELEMENT_('background-image-path', {
            value: configThemeProperties.backgroundImage || ''
          });
          _SET_KEYED_ELEMENT_('background-image-url-alpha', {
            value: configThemeProperties.backgroundImageAlpha || 0.5,
            disabled: configThemeProperties.backgroundImage === ''
          });
          _SET_KEYED_ELEMENT_('color-widget-background-alpha', {
            value: configThemeProperties.colorWidgetBackgroundAlpha || 1
          });
          _SET_KEYED_ELEMENT_('widget-background-blur', {
            value: configThemeProperties.widgetBackgroundBlur || 0
          });
          _SET_KEYED_ELEMENT_('color-popover-background-alpha', {
            value: configThemeProperties.colorPopoverBackgroundAlpha || 1
          });
          _SET_KEYED_ELEMENT_('current-configuration', {
            value: customSettingsFunctions.customJSONStringify(configThemeProperties)
          });
          _SET_SLIDER_LABEL_('contrast-multiplier', configThemeProperties.contrastMultiplier);
          _SET_SLIDER_LABEL_('text-saturation-multiplier', configThemeProperties.textSaturationMultiplier);
          _SET_SLIDER_LABEL_('border-radius', configThemeProperties.borderRadius || '5px');
          _SET_SLIDER_LABEL_('background-image-url-alpha', configThemeProperties.backgroundImageAlpha || 1);
          _SET_SLIDER_LABEL_('color-widget-background-alpha', configThemeProperties.colorWidgetBackgroundAlpha || 1);
          _SET_SLIDER_LABEL_('widget-background-blur', (configThemeProperties.widgetBackgroundBlur || 0) + 'px');
          _SET_SLIDER_LABEL_('color-popover-background-alpha', configThemeProperties.colorPopoverBackgroundAlpha || 1);
        }
        const updateConfig = () => {
          setValuesWithConfig(updateConfiguration());
        };
      },
      ready: () => {
        const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
        if (!storedThemesConfig.overrideTheming) return;
        setValuesWithConfig(storedThemesConfig);
        followSystemSchemeFn(_KEYED_ELEMENT_('follow-system-scheme').checked, () => updateConfig());
      },
      click: async e => {
        const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
        const target = e.target;
        const keyEl = _KEYED_ELEMENT_(target.dataset.key);
        if (target.dataset.key === 'override-theming') {
          if (await confirmDialog(target.checked ? 'This will override the built one rendering it useless, proceed and reload?' : 'Disable and reload?')) {
            customSettingsFunctions.setValueByPath(storedThemesConfig, 'overrideTheming', target.checked);
            localStorage.setItem(configKey, JSON.stringify({
              ...storedThemesConfig
            }));
            location.reload();
          } else {
            target.checked = !target.checked;
          }
        }
        if (target.dataset.key === 'follow-system-scheme') {
          customSettingsFunctions.setValueByPath(storedThemesConfig, 'followSystemScheme', target.checked);
          localStorage.setItem(configKey, JSON.stringify({
            ...storedThemesConfig
          }));
          updateConfig();
          followSystemSchemeFn(_KEYED_ELEMENT_('follow-system-scheme').checked, () => updateConfig());
          document.querySelectorAll('.theme-picker .auto-theme-toggle-container [name="auto-follow-system"]').forEach(t => t.checked = target.checked);
        }
        if (target.dataset.key === 'theme-configuration-url') {
          if (keyEl.value && (await confirmDialog('Downloading configuration, this will replace your existing one, proceed?'))) {
            try {
              var _window$showToast5, _window6;
              localStorage.setItem(configPathKey, keyEl.value);
              const getUrlConfig = await fetch(customSettingsFunctions.buildFetchUrl(keyEl.value));
              const urlConfig = await getUrlConfig.json();
              localStorage.setItem(configKey, JSON.stringify(urlConfig));
              setValuesWithConfig(urlConfig);
              regenerateThemePicker(urlConfig);
              if (urlConfig !== null && urlConfig !== void 0 && urlConfig.overrideTheming) setAll(urlConfig.themeProperties);
              (_window$showToast5 = (_window6 = window).showToast) === null || _window$showToast5 === void 0 || _window$showToast5.call(_window6, 'Theme Configuration successfully loaded.', {
                type: 'success'
              });
            } catch (err) {
              var _window$showToast6, _window7;
              (_window$showToast6 = (_window7 = window).showToast) === null || _window$showToast6 === void 0 || _window$showToast6.call(_window7, 'Failed to fetch configuration, see logs.', {
                type: 'error'
              });
              console.error(err);
            }
          }
        }
        if (target.dataset.key === 'is-default' && !followSystemIsChecked) {
          setIsDefault(target.checked);
          updateConfig();
        }
        if (target.dataset.key === 'is-light-scheme' && !followSystemIsChecked) {
          setIsLight(target.checked);
          updateConfig();
        }
        if (target.dataset.key === 'restore-defaults') {
          if (await confirmDialog('Restoring theme configuration to default, are you sure about this?')) {
            localStorage.removeItem(configKey);
            location.reload();
          }
        }
        if (target.dataset.key === 'reload-page' && (await confirmDialog('Reload page?'))) location.reload();
        if (target.dataset.key === 'background-image-path') {
          const imagePath = _KEYED_ELEMENT_('background-image-path').value;
          const setImagePath = () => {
            var _window$showToast7, _window8;
            setBackgroundImage(imagePath);
            updateConfig();
            (_window$showToast7 = (_window8 = window).showToast) === null || _window$showToast7 === void 0 || _window$showToast7.call(_window8, 'Background image updated.', {
              type: 'success'
            });
          };
          try {
            const queryImage = await fetch(imagePath);
            const imageSize = queryImage.headers.get('content-length');
            const isAcceptableSize = imageSize && Number(imageSize) <= 1048576;
            if (isAcceptableSize || !isAcceptableSize && (await confirmDialog(`Image is higher than 1MB and may cause high memory usage.
                  Do you still want to set this as background image?`, {
              confirmText: 'YES'
            }))) {
              setImagePath();
            }
          } catch (error) {
            if (await confirmDialog(`Failed to determine image size.
              Be warned that recommended is under 1MB,
              beyond this can affect performance.
              Do you still want to set this as background image?`, {
              confirmText: 'YES'
            })) {
              setImagePath();
            }
          }
        }
        if (target.dataset.key === 'copy-glance-theme-config') {
          const updatedConfig = JSON.parse(localStorage.getItem(configKey));
          const configToCopy = [`light: ${updatedConfig.themeProperties.isLight ? "true" : "false"}`, `background-color: ${hslValuesToThemeString(updatedConfig.themeProperties.backgroundColor)}`, `primary-color: ${hslValuesToThemeString(updatedConfig.themeProperties.primaryColor)}`, `positive-color: ${hslValuesToThemeString(updatedConfig.themeProperties.positiveColor)}`, `negative-color: ${hslValuesToThemeString(updatedConfig.themeProperties.negativeColor)}`, `contrast-multiplier: ${updatedConfig.themeProperties.contrastMultiplier}`, `text-saturation-multiplier: ${updatedConfig.themeProperties.textSaturationMultiplier}`].join('\n');
          try {
            var _window$showToast8, _window9;
            await navigator.clipboard.writeText(configToCopy);
            (_window$showToast8 = (_window9 = window).showToast) === null || _window$showToast8 === void 0 || _window$showToast8.call(_window9, 'Theme properties config copied to clipboard.', {
              type: 'success'
            });
          } catch (err) {
            var _window$showToast9, _window0;
            (_window$showToast9 = (_window0 = window).showToast) === null || _window$showToast9 === void 0 || _window$showToast9.call(_window0, 'Failed to copy theme properties config, see logs', {
              type: 'error'
            });
            console.error(configToCopy, err);
          }
        }
        if (['copy-this-json-configuration', 'copy-all-json-configuration'].includes(target.dataset.key)) {
          try {
            var _window$showToast0, _window1;
            const configToCopy = target.dataset.key === 'copy-this-json-configuration' ? JSON.parse(localStorage.getItem(configKey)).themeProperties : JSON.parse(localStorage.getItem(configKey));
            await navigator.clipboard.writeText(customSettingsFunctions.customJSONStringify(configToCopy));
            (_window$showToast0 = (_window1 = window).showToast) === null || _window$showToast0 === void 0 || _window$showToast0.call(_window1, 'JSON configuration has been copied to clipboard.', {
              type: 'success'
            });
          } catch (err) {
            var _window$showToast1, _window10;
            (_window$showToast1 = (_window10 = window).showToast) === null || _window$showToast1 === void 0 || _window$showToast1.call(_window10, 'Failed to copy JSON config, see logs', {
              type: 'error'
            });
            console.error(err);
          }
        }
        if (target.dataset.key === 'current-configuration') {
          try {
            var _window$showToast10, _window11;
            const textConfig = JSON.parse(keyEl.value);
            storedThemesConfig.themeProperties = textConfig;
            if (storedThemesConfig !== null && storedThemesConfig !== void 0 && storedThemesConfig.overrideTheming) setAll(textConfig);
            setValuesWithConfig(storedThemesConfig);
            localStorage.setItem(configKey, JSON.stringify(storedThemesConfig));
            updateConfig();
            (_window$showToast10 = (_window11 = window).showToast) === null || _window$showToast10 === void 0 || _window$showToast10.call(_window11, 'Theme Configuration successfully loaded.', {
              type: 'success'
            });
          } catch (err) {
            var _window$showToast11, _window12;
            (_window$showToast11 = (_window12 = window).showToast) === null || _window$showToast11 === void 0 || _window$showToast11.call(_window12, 'Failed to save JSON config, see logs', {
              type: 'error'
            });
            console.error(err);
          }
        }
      },
      change: e => {
        const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
        const target = e.target;
        const setters = {
          'background-color': setBackgroundColor,
          'primary-color': setPrimaryColor,
          'positive-color': setPositiveColor,
          'negative-color': setNegativeColor
        };
        const setter = setters[target.dataset.key];
        if (setter && storedThemesConfig.overrideTheming) {
          setter(hexToHsl(target.value));
          updateConfig();
        }
        if (target.dataset.key === 'theme-preset') {
          var _storedThemesConfig$p;
          storedThemesConfig.themeProperties = storedThemesConfig === null || storedThemesConfig === void 0 || (_storedThemesConfig$p = storedThemesConfig.preset) === null || _storedThemesConfig$p === void 0 ? void 0 : _storedThemesConfig$p.find(p => p.themeName === target.value);
          setValuesWithConfig(storedThemesConfig);
          localStorage.setItem(configKey, JSON.stringify(storedThemesConfig));
          const currentThemeProperties = storedThemesConfig.themeProperties;
          setAll(currentThemeProperties);
          regenerateThemePicker(storedThemesConfig);
        }
      },
      input: e => {
        const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
        const target = e.target;
        const setters = {
          'contrast-multiplier': setContrastMultiplier,
          'text-saturation-multiplier': setTextSaturationMultiplier,
          'background-image-url-alpha': setBackgroundImageAlpha,
          'color-widget-background-alpha': setColorWidgetBackgroundAlpha,
          'widget-background-blur': setWidgetBackgroundBlur,
          'color-popover-background-alpha': setColorPopoverBackgroundAlpha,
          'border-radius': setBorderRadius
        };
        const setter = setters[target.dataset.key];
        if (setter && storedThemesConfig.overrideTheming) {
          let targetValue = target.value || 1;
          if (target.dataset.key === 'border-radius') targetValue = `${target.value || 5}px`;
          setter(targetValue);
          _SET_SLIDER_LABEL_(target.dataset.key, targetValue);
          updateConfig();
        }
      }
    }
  });
});