[⇐ Micro-script list](../#micro-scripts)

This will be the place where redundant functions or a boilerplate will be stored and will be a `window` function. Scripts here will be considered as `pre-DOM`.

```js
// Pre-DOM
// Add here if the script doesn't need both DOM and Glance to be ready
$include: global-functions/CREATE_ELEMENT.js

document.addEventListener('DOMContentLoaded', async () => {
    console.info("DOM is ready...");
// ... the rest of main.js
```