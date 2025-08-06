/**
 * Global Dependency Injection Utilities - Shared utilities for DI Container access
 * Compatible with older browsers - no ES6 imports
 */

(function(window) {
    'use strict';

    /**
     * Gets the ProductRepository from DI Container
     * Consolidates getProductRepository functions from multiple files
     * @returns {Object} Product repository instance
     * @throws {Error} If DIContainer is not initialized
     */
    function getProductRepository() {
        if (typeof window.DIContainer === 'undefined' && typeof window.container === 'undefined') {
            throw new Error('DI Container not initialized. Make sure AppInit.initialize() has been called.');
        }
        
        // Support both naming conventions found in the codebase
        var container = window.DIContainer || window.container;
        return container.resolve('ProductRepository');
    }

    /**
     * Generic service resolver from DI Container
     * @param {string} serviceName - Name of the service to resolve
     * @returns {Object} Resolved service instance
     * @throws {Error} If DIContainer is not initialized or service not found
     */
    function resolveService(serviceName) {
        if (typeof window.DIContainer === 'undefined' && typeof window.container === 'undefined') {
            throw new Error('DI Container not initialized. Make sure AppInit.initialize() has been called.');
        }
        
        var container = window.DIContainer || window.container;
        return container.resolve(serviceName);
    }

    /**
     * Checks if DI Container is available
     * @returns {boolean} True if container is available
     */
    function isDIContainerAvailable() {
        return typeof window.DIContainer !== 'undefined' || typeof window.container !== 'undefined';
    }

    /**
     * Gets the DI Container instance
     * @returns {Object|null} DI Container instance or null if not available
     */
    function getDIContainer() {
        return window.DIContainer || window.container || null;
    }

    /**
     * Safely resolves a service with error handling
     * @param {string} serviceName - Name of the service to resolve
     * @param {Object} fallback - Fallback value if service cannot be resolved
     * @returns {Object} Resolved service or fallback
     */
    function safeResolveService(serviceName, fallback) {
        fallback = fallback || null;
        
        try {
            return resolveService(serviceName);
        } catch (error) {
            if (window.Logger && window.Logger.warn) {
                window.Logger.warn('Failed to resolve service \'' + serviceName + '\':', error.message);
            } else if (console && console.warn) {
                console.warn('Failed to resolve service \'' + serviceName + '\':', error.message);
            }
            return fallback;
        }
    }

    // Create the global DIUtils object
    var DIUtils = {
        getProductRepository: getProductRepository,
        resolveService: resolveService,
        isDIContainerAvailable: isDIContainerAvailable,
        getDIContainer: getDIContainer,
        safeResolveService: safeResolveService
    };

    // Export to global scope
    window.DIUtils = DIUtils;
    
    // Legacy exports for backward compatibility
    window.getProductRepository = getProductRepository;
    window.resolveService = resolveService;
    window.isDIContainerAvailable = isDIContainerAvailable;
    window.getDIContainer = getDIContainer;
    window.safeResolveService = safeResolveService;

})(window);