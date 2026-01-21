> [!NOTE]
> **Rename Notice**
> 
> Yes, this repository was renamed from `glance-micro-scripts` to `glance-addon-scripts`.
>
> This repository started with only a few scripts like [HTML Script Loader](html-script-loader/README.md) and [Swipe Left and Right](swipe-left-and-right/README.md) hence why it's previously named `glance-micro-scripts`. Then I started adding [Modal](modal/README.md), [Glimpse](glimpse/README.md) and [Responsive Table](responsive-table/README.md) which quickly made the previous name irrelevant.

> [!NOTE]
> **Rewrite Notice**
> 
> With how the scripts got larger hence the need to rename this repository, I have rewritten the method of loading the scripts. Previously with the `$include`, everything is loaded to the DOM and not *cached* by default.
>
> If you still need the `$include` method:
> - see the [include-method-script-loading branch](https://github.com/ralphocdol/glance-addon-scripts/tree/include-method-script-loading), but just know that I will no longer be updating that.
> - or check [below](#still-want-to-use-include).

## ⚠️ Disclaimer

This repository provides an **unofficial add-on script** for [Glance](https://github.com/glanceapp/glance).  
It is **not affiliated with, endorsed by, or connected to** it or its maintainers.

> [!WARNING]
>
> This repository is provided "as is" without any warranties or guarantees. Use it at your own risk. I, the author is not responsible for any damage, loss of data, or any issues arising from the use or misuse of this code.

*Check the [Widget Repository](https://github.com/ralphocdol/glance-custom-widgets) that uses these scripts.*

### Addon Scripts

| Script | Tested Version |
| ------ | :--------: |
| [HTML Script Loader](html-script-loader/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Swipe Left and Right](swipe-left-and-right/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Modal](modal/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Tab Notification](tab-notification/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Glimpse](glimpse/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Responsive Table](responsive-table/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Lazy Unloader](lazy-unloader/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Custom Menu](custom-menu/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Toast Message](toast-message/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Custom Settings](custom-settings/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Theming](theming/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Mobile Vertical Navigation](mobile-vertical-nav/README.md) | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |

### Limitations
Scripts that provide GUI itself like `Modal` can only be used with widgets that allows custom html like `custom-api`, `html`, `extension` and the like.

### Loading Script
We will use the Glance's served assets path at `/assets/`.

#### in the `document` config:
```yaml
document:
  head: | #gohtml
    <script async src="/assets/path-to-addon-script/global-functions/CREATE_ELEMENT.js?v=1"></script>
    
    <link rel="preload" href="/assets/path-to-addon-script/toast-message/style.css?v=1" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <script defer src="/assets/path-to-addon-script/toast-message/script.js?v=1"></script>
```
#### still want to use $include?
If for some reason you really want to use the `$include` method, I will not be supporting it but you should be able to:
```yaml
  head: | #gohtml
    <script>
      $include: /app/assets/path-to-addon-script/global-functions/CREATE_ELEMENT.js
    </script>
    <script>
      $include: /app/assets/path-to-addon-script/toast-message/style.css
    </script>
```
you can retain the css in import url or copy the one above
    
#### Know issue
Loading the scripts this way will have a [Cache Busting](https://www.keycdn.com/support/what-is-cache-busting) Issue. You, the user, will have to do things manually.

Here are several method to do so:
- By Force loading your browser while Glance is open, there are plenty of tutorial out there on how to do it but typically its just `Ctrl+Shift+R`
- By updating all the instance of `?v=1` to `?v=2` and so on each addon-script update.
- If you want to disable caching entirely and don't care about bandwidth or any other issue that may come with it (*careful, this is for those who knows what they are doing*). You can do so by disabling the caching in the Glance's `/assets/`. If you are using Nginx to proxy Glance, you can add this location block
```nginx
  location /assets/ {
    add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
    add_header Pragma 'no-cache';
    add_header Expires 0;
  }
```






