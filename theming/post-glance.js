(() => {
  const customSettingsFunctions = window.customSettingsFunctions;
  if (!(customSettingsFunctions && typeof customSettingsFunctions === 'object')) return;

  const { newThemePropertiesManager, hslToHex } = window.glanceTheming;
  const { themeProperties } = newThemePropertiesManager();

  const configKey = 'glance-theme-storage';
  if (!localStorage.getItem(configKey)) {
    localStorage.setItem(configKey, JSON.stringify({ themeProperties, overrideTheming: false }));
    console.info('Theming Local Storage configuration initialized.');
  }
  const glanceThemeConfig = !!localStorage.getItem(configKey) ? JSON.parse(localStorage.getItem(configKey)) : { themeProperties };

  const glanceThemeConfigPresets = glanceThemeConfig?.preset || [];

  const configForOverride = glanceThemeConfig.overrideTheming ? [
    { type: 'toggle', name: 'Follow System Scheme', key: 'follow-system-scheme',
      value: glanceThemeConfig?.followSystemScheme, tooltip: 'Requires one of each scheme.',
    },
    { type: 'text', name: 'Load Theme Config from Path/URL', key: 'theme-configuration-url', value: '', colOffset: 2,
      tooltip: 'A way to load theme in JSON format from either your assets-path or from a URL.',
      icon: `
        <svg viewBox="0 0 24 24" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12ZM12 6.25C12.4142 6.25 12.75 6.58579 12.75 7V12.1893L14.4697 10.4697C14.7626 10.1768 15.2374 10.1768 15.5303 10.4697C15.8232 10.7626 15.8232 11.2374 15.5303 11.5303L12.5303 14.5303C12.3897 14.671 12.1989 14.75 12 14.75C11.8011 14.75 11.6103 14.671 11.4697 14.5303L8.46967 11.5303C8.17678 11.2374 8.17678 10.7626 8.46967 10.4697C8.76256 10.1768 9.23744 10.1768 9.53033 10.4697L11.25 12.1893V7C11.25 6.58579 11.5858 6.25 12 6.25ZM8 16.25C7.58579 16.25 7.25 16.5858 7.25 17C7.25 17.4142 7.58579 17.75 8 17.75H16C16.4142 17.75 16.75 17.4142 16.75 17C16.75 16.5858 16.4142 16.25 16 16.25H8Z" fill="fillColor"></path> </g></svg>
      `,
    },
    { type: 'dropdown', name: 'Theme Preset', key: 'theme-preset', value: glanceThemeConfig.themeProperties.themeName,
      options: glanceThemeConfigPresets.map(p => p.themeName) || [], disabled: glanceThemeConfigPresets.length === 0,
      tooltip: 'Can only be populated by loading a theme configuration from a Path/URL'
    },
    { type: 'toggle', name: 'Default for Scheme', key: 'is-default', value: glanceThemeConfig.themeProperties.isDefault,
      tooltip: 'Only one default per light and dark scheme, will automatically uncheck others.'
    },
    { type: 'toggle', name: 'Light Scheme', key: 'is-light-scheme', value: glanceThemeConfig.themeProperties.isLight,
      disabled: glanceThemeConfig?.followSystemScheme || false, tooltip: 'Set this theme a light theme. Follow System Scheme needs to be disabled.'
    },
    { type: 'color', name: 'Background Color', key: 'background-color', value: hslToHex(glanceThemeConfig.themeProperties.backgroundColor) },
    { type: 'color', name: 'Primary Color', key: 'primary-color', value: hslToHex(glanceThemeConfig.themeProperties.primaryColor) },
    { type: 'color', name: 'Positive Color', key: 'positive-color', value: hslToHex(glanceThemeConfig.themeProperties.positiveColor) },
    { type: 'color', name: 'Negative Color', key: 'negative-color', value: hslToHex(glanceThemeConfig.themeProperties.negativeColor) },
    { type: 'slider', name: 'Contrast Multiplier', key: 'contrast-multiplier',
      min: 0.3, max: 2, step: 0.1,
      value: glanceThemeConfig.themeProperties.contrastMultiplier,
    },
    { type: 'slider', name: 'Text Saturation Multiplier', key: 'text-saturation-multiplier',
      min: 0.3, max: 5, step: 0.1,
      value: glanceThemeConfig.themeProperties.textSaturationMultiplier,
    },
    { type: 'slider', name: 'Border Radius', key: 'border-radius',
      min: 0, max: 30, step: 1,
      value: parseFloat(glanceThemeConfig.themeProperties.borderRadius),
    },
    { type: 'text', name: 'Background Image Path/URL', key: 'background-image-path',
      value: glanceThemeConfig.themeProperties?.backgroundImage || '',
      colOffset: 2,
    },
    { type: 'slider', name: 'Background Image Alpha', key: 'background-image-url-alpha',
      min: 0, max: 1, step: 0.05,
      value: glanceThemeConfig.themeProperties.backgroundImageAlpha,
    },
    { type: 'slider', name: 'Widget Background Alpha', key: 'color-widget-background-alpha',
      min: 0.1, max: 1, step: 0.05,
      value: glanceThemeConfig.themeProperties.colorWidgetBackgroundAlpha,
    },
    { type: 'slider', name: 'Color Popover Alpha', key: 'color-popover-background-alpha',
      min: 0.1, max: 1, step: 0.05,
      value: glanceThemeConfig.themeProperties.colorPopoverBackgroundAlpha,
    },
    { type: 'textarea', name: 'Current JSON Configuration', key: 'current-configuration',
      value: JSON.stringify(glanceThemeConfig.themeProperties, null, 2), colOffset: 1, height: '293px',
      moreButtons: [
        { name: 'Copy this configuration', key: 'copy-this-json-configuration' },
      ]
    },
    { type: 'buttons', buttons: [
      { name: 'Restore Defaults', key: 'restore-defaults', negative: true },
      { name: 'Reload Page', key: 'reload-page' },
      { name: 'Copy this YAML Config', key: 'copy-glance-theme-config', tooltip: 'This is for Glance default theme yaml properties.' },
      { name: 'Copy ALL JSON Config', key: 'copy-all-json-configuration', tooltip: `If you want to store and host it somewhere, even in your Glance's assets-path.` },
    ], colOffset: 1 },
  ] : [
    { type: 'buttons', buttons: [
      { name: 'Restore Defaults', key: 'restore-defaults', negative: true },
    ], colOffset: 1 },
  ];

  customSettingsFunctions.createCustomSettingsItem?.({
    nameHTML: 'Theming',
    contentObject: [
      { type: 'toggle', name: 'Override Theming', key: 'override-theming', value: glanceThemeConfig.overrideTheming, colOffset: 2,
        tooltip: 'This will disable the built-in Glance theme.',
      },
      ...configForOverride,
      { type: 'custom-html', contentHTML: `
        <div style="width: 100%;">
          <a class="color-primary visited-indicator" target="_blank" rel="noreferrer" href="https://github.com/ralphocdol/glance-addon-scripts/tree/main/theming">
            Project Repository
          </a>
        </div>
        <div style="width: 100%;">
          <a class="color-primary visited-indicator" target="_blank" rel="noreferrer" href="https://github.com/ralphocdol/glance-addon-scripts/tree/main/theming/README.md">
            Glance Scripts
          </a>
        </div>
      `,
        style: {
          display: 'flex',
          flexDirection: 'column'
        },
      },
    ],
    contentEventListener: {
      setup: () => {
        const configKey = 'glance-theme-storage';
        const configPathKey = 'glance-theme-config-path'
        const {
          hslToHex,
          hexToHsl,
          hslValuesToThemeString,
          newThemePropertiesManager,
          hslValuesToCSSString,
          regenerateThemePicker,
          updateConfiguration,
          followSystemSchemeFn,
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
          setColorPopoverBackgroundAlpha,
          setBorderRadius,
        } = newThemePropertiesManager();

        const getKeyedElement = key => _SETTING_ELEMENT_.querySelector(`[name="${key}"]`);
        const sliderLabelElement = key => _SETTING_ELEMENT_.querySelector(`[data-slider-label="${key}"]`);

        const followSystemIsChecked = getKeyedElement('follow-system-scheme')?.checked || false;

        function setValuesWithConfig(config) {
          const configThemeProperties = config.themeProperties;
          const themePresetEl = getKeyedElement('theme-preset');
          const isLightEl = getKeyedElement('is-light-scheme');
          const presets = config?.preset || [];

          getKeyedElement('override-theming').checked = config.overrideTheming;
          getKeyedElement('follow-system-scheme').checked = config?.followSystemScheme;
          themePresetEl.value = configThemeProperties.themeName;
          themePresetEl.replaceChildren(...presets
            .filter(o =>
              !config?.followSystemScheme || o.isLight === configThemeProperties.isLight
            )
            .map(o => {
              const selected = o.themeName === configThemeProperties.themeName;
              return new Option(o.themeName, o.themeName, selected, selected);
            })
          || []);
          getKeyedElement('is-default').checked = configThemeProperties.isDefault;
          isLightEl.checked = configThemeProperties.isLight;
          getKeyedElement('background-color').value = hslToHex(configThemeProperties.backgroundColor);
          getKeyedElement('primary-color').value = hslToHex(configThemeProperties.primaryColor);
          getKeyedElement('positive-color').value = hslToHex(configThemeProperties.positiveColor);
          getKeyedElement('negative-color').value = hslToHex(configThemeProperties.negativeColor);
          getKeyedElement('contrast-multiplier').value = configThemeProperties.contrastMultiplier;
          getKeyedElement('text-saturation-multiplier').value = configThemeProperties.textSaturationMultiplier;
          getKeyedElement('border-radius').value = parseFloat(configThemeProperties.borderRadius || '5');
          getKeyedElement('background-image-path').value = configThemeProperties.backgroundImage || '';
          getKeyedElement('background-image-url-alpha').value = configThemeProperties.backgroundImageAlpha || 1;
          getKeyedElement('color-widget-background-alpha').value = configThemeProperties.colorWidgetBackgroundAlpha || 1;
          getKeyedElement('color-popover-background-alpha').value = configThemeProperties.colorPopoverBackgroundAlpha || 1;
          getKeyedElement('current-configuration').value = customSettingsFunctions.customJSONStringify(configThemeProperties);

          sliderLabelElement('contrast-multiplier').textContent = configThemeProperties.contrastMultiplier;
          sliderLabelElement('text-saturation-multiplier').textContent = configThemeProperties.textSaturationMultiplier;
          sliderLabelElement('border-radius').textContent = configThemeProperties.borderRadius || '5px';
          sliderLabelElement('background-image-url-alpha').textContent = configThemeProperties.backgroundImageAlpha || 1;
          sliderLabelElement('color-widget-background-alpha').textContent = configThemeProperties.colorWidgetBackgroundAlpha || 1;
          sliderLabelElement('color-popover-background-alpha').textContent = configThemeProperties.colorPopoverBackgroundAlpha || 1;

          isLightEl.disabled = config.followSystemScheme;
          themePresetEl.disabled = presets.length === 0;
        }

        const updateConfig = () => {
          setValuesWithConfig(updateConfiguration());
        }
      },
      ready: () => {
        const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
        if (!storedThemesConfig.overrideTheming) return;
        getKeyedElement('theme-configuration-url').value = localStorage.getItem(configPathKey);
        setValuesWithConfig(storedThemesConfig);
        followSystemSchemeFn(getKeyedElement('follow-system-scheme').checked, () => updateConfig());
      },
      click: async e => {
        const storedThemesConfig = JSON.parse(localStorage.getItem(configKey));
        const target = e.target;
        const keyEl = getKeyedElement(target.dataset.key);

        if (target.dataset.key === 'override-theming') {
          if (await customSettingsFunctions.ask(target.checked ? 'This will override the built one rendering it useless, proceed and reload?' : 'Disable and reload?')) {
            customSettingsFunctions.setValueByPath(storedThemesConfig, 'overrideTheming', target.checked);
            localStorage.setItem(configKey, JSON.stringify({...storedThemesConfig }));
            location.reload();
          } else {
            target.checked = !target.checked;
          }
        }

        if (target.dataset.key === 'follow-system-scheme') {
          customSettingsFunctions.setValueByPath(storedThemesConfig, 'followSystemScheme', target.checked);
          localStorage.setItem(configKey, JSON.stringify({...storedThemesConfig }));
          updateConfig();
          followSystemSchemeFn(getKeyedElement('follow-system-scheme').checked, () => updateConfig());
          document.querySelectorAll('.theme-picker .auto-theme-toggle-container [name="auto-follow-system"]').forEach(t => t.checked = target.checked);
        }

        if (target.dataset.key === 'theme-configuration-url') {
          if (keyEl.value && await customSettingsFunctions.ask('Downloading configuration, this will replace your existing one, proceed?')) {
            try {
              localStorage.setItem(configPathKey, keyEl.value);
              const getUrlConfig = await fetch(customSettingsFunctions.buildFetchUrl(keyEl.value));
              const urlConfig = await getUrlConfig.json();
              localStorage.setItem(configKey, JSON.stringify(urlConfig));
              setValuesWithConfig(urlConfig);
              regenerateThemePicker(urlConfig);
              if (urlConfig?.overrideTheming) setAll(urlConfig.themeProperties);
              window.showToast?.('Theme Configuration successfully loaded.', { type: 'success' });
            } catch (err) {
              window.showToast?.('Failed to fetch configuration, see logs.', { type: 'error' });
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
          if (await customSettingsFunctions.ask('Restoring theme configuration to default, are you sure about this?')) {
            localStorage.removeItem(configKey);
            location.reload();
          }
        }

        if (target.dataset.key === 'reload-page' && await customSettingsFunctions.ask('Reload page?')) location.reload();
        if (target.dataset.key === 'background-image-path') {
          setBackgroundImage(getKeyedElement('background-image-path').value);
          updateConfig();
          window.showToast?.('Background image updated.', { type: 'success' });
        }

        if (target.dataset.key === 'copy-glance-theme-config') {
          const updatedConfig = JSON.parse(localStorage.getItem(configKey));
          const configToCopy = [
            `light: ${updatedConfig.themeProperties.isLight ? "true" : "false"}`,
            `background-color: ${hslValuesToThemeString(updatedConfig.themeProperties.backgroundColor)}`,
            `primary-color: ${hslValuesToThemeString(updatedConfig.themeProperties.primaryColor)}`,
            `positive-color: ${hslValuesToThemeString(updatedConfig.themeProperties.positiveColor)}`,
            `negative-color: ${hslValuesToThemeString(updatedConfig.themeProperties.negativeColor)}`,
            `contrast-multiplier: ${updatedConfig.themeProperties.contrastMultiplier}`,
            `text-saturation-multiplier: ${updatedConfig.themeProperties.textSaturationMultiplier}`,
          ].join('\n');
          try {
            await navigator.clipboard.writeText(configToCopy);
            window.showToast?.('Theme properties config copied to clipboard.', { type: 'success' });
          } catch (err) {
            window.showToast?.('Failed to copy theme properties config, see logs', { type: 'error' });
            console.error(configToCopy, err);
          }
        }

        if (['copy-this-json-configuration', 'copy-all-json-configuration'].includes(target.dataset.key)) {
          try {
            const configToCopy = target.dataset.key === 'copy-this-json-configuration'
              ? JSON.parse(localStorage.getItem(configKey)).themeProperties
              : JSON.parse(localStorage.getItem(configKey));
            await navigator.clipboard.writeText(customSettingsFunctions.customJSONStringify(configToCopy));
            window.showToast?.('JSON configuration has been copied to clipboard.', { type: 'success' });
          } catch (err) {
            window.showToast?.('Failed to copy JSON config, see logs', { type: 'error' });
            console.error(err);
          }
        }

        if (target.dataset.key === 'current-configuration') {
          try {
            const textConfig = JSON.parse(keyEl.value);
            storedThemesConfig.themeProperties = textConfig;
            if (storedThemesConfig?.overrideTheming) setAll(textConfig);
            setValuesWithConfig(storedThemesConfig);
            localStorage.setItem(configKey, JSON.stringify(storedThemesConfig));
            regenerateThemePicker(storedThemesConfig);
            updateConfig();
            window.showToast?.('Theme Configuration successfully loaded.', { type: 'success' });
          } catch (err) {
            window.showToast?.('Failed to save JSON config, see logs', { type: 'error' });
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
          storedThemesConfig.themeProperties = storedThemesConfig?.preset?.find(p => p.themeName === target.value)
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
          'color-popover-background-alpha': setColorPopoverBackgroundAlpha,
          'border-radius': setBorderRadius,
        };
        const setter = setters[target.dataset.key];
        if (setter && storedThemesConfig.overrideTheming) {
          const sliderLabelEl = _SETTING_ELEMENT_.querySelector(`[data-slider-label="${target.dataset.key}"]`);
          if (target.dataset.key === 'border-radius') {
            setter(`${target.value}px` || '5px');
            sliderLabelEl.textContent = `${target.value}px`;
          } else {
            setter(target.value || 1);
            sliderLabelEl.textContent = target.value;
          }
          updateConfig();
        }
      }
    }
  });
})();