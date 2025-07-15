/**
 * VALUE OBJECT: ProductId
 * Representa un identificador único de producto inmutable
 * 
 * Parte del Plan de Refactorización - Semana 1
 * Patrón: Value Object (DDD)
 */

import ValidationError from '../exceptions/ValidationError.js';

export class ProductId {
  /**
   * @param {string} value - Valor del identificador
   */
  constructor(value) {
    this.validateValue(value);
    
    // Inmutable - usar Object.freeze
    this._value = value.trim();
    
    Object.freeze(this);
  }

  /**
   * Getter para el valor
   */
  get value() {
    return this._value;
  }

  /**
   * Validar el valor del identificador
   */
  validateValue(value) {
    if (typeof value !== 'string') {
      throw new ValidationError('ProductId must be a string');
    }
    
    if (value.trim().length === 0) {
      throw new ValidationError('ProductId cannot be empty');
    }
    
    if (value.trim().length > 50) {
      throw new ValidationError('ProductId cannot exceed 50 characters');
    }
    
    // Validar formato: solo letras, números, guiones y guiones bajos
    const validFormat = /^[a-zA-Z0-9_-]+$/;
    if (!validFormat.test(value.trim())) {
      throw new ValidationError('ProductId can only contain letters, numbers, hyphens and underscores');
    }
  }

  /**
   * Comparar si es igual a otro ProductId
   * @param {ProductId} other - Otro ProductId
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof ProductId)) {
      return false;
    }
    
    return this._value === other._value;
  }

  /**
   * Convertir a string
   * @returns {string}
   */
  toString() {
    return this._value;
  }

  /**
   * Convertir a representación JSON
   * @returns {string}
   */
  toJSON() {
    return this._value;
  }

  /**
   * Crear ProductId desde string
   * @param {string} value - Valor del identificador
   * @returns {ProductId}
   */
  static fromString(value) {
    return new ProductId(value);
  }

  /**
   * Generar un ProductId único
   * @param {string} prefix - Prefijo opcional
   * @returns {ProductId}
   */
  static generate(prefix = 'prod') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const value = `${prefix}_${timestamp}_${random}`;
    
    return new ProductId(value);
  }

  /**
   * Crear ProductId para cerveza
   * @param {string} name - Nombre de la cerveza
   * @returns {ProductId}
   */
  static forBeer(name) {
    const sanitized = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    return new ProductId(`beer_${sanitized}`);
  }

  /**
   * Crear ProductId para comida
   * @param {string} name - Nombre de la comida
   * @returns {ProductId}
   */
  static forFood(name) {
    const sanitized = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    return new ProductId(`food_${sanitized}`);
  }

  /**
   * Crear ProductId para cóctel
   * @param {string} name - Nombre del cóctel
   * @returns {ProductId}
   */
  static forCocktail(name) {
    const sanitized = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    return new ProductId(`cocktail_${sanitized}`);
  }

  /**
   * Verificar si es un ID de cerveza
   * @returns {boolean}
   */
  isBeer() {
    return this._value.startsWith('beer_');
  }

  /**
   * Verificar si es un ID de comida
   * @returns {boolean}
   */
  isFood() {
    return this._value.startsWith('food_');
  }

  /**
   * Verificar si es un ID de cóctel
   * @returns {boolean}
   */
  isCocktail() {
    return this._value.startsWith('cocktail_');
  }

  /**
   * Obtener el tipo de producto
   * @returns {string}
   */
  getProductType() {
    if (this.isBeer()) return 'beer';
    if (this.isFood()) return 'food';
    if (this.isCocktail()) return 'cocktail';
    return 'unknown';
  }
}

export default ProductId;