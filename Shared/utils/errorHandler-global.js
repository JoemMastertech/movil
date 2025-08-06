/**
 * ErrorHandler - Global Version
 * Error handling utilities without ES6 imports
 * Compatible with older browsers
 */

window.ErrorHandler = window.ErrorHandler || {
  
  handle: function(error, context, options) {
    context = context || '';
    options = options || {};
    
    var errorMessage = error instanceof Error ? error.message : (error || 'Error desconocido');
    var timestamp = new Date().toISOString();
    
    // Log error with context
    if (window.Logger) {
      window.Logger.error('[' + timestamp + '] [' + context + '] ERROR: ' + errorMessage, {
        name: error && error.name,
        stack: error && error.stack,
        context: context,
        additionalInfo: options.additionalInfo
      });
    } else {
      console.error('[' + timestamp + '] [' + context + '] ERROR: ' + errorMessage, error);
    }
    
    // Return user-friendly message
    return this._getUserFriendlyMessage(error);
  },
  
  _getUserFriendlyMessage: function(error) {
    if (!error) return 'Algo salió mal. Por favor intenta de nuevo.';
    
    var errorType = error.name || (error.constructor && error.constructor.name) || '';
    
    switch (errorType) {
      case 'NetworkError':
      case 'TypeError':
        if (error.message && error.message.indexOf('fetch') !== -1) {
          return 'Problema de conexión. Verifica tu internet e intenta de nuevo.';
        }
        break;
        
      case 'ValidationError':
        return error.message || 'Los datos ingresados no son válidos.';
        
      case 'DomainError':
        return error.message || 'Error en la operación solicitada.';
        
      case 'InfrastructureError':
        return 'Problema temporal del servicio. Intenta de nuevo en unos momentos.';
        
      default:
        if (error.message && error.message.length < 100) {
          // Si el mensaje es corto y comprensible, mostrarlo
          return error.message;
        }
    }
    
    return 'Algo salió mal. Por favor intenta de nuevo.';
  },
  
  handleValidation: function(error, context) {
    context = context || 'Validation';
    return this.handle(error, context, { type: 'validation' });
  },
  
  handleDomain: function(error, context) {
    context = context || 'Domain';
    return this.handle(error, context, { type: 'domain' });
  },
  
  logWarning: function(message, context) {
    context = context || {};
    if (window.Logger) {
      window.Logger.warn(message, context);
    } else {
      console.warn(message, context);
    }
  },
  
  handleValidationError: function(field, value, rule) {
    var message = "Validation failed for field '" + field + "' with value '" + value + "': " + rule;
    this.handle(message, 'Validation', { field: field, value: value, rule: rule });
    
    // Throw a simple error since we can't dynamically import ValidationError
    throw new Error(message);
  },
  
  showUserError: function(message, elementId) {
    this.handle('User error: ' + message, 'UI');
    
    if (elementId) {
      var element = document.getElementById(elementId);
      if (element) {
        element.textContent = message;
        element.className = element.className.replace('error-hidden', '').trim() + ' error-red error-visible';
      }
    } else {
      // Fallback to alert if no element specified
      alert('Error: ' + message);
    }
  },
  
  clearUserError: function(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
      element.textContent = '';
      element.className = element.className.replace('error-visible', '').replace('error-red', '').trim() + ' error-hidden';
    }
  },
  
  handleXSSError: function(context, suspiciousData) {
    this.handle('¡ERROR DE SEGURIDAD XSS!', context, {
      type: 'security',
      suspiciousData: suspiciousData,
      additionalInfo: 'XSS attempt detected in ' + context
    });
    
    // Trigger debugger in development (simplified check)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      debugger;
    }
  },
  
  handleAsync: function(promise, context) {
    context = context || '';
    var self = this;
    
    return promise.then(function(result) {
      return [null, result];
    }).catch(function(error) {
      var userMessage = self.handle(error, context);
      return [{ originalError: error, userMessage: userMessage }, null];
    });
  }
};

// Legacy functions for backward compatibility
window.logError = function(message, error, context) {
  error = error || null;
  context = context || {};
  
  window.ErrorHandler.handle(error || message, context.module || 'Unknown', {
    additionalInfo: context
  });
};

window.logWarning = window.ErrorHandler.logWarning;
window.handleValidationError = window.ErrorHandler.handleValidationError;
window.handleMissingElementError = window.ErrorHandler.handle;
window.showUserError = window.ErrorHandler.showUserError;
window.clearUserError = window.ErrorHandler.clearUserError;
window.handleXSSError = window.ErrorHandler.handleXSSError;

console.log('ErrorHandler (Global) loaded successfully');