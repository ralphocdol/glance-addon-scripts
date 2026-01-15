[⇐ Micro-script list](../#micro-scripts)

This simply adds a custom menu to the navigation bar. And will be used for other micro-scripts in future that may have user interactable elements like [Glimpse](../glimpse).

![1](preview/preview1.png)
![2](preview/preview2.png)

# Dependency
- [CREATE_ELEMENT](../global-functions/CREATE_ELEMENT.js) *(required)*
- [Toast Message](../toast-message) *(optional)*

# Note
`post-glance.js` is loaded a bit differently as it needs to have a delay before it is executed.

```js
setTimeout(() => {
  $include: custom-menu/post-glance.js
}, 50);
```

# Usage
```js
window.createCustomMenuItemElement?.({
  className: 'class-of-the-menu',
  tooltip: 'Tooltip on icon hover',
  icon: '', // <img> or <svg>
  actionFn: () => {} //on icon click function
});
```