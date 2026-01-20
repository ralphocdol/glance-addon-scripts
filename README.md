## ⚠️ Disclaimer

This repository provides an **unofficial add-on script** for [Glance](https://github.com/glanceapp/glance).  
It is **not affiliated with, endorsed by, or connected to** it or its maintainers.

> [!WARNING]
>
> This repository is provided "as is" without any warranties or guarantees. Use it at your own risk. I, the author is not responsible for any damage, loss of data, or any issues arising from the use or misuse of this code.

*Check the [Widget Repository](https://github.com/ralphocdol/glance-custom-widgets) that uses these scripts.*

### Addon Scripts

| Script | Pre-DOM | Post-DOM/Pre-Glance | Post-Glance | Tested Version |
| ------ | :--------: | :--------: | :--------: | :--------: |
| [HTML Script Loader](html-script-loader/README.md) | - | - | :white_check_mark: | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Swipe Left and Right](swipe-left-and-right/README.md) | - | :white_check_mark: | - | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Modal](modal/README.md) | - | :white_check_mark: | - | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Tab Notification](tab-notification/README.md) | - | - | :white_check_mark: | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Glimpse](glimpse/README.md) | - | :white_check_mark: | :white_check_mark: | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Responsive Table](responsive-table/README.md) | - | - | :white_check_mark: | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Lazy Unloader](lazy-unloader/README.md) | - | :white_check_mark: | :white_check_mark: | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Custom Menu](custom-menu/README.md) | - | :white_check_mark: | :white_check_mark: | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Toast Message](toast-message/README.md) | - | :white_check_mark: | - | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Custom Settings](custom-settings/README.md) | - | :white_check_mark: | :white_check_mark: | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Theming](theming/README.md) | - | :white_check_mark: | :white_check_mark: | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |

*see [main.js](#inside-mainjs) for info regarding pre/post*

### Limitations
Scripts that provide GUI itself like `Modal` can only be used with widgets that allows custom html like `custom-api`, `html`, `extension` and the like.

### Loading Script
Issues with loading the scripts are mostly because of the lack of [Cache Busting](https://www.keycdn.com/support/what-is-cache-busting) for JavaScript. To address this, we can use `$include` to load the script BUT doing so will not cache the script and will just append them directly to the DOM which may not be ideal.

The [old method](https://github.com/ralphocdol/glance-js-loader?tab=readme-ov-file#modules) I used to use was using a `module.json` and have a script loader which was complicated. See https://github.com/ralphocdol/glance-js-loader/blob/main/assets/custom.js

#### in the `document` config:
```yaml
document:
    head: |
        <script>
            $include: path-to-js/main.js
        </script>
```

#### inside `main.js`
```javascript
// Pre-DOM
// Add here for global-functions

// Add here if the script doesn't need both DOM and Glance to be ready

document.addEventListener('DOMContentLoaded', async () => {
    console.info("DOM is ready...");

    // Post-DOM/Pre-Glance
    // Add here if the script needs the DOM to be loaded 
    // but doesn't need the Glance to be ready

    // example since 1 part of Glimpse can be loaded before Glance is ready
    $include: glimpse/pre-glance.js

    console.info("Waiting for Glance...");
    while (!document.body.classList.contains('page-columns-transitioned')) await new Promise(resolve => setTimeout(resolve, 50));
    console.info("Glance is ready...");
    
    // Post-Glance
    // Add here if the script needs the Glance to be ready
    // example since 1 part of Glimpse can be loaded after Glance is ready
    $include: glimpse/post-glance.js
});
```

> [!NOTE]
>
> Doing it this way will make the JS file follow the Glance's configuration template for the `document` `head`. Like how the a `${LOCAL_VARIABLE}` will be treated as an environment variable and needs to be escaped with `\` and become `\${LOCAL_VARIABLE}`. See https://github.com/glanceapp/glance/blob/v0.8.3/docs/configuration.md#environment-variables.
    





