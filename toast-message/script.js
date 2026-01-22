'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const icons = {
    info: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0">
        </g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z" fill="var(--color-text-highlight)"></path> </g>
      </svg>`,
    success: `
      <svg fill="var(--color-positive)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"></path>
      </svg>`,
    error: `
      <svg viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="var(--color-negative)">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>error-filled</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="add" fill="var(--color-negative)" transform="translate(42.666667, 42.666667)"> <path d="M213.333333,3.55271368e-14 C331.136,3.55271368e-14 426.666667,95.5306667 426.666667,213.333333 C426.666667,331.136 331.136,426.666667 213.333333,426.666667 C95.5306667,426.666667 3.55271368e-14,331.136 3.55271368e-14,213.333333 C3.55271368e-14,95.5306667 95.5306667,3.55271368e-14 213.333333,3.55271368e-14 Z M262.250667,134.250667 L213.333333,183.168 L164.416,134.250667 L134.250667,164.416 L183.168,213.333333 L134.250667,262.250667 L164.416,292.416 L213.333333,243.498667 L262.250667,292.416 L292.416,262.250667 L243.498667,213.333333 L292.416,164.416 L262.250667,134.250667 Z" id="Combined-Shape"> </path> </g> </g> </g>
      </svg>`
  }
  const getIcon = type => {
    switch (type) {
      case 'success': return icons.success;
      case 'error': return icons.error;
      default: return icons.info;
    }
  }

  const mainContainer = document.createElement('div');
  mainContainer.id = 'toast';

  const positions = ['bottom-right', 'bottom-left'];
  const containers = {};
  positions.forEach(pos => {
    const positionContainer = document.createElement('div');
    positionContainer.className = `toast-container ${pos}`;
    mainContainer.appendChild(positionContainer);
    containers[pos] = positionContainer;
  });
  document.body.appendChild(mainContainer);

  function showToast(message, {
    title = '',
    type = 'info',
    position = 'bottom-right',
    duration = 3000,
  } = {}) {
    const container = containers[position];
    if (!container) return;

    // Create new toast
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.classList.add(position);

    const toastIcon = document.createElement('div');
    toastIcon.className = 'toast-icon';
    toastIcon.innerHTML = getIcon(type);
    toast.appendChild(toastIcon);

    const toastMessage = document.createElement('div');
    toastMessage.className = 'toast-message';

    if (title !== '') {
      const toastTitle = document.createElement('div');
      toastTitle.className = 'toast-title';
      toastTitle.textContent = title;
      toastMessage.appendChild(toastTitle);
    }

    const toastMessageContent = document.createElement('div');
    toastMessageContent.textContent = message;
    toastMessage.appendChild(toastMessageContent);
    toast.appendChild(toastMessage);

    container.appendChild(toast);

    // Trigger slide-in
    void toast.offsetWidth;
    toast.classList.add('show');

    // Timer + hover pause
    let start = Date.now();
    let remaining = duration;
    let paused = false;
    let closeTimer = setTimeout(() => hideToast(toast, position), remaining);

    toast.onmouseenter = () => {
      if (paused) return;
      paused = true;
      clearTimeout(closeTimer);
      remaining -= Date.now() - start;
    };

    toast.onmouseleave = () => {
      if (!paused) return;
      paused = false;
      start = Date.now();
      closeTimer = setTimeout(() => hideToast(toast, position), remaining);
    };
  }

  function hideToast(toast, position) {
    toast.classList.remove('show');
    toast.classList.add('hide', position);

    toast.addEventListener('transitionend', function handler() {
      toast.remove();
      toast.removeEventListener('transitionend', handler);
    });
  }

  window.showToast = showToast;
});
