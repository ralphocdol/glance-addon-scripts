/*
 * Boilerplate for creating HTML element
 */
(() => {
  window.CREATE_ELEMENT = function ({
    tag = 'div',
    isFragment = false,
    id = null,
    classes = null,
    style = null,
    props = null,
    attrs = null,
    datasets = null,
    innerHTML = null,
    innerText = null,
    textContent = null,
    events = null,
  } = {}) {
    const e = isFragment ? document.createDocumentFragment() : document.createElement(tag);

    if (id !== null) e.id = id;
    if (style !== null) Object.assign(e.style, style);
    if (props !== null) Object.assign(e, props);
    if (classes !== null) e.className = classes;

    if (innerHTML !== null) {
      e.innerHTML = innerHTML;
    } else if (innerText !== null) {
      e.innerText = innerText;
    } else if (textContent !== null) {
      e.textContent = textContent;
    }

    if (datasets !== null) {
      for (const [k, v] of Object.entries(datasets)) {
        if (v == null) continue;
        e.dataset[k] = String(v);
      }
    }

    if (attrs !== null)
      for (const [k, v] of Object.entries(attrs))
        e.setAttribute(k, v);


    if (events !== null)
      for (const [event, handler] of Object.entries(events))
        e.addEventListener(event, handler);

    return e;
  }
})();