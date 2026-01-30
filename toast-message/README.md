[⇐ addon-script list](../#addon-scripts)

Adds a toast notification and is optionally used by some addon-scripts.

![1](preview/preview1.png)
![2](preview/preview2.png)

# How to load
```html
  <link rel="preload" href="/assets/glance-addon-scripts/toast-message/style.css?v=1" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <script defer src="/assets/glance-addon-scripts/toast-message/script.js?v=1"></script>
```

# Usage
```js
window.showToast?.('This is a message');
window.showToast?.('This is a success message', { type: 'success' });
window.showToast?.('This is an error message', { type: 'error' });
window.showToast?.('This is message has a title', { title: 'Title' });
window.showToast?.('Everything else', { 
  title: 'Title',
  type: 'info',
  position: 'bottom-right', // and bottom-left only, other position blocks the contents
  duration: 3000, // ms is the default
});
```