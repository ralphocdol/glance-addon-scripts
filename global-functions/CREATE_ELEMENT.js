/*
 * Boilerplate for creating HTML element
 */
'use strict';
export default function CREATE_ELEMENT({
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

  if (isFragment) {
    const frag = document.createDocumentFragment();
    processChildren(frag, children);
    return frag;
  }

  const e = document.createElement(tag);

  if (id !== null) e.id = id;
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

  if (style !== null) {
    for (const k in style) {
      const v = safeCssValue(style[k]);
      k.startsWith('--') ? e.style.setProperty(k, v) : (e.style[k] = v);
    }
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

  processChildren(e, children);

  return e;
}

function processChildren(targetDoc, children) {
  if (children && Array.isArray(children))
    children.forEach(child => targetDoc.appendChild(CREATE_ELEMENT(child)));
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

function safeCssValue(v) {
  if (v == null) return '';

  const s = String(v);
  if (/url\s*\(|expression\s*\(|javascript:/i.test(s)) return '';

  return s;
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