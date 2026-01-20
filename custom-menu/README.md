[⇐ addon-script list](../#addon-scripts)

This simply adds a custom menu to the navigation bar. And will be used for other addon-scripts in future that may have user interactable elements like [Glimpse](../glimpse).

![1](preview/preview1.png)
![2](preview/preview2.png)

# Dependency
- [CREATE_ELEMENT](../global-functions/CREATE_ELEMENT.js) *(required)*
- [Toast Message](../toast-message) *(optional)*

# Usage
```js
window.createCustomMenuItemElement?.({
  className: 'class-of-the-menu',
  tooltip: 'Tooltip on icon hover',
  icon: '', // <img> or <svg>
  actionFn: () => {} //on icon click function
});
```

# Note
Although there is a `setTimeout` added for delay, it's still a good idea to load the `post-glance.js` to the bottom.

# Credits
Vectors and icons by [SVG Repo](https://www.svgrepo.com).