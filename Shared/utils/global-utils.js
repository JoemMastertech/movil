/**
 * Global Utilities - Consolidated utilities without ES6 imports
 * Part of the no-import migration strategy
 * Contains: formatters, calculations, and essential constants
 */

// ============================================================================
// CONSTANTS (Essential subset from constants.js)
// ============================================================================

window.BUSINESS_RULES = {
  MAX_DRINK_COUNT: 5,
  MAX_JUICE_COUNT: 10,
  MIN_ORDER_AMOUNT: 0,
  MAX_ORDER_AMOUNT: 10000,
  JAGER_MULTIPLIER: 1,
  JAGER_EXCEPTION_DRINKS: ['2 Boost'],
  LOW_STOCK_THRESHOLD: 5,
  OUT_OF_STOCK_THRESHOLD: 0,
  DEFAULT_PRICE: 0,
  PRICE_PRECISION: 2
};

window.CACHE_KEYS = {
  COCKTAILS: 'cocktails_cache',
  PRODUCTS: 'products_cache',
  USER_PREFS: 'user_preferences',
  ORDER_HISTORY: 'order_history',
  SPIRITS: 'spirits_cache',
  FOOD: 'food_cache'
};

window.CACHE_CONFIG = {
  DEFAULT_TTL: 300000,
  LONG_TTL: 3600000,
  SHORT_TTL: 60000,
  USER_PREFS_TTL: 86400000,
  MAX_CACHE_SIZE: 50
};

// ============================================================================
// FORMATTERS (From formatters.js)
// ============================================================================

window.GlobalUtils = window.GlobalUtils || {};

/**
 * Formatea precios de manera consistente
 */
window.GlobalUtils.formatPrice = function(price, presentation = 'individual') {
  const cleanPrice = typeof price === 'string' ? price.replace('$', '') : price;
  const numericPrice = parseFloat(cleanPrice);
  
  if (isNaN(numericPrice)) return '$0.00';
  
  const basePrice = `$${numericPrice.toFixed(2)}`;
  
  const presentations = {
    individual: basePrice,
    jarra: `${basePrice} (Jarra)`,
    botella: `${basePrice} (Botella)`,
    copa: `${basePrice} (Copa)`,
    litro: `${basePrice} (Litro)`
  };
  
  return presentations[presentation] || basePrice;
};

/**
 * Formatea lista de ingredientes
 */
window.GlobalUtils.formatIngredients = function(ingredients) {
  if (!ingredients) return '';
  
  if (Array.isArray(ingredients)) {
    return ingredients.join(', ');
  }
  
  if (typeof ingredients === 'string') {
    return ingredients.trim();
  }
  
  return '';
};

/**
 * Formatea nombres de productos
 */
window.GlobalUtils.formatProductName = function(name) {
  if (!name || typeof name !== 'string') return '';
  
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

/**
 * Formatea texto para capitalización de títulos
 */
window.GlobalUtils.formatTitle = function(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Limpia y formatea texto general
 */
window.GlobalUtils.cleanText = function(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Formatea números de manera consistente
 */
window.GlobalUtils.formatNumber = function(num, decimals = 2) {
  if (isNaN(num)) return '0';
  
  return parseFloat(num).toFixed(decimals);
};

// ============================================================================
// CALCULATIONS (From calculationUtils.js)
// ============================================================================

const DRINK_CATEGORIES = ['cocteleria', 'refrescos', 'licores', 'cervezas'];

/**
 * Calculate total drink count from order items
 */
window.GlobalUtils.calculateTotalDrinkCount = function(items) {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    return item?.category && DRINK_CATEGORIES.includes(item.category) 
      ? total + (item.quantity || 0) 
      : total;
  }, 0);
};

/**
 * Calculate total juice count from order items
 */
window.GlobalUtils.calculateTotalJuiceCount = function(items) {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const hasJuice = item?.selectedOptions?.some?.(option => window.GlobalUtils.isJuiceOption(option));
    return hasJuice ? total + (item.quantity || 0) : total;
  }, 0);
};

/**
 * Calculate total Jäger drink count from order items
 */
window.GlobalUtils.calculateTotalJagerDrinkCount = function(items) {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const isJager = item?.name?.toLowerCase().includes('jäger');
    return isJager ? total + (item.quantity || 0) : total;
  }, 0);
};

/**
 * Calculate price for a product with options
 */
window.GlobalUtils.calculatePrice = function(product, selectedOptions = [], quantity = 1) {
  const basePrice = product?.price || 0;
  const optionPrice = selectedOptions?.reduce((total, option) => total + (option?.price || 0), 0) || 0;
  return (basePrice + optionPrice) * Math.max(1, quantity);
};

/**
 * Calculate total order amount
 */
window.GlobalUtils.calculateOrderTotal = function(items) {
  return items?.reduce((total, item) => total + ((item?.price || 0) * (item?.quantity || 0)), 0) || 0;
};

/**
 * Check if option is a juice option
 */
window.GlobalUtils.isJuiceOption = function(option) {
  const normalized = option.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  return ['PIÑA', 'UVA', 'NARANJA', 'ARANDANO', 'MANGO', 'DURAZNO', 'JUGO']
    .some(keyword => normalized.includes(keyword));
};

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('Global utilities loaded successfully');