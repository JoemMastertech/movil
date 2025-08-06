/**
 * Global Calculation Utilities for drink counts and pricing
 * Compatible with older browsers - no ES6 imports
 */

(function(window) {
    'use strict';

    // Drink categories for easy maintenance
    var DRINK_CATEGORIES = ['cocteleria', 'refrescos', 'licores', 'cervezas'];

    /**
     * Calculate total drink count from order items
     * @param {Array} items - Order items array
     * @returns {number} Total drink count
     */
    function calculateTotalDrinkCount(items) {
        if (!Array.isArray(items)) return 0;
        
        return items.reduce(function(total, item) {
            return item && item.category && DRINK_CATEGORIES.indexOf(item.category) !== -1
                ? total + (item.quantity || 0)
                : total;
        }, 0);
    }

    /**
     * Calculate total juice count from order items
     * @param {Array} items - Order items array
     * @returns {number} Total juice count
     */
    function calculateTotalJuiceCount(items) {
        if (!Array.isArray(items)) return 0;
        
        return items.reduce(function(total, item) {
            var hasJuice = item && item.selectedOptions && item.selectedOptions.some && 
                          item.selectedOptions.some(function(option) { return isJuiceOption(option); });
            return hasJuice ? total + (item.quantity || 0) : total;
        }, 0);
    }

    /**
     * Calculate total Jäger drink count from order items
     * @param {Array} items - Order items array
     * @returns {number} Total Jäger drink count
     */
    function calculateTotalJagerDrinkCount(items) {
        if (!Array.isArray(items)) return 0;
        
        return items.reduce(function(total, item) {
            var isJager = item && item.name && item.name.toLowerCase().indexOf('jäger') !== -1;
            return isJager ? total + (item.quantity || 0) : total;
        }, 0);
    }

    /**
     * Calculate price for a product with options
     * @param {Object} product - Product object
     * @param {Array} selectedOptions - Selected options array
     * @param {number} quantity - Quantity
     * @returns {number} Total price
     */
    function calculatePrice(product, selectedOptions, quantity) {
        selectedOptions = selectedOptions || [];
        quantity = quantity || 1;
        
        var basePrice = product && product.price ? product.price : 0;
        var optionPrice = selectedOptions.reduce(function(total, option) {
            return total + (option && option.price ? option.price : 0);
        }, 0);
        
        return (basePrice + optionPrice) * Math.max(1, quantity);
    }

    /**
     * Calculate total order amount
     * @param {Array} items - Order items array
     * @returns {number} Total order amount
     */
    function calculateOrderTotal(items) {
        if (!Array.isArray(items)) return 0;
        
        return items.reduce(function(total, item) {
            return total + ((item && item.price ? item.price : 0) * (item && item.quantity ? item.quantity : 0));
        }, 0);
    }

    /**
     * Check if an option is a juice option
     * @param {string} option - Option to check
     * @returns {boolean} True if it's a juice option
     */
    function isJuiceOption(option) {
        if (!option || typeof option !== 'string') return false;
        
        var normalized = option.normalize ? 
            option.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() :
            option.toUpperCase();
            
        var keywords = ['PIÑA', 'UVA', 'NARANJA', 'ARANDANO', 'MANGO', 'DURAZNO', 'JUGO'];
        
        return keywords.some(function(keyword) {
            return normalized.indexOf(keyword) !== -1;
        });
    }

    /**
     * Get ingredient price
     * @param {string} ingredient - Ingredient name
     * @returns {number} Price of the ingredient
     */
    function getIngredientPrice(ingredient) {
        var prices = {
            'extra_cheese': 2.0,
            'extra_bacon': 3.0,
            'extra_sauce': 1.0,
            'premium_meat': 5.0
        };
        
        return prices[ingredient] || 0;
    }

    // Create the global CalculationUtils object
    var CalculationUtils = {
        calculateTotalDrinkCount: calculateTotalDrinkCount,
        calculateTotalJuiceCount: calculateTotalJuiceCount,
        calculateTotalJagerDrinkCount: calculateTotalJagerDrinkCount,
        calculatePrice: calculatePrice,
        calculateOrderTotal: calculateOrderTotal,
        isJuiceOption: isJuiceOption,
        getIngredientPrice: getIngredientPrice
    };

    // Export to global scope
    window.CalculationUtils = CalculationUtils;
    
    // Legacy exports for backward compatibility
    window.calculateTotalDrinkCount = calculateTotalDrinkCount;
    window.calculateTotalJuiceCount = calculateTotalJuiceCount;
    window.calculateTotalJagerDrinkCount = calculateTotalJagerDrinkCount;
    window.calculatePrice = calculatePrice;
    window.calculateOrderTotal = calculateOrderTotal;
    window.isJuiceOption = isJuiceOption;
    window.getIngredientPrice = getIngredientPrice;

})(window);