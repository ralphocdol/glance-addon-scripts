<details>
  <summary><strong>Rename Notice</strong></summary>
  <br>
  
  Yes, this repository was renamed from `glance-micro-scripts` to `glance-addon-scripts`.
  
  This repository started with only a few scripts like [HTML Script Loader](html-script-loader/README.md) and [Swipe Left and Right](swipe-left-and-right/README.md) hence why it's previously named `glance-micro-scripts`. Then I started adding [Modal](modal/README.md), [Glimpse](glimpse/README.md) and [Responsive Table](responsive-table/README.md) which quickly made the previous name irrelevant.

</details>

<details>
  <summary><strong>Rewrite Notice</strong></summary>
  <br>
  
  With how the scripts got larger hence the need to rename this repository, I have rewritten the method of loading the scripts. Previously with the `$include`, everything is loaded to the DOM and not *cached* by default.
  If you still need the `$include` method:
  - see the [include-method-script-loading branch](https://github.com/ralphocdol/glance-addon-scripts/tree/include-method-script-loading), but just know that I will no longer be updating that.
  - or check [below](#still-want-to-use-include).

</details>

## ⚠️ Disclaimer

This repository provides an **unofficial addon script** for [Glance](https://github.com/glanceapp/glance).  
It is **not affiliated with, endorsed by, or connected to** it or its maintainers.

> [!WARNING]
>
> These scripts are unofficial and intended for users who are comfortable exploring and modifying their dashboard.
> Review the code before use.
> 
> Provided under the terms of the GPL-3.0 license

*Check the [Widget Repository](https://github.com/ralphocdol/glance-custom-widgets) that uses some of these scripts.*

### Addon Scripts

| Script | Short Description | Tested Version |
| ------ | :---------------: | :------------: |
| [HTML Script Loader](html-script-loader/README.md) | Adds the ability to load `<script>` inside `custom-api` | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Swipe Left and Right](swipe-left-and-right/README.md) | Swipe left/right on Mobile | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Modal](modal/README.md) | A modal popup | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Tab Notification](tab-notification/README.md) | Show notification count on `group` tabs | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Glimpse](glimpse/README.md) | A `search` widget that searches other widgets | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Responsive Table](responsive-table/README.md) | A table widget | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Lazy Unloader](lazy-unloader/README.md) | Unloads image when not in view | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Custom Menu](custom-menu/README.md) | Menu grid for Addon Script | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Toast Message](toast-message/README.md) | Custom notification message display | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Custom Settings](custom-settings/README.md) | Custom settings manager for Addon Script | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Theming](theming/README.md) | Theme editor/manager for Glance | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Mobile Vertical Navigation](mobile-vertical-nav/README.md) | Replaces horizontal navigation | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Custom Dialog](custom-dialog/README.md) | A basic dialog box | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Navigation Shortcuts](navigation-shortcuts/README.md) | Navigation shortcut using `Ctrl+Shift+#` | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |
| [Iframe Bookmarks Nav](iframe-bookmarks-nav/README.md) | Turning bookmarks into navigation, paired with iframe | v0.8.4 \| dev@[784bf53](https://github.com/glanceapp/glance/tree/784bf5342570af94e62238c4f4a7b542d1853077) |

### Limitations
Scripts that provide GUI itself like `Modal` can only be used with widgets that allows custom html like `custom-api`, `html`, `extension` and the like.

### Loading Script
We will use the Glance's served assets path at `/assets/`.

#### in the `document` config:
```yaml
document:
  head: | #gohtml
    <script async src="/assets/glance-addon-scripts/global-functions/CREATE_ELEMENT.js?v=1"></script>
    
    <link rel="preload" href="/assets/glance-addon-scripts/toast-message/style.css?v=1" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <script defer src="/assets/glance-addon-scripts/toast-message/script.js?v=1"></script>
```

#### Cloned Project
You can clone this project inside the `/assets/` and load all of them using [load-addons.html](load-addons.html).
Let's assume your assets folder is `/home/user/glance-assets`:

```bash
cd /home/user/glance-assets
git clone https://github.com/ralphocdol/glance-addon-scripts.git
```

Then on your `glance.yml`
```yaml
server:
  assets-path: /home/user/glance-assets
  
document:
  head: | #gohtml
    $include: /home/user/glance-assets/glance-addon-scripts/load-addons.html
```

#### Still want to use $include?
<details>
  <summary>Click to expand</summary>
  <br>
  
If for some reason you really want to use the `$include` method, I will not be supporting it but you should be able to:
```yaml
  head: | #gohtml
    <script>
      $include: /app/assets/glance-addon-scripts/global-functions/CREATE_ELEMENT.js
    </script>
    <script>
      $include: /app/assets/glance-addon-scripts/toast-message/style.css
    </script>
```
you can retain the css in import url or copy the one above

</details>

#### Know issue
Loading the scripts this way will have a [Cache Busting](https://www.keycdn.com/support/what-is-cache-busting) Issue. I have a reopened issue at [glanceapp/glance #550](https://github.com/glanceapp/glance/issues/550#issuecomment-3755143924) if you'd like to upvote it. For now, you, the user, will have to do things manually.

Here are several approach to do so:
- By force reloading your browser while Glance is open, there are plenty of tutorial out there on how to do it but typically it's just `Ctrl+Shift+R`.
- By updating all the instance of `?v=1` to `?v=2` and so on each addon-script update.
- By modifying the Glance's Docker Compose entrypoint. By default, as of v0.8.4, it's `/app/glance --config /app/config/glance.yml` and is omitted.
  ```yaml
    services:
      glance:
        image: glanceapp/glance:v0.8.4
        container_name: glance
        environment:
          - MY_ENV_VAR=test-value
        entrypoint: sh -c 'export LAST_RESTART=$(date +%s); exec /app/glance --config /app/config/glance.yml'
  ```
  This will now append an Environment Variable called `LAST_RESTART` which can be used to replace `?v=1` to `?v=${LAST_RESTART}`. The only downside is that, this only works if the Docker Compose of Glance is restarted and not when Glance gets reloaded.
- If you want to disable caching entirely and don't care about bandwidth or any other issue that may come with it (*careful, this is for those who knows what they are doing*). You can do so by disabling the caching. If you are using Nginx to proxy Glance, you can add this location block
  ```nginx
    location /assets/glance-addon-scripts/ {
      add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
      add_header Pragma 'no-cache';
      add_header Expires 0;
    }
  ```












