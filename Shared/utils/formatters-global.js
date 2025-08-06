/**
 * Global Formatters - Unified formatting utilities
 * Compatible with older browsers - no ES6 imports
 */

(function(window) {
    'use strict';

    /**
     * Format prices consistently
     * @param {string|number} price - Price to format
     * @param {string} presentation - Presentation type (individual, jarra, botella, copa, litro)
     * @returns {string} Formatted price
     */
    function formatPrice(price, presentation) {
        presentation = presentation || 'individual';
        
        // Clean price if it comes as string with '$'
        var cleanPrice = typeof price === 'string' ? price.replace('$', '') : price;
        var numericPrice = parseFloat(cleanPrice);
        
        if (isNaN(numericPrice)) return '$0.00';
        
        var basePrice = '$' + numericPrice.toFixed(2);
        
        var presentations = {
            individual: basePrice,
            jarra: basePrice + ' (Jarra)',
            botella: basePrice + ' (Botella)',
            copa: basePrice + ' (Copa)',
            litro: basePrice + ' (Litro)'
        };
        
        return presentations[presentation] || basePrice;
    }

    /**
     * Format ingredients list consistently
     * @param {string|Array} ingredients - Ingredients to format
     * @returns {string} Formatted ingredients
     */
    function formatIngredients(ingredients) {
        if (!ingredients) return '';
        
        if (Array.isArray(ingredients)) {
            return ingredients.join(', ');
        }
        
        if (typeof ingredients === 'string') {
            return ingredients.trim();
        }
        
        return '';
    }

    /**
     * Format product names consistently
     * @param {string} name - Name to format
     * @returns {string} Formatted name
     */
    function formatProductName(name) {
        if (!name || typeof name !== 'string') return '';
        
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    /**
     * Format text for title capitalization
     * @param {string} text - Text to format
     * @returns {string} Text with title capitalization
     */
    function formatTitle(text) {
        if (!text || typeof text !== 'string') return '';
        
        return text
            .toLowerCase()
            .split(' ')
            .map(function(word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }

    /**
     * Clean and format general text
     * @param {string} text - Text to clean
     * @returns {string} Clean text
     */
    function cleanText(text) {
        if (!text || typeof text !== 'string') return '';
        
        return text.trim().replace(/\s+/g, ' ');
    }

    /**
     * Format numbers consistently
     * @param {number} num - Number to format
     * @param {number} decimals - Number of decimals (default: 2)
     * @returns {string} Formatted number
     */
    function formatNumber(num, decimals) {
        decimals = decimals !== undefined ? decimals : 2;
        
        if (isNaN(num)) return '0';
        
        return parseFloat(num).toFixed(decimals);
    }

    // Create the global Formatters object
    var Formatters = {
        formatPrice: formatPrice,
        formatIngredients: formatIngredients,
        formatProductName: formatProductName,
        formatTitle: formatTitle,
        cleanText: cleanText,
        formatNumber: formatNumber
    };

    // Export to global scope
    window.Formatters = Formatters;
    
    // Legacy exports for backward compatibility
    window.formatPrice = formatPrice;
    window.formatIngredients = formatIngredients;
    window.formatProductName = formatProductName;
    window.formatTitle = formatTitle;
    window.cleanText = cleanText;
    window.formatNumber = formatNumber;

})(window);