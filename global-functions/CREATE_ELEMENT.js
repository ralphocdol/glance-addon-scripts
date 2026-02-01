/*
 * Boilerplate for creating HTML element
 */
'use strict';
(() => {
  // Catch duplicate instances
  const scriptName = 'CREATE_ELEMENT';
  if ((window.GLANCE_ADDON_SCRIPTS ??= {})[scriptName] === true) {
    const msg = scriptName + ' already loaded, you might have duplicate instance of this script. Aborting.';
    if (typeof window.showToast === 'function') window.showToast?.(msg, { type: 'error' });
    console.error(msg);
    return;
  } else {
    window.GLANCE_ADDON_SCRIPTS[scriptName] = true;
  }

  function createElement ({
    tag = 'div',
    isFragment = false,
    id = null,
    classes = null,
    classAppend = null,
    style = null,
    props = null,
    attrs = null,
    datasets = null,
    innerText = null,
    textContent = null,
    htmlContent = null,
    events = null,
    children = null,
  } = {}) {
    const e = isFragment ? document.createDocumentFragment() : document.createElement(tag);

    if (id !== null) e.id = id;
    if (style !== null) Object.assign(e.style, style);
    if (props !== null) Object.assign(e, safeProps(props));
    if (classes !== null) e.className = classes;
    if (classAppend !== null) classAppend.forEach(c => c.classList.add(c));

    if (innerText !== null) {
      e.innerText = innerText;
    } else if (textContent !== null) {
      e.textContent = textContent;
    } else if (htmlContent !== null) {
      e.innerHTML = '';
      e.appendChild(sanitizeHTML(htmlContent));
    }

    if (datasets !== null) {
      for (const [k, v] of Object.entries(datasets)) {
        if (v == null) continue;
        e.dataset[k] = safeValue(v);
      }
    }

    if (attrs !== null) safeAttr(e, attrs);

    if (events !== null) {
      for (const [eventName, spec] of Object.entries(events)) {
        let handler, options;

        if (typeof spec === 'function') {
          handler = spec;
          options = undefined;
        } else {
          handler = spec.handler;
          options = spec.options;
        }

        e.addEventListener(eventName, event => handler(event, e), options);
      }
    }

    if (children && Array.isArray(children)) children.forEach(child => e.appendChild(createElement(child)));

    return e;
  }

  function safeAttr(e, a) {
    for (const [k, v] of Object.entries(a)) {
      if (typeof k === 'string' && k.startsWith('on')) continue;
      e.setAttribute(k, safeValue(v));
    }
  }

  function safeValue(v) {
    if (v == null) return '';
    return String(v)
      .replace(/&/g, '&amp;')     // escape &
      .replace(/"/g, '&quot;')    // escape double quotes
      .replace(/'/g, '&#39;')     // escape single quotes
      .replace(/</g, '&lt;')      // escape <
      .replace(/>/g, '&gt;');     // escape >
  }

  function safeProps(props) {
    if (!props) return {};
    const safe = {};
    for (const [key, value] of Object.entries(props)) {
      if (typeof key === 'string' && key.startsWith('on')) continue;
      safe[key] = value;
    }
    return safe;
  }

  function sanitizeHTML(htmlString) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlString || '';

    // Remove unsafe tags
    wrapper.querySelectorAll('script, foreignObject').forEach(el => el.remove());

    // Remove unsafe attributes
    wrapper.querySelectorAll('*').forEach(el => {
      for (const attr of Array.from(el.attributes)) {
        // strip all event handlers
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }

        // allow href="#" fragment only
        if (attr.name === 'href' || attr.name === 'xlink:href') {
          if (!attr.value.startsWith('#')) el.removeAttribute(attr.name);
        }

        // remove dangerous style urls
        if (attr.name === 'style' && /url\(\s*javascript:/i.test(attr.value)) {
          el.removeAttribute('style');
        }
      }
    });

    // Move all children to a DocumentFragment
    const frag = document.createDocumentFragment();
    while (wrapper.firstChild) frag.appendChild(wrapper.firstChild);

    return frag;
  }

  window.CREATE_ELEMENT = createElement;
})();