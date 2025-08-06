import { handleXSSError } from './errorHandler.js';
<<<<<<< HEAD
import Validator from './validator.js';
import Logger from './logger.js';
=======
import { MemoizationManager } from './simpleCache.js';
import Validator from './validator.js';

const sanitizerCache = new MemoizationManager({ defaultCacheSize: 200, defaultTTL: 300000 });

const memoizedSanitizeHTML = sanitizerCache.memoize(
  'htmlSanitization',
  (html, options = {}) => {
    if (!window.DOMPurify) {
      console.error('DOMPurify not available. HTML sanitization disabled.');
      return '';
    }
    
    try {
      const defaultOptions = {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'span', 'div', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: ['class', 'src', 'alt', 'data-category'],
        KEEP_CONTENT: true,
        FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover'],
        ...options
      };
      return window.DOMPurify.sanitize(html, defaultOptions);
    } catch (error) {
      handleXSSError('sanitizeHTML', { html, error: error.message });
      return '';
    }
  },
  { keyGenerator: (args) => `${args[0]}_${JSON.stringify(args[1])}`, ttl: 300000 }
);
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4

function sanitizeHTML(html, options = {}) {
  if (!html || typeof html !== 'string') return '';
  
  const validation = Validator.validate(html, 'text', { maxLength: 10000 });
  if (!validation.isValid) {
    handleXSSError('sanitizeHTML', validation.message);
    return '';
  }
  
<<<<<<< HEAD
  if (!window.DOMPurify) {
    Logger.error('DOMPurify not available. HTML sanitization disabled.');
    return '';
  }
  
  try {
    const defaultOptions = {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'span', 'div', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['class', 'src', 'alt', 'data-category'],
      KEEP_CONTENT: true,
      FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover'],
      ...options
    };
    return window.DOMPurify.sanitize(html, defaultOptions);
  } catch (error) {
    handleXSSError('sanitizeHTML', { html, error: error.message });
    return '';
  }
}

=======
  return memoizedSanitizeHTML(html, options);
}

const memoizedSanitizeText = sanitizerCache.memoize(
  'textSanitization',
  (text, maxLength = 1000) => text.trim().replace(/[<>"'&]/g, '').substring(0, maxLength),
  { keyGenerator: (args) => `${args[0]}_${args[1]}`, ttl: 300000 }
);

const memoizedSanitizeURL = sanitizerCache.memoize(
  'urlSanitization',
  (url) => {
    const trimmedUrl = url.trim().toLowerCase();
    if (trimmedUrl.startsWith('javascript:') || trimmedUrl.startsWith('data:') || 
        trimmedUrl.startsWith('vbscript:') || trimmedUrl.startsWith('file:') || 
        trimmedUrl.startsWith('ftp:')) {
      handleXSSError('sanitizeURL', url);
      return '';
    }
    return url.trim();
  },
  { keyGenerator: (args) => args[0], ttl: 600000 }
);

>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
function sanitizeText(text, maxLength = 1000) {
  if (!text || typeof text !== 'string') return '';
  
  const validation = Validator.validate(text, 'text', { maxLength });
  if (!validation.isValid) return Validator.sanitizeText(text);
  
<<<<<<< HEAD
  return text.trim().replace(/[<>"'&]/g, '').substring(0, maxLength);
=======
  return memoizedSanitizeText(text, maxLength);
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
}

function sanitizeURL(url) {
  if (!url || typeof url !== 'string') return '';
  
  if (url.length > 2048) {
    handleXSSError('sanitizeURL', 'URL too long');
    return '';
  }
  
<<<<<<< HEAD
  const trimmedUrl = url.trim().toLowerCase();
  if (trimmedUrl.startsWith('javascript:') || trimmedUrl.startsWith('data:') || 
      trimmedUrl.startsWith('vbscript:') || trimmedUrl.startsWith('file:') || 
      trimmedUrl.startsWith('ftp:')) {
    handleXSSError('sanitizeURL', url);
    return '';
  }
  return url.trim();
=======
  return memoizedSanitizeURL(url);
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
}

const sanitize = (input, type = 'text', options = {}) => {
  switch (type.toLowerCase()) {
    case 'html': return sanitizeHTML(input, options);
    case 'url': return sanitizeURL(input);
    case 'text':
    default: return sanitizeText(input, options.maxLength);
  }
};

<<<<<<< HEAD
=======
const getSanitizerStats = () => sanitizerCache.getGlobalStats();

const clearSanitizerCache = (cacheKey = null) => {
  if (cacheKey) {
    sanitizerCache.clearCache(cacheKey);
  } else {
    sanitizerCache.clearAllCaches();
  }
};

>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
const sanitizeBatch = (inputs) => inputs.map(({ value, type = 'text', options = {} }) => 
  sanitize(value, type, options)
);

window.sanitizeHTML = sanitizeHTML;
window.sanitizeText = sanitizeText;
window.sanitizeURL = sanitizeURL;
window.sanitize = sanitize;

export { 
  sanitizeHTML, 
  sanitizeText, 
  sanitizeURL, 
  sanitize,
<<<<<<< HEAD
=======
  getSanitizerStats,
  clearSanitizerCache,
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
  sanitizeBatch
};
export default sanitize;