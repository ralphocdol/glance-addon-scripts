[⇐ Micro-script list](../#micro-scripts)

This will replace Glance's default theming and will do more than just change colors.

![custom-settings](preview/preview1.png)

> [!NOTE]
>
> 1. This is a client-side functionality, all modifications will only be stored in the browser.
> 2. There is no syncing, you can only fetch a configuration.
> 3. Config fetching using URL will mostly not work unless you proxy it or have full control over it.

# Dependency
- [CREATE_ELEMENT](../global-functions/CREATE_ELEMENT.js) *(required)*
- [Custom Settings](../custom-settings) *(required)* — where the configuration can be modified, `inherits dependency`.

# Get started
Just enable `Override Theming` in `custom-settings` as shown in the preview above.

To get started, just copy the [sample-themes.json](sample-themes.json) to your `assets-path` and enter that path in the `Load Theme Config From Path/URL`.

# Credits
[svilenmarkov](https://github.com/svilenmarkov) - https://github.com/glanceapp/glance/discussions/184