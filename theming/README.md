[⇐ Micro-script list](../#micro-scripts)

This will replace Glance's default theming and will do more than just change colors.

![custom-settings](preview/preview1.png)

> [!NOTE
>
> 1. This is a client-side functionality, all modifications will only be store on the browser.
> 2. Config fetching using URL will mostly not work (client-side limitation) unless you proxy it or have full control over it.

# Dependency
- [CREATE_ELEMENT](../global-functions/CREATE_ELEMENT.js) *(required)*
- [Custom Settings](../custom-settings) *(required)* — where the configuration can be modified, `inherits dependency`.

# Get started
Just enable `Override Theming` in `custom-settings` as shown in the preview above.

To get started, just copy the [sample-themes.json](sample-themes.json) to your `assets-path` and enter that path in the `Load Theme Config From Path/URL`.