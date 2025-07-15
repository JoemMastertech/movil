/**
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