/**
 * Validator - Global Version
 * Unified validation methods for forms, data, and domain objects
 * Compatible with older browsers, no ES6 imports
 */

window.Validator = window.Validator || {};

// Validation constants (inline to avoid imports)
var VALIDATION_CONSTANTS = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 6
};

/**
 * Check if value is empty
 */
window.Validator.isEmpty = function(value) {
  return value === null || value === undefined || value === '' || 
         (typeof value === 'string' && value.trim() === '');
};

/**
 * Validate email format
 */
window.Validator.isValidEmail = function(email) {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_CONSTANTS.EMAIL_PATTERN.test(email.trim());
};

/**
 * Validate phone number format
 */
window.Validator.isValidPhone = function(phone) {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION_CONSTANTS.PHONE_PATTERN.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validate if value is a positive number
 */
window.Validator.isPositiveNumber = function(value) {
  var num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate text length
 */
window.Validator.isValidLength = function(text, minLength, maxLength) {
  if (typeof text !== 'string') return false;
  minLength = minLength || 0;
  maxLength = maxLength || Infinity;
  var length = text.trim().length;
  return length >= minLength && length <= maxLength;
};

/**
 * Validate URL format
 */
window.Validator.isValidUrl = function(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate email with detailed response
 */
window.Validator.validateEmail = function(email) {
  if (!VALIDATION_CONSTANTS.EMAIL_PATTERN.test(email)) {
    return { isValid: false, message: 'Email no válido' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate phone with detailed response
 */
window.Validator.validatePhone = function(phone) {
  var cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (!VALIDATION_CONSTANTS.PHONE_PATTERN.test(cleanPhone)) {
    return { isValid: false, message: 'Teléfono no válido' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate number with options
 */
window.Validator.validateNumber = function(value, options) {
  options = options || {};
  var num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, message: 'Debe ser un número válido' };
  }
  
  if (options.integer && !Number.isInteger(num)) {
    return { isValid: false, message: 'Debe ser un número entero' };
  }
  
  if (options.min !== undefined && num < options.min) {
    return { isValid: false, message: 'Debe ser mayor o igual a ' + options.min };
  }
  
  if (options.max !== undefined && num > options.max) {
    return { isValid: false, message: 'Debe ser menor o igual a ' + options.max };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate text with options
 */
window.Validator.validateText = function(text, options) {
  options = options || {};
  var minLength = options.minLength || VALIDATION_CONSTANTS.MIN_NAME_LENGTH;
  var maxLength = options.maxLength || VALIDATION_CONSTANTS.MAX_NAME_LENGTH;
  
  if (text.length < minLength) {
    return { isValid: false, message: 'Debe tener al menos ' + minLength + ' caracteres' };
  }
  
  if (text.length > maxLength) {
    return { isValid: false, message: 'No puede exceder ' + maxLength + ' caracteres' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password
 */
window.Validator.validatePassword = function(password) {
  if (password.length < VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH) {
    return { 
      isValid: false, 
      message: 'La contraseña debe tener al menos ' + VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH + ' caracteres'
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Main validation function
 */
window.Validator.validate = function(value, type, options) {
  options = options || {};
  
  try {
    if (window.Validator.isEmpty(value) && !options.optional) {
      return { isValid: false, message: 'Este campo es requerido' };
    }
    
    if (window.Validator.isEmpty(value) && options.optional) {
      return { isValid: true, message: '' };
    }
    
    switch (type) {
      case 'email': return window.Validator.validateEmail(value);
      case 'phone': return window.Validator.validatePhone(value);
      case 'number': return window.Validator.validateNumber(value, options);
      case 'text': return window.Validator.validateText(value, options);
      case 'password': return window.Validator.validatePassword(value);
      default:
        return { isValid: true, message: '' };
    }
  } catch (error) {
    return { isValid: false, message: 'Error en la validación' };
  }
};

/**
 * Validate multiple fields
 */
window.Validator.validateFields = function(fields, rules) {
  var errors = {};
  var isValid = true;
  
  for (var fieldName in rules) {
    if (rules.hasOwnProperty(fieldName)) {
      var rule = rules[fieldName];
      var value = fields[fieldName];
      var result = window.Validator.validate(value, rule.type, rule.options || {});
      
      if (!result.isValid) {
        errors[fieldName] = result.message;
        isValid = false;
      }
    }
  }
  
  return { isValid: isValid, errors: errors };
};

/**
 * Sanitize text
 */
window.Validator.sanitizeText = function(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/[<>"'&]/g, '')
    .substring(0, 1000);
};

/**
 * Validate batch of values
 */
window.Validator.validateBatch = function(validations) {
  var results = [];
  for (var i = 0; i < validations.length; i++) {
    var validation = validations[i];
    results.push(window.Validator.validate(validation.value, validation.type, validation.options || {}));
  }
  return results;
};

/**
 * Validate and sanitize
 */
window.Validator.validateAndSanitize = function(value, type, options) {
  var validation = window.Validator.validate(value, type, options);
  var sanitizedValue = validation.isValid ? window.Validator.sanitizeText(value) : '';
  
  return {
    isValid: validation.isValid,
    message: validation.message,
    sanitizedValue: sanitizedValue
  };
};

// Domain-specific validation methods

/**
 * Validate product data
 */
window.Validator.validateProduct = function(product) {
  var errors = [];
  if (!product || !product.name || !product.name.trim()) {
    errors.push('Product name is required');
  }
  if (!window.Validator.isPositiveNumber(product && product.price)) {
    errors.push('Valid price is required');
  }
  if (!product || !product.category || !product.category.trim()) {
    errors.push('Product category is required');
  }
  return { isValid: errors.length === 0, errors: errors };
};

/**
 * Validate cocktail data
 */
window.Validator.validateCocktail = function(cocktail) {
  var errors = [];
  if (!cocktail || !cocktail.name || !cocktail.name.trim()) {
    errors.push('Cocktail name is required');
  }
  if (!window.Validator.isPositiveNumber(cocktail && cocktail.price)) {
    errors.push('Valid price is required');
  }
  if (!cocktail || !cocktail.ingredients || !cocktail.ingredients.length) {
    errors.push('At least one ingredient is required');
  }
  return { isValid: errors.length === 0, errors: errors };
};

/**
 * Validate order data
 */
window.Validator.validateOrder = function(order) {
  var errors = [];
  if (!order || !order.items || !order.items.length) {
    errors.push('Order must contain at least one item');
  }
  if (!window.Validator.isPositiveNumber(order && order.total)) {
    errors.push('Valid order total is required');
  }
  return { isValid: errors.length === 0, errors: errors };
};

/**
 * Validate beer data
 */
window.Validator.validateBeer = function(beer) {
  var errors = [];
  if (!beer || !beer.nombre || !beer.nombre.trim()) {
    errors.push('Beer name is required');
  }
  if (!window.Validator.isPositiveNumber(beer && beer.precio)) {
    errors.push('Valid price is required');
  }
  return { isValid: errors.length === 0, errors: errors };
};

/**
 * Validate food data
 */
window.Validator.validateFood = function(food) {
  var errors = [];
  if (!food || !food.nombre || !food.nombre.trim()) {
    errors.push('Food name is required');
  }
  if (!window.Validator.isPositiveNumber(food && food.precio)) {
    errors.push('Valid price is required');
  }
  return { isValid: errors.length === 0, errors: errors };
};

/**
 * Throw error if validation fails
 */
window.Validator.throwIfInvalid = function(validation, context) {
  context = context || 'Validation';
  if (!validation.isValid) {
    throw new Error(context + ' failed: ' + validation.errors.join(', '));
  }
};

console.log('Validator (Global) loaded successfully');