(() => {
    const ENUM_WIDTH = {
        SMALL: 'small',
        MEDIUM: 'medium',
        WIDE: 'wide',
        FULL: 'full',
    }

    const ENUM_HEIGHT = {
        SHORT: 'short',
        MEDIUM: 'medium',
        TALL: 'tall',
        FULL: 'full',
    }

    const modalWrapper = document.createElement('div');
    modalWrapper.classList.add('modal', 'widget-exclude-swipe');
    modalWrapper.innerHTML = `
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-header-content"></div>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer"></div>
        </div>
      </div>
  `;
    document.body.appendChild(modalWrapper);

    const closeBtnElement = document.createElement('span');
    closeBtnElement.className = 'close';

    const modal = document.querySelector('.modal');
    const modalContainer = modal.querySelector('.modal-container');
    const modalHeader = modal.querySelector('.modal-header');
    const modalHeaderContent = modal.querySelector('.modal-header-content');
    const modalBody = modal.querySelector('.modal-body');
    const modalFooter = modal.querySelector('.modal-footer');
    const bodyOverflowState = document.body.style.overflow;
    let closeBtn = null;

    document.addEventListener('click', (e) => {
        const triggerElement = e.target.closest('[custom-modal]');
        if (triggerElement) {
            const headerElement = triggerElement.querySelector('[modal-header]');
            const bodyElement = triggerElement.querySelector('[modal-body]');
            const footerElement = triggerElement.querySelector('[modal-footer]');

            if (headerElement) {
                modalHeaderContent.innerHTML = headerElement.innerHTML.trim();
                modalHeaderContent.classList.add(...headerElement.classList);
            }

            modalHeader.appendChild(closeBtnElement);
            closeBtn = modal.querySelector('.close')

            if (bodyElement) {
                modalBody.innerHTML = bodyElement.innerHTML.trim();
                modalBody.classList.add(...bodyElement.classList);
            }

            if (footerElement) {
                modalFooter.innerHTML = footerElement.innerHTML.trim();
                modalFooter.classList.add(...footerElement.classList);
            }

            if (triggerElement.hasAttribute('dismiss-on-outside-click')) {
                modal.setAttribute('dismiss-on-outside-click', '');
            }

            if (triggerElement.hasAttribute('modal-no-background')) {
                modal.setAttribute('modal-no-background', '')
            }

            if (triggerElement.className) modal.classList.add(triggerElement.className);

            modalContainer.classList.remove(
                ...Object.values(ENUM_WIDTH).map(size => `modal-width-${size}`),
                ...Object.values(ENUM_HEIGHT).map(size => `modal-height-${size}`),
            );

            const attributeWidth = triggerElement.getAttribute('width');
            const width = Object.values(ENUM_WIDTH).includes(attributeWidth) ? attributeWidth : ENUM_WIDTH.WIDE;
            modalContainer.classList.add(`modal-width-${width}`);

            const attributeHeight = triggerElement.getAttribute('height');
            const height = Object.values(ENUM_HEIGHT).includes(attributeHeight) ? attributeHeight : ENUM_HEIGHT.TALL;
            modalContainer.classList.add(`modal-height-${height}`);

            const fillHeight = triggerElement.getAttribute('fillHeight');
            if (fillHeight !== null && (fillHeight === '' || fillHeight === 'true')) {
                modalContainer.style.height = '100%';
            } else {
                modalContainer.style.removeProperty('height');
            }

            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show', 'fade-in'), 10);
            document.body.style.overflow = 'hidden';
        }
        if (e.target === closeBtn || (modal.hasAttribute('dismiss-on-outside-click') && e.target === modal)) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('show') && e.key === 'Escape') {
            closeModal();
        }
    });

    function closeModal() {
        modal.style.display = 'none';
        modal.classList.remove('show', 'fade-in');
        modalBody.innerHTML = '';
        document.body.style.overflow = bodyOverflowState;
    }
})();