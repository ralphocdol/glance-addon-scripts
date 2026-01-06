(() => {
  const ENUM_WIDTH = {
    SMALL: 'small',
    MEDIUM: 'medium',
    WIDE: 'wide',
    FULL: 'full',
    SMALL_AUTO: 'small-auto',
    MEDIUM_AUTO: 'medium-auto',
    WIDE_AUTO: 'wide-auto',
    FULL_AUTO: 'full-auto',
  }

  const ENUM_HEIGHT = {
    SHORT: 'short',
    MEDIUM: 'medium',
    TALL: 'tall',
    FULL: 'full',
    SHORT_AUTO: 'short-auto',
    MEDIUM_AUTO: 'medium-auto',
    TALL_AUTO: 'tall-auto',
    FULL_AUTO: 'full-auto',
  }

  function createModalWrapper() {
    const createModal = document.createElement('div');
    initializeModalProperties(createModal);
    createModal.innerHTML = `
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-header-content" id="modalTitle"></div>
          </div>
          <div class="modal-body" id="modalDescription"></div>
          <div class="modal-footer"></div>
        </div>
      </div>
    `;
    return createModal;
  }

  function initializeModalProperties(modalElement) {
    [...modalElement.attributes].forEach(a => modalElement.removeAttribute(a.name));
    modalElement.id = 'modal';
    modalElement.classList.add('modal', 'widget-exclude-swipe');
    modalElement.setAttribute('role', 'dialog');
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('aria-labelledby', 'modalTitle');
    modalElement.setAttribute('aria-describedby', 'modalDescription');
    modalElement.hidden = true;
  }

  document.body.appendChild(createModalWrapper());

  const closeBtnElement = document.createElement('span');
  closeBtnElement.className = 'close';

  const modal = document.getElementById('modal');
  const modalContainer = modal.querySelector('.modal-container');
  const modalHeader = modal.querySelector('.modal-header');
  const modalHeaderContent = modal.querySelector('.modal-header-content');
  const modalBody = modal.querySelector('.modal-body');
  const modalFooter = modal.querySelector('.modal-footer');
  const bodyOverflowState = document.body.style.overflow;
  let closeBtn = null;

  document.addEventListener('click', (e) => {
    openModal(e.target.closest('[custom-modal]'));
    if (e.target === closeBtn || (modal.hasAttribute('dismiss-on-outside-click') && e.target === modal)) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('show') && e.key === 'Escape') {
      closeModal();
    }
  });

  function openModal(targetElement) {
    if (!targetElement) return;
    if (!targetElement.hasAttribute('custom-modal')) return;

    const headerElement = targetElement.querySelector('[modal-header]');
    const bodyElement = targetElement.querySelector('[modal-body]');
    const footerElement = targetElement.querySelector('[modal-footer]');

    if (headerElement) {
      modalHeaderContent.innerHTML = headerElement.innerHTML.trim();
      modalHeaderContent.classList.add(...headerElement.classList);
      if (headerElement.hasAttribute('style')) modalHeader.style.cssText = headerElement.style.cssText;
    }

    modalHeader.appendChild(closeBtnElement);
    closeBtn = modal.querySelector('.close')

    if (bodyElement) {
      modalBody.innerHTML = bodyElement.innerHTML.trim();
      modalBody.classList.add(...bodyElement.classList);
      if (bodyElement.hasAttribute('style')) modalBody.style.cssText = bodyElement.style.cssText;
    }

    if (footerElement) {
      modalFooter.innerHTML = footerElement.innerHTML.trim();
      modalFooter.classList.add(...footerElement.classList);
      if (footerElement.hasAttribute('style')) modalFooter.style.cssText = footerElement.style.cssText;
    }

    if (targetElement.hasAttribute('dismiss-on-outside-click')) {
      modal.setAttribute('dismiss-on-outside-click', '');
    }

    if (targetElement.hasAttribute('modal-no-background')) {
      modal.setAttribute('modal-no-background', '')
    }

    if (targetElement.className) modal.classList.add(targetElement.className);

    modalContainer.classList.remove(
      ...Object.values(ENUM_WIDTH).map(size => `modal-width-${size}`),
      ...Object.values(ENUM_HEIGHT).map(size => `modal-height-${size}`),
    );

    const attributeWidth = targetElement.getAttribute('width');
    const width = Object.values(ENUM_WIDTH).includes(attributeWidth) ? attributeWidth : ENUM_WIDTH.WIDE_AUTO;
    modalContainer.classList.add(`modal-width-${width}`);

    const attributeHeight = targetElement.getAttribute('height');
    const height = Object.values(ENUM_HEIGHT).includes(attributeHeight) ? attributeHeight : ENUM_HEIGHT.TALL_AUTO;
    modalContainer.classList.add(`modal-height-${height}`);

    modal.style.display = 'flex';
    setTimeout(() => {
      modal.hidden = false;
      modal.classList.add('show', 'fade-in');
    }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const targetModal = document.querySelector('#modal');
    const targetModalBody = targetModal.querySelector('.modal-body');
    targetModal.hidden = true;
    targetModal.style.display = 'none';
    targetModal.classList.remove('show', 'fade-in');
    targetModalBody.innerHTML = '';
    document.body.style.overflow = bodyOverflowState;
    initializeModalProperties(targetModal);
  }

  function launchModalByAttributeValue(targetAttribute) {
    openModal(document.querySelector(`[custom-modal="${targetAttribute}"]`));
  }

  window.launchModalByAttributeValue = launchModalByAttributeValue;
  window.closeModal = closeModal;
})();