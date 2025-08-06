/**
 * DOM utilities - Global Version
 * Safe HTML insertion, modal management, element manipulation
 * Compatible with older browsers, no ES6 imports
 */

window.DomUtils = window.DomUtils || {};

// Simple HTML sanitization using DOMPurify if available
window.DomUtils.sanitizeHTML = function(html, options) {
  if (!html || typeof html !== 'string') return '';
  
  options = options || {};
  
  if (!window.DOMPurify) {
    if (window.Logger) {
      window.Logger.error('DOMPurify not available. HTML sanitization disabled.');
    }
    return '';
  }
  
  try {
    var defaultOptions = {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'span', 'div', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['class', 'src', 'alt', 'data-category'],
      KEEP_CONTENT: true,
      FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover']
    };
    
    // Merge options
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        defaultOptions[key] = options[key];
      }
    }
    
    return window.DOMPurify.sanitize(html, defaultOptions);
  } catch (error) {
    if (window.handleXSSError) {
      window.handleXSSError('sanitizeHTML', { html: html, error: error.message });
    }
    return '';
  }
};

/**
 * Safe innerHTML setter with sanitization
 */
window.DomUtils.setSafeInnerHTML = function(element, html) {
  if (!element || typeof element.innerHTML === 'undefined') {
    if (window.Logger) {
      window.Logger.error('setSafeInnerHTML: Invalid element provided');
    }
    return false;
  }
  
  if (typeof html !== 'string') {
    if (window.handleXSSError) {
      window.handleXSSError('setSafeInnerHTML', html);
    }
    return false;
  }
  
  try {
    element.innerHTML = window.DomUtils.sanitizeHTML(html);
    return true;
  } catch (error) {
    if (window.handleXSSError) {
      window.handleXSSError('setSafeInnerHTML', { html: html, error: error.message });
    }
    return false;
  }
};

/**
 * Show modal with accessibility features
 */
window.DomUtils.showModal = function(modalId) {
  var modal = window.DomUtils.getElementSafely(modalId);
  if (!modal || !modal.classList) return;
  
  modal.classList.remove('modal-hidden');
  modal.classList.add('modal-flex');
  modal.setAttribute('aria-hidden', 'false');
  
  // Simple focus management
  var firstFocusable = modal.querySelector('button, [href], input, select, textarea');
  if (firstFocusable && firstFocusable.focus) {
    firstFocusable.focus();
  }
};

/**
 * Hide modal
 */
window.DomUtils.hideModal = function(modalId) {
  var modal = window.DomUtils.getElementSafely(modalId);
  if (!modal || !modal.classList) return;
  
  modal.classList.remove('modal-flex');
  modal.classList.add('modal-hidden');
  modal.setAttribute('aria-hidden', 'true');
};

/**
 * Add basic modal functionality (click outside to close, escape key)
 */
window.DomUtils.enhanceModal = function(modal) {
  if (!modal || modal.dataset.enhanced) return;
  
  // Click outside to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      window.DomUtils.hideModal(modal.id);
    }
  });
  
  // Escape key to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList && !modal.classList.contains('modal-hidden')) {
      window.DomUtils.hideModal(modal.id);
    }
  });
  
  modal.dataset.enhanced = 'true';
};

/**
 * Get element safely by ID
 */
window.DomUtils.getElementSafely = function(elementId, required) {
  var element = document.getElementById(elementId);
  if (!element && required) {
    if (window.Logger) {
      window.Logger.error("Required element with ID '" + elementId + "' not found.");
    }
  }
  return element;
};

/**
 * Update element text content
 */
window.DomUtils.updateElementText = function(elementId, content) {
  var element = window.DomUtils.getElementSafely(elementId);
  if (element) {
    element.textContent = content;
  }
};

/**
 * Toggle element class
 */
window.DomUtils.toggleElementClass = function(elementId, className, force) {
  var element = window.DomUtils.getElementSafely(elementId);
  if (element && element.classList) {
    if (typeof force !== 'undefined') {
      element.classList.toggle(className, force);
    } else {
      element.classList.toggle(className);
    }
  }
};

/**
 * Clear modal cache (for compatibility)
 */
window.DomUtils.clearModalCache = function() {
  // Simple implementation for compatibility
  return true;
};

/**
 * Get modal cache stats (for compatibility)
 */
window.DomUtils.getModalCacheStats = function() {
  return { size: 0, hits: 0, misses: 0 };
};

// Legacy function exports for backward compatibility
window.setSafeInnerHTML = window.DomUtils.setSafeInnerHTML;
window.showModal = window.DomUtils.showModal;
window.hideModal = window.DomUtils.hideModal;
window.getElementSafely = window.DomUtils.getElementSafely;
window.updateElementText = window.DomUtils.updateElementText;
window.toggleElementClass = window.DomUtils.toggleElementClass;
window.clearModalCache = window.DomUtils.clearModalCache;
window.getModalCacheStats = window.DomUtils.getModalCacheStats;

console.log('DomUtils (Global) loaded successfully');