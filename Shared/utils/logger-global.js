/**
 * Logger - Global Version
 * Simple logging utility without ES6 imports
 * Compatible with older browsers
 */

window.Logger = window.Logger || {
  _isProduction: false, // Cambiar a true en producción
  
  info: function(message, data) {
    data = data || {};
    if (!this._isProduction) {
      console.log('[INFO] ' + new Date().toISOString() + ' - ' + message, data);
    }
  },
  
  error: function(message, error) {
    error = error || {};
    console.error('[ERROR] ' + new Date().toISOString() + ' - ' + message, error);
    
    // En producción, aquí podrías enviar a un servicio de monitoreo
    if (this._isProduction && error.stack) {
      // TODO: Integrar con servicio de monitoreo si es necesario
    }
  },
  
  warn: function(message, data) {
    data = data || {};
    console.warn('[WARN] ' + new Date().toISOString() + ' - ' + message, data);
  },
  
  debug: function(message, data) {
    data = data || {};
    if (!this._isProduction) {
      console.debug('[DEBUG] ' + new Date().toISOString() + ' - ' + message, data);
    }
  },
  
  setProduction: function(isProduction) {
    this._isProduction = isProduction;
  },
  
  isProduction: function() {
    return this._isProduction;
  }
};

console.log('Logger (Global) loaded successfully');