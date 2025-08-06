/**
<<<<<<< HEAD
 * Simplified calculation utilities for drink counts and pricing
 * Centralized business logic with reduced complexity
 */

// Drink categories for easy maintenance
const DRINK_CATEGORIES = ['cocteleria', 'refrescos', 'licores', 'cervezas'];

/**
 * Calculate total drink count from order items
 * @param {Array} items - Order items array
 * @returns {number} Total drink count
 */
export function calculateTotalDrinkCount(items) {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    return item?.category && DRINK_CATEGORIES.includes(item.category) 
      ? total + (item.quantity || 0) 
      : total;
  }, 0);
}

/**
 * Calculate total juice count from order items
 * @param {Array} items - Order items array
 * @returns {number} Total juice count
 */
export function calculateTotalJuiceCount(items) {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const hasJuice = item?.selectedOptions?.some?.(option => isJuiceOption(option));
    return hasJuice ? total + (item.quantity || 0) : total;
  }, 0);
}

/**
 * Calculate total Jäger drink count from order items
 * @param {Array} items - Order items array
 * @returns {number} Total Jäger drink count
 */
export function calculateTotalJagerDrinkCount(items) {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const isJager = item?.name?.toLowerCase().includes('jäger');
    return isJager ? total + (item.quantity || 0) : total;
  }, 0);
}

/**
 * Calculate price for a product with options (simplified)
 * @param {Object} product - Product object
 * @param {Array} selectedOptions - Selected options array
 * @param {number} quantity - Quantity
 * @returns {number} Total price
 */
export function calculatePrice(product, selectedOptions = [], quantity = 1) {
  const basePrice = product?.price || 0;
  const optionPrice = selectedOptions?.reduce((total, option) => total + (option?.price || 0), 0) || 0;
  return (basePrice + optionPrice) * Math.max(1, quantity);
}

/**
 * Calculate total order amount (simplified)
 * @param {Array} items - Order items array
 * @returns {number} Total order amount
 */
export function calculateOrderTotal(items) {
  return items?.reduce((total, item) => total + ((item?.price || 0) * (item?.quantity || 0)), 0) || 0;
}

// Funciones de formateo movidas a formatters.js para unificación
=======
 * Calculation utilities for drink counting and pricing
 * Business rules: Max 5 drinks per bottle, special Jäger logic
 */

import { MemoizationManager } from './simpleCache.js';

const cache = new MemoizationManager({ defaultCacheSize: 50, defaultTTL: 300000 });

const memoizedDrinkCount = cache.memoize('drinkCount', 
  (drinkCounts, bottleCategory, currentProduct = null) => {
    let total = 0;
    const isVodkaOrGin = ['VODKA', 'GINEBRA'].includes(bottleCategory);
    const name = currentProduct?.name?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() || '';
    const isMalibu = name.includes('MALIBU');
    const isSpecialRon = ['BACARDI MANGO', 'BACARDI RASPBERRY', 'MALIBU'].some(s => name.includes(s));

    for (const [option, count] of Object.entries(drinkCounts)) {
      const multiplier = (isVodkaOrGin || (bottleCategory === 'RON' && isSpecialRon)) && isJuiceOption(option) ? 2 : 1;
      total += count * multiplier;
    }
    return total;
  },
  { keyGenerator: args => `${JSON.stringify(args[0])}_${args[1]}_${args[2]?.name || ''}` }
);

export function calculateTotalDrinkCount(drinkCounts, bottleCategory, currentProduct = null) {
  if (!drinkCounts || typeof drinkCounts !== 'object') return 0;
  return memoizedDrinkCount(drinkCounts, bottleCategory, currentProduct);
}

export function calculateTotalJuiceCount(drinkCounts) {
  return Object.entries(drinkCounts)
    .filter(([option]) => isJuiceOption(option))
    .reduce((total, [, count]) => total + count, 0);
}

export function calculateTotalJagerDrinkCount(selectedDrinks, drinkCounts) {
  if (selectedDrinks.includes('2 Boost')) return 0;
  return Object.entries(drinkCounts)
    .filter(([option]) => ['Botella de Agua', 'Mineral'].includes(option))
    .reduce((total, [, count]) => total + count, 0);
}

const memoizedPrice = cache.memoize('price', 
  (product, customizations = {}) => {
    let price = parseFloat(product.price?.replace(/[^\d.]/g, '') || 0);
    if (customizations.extraIngredients) {
      price += customizations.extraIngredients.reduce((sum, ing) => sum + getIngredientPrice(ing), 0);
    }
    if (customizations.premium) price *= 1.15;
    return Math.round(price * 100) / 100;
  },
  { keyGenerator: args => `${args[0]?.id || args[0]?.name}_${JSON.stringify(args[1])}` }
);

export function calculatePrice(product, customizations = {}) {
  if (!product || typeof product !== 'object') return 0;
  return memoizedPrice(product, customizations);
}

export const calculateOrderTotal = items => items.reduce((sum, item) => sum + (item.price || 0), 0);

export const formatPrice = (price, currency = '$') => `${currency}${price.toFixed(2)}`;

export const formatCurrency = (amount, locale = 'es-ES', currency = 'EUR') => 
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4

export function isJuiceOption(option) {
  const normalized = option.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  return ['PIÑA', 'UVA', 'NARANJA', 'ARANDANO', 'MANGO', 'DURAZNO', 'JUGO']
    .some(keyword => normalized.includes(keyword));
}

const getIngredientPrice = ingredient => ({
  'extra_cheese': 2.0,
  'extra_bacon': 3.0,
  'extra_sauce': 1.0,
  'premium_meat': 5.0
})[ingredient] || 0;