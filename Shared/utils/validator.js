import { VALIDATION } from '../config/constants.js';
import Logger from './logger.js';
import { MemoizationManager } from './simpleCache.js';

const validatorCache = new MemoizationManager({ defaultCacheSize: 150, defaultTTL: 300000 });
class Validator {
  static #memoizedValidate = validatorCache.memoize(
    'validation',
    (value, type, options = {}) => {
      switch (type) {
        case 'email': return Validator.#validateEmail(value);
        case 'phone': return Validator.#validatePhone(value);
        case 'number': return Validator.#validateNumber(value, options);
        case 'text': return Validator.#validateText(value, options);
        case 'password': return Validator.#validatePassword(value);
        default:
          Logger.warn('Unknown validation type', { type });
          return { isValid: true, message: '' };
      }
    },
    { keyGenerator: (args) => `${args[1]}_${JSON.stringify(args[0])}_${JSON.stringify(args[2])}`, ttl: 300000 }
  );

  static validate(value, type, options = {}) {
    try {
      if (this.#isEmpty(value) && !options.optional) {
        return { isValid: false, message: 'Este campo es requerido' };
      }
      
      if (this.#isEmpty(value) && options.optional) {
        return { isValid: true, message: '' };
      }
      
      return this.#memoizedValidate(value, type, options);
    } catch (error) {
      Logger.error('Validation error', { type, value, error });
      return { isValid: false, message: 'Error en la validación' };
    }
  }
  
  static validateFields(fields, rules) {
    const errors = {};
    let isValid = true;
    
    for (const [fieldName, rule] of Object.entries(rules)) {
      const value = fields[fieldName];
      const result = this.validate(value, rule.type, rule.options || {});
      
      if (!result.isValid) {
        errors[fieldName] = result.message;
        isValid = false;
      }
    }
    
    return { isValid, errors };
  }
  
  static #isEmpty(value) {
    return value === null || value === undefined || value === '' || 
           (typeof value === 'string' && value.trim() === '');
  }
  
  static #validateEmail(email) {
    if (!VALIDATION.EMAIL_PATTERN.test(email)) {
      return { isValid: false, message: 'Email no válido' };
    }
    return { isValid: true, message: '' };
  }
  
  static #validatePhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!VALIDATION.PHONE_PATTERN.test(cleanPhone)) {
      return { isValid: false, message: 'Teléfono no válido' };
    }
    return { isValid: true, message: '' };
  }
  
  static #validateNumber(value, options = {}) {
    const num = Number(value);
    
    if (isNaN(num)) {
      return { isValid: false, message: 'Debe ser un número válido' };
    }
    
    if (options.integer && !Number.isInteger(num)) {
      return { isValid: false, message: 'Debe ser un número entero' };
    }
    
    if (options.min !== undefined && num < options.min) {
      return { isValid: false, message: `Debe ser mayor o igual a ${options.min}` };
    }
    
    if (options.max !== undefined && num > options.max) {
      return { isValid: false, message: `Debe ser menor o igual a ${options.max}` };
    }
    
    return { isValid: true, message: '' };
  }
  
  static #validateText(text, options = {}) {
    const minLength = options.minLength || VALIDATION.MIN_NAME_LENGTH;
    const maxLength = options.maxLength || VALIDATION.MAX_NAME_LENGTH;
    
    if (text.length < minLength) {
      return { isValid: false, message: `Debe tener al menos ${minLength} caracteres` };
    }
    
    if (text.length > maxLength) {
      return { isValid: false, message: `No puede exceder ${maxLength} caracteres` };
    }
    
    return { isValid: true, message: '' };
  }
  
  static #validatePassword(password) {
    if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      return { 
        isValid: false, 
        message: `La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres` 
      };
    }
    
    return { isValid: true, message: '' };
  }
  
  static sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    return text
      .trim()
      .replace(/[<>"'&]/g, '')
      .substring(0, 1000);
  }

  static getValidatorStats = () => validatorCache.getGlobalStats();

  static clearValidatorCache = (cacheKey = null) => {
    if (cacheKey) {
      validatorCache.clearCache(cacheKey);
    } else {
      validatorCache.clearAllCaches();
    }
  };

  static validateBatch = (validations) => validations.map(({ value, type, options = {} }) => 
    this.validate(value, type, options)
  );

  static validateAndSanitize = (value, type, options = {}) => {
    const validation = this.validate(value, type, options);
    const sanitizedValue = validation.isValid ? this.sanitizeText(value) : '';
    
    return {
      ...validation,
      sanitizedValue
    };
  };
}

export default Validator;