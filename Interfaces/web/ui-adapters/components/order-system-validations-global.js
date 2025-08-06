/**
 * Centralized validation module for OrderSystem - Global Version
 * Contains all validation logic extracted from order-system.js
 * Provides consistent validation methods with proper error handling
 * Converted to work without ES6 imports
 */

// Create global namespace if it doesn't exist
window.OrderSystemValidations = window.OrderSystemValidations || {};

/**
 * Validates if a product selection is allowed
 * @param {Event} event - The click event
 * @param {boolean} isOrderMode - Current order mode state
 * @returns {boolean} True if selection is valid
 */
window.OrderSystemValidations.validateSelection = function(event, isOrderMode) {
  return isOrderMode && 
         !event.target.disabled && 
         !(event.target.classList && event.target.classList.contains('non-selectable'));
};

/**
 * Validates drink options result from product lookup
 * @param {Object} drinkOptionsResult - Result from getDrinkOptionsForProduct
 * @param {string} productName - Name of the product for logging
 * @returns {boolean} True if drink options are valid
 */
window.OrderSystemValidations.validateDrinkOptions = function(drinkOptionsResult, productName) {
  if (!drinkOptionsResult || !drinkOptionsResult.drinkOptions) {
    if (window.Logger) {
      window.Logger.error('No drink options found for product:', productName);
    } else {
      console.error('No drink options found for product:', productName);
    }
    return false;
  }
  return true;
};

/**
 * Validates if current drink selection is valid for confirmation
 * @param {Array} selectedDrinks - Currently selected drinks
 * @param {Object} drinkCounts - Drink count mappings
 * @param {Object} currentProduct - Current product being processed
 * @returns {boolean} True if selection is valid
 */
window.OrderSystemValidations.hasValidDrinkSelection = function(selectedDrinks, drinkCounts, currentProduct) {
  const isJagerBottle = currentProduct.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().includes('JAGERMEISTER') && 
                        currentProduct.priceType === 'precioBotella';
  
  if (isJagerBottle) {
    return selectedDrinks.includes('2 Boost') || Object.values(drinkCounts).some(count => count > 0);
  }
  
  return selectedDrinks.length > 0 || Object.values(drinkCounts).some(count => count > 0);
};

/**
 * Validates cooking term selection for meat products
 * @param {string} selectedCookingTerm - Currently selected cooking term
 * @returns {boolean} True if cooking term is selected
 */
window.OrderSystemValidations.validateCookingTerm = function(selectedCookingTerm) {
  if (!selectedCookingTerm) {
    return false;
  }
  return true;
};

/**
 * Validates product name input
 * @param {string} productName - Product name to validate
 * @returns {Object} Validation result with isValid and message
 */
window.OrderSystemValidations.validateProductName = function(productName) {
  if (!productName || typeof productName !== 'string') {
    return {
      isValid: false,
      message: 'Invalid productName: must be a non-empty string'
    };
  }
  return { isValid: true };
};

/**
 * Validates if order has items before completion
 * @param {Array} orderItems - Current order items
 * @returns {Object} Validation result
 */
window.OrderSystemValidations.validateOrderCompletion = function(orderItems) {
  if (!orderItems || orderItems.length === 0) {
    return {
      isValid: false,
      message: 'La orden está vacía. Por favor agregue productos.'
    };
  }
  return { isValid: true };
};

/**
 * Validates special bottle rules for drink selection
 * @param {boolean} isJuice - Whether the drink being added is a juice
 * @param {number} totalJuices - Current total juice count
 * @param {number} totalRefrescos - Current total soda count
 * @param {string} bottleCategory - Category of the bottle product
 * @param {string} productName - Name of the current product
 * @returns {boolean} True if the drink can be added
 */
window.OrderSystemValidations.validateSpecialBottleRules = function(isJuice, totalJuices, totalRefrescos, bottleCategory, productName) {
  // Check if it's a special bottle category
  const isSpecialBottle = window.OrderSystemValidations._isSpecialBottleCategory(bottleCategory, productName);
  const isOnlySoda = window.OrderSystemValidations._isOnlySodaCategory(bottleCategory);
  
  if (isOnlySoda) {
    // Solo refrescos permitidos, máximo 5
    return !isJuice && totalRefrescos < 5;
  }
  
  if (isSpecialBottle) {
    // Verificar si estamos intentando agregar y si la combinación resultante sería válida
    const newJuices = isJuice ? totalJuices + 1 : totalJuices;
    const newRefrescos = !isJuice ? totalRefrescos + 1 : totalRefrescos;
    
    // Solo permitir si la nueva combinación es una de las tres válidas:
    // 1. Hasta 2 jugos sin refrescos
    // 2. Hasta 5 refrescos sin jugos  
    // 3. Exactamente 1 jugo + hasta 2 refrescos
    return (newJuices <= 2 && newRefrescos === 0) ||  // Combinación 1
           (newJuices === 0 && newRefrescos <= 5) ||  // Combinación 2
           (newJuices === 1 && newRefrescos <= 2);    // Combinación 3
  }
  
  // Reglas por defecto para otras categorías
  return totalJuices + totalRefrescos < 5;
};

/**
 * Validates special drink limits for button disabling
 * @param {boolean} isJuice - Whether the drink is a juice
 * @param {number} totalJuices - Current total juice count
 * @param {number} totalRefrescos - Current total soda count
 * @param {string} bottleCategory - Category of the bottle product
 * @param {string} productName - Name of the current product
 * @returns {boolean} True if the button should be disabled
 */
window.OrderSystemValidations.validateSpecialDrinkLimits = function(isJuice, totalJuices, totalRefrescos, bottleCategory, productName) {
  const isOnlySoda = window.OrderSystemValidations._isOnlySodaCategory(bottleCategory);
  const isSpecialBottle = window.OrderSystemValidations._isSpecialBottleCategory(bottleCategory, productName);
  
  if (isOnlySoda) {
    // Solo refrescos: deshabilitar si ya hay 5 refrescos o si es jugo
    return isJuice || totalRefrescos >= 5;
  }
  
  if (isSpecialBottle) {
    // Para botellas especiales, verificar límites específicos
    if (isJuice) {
      // Para jugos: deshabilitar si ya hay 2 jugos, o si hay 1 jugo y 3+ refrescos
      return totalJuices >= 2 || (totalJuices >= 1 && totalRefrescos >= 2);
    } else {
      // Para refrescos: deshabilitar si ya hay 5 refrescos, o si hay 1+ jugos y 2+ refrescos
      return totalRefrescos >= 5 || (totalJuices >= 1 && totalRefrescos >= 2);
    }
  }
  
  // Reglas por defecto
  return totalJuices + totalRefrescos >= 5;
};

// Helper functions
window.OrderSystemValidations._isSpecialBottleCategory = function(bottleCategory, productName) {
  const specialCategories = ['Licores', 'Whisky', 'Vodka', 'Ron', 'Tequila', 'Ginebra', 'Brandy', 'Cognac'];
  const normalizedProductName = productName ? productName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() : '';
  
  return specialCategories.some(cat => 
    bottleCategory && bottleCategory.toLowerCase().includes(cat.toLowerCase())
  ) && !normalizedProductName.includes('JAGERMEISTER');
};

window.OrderSystemValidations._isOnlySodaCategory = function(bottleCategory) {
  const onlySodaCategories = ['Refrescos', 'Sodas', 'Bebidas'];
  return onlySodaCategories.some(cat => 
    bottleCategory && bottleCategory.toLowerCase().includes(cat.toLowerCase())
  );
};

/**
 * Validates drink count limits based on business rules
 * @param {number} currentCount - Current drink count
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {boolean} True if within limits
 */
window.OrderSystemValidations.validateDrinkCountLimits = function(currentCount, maxLimit) {
  return currentCount < maxLimit;
};

/**
 * Validates order total amount
 * @param {number} totalAmount - Total order amount
 * @returns {Object} Validation result
 */
window.OrderSystemValidations.validateOrderAmount = function(totalAmount) {
  const minAmount = window.BUSINESS_RULES ? window.BUSINESS_RULES.MIN_ORDER_AMOUNT : 0;
  const maxAmount = window.BUSINESS_RULES ? window.BUSINESS_RULES.MAX_ORDER_AMOUNT : 10000;
  
  if (totalAmount < minAmount) {
    return {
      isValid: false,
      message: `El monto mínimo de orden es $${minAmount}`
    };
  }
  
  if (totalAmount > maxAmount) {
    return {
      isValid: false,
      message: `El monto máximo de orden es $${maxAmount}`
    };
  }
  
  return { isValid: true };
};

console.log('OrderSystemValidations (Global) loaded successfully');