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

  const cleanUpModalClose = [];

  document.addEventListener('click', (e) => {
    openModal(e.target.closest('[custom-modal]'));
    if (e.target === closeBtn || (modal.hasAttribute('dismiss-on-outside-click') && e.target === modal)) {
      closeModal(cleanUpModalClose);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('show') && e.key === 'Escape' && !modal.hasAttribute('no-dismiss-on-escape-key')) {
      closeModal(cleanUpModalClose);
    }
  });

  const attachEl = (target, source, attribute) => {
    const placeholder = document.createComment('');
    target.replaceWith(placeholder);
    source.replaceChildren(target);
    target.removeAttribute(attribute);
    cleanUpModalClose.push(() => {
      target.setAttribute(attribute, '');
      placeholder.replaceWith(target);
      placeholder.remove();
    });
  }

  function openModal(targetElement) {
    if (!targetElement) return;
    if (!targetElement.hasAttribute('custom-modal')) return;

    const headerElement = targetElement.querySelector('[modal-header]');
    const bodyElement = targetElement.querySelector('[modal-body]');
    const footerElement = targetElement.querySelector('[modal-footer]');

    modalHeader.appendChild(closeBtnElement);
    closeBtn = modal.querySelector('.close')

    if (headerElement) attachEl(headerElement, modalHeaderContent, 'modal-header');
    if (bodyElement) attachEl(bodyElement, modalBody, 'modal-body');
    if (footerElement) attachEl(footerElement, modalFooter, 'modal-footer');

    if (targetElement.hasAttribute('dismiss-on-outside-click')) modal.setAttribute('dismiss-on-outside-click', '');
    if (targetElement.hasAttribute('no-dismiss-on-escape-key')) modal.setAttribute('no-dismiss-on-escape-key', '');
    if (targetElement.hasAttribute('modal-no-background')) modal.setAttribute('modal-no-background', '');
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
    window.closeModal = () => closeModal(cleanUpModalClose);
  }

  function closeModal(cleanUp) {
    const targetModal = document.querySelector('#modal');
    const targetModalBody = targetModal.querySelector('.modal-body');
    targetModal.hidden = true;
    targetModal.style.display = 'none';
    targetModal.classList.remove('show', 'fade-in');
    targetModalBody.innerHTML = '';
    document.body.style.overflow = bodyOverflowState;
    initializeModalProperties(targetModal);
    setTimeout(() => {
      for (const fn of cleanUp) fn();
      cleanUp.length = 0;
    }, 10);
  }

  function launchModalByAttributeValue(targetAttribute) {
    openModal(document.querySelector(`[custom-modal="${targetAttribute}"]`));
  }

  window.launchModalByAttributeValue = launchModalByAttributeValue;
})();