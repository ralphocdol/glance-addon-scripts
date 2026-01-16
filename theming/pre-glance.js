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
  const { themeProperties, setAll } = newThemePropertiesManager();
  const glanceThemeConfig = !!localStorage.getItem(configKey) ? JSON.parse(localStorage.getItem(configKey)) : { themeProperties };

  if (glanceThemeConfig?.overrideTheming) setAll(glanceThemeConfig.themeProperties);

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

    const themeProperties = {
      themeName: documentRoot.dataset.theme,
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

    const applyBackgroundImage = async () => {
      const isValid = !themeProperties.backgroundImage || isUrlOrPath(themeProperties.backgroundImage);
      document.body.classList.remove('bg-img-visible');
      setTimeout(() => {
        document.body.classList.add('bg-img-visible')
        setRootVars({ '--background-image-url-body': isValid ? `url(${themeProperties.backgroundImage})` : 'none' });
      }, 1000);
    }

    const limitValue = (value, min, max) => {
      const floatValue = parseFloat(value);
      if (isNaN(floatValue)) throw new TypeError('Expected a number.');
      if (floatValue < min) return min;
      if (floatValue > max) return max;
      return value;
    }

    const obj = {
      themeProperties,
      setThemeName: function (value) {
        documentRoot.dataset.theme = value;
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
        themeProperties.backgroundImage = value;
        setRootVars({ '--background-image-url': value });
        applyBackgroundImage();
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
      setBorderRadius: function (value) {
        themeProperties.borderRadius = value;
        setRootVars({ '--border-radius': value });
      }
    };

    function setRootVars(vars) {
      const currentVars = {};
      (styleElement.textContent.match(/--[\w-]+:\s*[^;]+;/g) || []).forEach(line => {
        const match = line.match(/(--[\w-]+):\s*(.+);/);
        if (match) {
          currentVars[match[1]] = match[2];
        }
      });
      for (const [key, value] of Object.entries(vars)) {
        currentVars[key] = value;
      }
      styleElement.textContent = `:root { ${Object.entries(currentVars).map(([k, v]) => `${k}: ${v};`).join(' ')} }`;
    }

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

  function generateRandomHSLColor(forPrimary = false, isLight = true) {
    const h = Math.floor(Math.random() * 360);

    const s = forPrimary
      ? Math.floor(Math.random() * 65) + 35
      : isLight
        ? Math.floor(Math.random() * 30) + 10
        : Math.floor(Math.random() * 40) + 10;

    let l;
    if (forPrimary) {
      l = Math.floor(Math.random() * 40) + 30;
    } else if (isLight) {
      l = Math.floor(Math.random() * 30) + 60;
    } else {
      l = Math.floor(Math.random() * 12) + 8;
    }

    return [h, s, l];
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

  function regenerateThemePicker(config) {
    if (!config?.overrideTheming) return;
    document.querySelectorAll('.theme-picker').forEach(t => {
      generateThemeChoices({ el: t, config });
    })
  }
  regenerateThemePicker(glanceThemeConfig);

  function generateThemeChoices({ el, config } = {}) {
    const themeChoices = el.querySelector('.theme-choices');
    const themePreview = el.querySelector('.current-theme-preview');
    const newPresetFragment = createElementFn({ isFragment: true });
    const newProperties = config?.themeProperties;
    const configThemePresets = config?.preset;
    const resetCurrentClasses = () => themeChoices.childNodes.forEach(presetEl => presetEl.classList.remove('current'));
    configThemePresets?.forEach(p => {
      if (newProperties.themeName === p.themeName) {
        themePreview.innerHTML = `
          <button class="theme-preset current${newProperties.isLight ? ' theme-preset-light' : ''}"
            style="--color: ${hslValuesToCSSString(newProperties.backgroundColor)}" data-key="${newProperties.themeName}" title="${newProperties.themeName}">
            <div class="theme-color" style="--color: ${hslValuesToCSSString(newProperties.primaryColor)}"></div>
            <div class="theme-color" style="--color: ${hslValuesToCSSString(newProperties.positiveColor)}"></div>
            <div class="theme-color" style="--color: ${hslValuesToCSSString(newProperties.negativeColor)}"></div>
          </button>
        `;
      }
      const presetEl = createElementFn({
        tag: 'button',
        classes: `theme-preset${p.isLight ? ' theme-preset-light' : ''}${newProperties.themeName === p.themeName ? ' current' : ''}`,
        datasets: { key: p.themeName },
        attrs: { title: p.themeName },
        htmlContent: `
          <div class="theme-color" style="--color: ${hslValuesToCSSString(p.primaryColor)}"></div>
          <div class="theme-color" style="--color: ${hslValuesToCSSString(p.positiveColor)}"></div>
          <div class="theme-color" style="--color: ${hslValuesToCSSString(p.negativeColor)}"></div>
        `,
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
      presetEl.style.setProperty('--color', hslValuesToCSSString(p.backgroundColor));
      newPresetFragment.appendChild(presetEl);
    });
    themeChoices.replaceChildren(newPresetFragment);
  }

  window.glanceTheming = {
    newThemePropertiesManager,
    hexToHsl,
    hslToHex,
    hslValuesToThemeString,
    hslValuesToCSSString,
    regenerateThemePicker,
  };
})();