/**
 * DOM utilities: safe HTML insertion, modal management, element manipulation
 */
import { sanitizeHTML } from './sanitizer.js';
import { handleXSSError } from './errorHandler.js';
<<<<<<< HEAD
import Logger from './logger.js';
=======
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4

const enhancedModalsCache = new Set();

export function setSafeInnerHTML(element, html) {
  if (!element || typeof element.innerHTML === 'undefined') {
<<<<<<< HEAD
    Logger.error('setSafeInnerHTML: Invalid element provided');
=======
    console.error('setSafeInnerHTML: Invalid element provided');
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    return false;
  }
  
  if (typeof html !== 'string') {
    handleXSSError('setSafeInnerHTML', html);
    return false;
  }
  
  try {
    element.innerHTML = sanitizeHTML(html);
    return true;
  } catch (error) {
    handleXSSError('setSafeInnerHTML', { html, error: error.message });
    return false;
  }
}

<<<<<<< HEAD
/**
 * Simplified modal management
 * @param {string} modalId - Modal element ID
 */
export function showModal(modalId) {
  const modal = getElementSafely(modalId);
  if (!modal || !modal.classList) return;
  
  modal.classList.remove('modal-hidden');
  modal.classList.add('modal-flex');
  modal.setAttribute('aria-hidden', 'false');
  
  // Simple focus management
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea');
  firstFocusable?.focus();
}

export function hideModal(modalId) {
  const modal = getElementSafely(modalId);
  if (!modal || !modal.classList) return;
  
  modal.classList.remove('modal-flex');
  modal.classList.add('modal-hidden');
  modal.setAttribute('aria-hidden', 'true');
}

/**
 * Add basic modal functionality (click outside to close, escape key)
 * @param {HTMLElement} modal - Modal element
 */
export function enhanceModal(modal) {
  if (!modal || modal.dataset.enhanced) return;
  
  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal(modal.id);
  });
  
  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList && !modal.classList.contains('modal-hidden')) {
      hideModal(modal.id);
    }
  });
  
  modal.dataset.enhanced = 'true';
=======
function enhanceModalIfNeeded(modalElement, modalId) {
  if (enhancedModalsCache.has(modalId)) return;
  
  if (typeof modalElement.show !== 'function') {
    modalElement.show = () => modalElement.style.display = 'flex';
    modalElement.hide = () => modalElement.style.display = 'none';
    enhancedModalsCache.add(modalId);
  }
}

export function showModal(modalId) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    enhanceModalIfNeeded(modalElement, modalId);
    modalElement.show();
  } else {
    console.error(`Modal element with ID '${modalId}' not found when trying to show.`);
  }
}

export function hideModal(modalId) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    enhanceModalIfNeeded(modalElement, modalId);
    modalElement.hide();
  } else {
    console.error(`Modal element with ID '${modalId}' not found when trying to hide.`);
  }
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
}

export function getElementSafely(elementId, required = false) {
  const element = document.getElementById(elementId);
  if (!element && required) {
<<<<<<< HEAD
    Logger.error(`Required element with ID '${elementId}' not found.`);
=======
    console.error(`Required element with ID '${elementId}' not found.`);
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
  }
  return element;
}

export const updateElementText = (elementId, content) => {
  const element = getElementSafely(elementId);
  if (element) element.textContent = content;
};

export const toggleElementClass = (elementId, className, force) => {
  const element = getElementSafely(elementId);
<<<<<<< HEAD
  if (element && element.classList) element.classList.toggle(className, force);
};
=======
  if (element) element.classList.toggle(className, force);
};

export const clearModalCache = (modalId = null) => {
  modalId ? enhancedModalsCache.delete(modalId) : enhancedModalsCache.clear();
};

export const getModalCacheStats = () => ({
  size: enhancedModalsCache.size,
  enhancedModals: Array.from(enhancedModalsCache)
});
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
