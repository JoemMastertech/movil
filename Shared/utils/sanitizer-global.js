/**
 * Global Sanitizer - HTML and text sanitization utilities
 * Compatible with older browsers - no ES6 imports
 */

(function(window) {
    'use strict';

    /**
     * Sanitize HTML content using DOMPurify
     * @param {string} html - HTML content to sanitize
     * @param {Object} options - Sanitization options
     * @returns {string} Sanitized HTML
     */
    function sanitizeHTML(html, options) {
        if (!html || typeof html !== 'string') return '';
        
        options = options || {};
        
        // Validate input length
        if (window.Validator && window.Validator.validate) {
            var validation = window.Validator.validate(html, 'text', { maxLength: 10000 });
            if (!validation.isValid) {
                if (window.ErrorHandler && window.ErrorHandler.handleXSSError) {
                    window.ErrorHandler.handleXSSError('sanitizeHTML', validation.message);
                }
                return '';
            }
        }
        
        if (!window.DOMPurify) {
            if (window.Logger && window.Logger.error) {
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
            if (window.ErrorHandler && window.ErrorHandler.handleXSSError) {
                window.ErrorHandler.handleXSSError('sanitizeHTML', { html: html, error: error.message });
            }
            return '';
        }
    }

    /**
     * Sanitize text content
     * @param {string} text - Text to sanitize
     * @param {number} maxLength - Maximum length allowed
     * @returns {string} Sanitized text
     */
    function sanitizeText(text, maxLength) {
        if (!text || typeof text !== 'string') return '';
        
        maxLength = maxLength || 1000;
        
        if (window.Validator && window.Validator.validate) {
            var validation = window.Validator.validate(text, 'text', { maxLength: maxLength });
            if (!validation.isValid && window.Validator.sanitizeText) {
                return window.Validator.sanitizeText(text);
            }
        }
        
        return text.trim().replace(/[<>"'&]/g, '').substring(0, maxLength);
    }

    /**
     * Sanitize URL
     * @param {string} url - URL to sanitize
     * @returns {string} Sanitized URL
     */
    function sanitizeURL(url) {
        if (!url || typeof url !== 'string') return '';
        
        if (url.length > 2048) {
            if (window.ErrorHandler && window.ErrorHandler.handleXSSError) {
                window.ErrorHandler.handleXSSError('sanitizeURL', 'URL too long');
            }
            return '';
        }
        
        var trimmedUrl = url.trim().toLowerCase();
        var dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
        
        for (var i = 0; i < dangerousProtocols.length; i++) {
            if (trimmedUrl.indexOf(dangerousProtocols[i]) === 0) {
                if (window.ErrorHandler && window.ErrorHandler.handleXSSError) {
                    window.ErrorHandler.handleXSSError('sanitizeURL', url);
                }
                return '';
            }
        }
        
        return url.trim();
    }

    /**
     * Generic sanitization function
     * @param {string} input - Input to sanitize
     * @param {string} type - Type of sanitization (html, url, text)
     * @param {Object} options - Sanitization options
     * @returns {string} Sanitized input
     */
    function sanitize(input, type, options) {
        type = type || 'text';
        options = options || {};
        
        switch (type.toLowerCase()) {
            case 'html': 
                return sanitizeHTML(input, options);
            case 'url': 
                return sanitizeURL(input);
            case 'text':
            default: 
                return sanitizeText(input, options.maxLength);
        }
    }

    /**
     * Sanitize multiple inputs in batch
     * @param {Array} inputs - Array of objects with value, type, and options
     * @returns {Array} Array of sanitized values
     */
    function sanitizeBatch(inputs) {
        if (!Array.isArray(inputs)) return [];
        
        return inputs.map(function(item) {
            var value = item.value || '';
            var type = item.type || 'text';
            var options = item.options || {};
            return sanitize(value, type, options);
        });
    }

    // Create the global Sanitizer object
    var Sanitizer = {
        sanitizeHTML: sanitizeHTML,
        sanitizeText: sanitizeText,
        sanitizeURL: sanitizeURL,
        sanitize: sanitize,
        sanitizeBatch: sanitizeBatch
    };

    // Export to global scope
    window.Sanitizer = Sanitizer;
    
    // Legacy exports for backward compatibility
    window.sanitizeHTML = sanitizeHTML;
    window.sanitizeText = sanitizeText;
    window.sanitizeURL = sanitizeURL;
    window.sanitize = sanitize;
    window.sanitizeBatch = sanitizeBatch;

})(window);