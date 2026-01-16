[⇐ Micro-script list](../#micro-scripts)

This will replace Glance's default theming and will do more than just change colors.

![custom-settings](preview/preview1.png)

# Dependency
- [CREATE_ELEMENT](../global-functions/CREATE_ELEMENT.js) *(required)*
- [Custom Settings](../custom-settings) *(required)* — where the configuration can be modified, `inherits dependency`.

# Get started
Just enable `Override Theming` in `custom-settings` as shown in the preview above.

To get started, just copy the [sample-themes.json](sample-themes.json) to your `assets-path` and enter that path in the `Load Theme Config From Path/URL`. Or you can try entering:
```
https://github.com/ralphocdol/glance-micro-scripts/raw/refs/heads/main/theming/sample-themes.json
```