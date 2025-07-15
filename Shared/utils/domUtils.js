/**
 * DOM utilities: safe HTML insertion, modal management, element manipulation
 */
import { sanitizeHTML } from './sanitizer.js';
import { handleXSSError } from './errorHandler.js';

const enhancedModalsCache = new Set();

export function setSafeInnerHTML(element, html) {
  if (!element || typeof element.innerHTML === 'undefined') {
    console.error('setSafeInnerHTML: Invalid element provided');
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
}

export function getElementSafely(elementId, required = false) {
  const element = document.getElementById(elementId);
  if (!element && required) {
    console.error(`Required element with ID '${elementId}' not found.`);
  }
  return element;
}

export const updateElementText = (elementId, content) => {
  const element = getElementSafely(elementId);
  if (element) element.textContent = content;
};

export const toggleElementClass = (elementId, className, force) => {
  const element = getElementSafely(elementId);
  if (element) element.classList.toggle(className, force);
};

export const clearModalCache = (modalId = null) => {
  modalId ? enhancedModalsCache.delete(modalId) : enhancedModalsCache.clear();
};

export const getModalCacheStats = () => ({
  size: enhancedModalsCache.size,
  enhancedModals: Array.from(enhancedModalsCache)
});