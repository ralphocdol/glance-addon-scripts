[⇐ Micro-script list](../#micro-scripts)

This loads images when they're in view and unloads them when they're not, freeing memory and reducing overall resource usage.
Better used in pages with a plenty of thumbnails that you had to scroll the entire page like Glance's [Video widget](https://github.com/glanceapp/glance/blob/main/docs/configuration.md#videos)'s `grid-cards` style.

Example below is using the [youtube-embedded-player](https://github.com/glanceapp/community-widgets/blob/main/widgets/youtube-embedded-player/README.md) Community Widget:
![preview1](preview/preview1.webp)

> [!CAUTION]
>
> Depending on the image source, caching may be disabled which would spam the image server for request which then could lead to rate limiting, so be careful in using this script.
>
> One way to check is by opening DevTools with F12 > Select the `Network` tab > Select `Images` then reload/refresh the page. In a Chrome-based browser, the `Size` tab should show `(memory cache)` and in Firefox, the `Transferred` tab should show `cached`. If it still shows the file size (e.g. 51.32 kB) even after refreshing the page again, there's a good chance it is NOT cached and you should not use this script on that.

# Usage
By default, this is setup to be applied manually, simply add the `css-class`:

```yaml
- type: video
  css-class: lazy-unloader-parent
  # ...
```

If you want to apply this globally, just remove every instance of `.lazy-unloader-parent` class in `style.css` and modify the `post-glance.js` to
```js
const className = 'lazy-unloader-parent';
// to
const className = '';
// ...rest of the script
```